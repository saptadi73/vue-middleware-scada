<script setup>
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import ScadaNavbar from '../components/ScadaNavbar.vue'
import weeklyData from '../assets/data/QualityReportWeekly.json'
import monthlyData from '../assets/data/QualityReportMonthly.json'

const reportType = ref('weekly')

const currentData = computed(() => (reportType.value === 'weekly' ? weeklyData : monthlyData))
const detailData = computed(() =>
  reportType.value === 'weekly' ? weeklyData.daily_quality : monthlyData.weekly_quality,
)
const downtimeBreakdown = computed(() =>
  reportType.value === 'weekly' ? weeklyData.downtime_breakdown : monthlyData.downtime_breakdown,
)

// Quality Chart
const qualityChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
  },
  colors: ['#10b981', '#ef4444'],
  plotOptions: {
    bar: { columnWidth: '65%', borderRadius: 4 },
  },
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories:
      reportType.value === 'weekly'
        ? weeklyData.daily_quality.map((d) => d.day.substring(0, 3))
        : monthlyData.weekly_quality.map((w) => w.week.substring(0, 3)),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  legend: { labels: { colors: '#cbd5e1' } },
  tooltip: { theme: 'dark' },
}))

const qualitySeries = computed(() => [
  {
    name: 'OK',
    data:
      reportType.value === 'weekly'
        ? weeklyData.daily_quality.map((d) => d.ok)
        : monthlyData.weekly_quality.map((w) => w.ok),
  },
  {
    name: 'NG',
    data:
      reportType.value === 'weekly'
        ? weeklyData.daily_quality.map((d) => d.ng)
        : monthlyData.weekly_quality.map((w) => w.ng),
  },
])

// Duration Chart
const durationChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    background: 'transparent',
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#f97316'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories:
      reportType.value === 'weekly'
        ? weeklyData.daily_quality.map((d) => d.day.substring(0, 3))
        : monthlyData.weekly_quality.map((w) => w.week.substring(0, 3)),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  legend: { labels: { colors: '#cbd5e1' } },
  tooltip: { theme: 'dark' },
}))

const durationSeries = computed(() => [
  {
    name: 'Durasi (menit)',
    data:
      reportType.value === 'weekly'
        ? weeklyData.daily_quality.map((d) => parseFloat(d.avg_duration))
        : monthlyData.weekly_quality.map((w) => parseFloat(w.avg_duration)),
  },
])

// Downtime Chart
const downtimeChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: { show: false },
    background: 'transparent',
  },
  colors: ['#3b82f6', '#f59e0b', '#8b5cf6'],
  plotOptions: {
    bar: { columnWidth: '60%', borderRadius: 4 },
  },
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories:
      reportType.value === 'weekly'
        ? weeklyData.downtime_breakdown.map((d) => d.day.substring(0, 3))
        : monthlyData.downtime_breakdown.map((w) => w.week),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  legend: { labels: { colors: '#cbd5e1' } },
  tooltip: { theme: 'dark' },
}))

const downtimeSeries = computed(() => [
  {
    name: 'Maintenance',
    data: downtimeBreakdown.value.map((d) => parseFloat(d.maintenance)),
  },
  {
    name: 'Troubleshooting',
    data: downtimeBreakdown.value.map((d) => parseFloat(d.trouble_shooting)),
  },
  {
    name: 'Lainnya',
    data: downtimeBreakdown.value.map((d) => parseFloat(d.other)),
  },
])

// Export to Excel
const exportToExcel = () => {
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryHeader = [
    ['LAPORAN KUALITAS PRODUKSI'],
    [reportType.value === 'weekly' ? 'MINGGUAN' : 'BULANAN'],
    [],
    ['Metrik', 'Nilai'],
    ['Total Batch', currentData.value.summary.total_batches],
    ['Quality OK (%)', currentData.value.summary.quality_ok_percent],
    ['Quality NG (%)', currentData.value.summary.quality_ng_percent],
    ['Rata-rata Deviasi', currentData.value.summary.avg_deviation],
    ['Rata-rata Durasi Produksi', currentData.value.summary.avg_production_duration],
    ['Total Downtime (Jam)', currentData.value.summary.total_downtime_hours],
    ['Downtime (%)', currentData.value.summary.downtime_percent],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryHeader)
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Ringkasan')

  // Quality Detail sheet
  const qualityHeader = [
    reportType.value === 'weekly' ? 'Tanggal' : 'Minggu',
    'Batch',
    'OK',
    'NG',
    'OK %',
    'Rata-rata Deviasi',
    'Rata-rata Durasi',
    'Downtime (Jam)',
  ]
  const qualityData = [qualityHeader]
  detailData.value.forEach((row) => {
    qualityData.push([
      reportType.value === 'weekly' ? row.date : row.week,
      row.batches,
      row.ok,
      row.ng,
      row.ok_percent,
      row.avg_deviation,
      row.avg_duration,
      row.downtime,
    ])
  })
  const qualitySheet = XLSX.utils.aoa_to_sheet(qualityData)
  XLSX.utils.book_append_sheet(wb, qualitySheet, 'Detail Kualitas')

  // Downtime sheet
  const downtimeHeader = [
    reportType.value === 'weekly' ? 'Hari' : 'Minggu',
    'Maintenance',
    'Troubleshooting',
    'Lainnya',
  ]
  const downtimeData = [downtimeHeader]
  downtimeBreakdown.value.forEach((row) => {
    downtimeData.push([
      reportType.value === 'weekly' ? row.day : row.week,
      row.maintenance,
      row.trouble_shooting,
      row.other,
    ])
  })
  const downtimeSheet = XLSX.utils.aoa_to_sheet(downtimeData)
  XLSX.utils.book_append_sheet(wb, downtimeSheet, 'Downtime')

  // Save file
  const fileName = `Laporan_Kualitas_${reportType.value === 'weekly' ? 'Mingguan' : 'Bulanan'}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

// Print Report
const printReport = () => {
  window.print()
}
</script>

<template>
  <div>
    <!-- SCADA Navbar -->
    <ScadaNavbar />

    <!-- Main Quality Report Content -->
    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 font-poppins"
    >
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <span class="material-symbols-outlined text-white text-2xl">verified_user</span>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-white">Laporan Kualitas</h1>
            <p class="text-gray-400 mt-1">Pakan Ternak - Analisis Mingguan & Bulanan</p>
          </div>
        </div>

        <!-- Report Type Selector -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex gap-2 bg-slate-700 rounded-lg p-1">
            <button
              @click="reportType = 'weekly'"
              :class="[
                'px-6 py-2 rounded-md font-semibold transition-all duration-300',
                reportType === 'weekly'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white',
              ]"
            >
              <span class="material-symbols-outlined text-sm align-middle mr-1"
                >calendar_month</span
              >
              Mingguan
            </button>
            <button
              @click="reportType = 'monthly'"
              :class="[
                'px-6 py-2 rounded-md font-semibold transition-all duration-300',
                reportType === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-400 hover:text-white',
              ]"
            >
              <span class="material-symbols-outlined text-sm align-middle mr-1">date_range</span>
              Bulanan
            </button>
          </div>

          <!-- Export Buttons -->
          <div class="flex gap-2">
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
      </div>

      <!-- Summary KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total Batch -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-blue-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">TOTAL BATCH</span>
            <span class="material-symbols-outlined text-blue-400">layers_clear</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ currentData.summary.total_batches }}</p>
          <p class="text-sm text-gray-400 mt-3">Periode: {{ currentData.period }}</p>
        </div>

        <!-- Quality OK -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-green-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">QUALITY OK</span>
            <span class="material-symbols-outlined text-green-400">check_circle</span>
          </div>
          <p class="text-3xl font-bold text-white mb-2">
            {{ currentData.summary.quality_ok_percent }}%
          </p>
          <div class="w-full bg-slate-600 rounded-full h-2">
            <div
              class="bg-green-500 h-2 rounded-full"
              :style="{ width: currentData.summary.quality_ok_percent + '%' }"
            ></div>
          </div>
        </div>

        <!-- Avg Duration -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-orange-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">RATA-RATA DURASI</span>
            <span class="material-symbols-outlined text-orange-400">schedule</span>
          </div>
          <p class="text-3xl font-bold text-white">
            {{ currentData.summary.avg_production_duration }}
          </p>
          <p class="text-sm text-gray-400 mt-3">per batch</p>
        </div>

        <!-- Total Downtime -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-red-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">TOTAL DOWNTIME</span>
            <span class="material-symbols-outlined text-red-400">warning</span>
          </div>
          <p class="text-3xl font-bold text-white">
            {{ currentData.summary.total_downtime_hours }}
          </p>
          <p class="text-sm text-gray-400 mt-3">
            {{ currentData.summary.downtime_percent }}% downtime
          </p>
        </div>
      </div>

      <!-- Quality Chart -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-green-400 text-xl">show_chart</span>
          <h2 class="text-lg font-bold text-white">
            Batch Quality {{ reportType === 'weekly' ? 'Harian' : 'Mingguan' }}
          </h2>
        </div>
        <apexchart
          type="bar"
          :options="qualityChartOptions"
          :series="qualitySeries"
          height="350"
        ></apexchart>
      </div>

      <!-- Duration Chart -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-orange-400 text-xl">trending_up</span>
          <h2 class="text-lg font-bold text-white">
            Rata-rata Durasi Produksi {{ reportType === 'weekly' ? 'Harian' : 'Mingguan' }}
          </h2>
        </div>
        <apexchart
          type="line"
          :options="durationChartOptions"
          :series="durationSeries"
          height="300"
        ></apexchart>
      </div>

      <!-- Downtime Chart -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-red-400 text-xl">schedule</span>
          <h2 class="text-lg font-bold text-white">
            Downtime Breakdown {{ reportType === 'weekly' ? 'Harian' : 'Mingguan' }}
          </h2>
        </div>
        <apexchart
          type="bar"
          :options="downtimeChartOptions"
          :series="downtimeSeries"
          height="350"
        ></apexchart>
      </div>

      <!-- Quality Metrics Table -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <h3 class="text-lg font-bold text-white mb-4">Metrik Kualitas</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-600">
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Metrik</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Target</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Aktual</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Status</th>
                <th
                  v-if="reportType === 'monthly'"
                  class="px-4 py-3 text-center text-gray-300 font-semibold"
                >
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(metric, idx) in currentData.quality_metrics"
                :key="idx"
                class="border-b border-slate-600/50 hover:bg-slate-600/30 transition-colors"
              >
                <td class="px-4 py-3 text-white font-medium">{{ metric.metric }}</td>
                <td class="px-4 py-3 text-center text-gray-300">{{ metric.target }}</td>
                <td class="px-4 py-3 text-center text-white font-semibold">{{ metric.actual }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="
                      metric.status === 'OK'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    "
                  >
                    {{ metric.status }}
                  </span>
                </td>
                <td v-if="reportType === 'monthly'" class="px-4 py-3 text-center text-white">
                  {{ metric.trend }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Table -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
      >
        <h3 class="text-lg font-bold text-white mb-4">
          Detail {{ reportType === 'weekly' ? 'Produksi Harian' : 'Produksi Mingguan' }}
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-600">
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">
                  {{ reportType === 'weekly' ? 'Tanggal' : 'Minggu' }}
                </th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Batch</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">OK</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">NG</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">OK %</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Deviasi</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Durasi</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Downtime</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in detailData"
                :key="idx"
                class="border-b border-slate-600/50 hover:bg-slate-600/30 transition-colors"
              >
                <td class="px-4 py-3 text-white font-medium">
                  <span v-if="reportType === 'weekly'">{{ row.date }} ({{ row.day }})</span>
                  <span v-else>{{ row.week }}</span>
                </td>
                <td class="px-4 py-3 text-right text-gray-300">{{ row.batches }}</td>
                <td class="px-4 py-3 text-right text-green-400 font-semibold">{{ row.ok }}</td>
                <td class="px-4 py-3 text-right text-red-400 font-semibold">{{ row.ng }}</td>
                <td class="px-4 py-3 text-right">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="
                      row.ok_percent >= 95
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    "
                  >
                    {{ row.ok_percent }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-gray-300">{{ row.avg_deviation }}</td>
                <td class="px-4 py-3 text-right text-orange-300">{{ row.avg_duration }}</td>
                <td class="px-4 py-3 text-right text-gray-300">{{ row.downtime }}h</td>
              </tr>
            </tbody>
          </table>
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
