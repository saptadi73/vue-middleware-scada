<script setup>
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import ScadaNavbar from '../components/ScadaNavbar.vue'
import inventoryData from '../assets/data/InventoryData.json'
import historyData from '../assets/data/InventoryHistory.json'

const selectedSilo = ref(null)

// Calculate days until stockout
const calculateDaysUntilStockout = (siloId) => {
  const silo = inventoryData.silos.find((s) => s.id === siloId)
  const dailyConsumption =
    historyData.consumption_history.reduce((sum, record) => {
      const key = silo.material.toLowerCase().replace(/\s+/g, '_')
      return sum + (record[key] || 0)
    }, 0) / historyData.consumption_history.length

  if (dailyConsumption === 0) return 'N/A'
  const days = Math.floor(silo.current_stock / dailyConsumption)
  return days
}

// Consumption Chart
const consumptionChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    background: 'transparent',
  },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#06b6d4', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#eab308'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: historyData.consumption_history.map((d) => d.date.split(' ')[0].split('-')[2]),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  legend: { labels: { colors: '#cbd5e1' } },
  tooltip: { theme: 'dark' },
}))

const consumptionSeries = computed(() => [
  {
    name: 'Jagung',
    data: historyData.consumption_history.map((d) => d.jagung),
  },
  {
    name: 'Bungkil Kedelai',
    data: historyData.consumption_history.map((d) => d.bungkil_kedelai),
  },
  {
    name: 'Tepung Ikan',
    data: historyData.consumption_history.map((d) => d.tepung_ikan),
  },
  {
    name: 'Limestone',
    data: historyData.consumption_history.map((d) => d.limestone),
  },
  {
    name: 'Premix',
    data: historyData.consumption_history.map((d) => d.premix),
  },
  {
    name: 'Salt',
    data: historyData.consumption_history.map((d) => d.salt),
  },
])

// Stock Level Chart
const stockChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    bar: { columnWidth: '70%', borderRadius: 4 },
  },
  colors: ['#06b6d4'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: inventoryData.silos.map((s) => s.name),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  tooltip: { theme: 'dark' },
}))

const stockSeries = computed(() => [
  {
    name: 'Stock (Ton)',
    data: inventoryData.silos.map((s) => s.current_stock),
  },
])

// Forecast Chart
const forecastChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    background: 'transparent',
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#f97316'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: historyData.forecast_7days.map((d) => d.date.split('-')[2]),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  legend: { labels: { colors: '#cbd5e1' } },
  tooltip: { theme: 'dark' },
}))

const forecastSeries = computed(() => [
  {
    name: 'Projected Stock (Ton)',
    data: historyData.forecast_7days.map((d) => {
      const avgDaily =
        (d.jagung + d.bungkil_kedelai + d.tepung_ikan + d.limestone + d.premix + d.salt) / 6
      return Math.max(0, selectedSilo.value ? 45 - avgDaily * 7 : 100 - avgDaily * 7)
    }),
  },
])

// Export to Excel
const exportToExcel = () => {
  const wb = XLSX.utils.book_new()

  // Current Inventory
  const inventoryHeader = [
    'Silo ID',
    'Material',
    'Current Stock (Ton)',
    'Capacity (Ton)',
    'Utilization %',
    'Min Threshold',
    'Status',
    'Price/Ton',
    'Total Value',
    'Days Until Stockout',
    'Incoming Stock',
    'Incoming Date',
  ]
  const inventoryData_ = [inventoryHeader]
  inventoryData.silos.forEach((silo) => {
    const utilization = ((silo.current_stock / silo.capacity) * 100).toFixed(1)
    const totalValue = (silo.current_stock * silo.price_per_ton).toLocaleString()
    inventoryData_.push([
      silo.id,
      silo.material,
      silo.current_stock,
      silo.capacity,
      utilization,
      silo.min_threshold,
      silo.status,
      silo.price_per_ton.toLocaleString(),
      totalValue,
      calculateDaysUntilStockout(silo.id),
      silo.incoming_shipment,
      silo.incoming_date || '-',
    ])
  })
  const inventorySheet = XLSX.utils.aoa_to_sheet(inventoryData_)
  XLSX.utils.book_append_sheet(wb, inventorySheet, 'Current Inventory')

  // Save file
  const fileName = `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

// Print
const printReport = () => {
  window.print()
}

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    default:
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
  }
}
</script>

<template>
  <div>
    <!-- SCADA Navbar -->
    <ScadaNavbar />

    <!-- Main Inventory Dashboard Content -->
    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 font-poppins"
    >
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
            <span class="material-symbols-outlined text-white text-2xl">warehouse</span>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-white">Inventory Management</h1>
            <p class="text-gray-400 mt-1">Pengolahan Pakan Ternak - Raw Material Tracking</p>
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total Silos -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-blue-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">TOTAL SILOS</span>
            <span class="material-symbols-outlined text-blue-400">storage</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ inventoryData.summary.total_silos }}</p>
          <p class="text-sm text-gray-400 mt-3">Active</p>
        </div>

        <!-- Total Stock Value -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-green-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">TOTAL STOCK VALUE</span>
            <span class="material-symbols-outlined text-green-400">payments</span>
          </div>
          <p class="text-2xl font-bold text-white">
            {{ formatCurrency(inventoryData.summary.total_stock_value) }}
          </p>
          <p class="text-xs text-gray-400 mt-3">Valuation IDR</p>
        </div>

        <!-- Avg Utilization -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-purple-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">AVG UTILIZATION</span>
            <span class="material-symbols-outlined text-purple-400">gauge</span>
          </div>
          <p class="text-3xl font-bold text-white">
            {{ inventoryData.summary.average_utilization }}%
          </p>
          <div class="w-full bg-slate-600 rounded-full h-2 mt-3">
            <div
              class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              :style="{ width: inventoryData.summary.average_utilization + '%' }"
            ></div>
          </div>
        </div>

        <!-- Alerts -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-red-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">STATUS ALERTS</span>
            <span class="material-symbols-outlined text-red-400">warning</span>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-red-400">
              <span class="font-bold">{{ inventoryData.summary.critical_items }}</span> Critical
            </p>
            <p class="text-sm text-yellow-400">
              <span class="font-bold">{{ inventoryData.summary.warning_items }}</span> Warning
            </p>
            <p class="text-sm text-green-400">
              <span class="font-bold">{{ inventoryData.summary.normal_items }}</span> Normal
            </p>
          </div>
        </div>
      </div>

      <!-- Consumption History Chart -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-cyan-400 text-xl">show_chart</span>
          <h2 class="text-lg font-bold text-white">Konsumsi Material - 7 Hari Terakhir</h2>
        </div>
        <apexchart
          type="line"
          :options="consumptionChartOptions"
          :series="consumptionSeries"
          height="350"
        ></apexchart>
      </div>

      <!-- Stock Level Chart -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-emerald-400 text-xl">inventory_2</span>
          <h2 class="text-lg font-bold text-white">Current Stock Level per Silo</h2>
        </div>
        <apexchart
          type="bar"
          :options="stockChartOptions"
          :series="stockSeries"
          height="300"
        ></apexchart>
      </div>

      <!-- Inventory Details Table -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <h3 class="text-lg font-bold text-white mb-4">Detail Inventaris per Silo</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-600">
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Silo</th>
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Material</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Stock</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Kapasitas</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Utilization</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Status</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Days Left</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Incoming</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(silo, idx) in inventoryData.silos"
                :key="idx"
                class="border-b border-slate-600/50 hover:bg-slate-600/30 transition-colors"
              >
                <td class="px-4 py-3 text-white font-medium">{{ silo.name }}</td>
                <td class="px-4 py-3 text-gray-300">{{ silo.material }}</td>
                <td class="px-4 py-3 text-right text-cyan-400 font-semibold">
                  {{ silo.current_stock }} {{ silo.unit }}
                </td>
                <td class="px-4 py-3 text-right text-gray-300">
                  {{ silo.capacity }} {{ silo.unit }}
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="w-full bg-slate-600 rounded-full h-2">
                    <div
                      class="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                      :style="{ width: (silo.current_stock / silo.capacity) * 100 + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-400 mt-1"
                    >{{ ((silo.current_stock / silo.capacity) * 100).toFixed(1) }}%</span
                  >
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      getStatusColor(silo.status),
                    ]"
                  >
                    {{ silo.status.toUpperCase() }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-white font-semibold">
                  {{ calculateDaysUntilStockout(silo.id) }}
                </td>
                <td class="px-4 py-3 text-right">
                  <span v-if="silo.incoming_shipment > 0" class="text-green-400 font-semibold">
                    +{{ silo.incoming_shipment }} {{ silo.unit }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-right text-yellow-400 font-semibold">
                  {{ formatCurrency(silo.current_stock * silo.price_per_ton) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Incoming Shipments -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
      >
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-400">local_shipping</span>
          Incoming Shipments ({{ inventoryData.summary.incoming_shipments }})
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="(silo, idx) in inventoryData.silos.filter((s) => s.incoming_shipment > 0)"
            :key="idx"
            class="bg-slate-600/50 rounded-lg p-4 border border-slate-500/50"
          >
            <p class="text-white font-semibold mb-2">{{ silo.name }}</p>
            <div class="space-y-1 text-sm">
              <p class="text-gray-400">
                Qty:
                <span class="text-green-400 font-semibold"
                  >+{{ silo.incoming_shipment }} {{ silo.unit }}</span
                >
              </p>
              <p class="text-gray-400">
                ETA: <span class="text-yellow-400 font-semibold">{{ silo.incoming_date }}</span>
              </p>
              <p class="text-gray-400">
                Supplier: <span class="text-cyan-400 text-xs">{{ silo.supplier }}</span>
              </p>
            </div>
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
