<script setup>
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import ScadaNavbar from '../components/ScadaNavbar.vue'
import maintenanceData from '../assets/data/MaintenanceData.json'

// Uptime Chart
const uptimeChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    bar: { columnWidth: '70%', borderRadius: 4 },
  },
  colors: ['#10b981', '#ef4444'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: maintenanceData.equipment.map((e) => e.name),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  tooltip: { theme: 'dark' },
}))

const uptimeSeries = computed(() => [
  {
    name: 'Uptime %',
    data: maintenanceData.equipment.map((e) => e.uptime_percent),
  },
  {
    name: 'Downtime %',
    data: maintenanceData.equipment.map((e) => 100 - e.uptime_percent),
  },
])

// Operating Hours Chart
const hoursChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    background: 'transparent',
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#f97316'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: maintenanceData.equipment.map((e) => e.name),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  tooltip: { theme: 'dark' },
}))

const hoursSeries = computed(() => [
  {
    name: 'Total Operating Hours',
    data: maintenanceData.equipment.map((e) => e.total_operating_hours),
  },
])

// Maintenance Cost Chart
const costChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    bar: { columnWidth: '60%', borderRadius: 4 },
  },
  colors: ['#8b5cf6'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: maintenanceData.equipment
      .filter((e) => e.maintenance_history.length > 0)
      .map((e) => e.name),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  tooltip: { theme: 'dark' },
}))

const costSeries = computed(() => [
  {
    name: 'Maintenance Cost',
    data: maintenanceData.equipment
      .filter((e) => e.maintenance_history.length > 0)
      .map((e) => e.maintenance_history.reduce((sum, h) => sum + h.cost, 0) / 1000000),
  },
])

// Export to Excel
const exportToExcel = () => {
  const wb = XLSX.utils.book_new()

  // Equipment Status
  const equipmentHeader = [
    'Equipment ID',
    'Equipment Name',
    'Type',
    'Status',
    'Uptime %',
    'Last Maintenance',
    'Next Scheduled',
    'Hours Since Maintenance',
    'Total Operating Hours',
  ]
  const equipmentData_ = [equipmentHeader]
  maintenanceData.equipment.forEach((eq) => {
    equipmentData_.push([
      eq.id,
      eq.name,
      eq.type,
      eq.status,
      eq.uptime_percent,
      eq.last_maintenance,
      eq.next_scheduled,
      eq.hours_since_maintenance,
      eq.total_operating_hours,
    ])
  })
  const equipmentSheet = XLSX.utils.aoa_to_sheet(equipmentData_)
  XLSX.utils.book_append_sheet(wb, equipmentSheet, 'Equipment Status')

  // Save file
  const fileName = `Maintenance_Report_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'running':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'maintenance':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'stopped':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

const printReport = () => {
  window.print()
}
</script>

<template>
  <div>
    <!-- SCADA Navbar -->
    <ScadaNavbar />

    <!-- Main Maintenance Dashboard Content -->
    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 font-poppins"
    >
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <span class="material-symbols-outlined text-white text-2xl">settings</span>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-white">Maintenance Management</h1>
            <p class="text-gray-400 mt-1">Equipment Monitoring & Maintenance Tracking</p>
          </div>
        </div>

        <!-- Export Buttons -->
        <div class="flex gap-2 mt-4">
          <button
            @click="exportToExcel"
            class="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30"
          >
            <span class="material-symbols-outlined text-sm">download</span>
            Export Excel
          </button>
          <button
            @click="printReport"
            class="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-300"
          >
            <span class="material-symbols-outlined text-sm">print</span>
            Print
          </button>
        </div>
      </div>

      <!-- Summary KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <!-- Total Equipment -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-blue-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">TOTAL EQUIPMENT</span>
            <span class="material-symbols-outlined text-blue-400">build</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ maintenanceData.summary.total_equipment }}</p>
          <p class="text-sm text-gray-400 mt-3">Units</p>
        </div>

        <!-- Running -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-green-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">RUNNING</span>
            <span class="material-symbols-outlined text-green-400">check_circle</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ maintenanceData.summary.running }}</p>
          <p class="text-xs text-gray-400 mt-3">Operational</p>
        </div>

        <!-- Maintenance -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-yellow-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">MAINTENANCE</span>
            <span class="material-symbols-outlined text-yellow-400">schedule</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ maintenanceData.summary.maintenance }}</p>
          <p class="text-xs text-gray-400 mt-3">In Service</p>
        </div>

        <!-- Avg Uptime -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-purple-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">AVG UPTIME</span>
            <span class="material-symbols-outlined text-purple-400">gauge</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ maintenanceData.summary.average_uptime }}%</p>
          <div class="w-full bg-slate-600 rounded-full h-2 mt-3">
            <div
              class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              :style="{ width: maintenanceData.summary.average_uptime + '%' }"
            ></div>
          </div>
        </div>

        <!-- Critical Alerts -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-red-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">ALERTS</span>
            <span class="material-symbols-outlined text-red-400">warning</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ maintenanceData.summary.critical_alerts }}</p>
          <p class="text-sm text-red-400 mt-3 font-semibold">Critical Issues</p>
        </div>
      </div>

      <!-- Uptime Chart -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-green-400 text-xl">trending_up</span>
          <h2 class="text-lg font-bold text-white">Equipment Uptime vs Downtime</h2>
        </div>
        <apexchart
          type="bar"
          :options="uptimeChartOptions"
          :series="uptimeSeries"
          height="300"
        ></apexchart>
      </div>

      <!-- Operating Hours & Cost -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Operating Hours Chart -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-orange-400 text-xl">schedule</span>
            <h2 class="text-lg font-bold text-white">Total Operating Hours</h2>
          </div>
          <apexchart
            type="line"
            :options="hoursChartOptions"
            :series="hoursSeries"
            height="300"
          ></apexchart>
        </div>

        <!-- Maintenance Cost Chart -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-purple-400 text-xl">payments</span>
            <h2 class="text-lg font-bold text-white">Maintenance Cost by Equipment</h2>
          </div>
          <apexchart
            type="bar"
            :options="costChartOptions"
            :series="costSeries"
            height="300"
          ></apexchart>
        </div>
      </div>

      <!-- Equipment Detail Table -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <h3 class="text-lg font-bold text-white mb-4">Equipment Status & Maintenance</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-600">
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Equipment</th>
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Type</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Status</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Uptime %</th>
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Last Maintenance</th>
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Next Scheduled</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Hours Since</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(eq, idx) in maintenanceData.equipment"
                :key="idx"
                class="border-b border-slate-600/50 hover:bg-slate-600/30 transition-colors"
              >
                <td class="px-4 py-3 text-white font-medium">{{ eq.name }}</td>
                <td class="px-4 py-3 text-gray-300">{{ eq.type }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      getStatusColor(eq.status),
                    ]"
                  >
                    {{ eq.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="
                      eq.uptime_percent >= 95
                        ? 'bg-green-500/20 text-green-400'
                        : eq.uptime_percent >= 90
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    "
                  >
                    {{ eq.uptime_percent }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-300">{{ eq.last_maintenance }}</td>
                <td class="px-4 py-3 text-cyan-400 font-semibold">{{ eq.next_scheduled }}</td>
                <td class="px-4 py-3 text-right text-orange-300">
                  {{ eq.hours_since_maintenance }}h
                </td>
                <td class="px-4 py-3 text-right text-white">{{ eq.total_operating_hours }}h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Maintenance History -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
      >
        <h3 class="text-lg font-bold text-white mb-4">Maintenance History</h3>
        <div class="space-y-4">
          <div
            v-for="(eq, eIdx) in maintenanceData.equipment"
            :key="eIdx"
            class="border border-slate-600/50 rounded-lg p-4"
          >
            <p class="text-white font-semibold mb-3">{{ eq.name }}</p>
            <div v-if="eq.maintenance_history.length > 0" class="space-y-2">
              <div
                v-for="(maint, mIdx) in eq.maintenance_history"
                :key="mIdx"
                class="bg-slate-600/30 rounded p-2 text-sm"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-gray-300">{{ maint.date }}</span>
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-semibold',
                      maint.type === 'Preventive'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400',
                    ]"
                  >
                    {{ maint.type }}
                  </span>
                </div>
                <p class="text-gray-400 mb-1">{{ maint.description }}</p>
                <div class="flex justify-between">
                  <span class="text-gray-400">Duration: {{ maint.duration_hours }}h</span>
                  <span class="text-cyan-400 font-semibold">{{ formatCurrency(maint.cost) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-400 text-sm">No maintenance history</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .bg-gradient-to-br,
  .border {
    background-color: white !important;
    border-color: #e5e7eb !important;
    color: black !important;
  }

  .text-white {
    color: black !important;
  }

  .text-gray-400,
  .text-gray-300 {
    color: #666 !important;
  }

  button {
    display: none !important;
  }

  .material-symbols-outlined {
    display: none !important;
  }
}
</style>
