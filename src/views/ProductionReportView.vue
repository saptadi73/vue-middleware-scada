<script setup>
import { ref, computed, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import ScadaNavbar from '../components/ScadaNavbar.vue'
import weeklyData from '../assets/data/ProductionReportWeekly.json'
import monthlyData from '../assets/data/ProductionReportMonthly.json'

const reportType = ref('weekly')

const currentData = computed(() => (reportType.value === 'weekly' ? weeklyData : monthlyData))
const detailData = computed(() =>
  reportType.value === 'weekly' ? weeklyData.daily_data : monthlyData.weekly_data,
)
const recipeBreakdown = computed(() =>
  reportType.value === 'weekly'
    ? weeklyData.recipe_breakdown
    : monthlyData.recipe_breakdown_monthly,
)

// Production Chart
const productionChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
  },
  colors: ['#0ea5e9', '#10b981'],
  plotOptions: {
    bar: { columnWidth: '60%', borderRadius: 4 },
  },
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories:
      reportType.value === 'weekly'
        ? weeklyData.daily_data.map((d) => d.day.substring(0, 3))
        : monthlyData.weekly_data.map((w) => 'W' + w.week.match(/\d+/)[0]),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  legend: { labels: { colors: '#cbd5e1' } },
  tooltip: { theme: 'dark', style: { backgroundColor: '#1e293b', borderColor: '#475569' } },
}))

const productionSeries = computed(() => [
  {
    name: 'Produksi',
    data:
      reportType.value === 'weekly'
        ? weeklyData.daily_data.map((d) => d.production)
        : monthlyData.weekly_data.map((w) => w.production),
  },
  {
    name: 'Target',
    data:
      reportType.value === 'weekly'
        ? weeklyData.daily_data.map((d) => d.target)
        : monthlyData.weekly_data.map((w) => w.target),
  },
])

// Material Consumption Chart
const consumptionChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 },
  },
  colors: ['#f97316', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: (reportType.value === 'weekly'
      ? weeklyData.material_consumption
      : monthlyData.material_consumption_monthly
    ).map((m) => m.material.substring(0, 8)),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  legend: { labels: { colors: '#cbd5e1' } },
  tooltip: { theme: 'dark' },
}))

const consumptionSeries = computed(() => [
  {
    name: 'Konsumsi (Ton)',
    data: (reportType.value === 'weekly'
      ? weeklyData.material_consumption
      : monthlyData.material_consumption_monthly
    ).map((m) => m.consumption),
  },
])

// Recipe Chart
const recipeChartOptions = computed(() => ({
  chart: { background: 'transparent' },
  colors: ['#0ea5e9', '#10b981', '#f97316', '#ef4444'],
  legend: { labels: { colors: '#cbd5e1' } },
  tooltip: { theme: 'dark' },
}))

const recipeSeries = computed(() => recipeBreakdown.value.map((r) => r.total_production))

// Cost Chart (Monthly only)
const costChartOptions = computed(() => ({
  chart: { background: 'transparent' },
  colors: ['#0ea5e9', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4'],
  legend: { labels: { colors: '#cbd5e1' } },
  tooltip: { theme: 'dark' },
}))

const costSeries = computed(() =>
  monthlyData.cost_analysis ? monthlyData.cost_analysis.material_breakdown.map((m) => m.cost) : [],
)

// Export to Excel
const exportToExcel = () => {
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryHeader = [
    ['RINGKASAN PRODUKSI'],
    [reportType.value === 'weekly' ? 'MINGGUAN' : 'BULANAN'],
    [],
    ['Metrik', 'Nilai'],
    ['Total Produksi (Ton)', currentData.value.summary.total_production],
    ['Target Produksi (Ton)', currentData.value.summary.target],
    ['Achievement (%)', currentData.value.summary.achievement_percent],
    ['Total Batch', currentData.value.summary.total_batches],
    ['Quality OK (%)', currentData.value.summary.quality_ok_percent],
    ['Downtime (Jam)', currentData.value.summary.downtime_hours],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryHeader)
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Ringkasan')

  // Production sheet
  const prodHeader = [
    reportType.value === 'weekly' ? 'Tanggal' : 'Minggu',
    'Produksi',
    'Target',
    'Batch',
    'Quality OK %',
    'Downtime (Jam)',
  ]
  const prodData = [prodHeader]
  detailData.value.forEach((row) => {
    prodData.push([
      reportType.value === 'weekly' ? row.date : row.week,
      row.production,
      row.target,
      row.batches,
      row.quality_ok,
      row.downtime,
    ])
  })
  const prodSheet = XLSX.utils.aoa_to_sheet(prodData)
  XLSX.utils.book_append_sheet(wb, prodSheet, 'Produksi')

  // Material sheet
  const matHeader = ['Material', 'Silo', 'Stok Awal', 'Konsumsi', 'Stok Akhir', 'Rata-rata Harian']
  const matData = [matHeader]
  ;(
    currentData.value.material_consumption || currentData.value.material_consumption_monthly
  ).forEach((mat) => {
    matData.push([
      mat.material,
      mat.silo,
      mat.opening_stock,
      mat.consumption,
      mat.closing_stock,
      mat.daily_average,
    ])
  })
  const matSheet = XLSX.utils.aoa_to_sheet(matData)
  XLSX.utils.book_append_sheet(wb, matSheet, 'Material')

  // Recipe sheet
  const recipeHeader = ['Nama Resep', 'Jumlah Batch', 'Total Produksi', 'Quality OK %']
  const recipeData = [recipeHeader]
  recipeBreakdown.value.forEach((recipe) => {
    recipeData.push([
      recipe.recipe_name,
      recipe.batches,
      recipe.total_production,
      recipe.quality_ok_percent,
    ])
  })
  const recipeSheet = XLSX.utils.aoa_to_sheet(recipeData)
  XLSX.utils.book_append_sheet(wb, recipeSheet, 'Resep')

  // Save file
  const fileName = `Laporan_Produksi_${reportType.value === 'weekly' ? 'Mingguan' : 'Bulanan'}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

// Print Report
const printReport = () => {
  window.print()
}

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID').format(value)
}
</script>

<template>
  <div>
    <!-- SCADA Navbar -->
    <ScadaNavbar />

    <!-- Main Production Report Content -->
    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 font-poppins"
    >
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
            <span class="material-symbols-outlined text-white text-2xl">assessment</span>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-white">Laporan Produksi</h1>
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

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Total Production -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-blue-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">TOTAL PRODUKSI</span>
            <span class="material-symbols-outlined text-blue-400">factory</span>
          </div>
          <p class="text-3xl font-bold text-white mb-2">
            {{ currentData.summary.total_production }}
          </p>
          <div class="w-full bg-slate-600 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
              :style="{ width: currentData.summary.achievement_percent + '%' }"
            ></div>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            Target: {{ currentData.summary.target }} |
            {{ currentData.summary.achievement_percent }}%
          </p>
        </div>

        <!-- Total Batches -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-purple-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">TOTAL BATCH</span>
            <span class="material-symbols-outlined text-purple-400">layers_clear</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ currentData.summary.total_batches }}</p>
          <p class="text-sm text-gray-400 mt-3">Periode: {{ currentData.period }}</p>
        </div>

        <!-- Quality -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-green-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">KUALITAS OK</span>
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

        <!-- Downtime -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-orange-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">DOWNTIME</span>
            <span class="material-symbols-outlined text-orange-400">schedule</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ currentData.summary.downtime_hours }}</p>
          <p class="text-sm text-gray-400 mt-3">Jam</p>
        </div>
      </div>

      <!-- Daily/Weekly Production Chart -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-blue-400 text-xl">show_chart</span>
          <h2 class="text-lg font-bold text-white">
            {{ reportType === 'weekly' ? 'Produksi Harian' : 'Produksi Mingguan' }}
          </h2>
        </div>
        <apexchart
          type="bar"
          :options="productionChartOptions"
          :series="productionSeries"
          height="350"
        ></apexchart>
      </div>

      <!-- Material Consumption Section -->
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-cyan-400 text-xl">inventory</span>
          <h2 class="text-xl font-bold text-white">Konsumsi Raw Material</h2>
        </div>

        <!-- Material Consumption Chart -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-6"
        >
          <div class="h-96">
            <apexchart
              type="bar"
              :options="consumptionChartOptions"
              :series="consumptionSeries"
              height="100%"
            ></apexchart>
          </div>
        </div>

        <!-- Material Consumption Table -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <h3 class="text-lg font-bold text-white mb-4">Detail Konsumsi per Silo</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-600">
                  <th class="px-4 py-3 text-left text-gray-300 font-semibold">Material</th>
                  <th class="px-4 py-3 text-left text-gray-300 font-semibold">Silo</th>
                  <th class="px-4 py-3 text-right text-gray-300 font-semibold">Stok Awal</th>
                  <th class="px-4 py-3 text-right text-gray-300 font-semibold">Konsumsi</th>
                  <th class="px-4 py-3 text-right text-gray-300 font-semibold">Stok Akhir</th>
                  <th class="px-4 py-3 text-right text-gray-300 font-semibold">Rata-rata Harian</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(mat, idx) in currentData.material_consumption ||
                  currentData.material_consumption_monthly"
                  :key="idx"
                  class="border-b border-slate-600/50 hover:bg-slate-600/30 transition-colors"
                >
                  <td class="px-4 py-3 text-white font-medium">{{ mat.material }}</td>
                  <td class="px-4 py-3 text-gray-300">{{ mat.silo }}</td>
                  <td class="px-4 py-3 text-right text-gray-300">
                    {{ mat.opening_stock }} {{ mat.unit }}
                  </td>
                  <td class="px-4 py-3 text-right text-orange-400 font-semibold">
                    {{ mat.consumption }} {{ mat.unit }}
                  </td>
                  <td class="px-4 py-3 text-right text-blue-400 font-semibold">
                    {{ mat.closing_stock }} {{ mat.unit }}
                  </td>
                  <td class="px-4 py-3 text-right text-gray-300">
                    {{ mat.daily_average.toFixed(2) }} {{ mat.unit }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Recipe Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Recipe Chart -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <h3 class="text-lg font-bold text-white mb-4">Distribusi Resep</h3>
          <apexchart
            type="pie"
            :options="recipeChartOptions"
            :series="recipeSeries"
            height="300"
          ></apexchart>
        </div>

        <!-- Recipe Table -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <h3 class="text-lg font-bold text-white mb-4">Breakdown Produksi per Resep</h3>
          <div class="space-y-3">
            <div
              v-for="(recipe, idx) in recipeBreakdown"
              :key="idx"
              class="p-4 bg-slate-600/50 rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-white font-semibold">{{ recipe.recipe_name }}</span>
                <span class="text-sm font-bold text-green-400"
                  >{{ recipe.quality_ok_percent }}% OK</span
                >
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-400">{{ recipe.batches }} batch</span>
                <span class="text-sm text-white font-semibold"
                  >{{ recipe.total_production }} ton</span
                >
              </div>
              <div class="w-full bg-slate-500 rounded-full h-2">
                <div
                  class="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  :style="{
                    width:
                      recipe.total_production / (currentData.summary.total_production / 100) + '%',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Cost Analysis (only for monthly report) -->
      <div
        v-if="reportType === 'monthly' && monthlyData.cost_analysis"
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined">analytics</span>
          Analisis Biaya Produksi
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-slate-600/50 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">Total Biaya Bahan Baku</p>
            <p class="text-2xl font-bold text-white">
              Rp {{ formatCurrency(monthlyData.cost_analysis.total_raw_material_cost) }}
            </p>
          </div>
          <div class="bg-slate-600/50 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">Total Biaya Produksi</p>
            <p class="text-2xl font-bold text-white">
              Rp {{ formatCurrency(monthlyData.cost_analysis.total_production_cost) }}
            </p>
          </div>
          <div class="bg-slate-600/50 rounded-lg p-4">
            <p class="text-gray-400 text-sm mb-1">Biaya per Ton</p>
            <p class="text-2xl font-bold text-cyan-400">
              Rp {{ formatCurrency(monthlyData.cost_analysis.cost_per_ton) }}
            </p>
          </div>
        </div>

        <!-- Material Cost Distribution -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-slate-600/30 rounded-lg p-4">
            <h4 class="text-white font-semibold mb-4">Distribusi Biaya Bahan Baku</h4>
            <apexchart
              type="donut"
              :options="costChartOptions"
              :series="costSeries"
              height="300"
            ></apexchart>
          </div>
          <div class="bg-slate-600/30 rounded-lg p-4">
            <h4 class="text-white font-semibold mb-4">Rincian Biaya per Material</h4>
            <div class="space-y-3">
              <div
                v-for="(item, idx) in monthlyData.cost_analysis.material_breakdown"
                :key="idx"
                class="flex items-center justify-between p-2 hover:bg-slate-500/30 rounded"
              >
                <span class="text-gray-300">{{ item.material }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-400">{{ item.percentage }}%</span>
                  <span class="text-sm font-semibold text-white"
                    >Rp {{ formatCurrency(item.cost) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily/Weekly Production Table -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <h3 class="text-lg font-bold text-white mb-4">
          {{ reportType === 'weekly' ? 'Detail Produksi Harian' : 'Detail Produksi Mingguan' }}
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-600">
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">
                  {{ reportType === 'weekly' ? 'Tanggal' : 'Minggu' }}
                </th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Produksi</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Target</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Batch</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Quality OK %</th>
                <th class="px-4 py-3 text-right text-gray-300 font-semibold">Downtime (Jam)</th>
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
                <td
                  class="px-4 py-3 text-right font-semibold"
                  :class="row.production >= row.target ? 'text-green-400' : 'text-orange-400'"
                >
                  {{ row.production }}
                </td>
                <td class="px-4 py-3 text-right text-gray-300">{{ row.target }}</td>
                <td class="px-4 py-3 text-right text-gray-300">{{ row.batches }}</td>
                <td class="px-4 py-3 text-right">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="
                      row.quality_ok >= 95
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    "
                  >
                    {{ row.quality_ok }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-gray-300">{{ row.downtime }}</td>
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
