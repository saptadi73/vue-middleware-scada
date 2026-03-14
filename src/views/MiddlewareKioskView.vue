<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BASE_URL } from '../utils/base.utils'

const API_BASE_URL = import.meta.env.VITE_MIDDLEWARE_BASE_URL || BASE_URL
const AUTO_REFRESH_MS = 10000

const loading = ref(false)
const errorMessage = ref('')
const lastUpdated = ref('-')
const nowLabel = ref(new Date().toLocaleString('id-ID'))
const refreshTimer = ref(null)
const clockTimer = ref(null)

const taskSummaries = ref([])
const moBatchRows = ref([])

const totalQueue = computed(() => moBatchRows.value.length)
const runningTaskCount = computed(
  () =>
    taskSummaries.value.filter((task) => (task.status || '').toLowerCase() === 'running').length,
)
const successTaskCount = computed(
  () =>
    taskSummaries.value.filter((task) => (task.status || '').toLowerCase() === 'success').length,
)
const errorTaskCount = computed(() =>
  taskSummaries.value.reduce((sum, task) => sum + Number(task?.log_counts?.error || 0), 0),
)
const queuePreview = computed(() => moBatchRows.value.slice(0, 8))
const firstQueueMo = computed(() => {
  if (!moBatchRows.value.length) return '-'
  return moBatchRows.value[0]?.mo_id || moBatchRows.value[0]?.batch_no || '-'
})

const taskStatusClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'success':
      return 'border-green-500/40 bg-green-500/20 text-green-300'
    case 'running':
      return 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
    case 'warning':
      return 'border-yellow-500/40 bg-yellow-500/20 text-yellow-300'
    case 'failed':
    case 'error':
      return 'border-red-500/40 bg-red-500/20 text-red-300'
    default:
      return 'border-slate-500/40 bg-slate-500/20 text-slate-300'
  }
}

const callMiddleware = async (path, options = {}) => {
  const headers = {
    ...(options.headers || {}),
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  })

  const payload = response.status === 204 ? null : await response.json()
  if (!response.ok || payload?.status === 'error') {
    throw new Error(payload?.detail || payload?.message || 'Middleware request failed')
  }

  return payload
}

const refreshData = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [summaryResponse, moBatchResponse] = await Promise.all([
      callMiddleware('/api/admin/task-monitor/summary?since_minutes=180'),
      callMiddleware('/api/admin/table/mo-batch'),
    ])

    taskSummaries.value = summaryResponse?.data?.tasks || []
    moBatchRows.value = moBatchResponse?.data?.rows || moBatchResponse?.data?.items || []
    lastUpdated.value = new Date().toLocaleString('id-ID')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Gagal memuat data monitoring kiosk'
  } finally {
    loading.value = false
  }
}

const startClock = () => {
  if (clockTimer.value) clearInterval(clockTimer.value)
  clockTimer.value = setInterval(() => {
    nowLabel.value = new Date().toLocaleString('id-ID')
  }, 1000)
}

const startAutoRefresh = () => {
  if (refreshTimer.value) clearInterval(refreshTimer.value)
  refreshTimer.value = setInterval(() => {
    refreshData()
  }, AUTO_REFRESH_MS)
}

const stopTimers = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }

  if (clockTimer.value) {
    clearInterval(clockTimer.value)
    clockTimer.value = null
  }
}

const toggleFullScreen = async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen()
    return
  }

  await document.exitFullscreen()
}

onMounted(async () => {
  startClock()
  await refreshData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopTimers()
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 p-6 font-poppins text-white">
    <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-wide">SCADA MIDDLEWARE TV MONITOR</h1>
        <p class="text-sm text-slate-300">Mode Kiosk Realtime · Refresh 10 detik</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span
          class="rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-300"
        >
          {{ nowLabel }}
        </span>
        <button
          @click="toggleFullScreen"
          class="rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Full Screen
        </button>
        <RouterLink
          to="/middleware"
          class="rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
        >
          Kembali
        </RouterLink>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 px-4 py-3 text-sm text-red-200"
    >
      {{ errorMessage }}
    </div>

    <div class="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
      <div class="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <p class="text-sm text-slate-300">Queue Aktif</p>
        <p class="mt-2 text-5xl font-bold text-cyan-300">{{ totalQueue }}</p>
      </div>
      <div class="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <p class="text-sm text-slate-300">Task Running</p>
        <p class="mt-2 text-5xl font-bold text-blue-300">{{ runningTaskCount }}</p>
      </div>
      <div class="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <p class="text-sm text-slate-300">Task Success</p>
        <p class="mt-2 text-5xl font-bold text-green-300">{{ successTaskCount }}</p>
      </div>
      <div class="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <p class="text-sm text-slate-300">Total Error Log</p>
        <p class="mt-2 text-5xl font-bold text-red-300">{{ errorTaskCount }}</p>
      </div>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div class="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-cyan-300">Status Task Scheduler</h2>
          <span class="text-xs text-slate-400">{{ taskSummaries.length }} task</span>
        </div>

        <div class="space-y-3">
          <div
            v-for="task in taskSummaries"
            :key="task.task"
            class="rounded-lg border p-3"
            :class="taskStatusClass(task.status)"
          >
            <div class="mb-1 flex items-center justify-between">
              <p class="text-sm font-bold">{{ task.label || task.task }}</p>
              <span class="rounded-full border border-current px-2 py-0.5 text-xs font-semibold">
                {{ task.status || 'unknown' }}
              </span>
            </div>
            <p class="line-clamp-2 text-xs">{{ task.latest_message || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-cyan-300">Antrean MO Batch</h2>
          <span class="text-xs text-slate-400">Top 8</span>
        </div>

        <div class="mb-4 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
          <p class="text-xs text-slate-400">Antrian Terdepan</p>
          <p class="text-2xl font-bold text-emerald-300">{{ firstQueueMo }}</p>
        </div>

        <div class="overflow-hidden rounded-lg border border-slate-700">
          <table class="w-full text-sm">
            <thead class="bg-slate-800 text-slate-300">
              <tr>
                <th class="px-3 py-2 text-left font-semibold">No</th>
                <th class="px-3 py-2 text-left font-semibold">MO ID</th>
                <th class="px-3 py-2 text-left font-semibold">Batch</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in queuePreview"
                :key="row.id || `${row.mo_id}-${index}`"
                class="border-t border-slate-700 bg-slate-900/60"
              >
                <td class="px-3 py-2 text-slate-300">{{ index + 1 }}</td>
                <td class="px-3 py-2 font-semibold text-white">{{ row.mo_id || '-' }}</td>
                <td class="px-3 py-2 text-slate-300">{{ row.batch_no || '-' }}</td>
              </tr>
              <tr v-if="!queuePreview.length">
                <td colspan="3" class="px-3 py-5 text-center text-slate-400">Queue kosong</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      class="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-slate-400"
    >
      <span>{{ loading ? 'Memuat data realtime...' : 'Monitoring aktif' }}</span>
      <span>Last update: {{ lastUpdated }}</span>
    </div>
  </div>
</template>
