<script setup>
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import ScadaNavbar from '../components/ScadaNavbar.vue'
import kpiData from '../assets/data/KPIRealTimeData.json'

// State
const showShiftBreakdown = ref(false)

// OEE Gauge Chart
const oeeChartOptions = computed(() => ({
  chart: {
    type: 'radialBar',
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        size: '70%',
      },
      dataLabels: {
        name: { show: true, color: '#cbd5e1' },
        value: { show: true, color: '#fff', fontSize: '24px', fontWeight: 'bold' },
      },
    },
  },
  colors: ['#10b981'],
  stroke: { lineCap: 'round' },
  labels: ['OEE'],
}))

const oeeSeries = computed(() => [kpiData.real_time_metrics.oee])

// Throughput Chart
const throughputChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    bar: { columnWidth: '50%', borderRadius: 4 },
  },
  colors: ['#f97316', '#ef4444'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: ['Current', 'Target'],
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  tooltip: { theme: 'dark' },
}))

const throughputSeries = computed(() => [
  {
    name: 'Throughput (ton/hr)',
    data: [
      kpiData.real_time_metrics.throughput_ton_per_hour,
      kpiData.real_time_metrics.target_throughput,
    ],
  },
])

// Hourly OEE Trend
const hourlyChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    background: 'transparent',
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#f97316'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: kpiData.hourly_data.map((h) => h.hour),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  tooltip: { theme: 'dark' },
}))

const hourlySeries = computed(() => [
  {
    name: 'OEE %',
    data: kpiData.hourly_data.map((h) => h.oee),
  },
])

// Shift Comparison Chart
const shiftChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    bar: { columnWidth: '60%', borderRadius: 4 },
  },
  colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: kpiData.shift_comparison.map((s) => s.shift),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  tooltip: { theme: 'dark' },
}))

const shiftSeries = computed(() => [
  {
    name: 'OEE %',
    data: kpiData.shift_comparison.map((s) => s.oee),
  },
  {
    name: 'Quality %',
    data: kpiData.shift_comparison.map((s) => s.quality),
  },
  {
    name: 'Throughput',
    data: kpiData.shift_comparison.map((s) => s.throughput),
  },
])

// Daily Trend Chart
const dailyChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    background: 'transparent',
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#8b5cf6', '#10b981'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: kpiData.daily_trend.map((d) => d.date),
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  tooltip: { theme: 'dark' },
}))

const dailySeries = computed(() => [
  {
    name: 'OEE %',
    data: kpiData.daily_trend.map((d) => d.oee),
  },
  {
    name: 'Achievement %',
    data: kpiData.daily_trend.map((d) => d.achievement),
  },
])

// Quality Radar Chart
const qualityChartOptions = computed(() => ({
  chart: {
    type: 'radar',
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    radar: {
      size: 140,
      polygons: { strokeColors: '#475569', fill: '#1e293b' },
    },
  },
  colors: ['#10b981'],
  xaxis: {
    categories: ['Availability', 'Performance', 'Quality', 'OEE', 'Throughput'],
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  tooltip: { theme: 'dark' },
}))

const qualitySeries = computed(() => [
  {
    name: 'Current Metrics',
    data: [
      kpiData.real_time_metrics.availability,
      kpiData.real_time_metrics.performance,
      kpiData.real_time_metrics.quality,
      kpiData.real_time_metrics.oee,
      (kpiData.real_time_metrics.throughput_ton_per_hour /
        kpiData.real_time_metrics.target_throughput) *
        100,
    ],
  },
])

// Export to Excel
const exportToExcel = () => {
  const wb = XLSX.utils.book_new()

  // Real-time Metrics
  const metricsHeader = ['Metric', 'Current', 'Target', 'Achievement %']
  const metricsData_ = [
    metricsHeader,
    ['OEE', kpiData.real_time_metrics.oee, '-', '-'],
    ['Availability', kpiData.real_time_metrics.availability, 'Target', '-'],
    ['Performance', kpiData.real_time_metrics.performance, 'Target', '-'],
    ['Quality', kpiData.real_time_metrics.quality, 'Target', '-'],
    [
      'Throughput (ton/hr)',
      kpiData.real_time_metrics.throughput_ton_per_hour.toFixed(2),
      kpiData.real_time_metrics.target_throughput.toFixed(2),
      (
        (kpiData.real_time_metrics.throughput_ton_per_hour /
          kpiData.real_time_metrics.target_throughput) *
        100
      ).toFixed(1),
    ],
    [
      'Production (Ton)',
      kpiData.real_time_metrics.current_production_ton.toFixed(1),
      kpiData.real_time_metrics.target_production_ton.toFixed(1),
      kpiData.real_time_metrics.achievement_percent.toFixed(1),
    ],
    [
      'Batches Completed',
      kpiData.real_time_metrics.batches_completed_today,
      kpiData.real_time_metrics.batches_target_today,
      '-',
    ],
    ['Quality OK %', kpiData.real_time_metrics.quality_ok_percent, '-', '-'],
  ]
  const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData_)
  XLSX.utils.book_append_sheet(wb, metricsSheet, 'Real-time Metrics')

  // Hourly Data
  const hourlyHeader = ['Hour', 'Throughput', 'OEE %', 'Downtime (min)']
  const hourlyData_ = [hourlyHeader]
  kpiData.hourly_data.forEach((h) => {
    hourlyData_.push([h.hour, h.throughput.toFixed(2), h.oee, h.downtime])
  })
  const hourlySheet = XLSX.utils.aoa_to_sheet(hourlyData_)
  XLSX.utils.book_append_sheet(wb, hourlySheet, 'Hourly Data')

  // Shift Comparison
  const shiftHeader = ['Shift', 'Operator', 'OEE %', 'Throughput', 'Quality %', 'Downtime (min)']
  const shiftData_ = [shiftHeader]
  kpiData.shift_comparison.forEach((s) => {
    shiftData_.push([s.shift, s.operator, s.oee, s.throughput.toFixed(2), s.quality, s.downtime])
  })
  const shiftSheet = XLSX.utils.aoa_to_sheet(shiftData_)
  XLSX.utils.book_append_sheet(wb, shiftSheet, 'Shift Comparison')

  // Daily Trend
  const dailyHeader = ['Date', 'OEE %', 'Throughput', 'Achievement %']
  const dailyData_ = [dailyHeader]
  kpiData.daily_trend.forEach((d) => {
    dailyData_.push([d.date, d.oee, d.throughput.toFixed(2), d.achievement])
  })
  const dailySheet = XLSX.utils.aoa_to_sheet(dailyData_)
  XLSX.utils.book_append_sheet(wb, dailySheet, 'Daily Trend')

  // Save file
  const fileName = `KPI_Report_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

const printReport = () => {
  window.print()
}

const getPerformanceColor = (value, threshold = 80) => {
  if (value >= threshold) return 'text-green-400'
  if (value >= threshold - 10) return 'text-yellow-400'
  return 'text-red-400'
}

const getPerformanceBg = (value, threshold = 80) => {
  if (value >= threshold) return 'bg-green-500/20 border-green-500/30'
  if (value >= threshold - 10) return 'bg-yellow-500/20 border-yellow-500/30'
  return 'bg-red-500/20 border-red-500/30'
}
</script>

<template>
  <div>
    <!-- SCADA Navbar -->
    <ScadaNavbar />

    <!-- Main KPI Dashboard Content -->
    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 font-poppins"
    >
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <span class="material-symbols-outlined text-white text-2xl">speed</span>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-white">Real-Time KPI Dashboard</h1>
            <p class="text-gray-400 mt-1">Overall Equipment Effectiveness & Performance Tracking</p>
          </div>
        </div>

        <!-- Current Shift Info -->
        <div
          class="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-lg p-4 mb-4"
        >
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p class="text-gray-400 text-sm">Current Shift</p>
              <p class="text-xl font-bold text-white">{{ kpiData.current_shift.shift_name }}</p>
              <p class="text-sm text-cyan-400">Operator: {{ kpiData.current_shift.operator }}</p>
            </div>
            <div class="text-right">
              <p class="text-gray-400 text-sm">Time Elapsed</p>
              <p class="text-2xl font-bold text-cyan-400">
                {{ kpiData.current_shift.elapsed_hours }}h
              </p>
              <p class="text-sm text-gray-400">{{ kpiData.current_shift.current_time }}</p>
            </div>
          </div>
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

      <!-- Main KPI Cards Row 1 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- OEE Card -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-green-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">OEE</span>
            <span class="material-symbols-outlined text-green-400">trending_up</span>
          </div>
          <p :class="['text-4xl font-bold', getPerformanceColor(kpiData.real_time_metrics.oee)]">
            {{ kpiData.real_time_metrics.oee }}%
          </p>
          <p class="text-xs text-gray-400 mt-3">Overall Equipment Effectiveness</p>
        </div>

        <!-- Availability Card -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-blue-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">AVAILABILITY</span>
            <span class="material-symbols-outlined text-blue-400">check_circle</span>
          </div>
          <p
            :class="[
              'text-4xl font-bold',
              getPerformanceColor(kpiData.real_time_metrics.availability),
            ]"
          >
            {{ kpiData.real_time_metrics.availability }}%
          </p>
          <p class="text-xs text-gray-400 mt-3">Machine Available Time</p>
        </div>

        <!-- Performance Card -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-purple-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">PERFORMANCE</span>
            <span class="material-symbols-outlined text-purple-400">bolt</span>
          </div>
          <p
            :class="[
              'text-4xl font-bold',
              getPerformanceColor(kpiData.real_time_metrics.performance),
            ]"
          >
            {{ kpiData.real_time_metrics.performance }}%
          </p>
          <p class="text-xs text-gray-400 mt-3">Operating Speed vs Standard</p>
        </div>

        <!-- Quality Card -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-cyan-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">QUALITY</span>
            <span class="material-symbols-outlined text-cyan-400">verified</span>
          </div>
          <p
            :class="[
              'text-4xl font-bold',
              getPerformanceColor(kpiData.real_time_metrics.quality, 95),
            ]"
          >
            {{ kpiData.real_time_metrics.quality }}%
          </p>
          <p class="text-xs text-gray-400 mt-3">Good Product Output</p>
        </div>
      </div>

      <!-- Main KPI Cards Row 2 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <!-- Throughput Card -->
        <div
          :class="[
            'bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border transition-all',
            getPerformanceBg(
              (kpiData.real_time_metrics.throughput_ton_per_hour /
                kpiData.real_time_metrics.target_throughput) *
                100,
            ),
          ]"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">THROUGHPUT</span>
            <span class="material-symbols-outlined text-orange-400">local_shipping</span>
          </div>
          <p class="text-3xl font-bold text-white">
            {{ kpiData.real_time_metrics.throughput_ton_per_hour }}
          </p>
          <p class="text-xs text-gray-400 mt-2">ton/hr</p>
          <p class="text-xs text-gray-500 mt-1">
            Target: {{ kpiData.real_time_metrics.target_throughput }}
          </p>
        </div>

        <!-- Production Card -->
        <div
          :class="[
            'bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border transition-all',
            getPerformanceBg(kpiData.real_time_metrics.achievement_percent),
          ]"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">PRODUCTION TODAY</span>
            <span class="material-symbols-outlined text-amber-400">factory</span>
          </div>
          <p class="text-3xl font-bold text-white">
            {{ kpiData.real_time_metrics.current_production_ton }}
          </p>
          <p class="text-xs text-gray-400 mt-2">Ton</p>
          <p class="text-xs text-gray-500 mt-1">
            Target: {{ kpiData.real_time_metrics.target_production_ton }}
          </p>
        </div>

        <!-- Downtime Card -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-red-500/50 transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">DOWNTIME</span>
            <span class="material-symbols-outlined text-red-400">pause</span>
          </div>
          <p class="text-3xl font-bold text-red-400">
            {{ kpiData.real_time_metrics.downtime_minutes_today }}
          </p>
          <p class="text-xs text-gray-400 mt-2">minutes</p>
          <p class="text-xs text-gray-500 mt-1">
            Waste: {{ kpiData.real_time_metrics.waste_percent }}%
          </p>
        </div>
      </div>

      <!-- OEE Gauge & Throughput Comparison -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- OEE Gauge -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <h3 class="text-lg font-bold text-white mb-4">OEE Gauge</h3>
          <apexchart
            type="radialBar"
            :options="oeeChartOptions"
            :series="oeeSeries"
            height="250"
          ></apexchart>
        </div>

        <!-- Throughput Comparison -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <h3 class="text-lg font-bold text-white mb-4">Throughput vs Target</h3>
          <apexchart
            type="bar"
            :options="throughputChartOptions"
            :series="throughputSeries"
            height="250"
          ></apexchart>
        </div>
      </div>

      <!-- Hourly OEE Trend & Quality Metrics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Hourly OEE Trend -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <h3 class="text-lg font-bold text-white mb-4">Hourly OEE Trend</h3>
          <apexchart
            type="line"
            :options="hourlyChartOptions"
            :series="hourlySeries"
            height="300"
          ></apexchart>
        </div>

        <!-- Quality Radar Chart -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <h3 class="text-lg font-bold text-white mb-4">Performance Metrics</h3>
          <apexchart
            type="radar"
            :options="qualityChartOptions"
            :series="qualitySeries"
            height="300"
          ></apexchart>
        </div>
      </div>

      <!-- Shift Comparison & Daily Trend -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Shift Comparison -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <h3 class="text-lg font-bold text-white mb-4">Shift Comparison</h3>
          <apexchart
            type="bar"
            :options="shiftChartOptions"
            :series="shiftSeries"
            height="300"
          ></apexchart>
        </div>

        <!-- Daily Trend -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <h3 class="text-lg font-bold text-white mb-4">OEE Daily Trend</h3>
          <apexchart
            type="line"
            :options="dailyChartOptions"
            :series="dailySeries"
            height="300"
          ></apexchart>
        </div>
      </div>

      <!-- Shift Performance Table -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg mb-8"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-white">Shift Performance Comparison</h3>
          <button
            @click="showShiftBreakdown = !showShiftBreakdown"
            class="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
          >
            {{ showShiftBreakdown ? 'Hide' : 'Show' }} Details
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-600">
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Shift</th>
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Operator</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">OEE %</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Throughput</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Quality %</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Downtime</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(shift, idx) in kpiData.shift_comparison"
                :key="idx"
                class="border-b border-slate-600/50 hover:bg-slate-600/30 transition-colors"
              >
                <td class="px-4 py-3 text-white font-semibold">{{ shift.shift }}</td>
                <td class="px-4 py-3 text-gray-300">{{ shift.operator }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      getPerformanceBg(shift.oee),
                    ]"
                  >
                    {{ shift.oee }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-orange-300">{{ shift.throughput }} ton/hr</td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      getPerformanceBg(shift.quality, 95),
                    ]"
                  >
                    {{ shift.quality }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-red-400 font-semibold">
                  {{ shift.downtime }} min
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hourly Data Table -->
      <div
        class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
      >
        <h3 class="text-lg font-bold text-white mb-4">Today's Hourly Performance</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-600">
                <th class="px-4 py-3 text-left text-gray-300 font-semibold">Time</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">
                  Throughput (ton/hr)
                </th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">OEE %</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Downtime (min)</th>
                <th class="px-4 py-3 text-center text-gray-300 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(data, idx) in kpiData.hourly_data"
                :key="idx"
                class="border-b border-slate-600/50 hover:bg-slate-600/30 transition-colors"
              >
                <td class="px-4 py-3 text-white font-medium">{{ data.hour }}</td>
                <td class="px-4 py-3 text-center text-orange-300">
                  {{ data.throughput.toFixed(2) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      getPerformanceBg(data.oee),
                    ]"
                  >
                    {{ data.oee }}%
                  </span>
                </td>
                <td
                  class="px-4 py-3 text-center"
                  :class="data.downtime > 0 ? 'text-red-400' : 'text-green-400'"
                >
                  {{ data.downtime }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                    :class="
                      data.downtime > 0
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    "
                  >
                    <span
                      class="w-2 h-2 rounded-full inline-block"
                      :class="data.downtime > 0 ? 'bg-red-400' : 'bg-green-400'"
                    ></span>
                    {{ data.downtime > 0 ? 'Downtime' : 'Running' }}
                  </span>
                </td>
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
