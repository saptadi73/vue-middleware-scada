<template>
  <div>
    <!-- SCADA Navbar -->
    <ScadaNavbar />

    <!-- Main SCADA Dashboard Content -->
    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 font-poppins"
    >
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
            <span class="material-symbols-outlined text-white text-2xl">radar</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white">Real-time Monitoring</h1>
            <p class="text-gray-400 mt-1">Sistem Pengolahan Pakan Ternak</p>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-4">
          <span
            class="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full"
          >
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span class="text-sm text-green-300 font-semibold">{{ scadaData.plant_status }}</span>
          </span>
          <span class="text-gray-400 text-sm">{{ currentTime }}</span>
        </div>
      </div>

      <!-- Top Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Production Today -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">PRODUKSI HARI INI</span>
            <span class="material-symbols-outlined text-cyan-400">trending_up</span>
          </div>
          <p class="text-3xl font-bold text-white mb-2">
            {{ scadaData.production_today.actual }} <span class="text-lg text-gray-400">Ton</span>
          </p>
          <div class="w-full bg-slate-600 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: scadaData.production_today.achievement_percent + '%' }"
            ></div>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            Target: {{ scadaData.production_today.target }} Ton |
            {{ scadaData.production_today.achievement_percent }}%
          </p>
        </div>

        <!-- Batch Progress -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">BATCH SELESAI</span>
            <span class="material-symbols-outlined text-purple-400">layers</span>
          </div>
          <p class="text-3xl font-bold text-white mb-2">
            {{ scadaData.batch_progress.completed
            }}<span class="text-lg text-gray-400">/{{ scadaData.batch_progress.total }}</span>
          </p>
          <div class="w-full bg-slate-600 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              :style="{
                width:
                  (scadaData.batch_progress.completed / scadaData.batch_progress.total) * 100 + '%',
              }"
            ></div>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            Progress:
            {{
              Math.round(
                (scadaData.batch_progress.completed / scadaData.batch_progress.total) * 100,
              )
            }}%
          </p>
        </div>

        <!-- Quality KPI -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-green-500/20"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">KUALITAS</span>
            <span class="material-symbols-outlined text-green-400">verified</span>
          </div>
          <p class="text-3xl font-bold text-white mb-2">
            {{ qualityData.batch_ok_percent }}<span class="text-lg text-gray-400">%</span>
          </p>
          <div class="flex gap-2 mt-2">
            <div class="flex-1">
              <p class="text-xs text-green-400 font-semibold mb-1">OK</p>
              <div class="w-full bg-slate-600 rounded h-1.5">
                <div class="bg-green-500 h-1.5 rounded" style="width: 94.2%"></div>
              </div>
            </div>
            <div class="flex-1">
              <p class="text-xs text-red-400 font-semibold mb-1">NG</p>
              <div class="w-full bg-slate-600 rounded h-1.5">
                <div class="bg-red-500 h-1.5 rounded" style="width: 5.8%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Batch -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-orange-500/20"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm font-semibold">BATCH AKTIF</span>
            <span class="material-symbols-outlined text-orange-400">settings</span>
          </div>
          <p class="text-lg font-bold text-white mb-1">{{ batchingData.batch_id }}</p>
          <p class="text-xs text-gray-400 mb-3">
            {{ batchingData.recipe }} - {{ batchingData.step }}
          </p>
          <div class="w-full bg-slate-600 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: batchingData.progress_percent + '%' }"
            ></div>
          </div>
          <p class="text-xs text-gray-400 mt-2">Progress: {{ batchingData.progress_percent }}%</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Process Trend Chart -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-cyan-400 text-xl">show_chart</span>
            <h2 class="text-lg font-bold text-white">Trend Proses</h2>
          </div>
          <apexchart
            type="line"
            :options="trendChartOptions"
            :series="trendSeries"
            height="300"
          ></apexchart>
        </div>

        <!-- Quality Deviation Trend -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-purple-400 text-xl">analytics</span>
            <h2 class="text-lg font-bold text-white">Tren Deviasi Kualitas</h2>
          </div>
          <apexchart
            type="line"
            :options="deviationChartOptions"
            :series="deviationSeries"
            height="300"
          ></apexchart>
        </div>
      </div>

      <!-- Monitoring Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Material Table -->
        <div
          class="lg:col-span-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-blue-400 text-xl">table_chart</span>
            <h2 class="text-lg font-bold text-white">Material Batch {{ batchingData.batch_id }}</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-600">
                  <th class="px-4 py-3 text-left text-gray-300 font-semibold">Material</th>
                  <th class="px-4 py-3 text-right text-gray-300 font-semibold">Target (kg)</th>
                  <th class="px-4 py-3 text-right text-gray-300 font-semibold">Aktual (kg)</th>
                  <th class="px-4 py-3 text-right text-gray-300 font-semibold">Deviasi</th>
                  <th class="px-4 py-3 text-center text-gray-300 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in batchingData.material_rows"
                  :key="idx"
                  class="border-b border-slate-600/50 hover:bg-slate-600/30 transition-colors"
                >
                  <td class="px-4 py-3 text-white font-medium">{{ row.material }}</td>
                  <td class="px-4 py-3 text-right text-gray-300">{{ row.target }}</td>
                  <td class="px-4 py-3 text-right text-gray-300">{{ row.actual }}</td>
                  <td
                    class="px-4 py-3 text-right"
                    :class="row.deviation >= 0 ? 'text-red-400' : 'text-green-400'"
                  >
                    {{ row.deviation > 0 ? '+' : '' }}{{ row.deviation }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span
                      v-if="Math.abs(row.deviation) <= 2"
                      class="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs text-green-300 font-semibold"
                    >
                      <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      OK
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-xs text-yellow-300 font-semibold"
                    >
                      <span class="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                      WARNING
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Inventory Status -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-cyan-400 text-xl">inventory_2</span>
            <h2 class="text-lg font-bold text-white">Status Inventory</h2>
          </div>
          <div class="space-y-4">
            <div
              v-for="(item, idx) in inventoryData"
              :key="idx"
              class="p-4 bg-slate-600/50 rounded-lg border border-slate-500/50"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-white font-semibold text-sm">{{ item.name }}</span>
                <span
                  class="text-xs font-bold"
                  :class="
                    item.status === 'NORMAL'
                      ? 'text-green-400'
                      : item.status === 'WARNING'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  "
                >
                  {{ item.status }}
                </span>
              </div>
              <div class="w-full bg-slate-500 rounded-full h-2 mb-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="
                    item.percentage >= 70
                      ? 'bg-green-500'
                      : item.percentage >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  "
                  :style="{ width: item.percentage + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-400">
                {{ item.current }}{{ item.unit }} / {{ item.capacity }}{{ item.unit }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Alarms & Control Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Active Alarms -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-red-400 text-xl">warning</span>
            <h2 class="text-lg font-bold text-white">Alarm Aktif</h2>
          </div>
          <div class="space-y-3">
            <div
              v-for="(alarm, idx) in alarmData"
              :key="idx"
              :class="[
                'p-4 rounded-lg border transition-all duration-300',
                alarm.severity === 'HIGH'
                  ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                  : alarm.severity === 'MEDIUM'
                    ? 'bg-yellow-500/10 border-yellow-500/50 hover:bg-yellow-500/20'
                    : 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20',
              ]"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="
                        alarm.severity === 'HIGH'
                          ? 'bg-red-500'
                          : alarm.severity === 'MEDIUM'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                      "
                    ></span>
                    <span
                      class="text-xs font-bold"
                      :class="
                        alarm.severity === 'HIGH'
                          ? 'text-red-400'
                          : alarm.severity === 'MEDIUM'
                            ? 'text-yellow-400'
                            : 'text-blue-400'
                      "
                    >
                      {{ alarm.severity }}
                    </span>
                    <span
                      v-if="alarm.acknowledged"
                      class="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/50"
                      >ACK</span
                    >
                  </div>
                  <p class="text-white text-sm font-semibold">{{ alarm.tag }}</p>
                  <p class="text-gray-400 text-xs mt-1">{{ alarm.message }}</p>
                  <p class="text-gray-500 text-xs mt-2">{{ alarm.timestamp }}</p>
                </div>
              </div>
            </div>
            <div v-if="alarmData.length === 0" class="p-4 text-center text-gray-400 text-sm">
              <span class="material-symbols-outlined">check_circle</span>
              <p>Tidak ada alarm</p>
            </div>
          </div>
        </div>

        <!-- Production Duration Stats -->
        <div
          class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-lg"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-orange-400 text-xl">schedule</span>
            <h2 class="text-lg font-bold text-white">Durasi Produksi Hari Ini</h2>
          </div>
          <div class="space-y-4">
            <!-- Average Duration Card -->
            <div class="bg-slate-600/50 rounded-lg p-4 border border-slate-500/50">
              <p class="text-gray-400 text-sm mb-2">Rata-rata Durasi per Batch</p>
              <p class="text-3xl font-bold text-orange-400">{{ productionDuration.avgDuration }}</p>
              <p class="text-xs text-gray-400 mt-1">menit per batch</p>
            </div>

            <!-- Duration Breakdown -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-600/50 rounded-lg p-3 border border-slate-500/50">
                <p class="text-gray-400 text-xs mb-1">Tercepat</p>
                <p class="text-xl font-bold text-green-400">{{ productionDuration.fastest }}m</p>
              </div>
              <div class="bg-slate-600/50 rounded-lg p-3 border border-slate-500/50">
                <p class="text-gray-400 text-xs mb-1">Terlama</p>
                <p class="text-xl font-bold text-red-400">{{ productionDuration.slowest }}m</p>
              </div>
            </div>

            <!-- Total Production Time -->
            <div class="bg-slate-600/50 rounded-lg p-4 border border-slate-500/50">
              <p class="text-gray-400 text-sm mb-2">Total Waktu Produksi</p>
              <p class="text-2xl font-bold text-cyan-400">{{ productionDuration.totalTime }} jam</p>
              <p class="text-xs text-gray-400 mt-1">
                untuk {{ productionDuration.totalBatches }} batch
              </p>
            </div>

            <!-- Efficiency Info -->
            <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p class="text-xs text-blue-300">
                <span class="material-symbols-outlined text-sm align-middle">info</span>
                Efisiensi: {{ productionDuration.efficiency }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div
        class="bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-center text-gray-400 text-sm"
      >
        <p>Dashboard SCADA Pengolahan Pakan Ternak | Last Updated: {{ lastUpdate }}</p>
      </div>
    </div>
    <!-- End of main SCADA Dashboard Content -->
  </div>
  <!-- End of SCADA Page -->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import ScadaNavbar from '../components/ScadaNavbar.vue'

// Data imports
import scadaRawData from '../assets/data/DashboardScada.json'
import batchingRawData from '../assets/data/DashboardBatching.json'
import qualityRawData from '../assets/data/DashboardKualitasKPI.json'
import alarmRawData from '../assets/data/DashboardAlarm.json'
import trendRawData from '../assets/data/DashboardTrend.json'
import controlRawData from '../assets/data/DashboardControl.json'

const currentTime = ref(new Date().toLocaleTimeString('id-ID'))
const lastUpdate = ref(new Date().toLocaleString('id-ID'))

// Initialize data
const scadaData = ref({
  plant_status: 'RUNNING',
  production_today: { target: 120, actual: 95.4, achievement_percent: 79.5 },
  batch_progress: { completed: 18, total: 22 },
})

const batchingData = ref({
  batch_id: 'BATCH-2026-0018',
  recipe: 'Feed Starter A',
  step: 'WEIGHING',
  progress_percent: 62,
  material_rows: [
    { material: 'Jagung', target: 500, actual: 498, deviation: -2 },
    { material: 'Bungkil Kedelai', target: 200, actual: 201, deviation: 1 },
  ],
})

const qualityData = ref({
  average_deviation_percent: 0.38,
  batch_ok_percent: 94.2,
  batch_ng_percent: 5.8,
})

const alarmData = ref([
  {
    tag: 'MIXER_MOTOR_OVERLOAD',
    severity: 'HIGH',
    message: 'Arus motor mixer melebihi batas',
    timestamp: '2026-01-25 10:12:45',
    acknowledged: false,
  },
  {
    tag: 'LOW_LEVEL_JAGUNG',
    severity: 'MEDIUM',
    message: 'Level silo jagung rendah',
    timestamp: '2026-01-25 09:58:12',
    acknowledged: true,
  },
])

const inventoryData = ref([
  {
    name: 'Silo Jagung',
    percentage: 65,
    current: 450,
    capacity: 700,
    unit: ' ton',
    status: 'NORMAL',
  },
  {
    name: 'Silo Kedelai',
    percentage: 35,
    current: 175,
    capacity: 500,
    unit: ' ton',
    status: 'WARNING',
  },
  {
    name: 'Silo Tepung Ikan',
    percentage: 85,
    current: 425,
    capacity: 500,
    unit: ' ton',
    status: 'NORMAL',
  },
  {
    name: 'Packaging Material',
    percentage: 45,
    current: 2250,
    capacity: 5000,
    unit: ' unit',
    status: 'WARNING',
  },
])

// Production Duration Statistics
const productionDuration = ref({
  avgDuration: '45',
  fastest: '38',
  slowest: '52',
  totalTime: '15.75',
  totalBatches: 21,
  efficiency: 89,
})

// Chart configurations
const trendChartOptions = ref({
  chart: {
    type: 'line',
    toolbar: { show: false },
    background: 'transparent',
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#06b6d4', '#f97316'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: ['10:00', '10:05', '10:10', '10:15', '10:20'],
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  legend: { labels: { colors: '#cbd5e1' }, offsetY: -10 },
  tooltip: {
    theme: 'dark',
    style: { backgroundColor: '#1e293b', borderColor: '#475569' },
  },
})

const trendSeries = ref([
  { name: 'Temperature (°C)', data: [62, 63, 64, 63, 62] },
  { name: 'Motor Current (A)', data: [18, 19, 21, 20, 18] },
])

const deviationChartOptions = ref({
  chart: {
    type: 'line',
    toolbar: { show: false },
    background: 'transparent',
  },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#a855f7'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: ['B001', 'B002', 'B003', 'B004'],
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: { labels: { style: { colors: '#cbd5e1' } } },
  legend: { labels: { colors: '#cbd5e1' }, offsetY: -10 },
  tooltip: {
    theme: 'dark',
    style: { backgroundColor: '#1e293b', borderColor: '#475569' },
  },
})

const deviationSeries = ref([{ name: 'Deviation (%)', data: [0.3, 0.4, 0.6, 0.2] }])

// Time update
let timeInterval
onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('id-ID')
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
})
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
