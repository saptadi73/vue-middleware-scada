<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ScadaNavbar from '../components/ScadaNavbar.vue'
import { BASE_URL } from '../utils/base.utils'

const API_BASE_URL = import.meta.env.VITE_MIDDLEWARE_BASE_URL || BASE_URL
const HISTORY_LIMIT = 10
const AUTO_REFRESH_MS = 15000

const schedulerEnabled = ref(true)
const loading = ref(false)
const continuing = ref(false)
const actionLoading = ref(false)
const dangerActionLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const lastUpdated = ref('-')
const refreshTimer = ref(null)
const resetTask1Switch = ref(false)
const clearMoBatchSwitch = ref(false)
const triggerSyncSwitch = ref(false)
const confirmModalOpen = ref(false)
const confirmModalStep = ref(1)
const pendingDangerAction = ref('')

const taskSummaries = ref([])
const moBatchRows = ref([])
const historiesRows = ref([])
const historySearch = ref('')
const historyOffset = ref(0)
const historyTotal = ref(0)
const historyHasNext = ref(false)

const historyPage = computed(() => Math.floor(historyOffset.value / HISTORY_LIMIT) + 1)
const historyTotalPages = computed(() => {
  if (historyTotal.value <= 0) return 1
  return Math.ceil(historyTotal.value / HISTORY_LIMIT)
})

const isResetAction = computed(() => pendingDangerAction.value === 'reset-task1')

const confirmModalTitle = computed(() =>
  confirmModalStep.value === 1 ? 'Konfirmasi Tindakan' : 'Konfirmasi Ulang',
)

const confirmModalActionLabel = computed(() =>
  isResetAction.value ? 'Reset TASK1 Start' : 'Clear MO Batch',
)

const confirmModalMessage = computed(() => {
  if (confirmModalStep.value === 1) {
    return isResetAction.value
      ? 'Reset TASK1 Start akan dijalankan. Lanjutkan?'
      : 'Clear MO Batch akan dijalankan. Lanjutkan?'
  }

  return isResetAction.value
    ? 'Apakah Anda yakin akan reset ulang TASK dari awal?'
    : 'Anda yakin akan melakukan penghapusan semua MO Batch yang ada di antrean?'
})

const getRowNumber = (index) => historyOffset.value + index + 1

const getTotalConsumption = (row) => {
  return Object.entries(row || {})
    .filter(
      ([key, value]) =>
        key.startsWith('consumption_') &&
        !key.startsWith('actual_consumption_') &&
        typeof value === 'number',
    )
    .reduce((sum, [, value]) => sum + value, 0)
}

const getTotalActualConsumption = (row) => {
  return Object.entries(row || {})
    .filter(([key, value]) => key.startsWith('actual_consumption_') && typeof value === 'number')
    .reduce((sum, [, value]) => sum + value, 0)
}

const moBatchChartCategories = computed(() =>
  moBatchRows.value.map((row, index) => row.mo_id || row.batch_no || `Batch ${index + 1}`),
)

const moBatchChartSeries = computed(() => [
  {
    name: 'Consumption',
    data: moBatchRows.value.map((row) => Number(getTotalConsumption(row).toFixed(2))),
  },
  {
    name: 'Actual Consumption',
    data: moBatchRows.value.map((row) => Number(getTotalActualConsumption(row).toFixed(2))),
  },
])

const moBatchChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4,
    },
  },
  colors: ['#0ea5e9', '#22c55e'],
  grid: { borderColor: '#475569', strokeDashArray: 3 },
  xaxis: {
    categories: moBatchChartCategories.value,
    labels: { style: { colors: '#cbd5e1' } },
  },
  yaxis: {
    labels: { style: { colors: '#cbd5e1' } },
  },
  legend: {
    labels: { colors: '#cbd5e1' },
  },
  tooltip: { theme: 'dark' },
  noData: {
    text: 'Belum ada data mo_batch',
    style: { color: '#cbd5e1' },
  },
}))

const taskStatusClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'success':
      return 'bg-green-500/20 text-green-300 border-green-500/40'
    case 'running':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
    case 'failed':
    case 'error':
      return 'bg-red-500/20 text-red-300 border-red-500/40'
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/40'
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

const refreshTaskSummary = async () => {
  const summary = await callMiddleware('/api/admin/task-monitor/summary?since_minutes=180')
  taskSummaries.value = summary?.data?.tasks || []
}

const refreshMoBatch = async () => {
  const batchResponse = await callMiddleware('/api/admin/table/mo-batch')
  moBatchRows.value = batchResponse?.data?.rows || []
}

const refreshHistories = async () => {
  const params = new URLSearchParams({
    limit: String(HISTORY_LIMIT),
    offset: String(historyOffset.value),
  })

  if (historySearch.value.trim()) {
    params.set('mo_id', historySearch.value.trim())
  }

  const historiesResponse = await callMiddleware(
    `/api/admin/table/mo-histories?${params.toString()}`,
  )
  historiesRows.value = historiesResponse?.data?.rows || []
  historyTotal.value = historiesResponse?.data?.pagination?.total || 0
  historyHasNext.value = historiesResponse?.data?.pagination?.has_next || false
}

const refreshAllData = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    await Promise.all([refreshTaskSummary(), refreshMoBatch(), refreshHistories()])
    lastUpdated.value = new Date().toLocaleString('id-ID')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Gagal memuat data middleware'
  } finally {
    loading.value = false
  }
}

const triggerManualSync = async () => {
  actionLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await callMiddleware('/api/admin/trigger-sync', { method: 'POST' })
    successMessage.value = 'Trigger sync berhasil dijalankan.'
    await refreshAllData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Trigger sync gagal'
  } finally {
    actionLoading.value = false
  }
}

const executeResetTask1Start = async () => {
  dangerActionLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await callMiddleware('/api/admin/reset-task1-start', { method: 'POST' })
    successMessage.value = 'Reset TASK1 Start berhasil. TASK dimulai ulang dari awal.'
    await refreshAllData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Reset TASK1 Start gagal'
  } finally {
    dangerActionLoading.value = false
  }
}

const executeClearMoBatch = async () => {
  dangerActionLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await callMiddleware('/api/admin/clear-mo-batch', { method: 'POST' })
    successMessage.value = 'Semua antrean MO Batch berhasil dihapus.'
    await refreshAllData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Clear MO Batch gagal'
  } finally {
    dangerActionLoading.value = false
  }
}

const openDangerConfirmation = (action) => {
  pendingDangerAction.value = action
  confirmModalStep.value = 1
  confirmModalOpen.value = true
}

const closeDangerConfirmation = () => {
  confirmModalOpen.value = false
  confirmModalStep.value = 1

  if (pendingDangerAction.value === 'reset-task1') {
    resetTask1Switch.value = false
  }

  if (pendingDangerAction.value === 'clear-mo-batch') {
    clearMoBatchSwitch.value = false
  }

  pendingDangerAction.value = ''
}

const confirmDangerAction = async () => {
  if (confirmModalStep.value === 1) {
    confirmModalStep.value = 2
    return
  }

  if (pendingDangerAction.value === 'reset-task1') {
    await executeResetTask1Start()
  }

  if (pendingDangerAction.value === 'clear-mo-batch') {
    await executeClearMoBatch()
  }

  closeDangerConfirmation()
}

watch(resetTask1Switch, async (enabled) => {
  if (!enabled) return

  openDangerConfirmation('reset-task1')
})

watch(clearMoBatchSwitch, async (enabled) => {
  if (!enabled) return

  openDangerConfirmation('clear-mo-batch')
})

watch(triggerSyncSwitch, async (enabled) => {
  if (!enabled) return

  await triggerManualSync()
  triggerSyncSwitch.value = false
})

const continueMonitoring = async () => {
  continuing.value = true
  schedulerEnabled.value = true
  await refreshAllData()
  continuing.value = false
}

const startAutoRefresh = () => {
  if (refreshTimer.value) clearInterval(refreshTimer.value)
  refreshTimer.value = setInterval(() => {
    if (schedulerEnabled.value) {
      refreshAllData()
    }
  }, AUTO_REFRESH_MS)
}

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

watch(historySearch, () => {
  historyOffset.value = 0
  refreshHistories()
})

const goNextPage = async () => {
  if (!historyHasNext.value) return
  historyOffset.value += HISTORY_LIMIT
  await refreshHistories()
}

const goPrevPage = async () => {
  if (historyOffset.value === 0) return
  historyOffset.value = Math.max(0, historyOffset.value - HISTORY_LIMIT)
  await refreshHistories()
}

watch(
  schedulerEnabled,
  (enabled) => {
    if (enabled) {
      startAutoRefresh()
      refreshAllData()
      return
    }
    stopAutoRefresh()
  },
  { immediate: false },
)

onMounted(async () => {
  await refreshAllData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<template>
  <div>
    <ScadaNavbar />

    <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 font-poppins"
    >
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 p-3">
            <span class="material-symbols-outlined text-2xl text-white">sync_alt</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white">Middleware SCADA</h1>
            <p class="text-sm text-gray-400">Scheduler Monitoring & Production Tables</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            @click="continueMonitoring"
            :disabled="continuing"
            class="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue Monitoring Task Scheduler
          </button>
        </div>
      </div>

      <div
        class="mb-6 rounded-xl border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-5 shadow-lg"
      >
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-3">
            <label class="relative inline-flex cursor-pointer items-center">
              <input v-model="schedulerEnabled" type="checkbox" class="peer sr-only" />
              <div
                class="peer h-6 w-11 rounded-full bg-slate-600 transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-green-500 peer-checked:after:translate-x-full"
              ></div>
            </label>
            <div>
              <p class="text-sm font-semibold text-white">Switch Scheduler Monitoring</p>
              <p class="text-xs text-gray-400">
                {{ schedulerEnabled ? 'ON - auto refresh aktif' : 'OFF - auto refresh berhenti' }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="relative inline-flex cursor-pointer items-center">
              <input
                v-model="triggerSyncSwitch"
                type="checkbox"
                class="peer sr-only"
                :disabled="actionLoading"
              />
              <div
                class="peer h-6 w-11 rounded-full bg-slate-600 transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-orange-500 peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
              ></div>
            </label>
            <div>
              <p class="text-sm font-semibold text-white">Switch Trigger TASK1 Manual</p>
              <p class="text-xs text-gray-400">
                {{
                  actionLoading ? 'Memproses trigger sync...' : 'ON untuk trigger sync satu kali'
                }}
              </p>
            </div>
          </div>

          <div class="text-right text-xs text-gray-400">
            <p>Interval refresh: 15 detik</p>
            <p>Last update: {{ lastUpdated }}</p>
          </div>
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="successMessage"
        class="mb-6 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-300"
      >
        {{ successMessage }}
      </div>

      <div
        class="mb-6 rounded-xl border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-5 shadow-lg"
      >
        <div class="mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-xl text-red-400">warning</span>
          <h2 class="text-base font-bold text-white">Danger Actions</h2>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-lg border border-slate-600 bg-slate-800/70 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-white">Switch Reset TASK1 Start</p>
                <p class="text-xs text-gray-400">
                  Reset ulang TASK dari awal (double confirmation).
                </p>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input
                  v-model="resetTask1Switch"
                  type="checkbox"
                  class="peer sr-only"
                  :disabled="dangerActionLoading"
                />
                <div
                  class="peer h-6 w-11 rounded-full bg-slate-600 transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
                ></div>
              </label>
            </div>
          </div>

          <div class="rounded-lg border border-slate-600 bg-slate-800/70 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-white">Switch Clear MO Batch</p>
                <p class="text-xs text-gray-400">
                  Hapus seluruh MO Batch pada antrean (double confirmation).
                </p>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input
                  v-model="clearMoBatchSwitch"
                  type="checkbox"
                  class="peer sr-only"
                  :disabled="dangerActionLoading"
                />
                <div
                  class="peer h-6 w-11 rounded-full bg-slate-600 transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
                ></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div
          v-for="task in taskSummaries"
          :key="task.task"
          class="rounded-xl border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-4 shadow-lg"
        >
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-white">{{ task.label || task.task }}</h2>
            <span
              class="rounded-full border px-2 py-0.5 text-xs font-semibold"
              :class="taskStatusClass(task.status)"
            >
              {{ task.status || 'unknown' }}
            </span>
          </div>
          <p class="mb-2 line-clamp-2 text-xs text-gray-300">{{ task.latest_message || '-' }}</p>
          <p class="text-xs text-gray-400">Run: {{ task.last_run_at || '-' }}</p>
        </div>
      </div>

      <div
        class="mb-8 rounded-xl border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-6 shadow-lg"
      >
        <div class="mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-xl text-cyan-400">bar_chart</span>
          <h2 class="text-lg font-bold text-white">Bar Chart `mo_batch`</h2>
        </div>
        <apexchart
          type="bar"
          :options="moBatchChartOptions"
          :series="moBatchChartSeries"
          height="320"
        />

        <div class="mt-6 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-600">
                <th class="px-4 py-3 text-left font-semibold text-gray-300">MO ID</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-300">Consumption</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-300">Actual Consumption</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in moBatchRows"
                :key="row.id || row.mo_id || index"
                class="border-b border-slate-600/50 hover:bg-slate-600/30"
              >
                <td class="px-4 py-3 text-white">{{ row.mo_id || row.batch_no || '-' }}</td>
                <td class="px-4 py-3 text-right text-cyan-300">
                  {{ getTotalConsumption(row).toFixed(2) }}
                </td>
                <td class="px-4 py-3 text-right text-green-300">
                  {{ getTotalActualConsumption(row).toFixed(2) }}
                </td>
              </tr>
              <tr v-if="!moBatchRows.length">
                <td colspan="3" class="px-4 py-6 text-center text-sm text-gray-400">
                  Tidak ada data mo_batch.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        class="rounded-xl border border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 p-6 shadow-lg"
      >
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-purple-400">table_view</span>
            <h2 class="text-lg font-bold text-white">Table `mo_histories`</h2>
          </div>
          <input
            v-model="historySearch"
            type="text"
            placeholder="Search mo_id..."
            class="w-full rounded-lg border border-slate-500 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 md:w-72"
          />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-600">
                <th class="px-4 py-3 text-left font-semibold text-gray-300">No</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-300">MO ID</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-300">Status</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-300">Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in historiesRows"
                :key="row.id || `${row.mo_id}-${index}`"
                class="border-b border-slate-600/50 hover:bg-slate-600/30"
              >
                <td class="px-4 py-3 text-gray-300">{{ getRowNumber(index) }}</td>
                <td class="px-4 py-3 text-white">{{ row.mo_id || '-' }}</td>
                <td class="px-4 py-3 text-gray-200">{{ row.status || '-' }}</td>
                <td class="px-4 py-3 text-gray-400">
                  {{ row.created_at || row.updated_at || '-' }}
                </td>
              </tr>
              <tr v-if="!historiesRows.length">
                <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-400">
                  Data mo_histories tidak ditemukan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <p class="text-xs text-gray-400">
            Page {{ historyPage }} / {{ historyTotalPages }} · Total {{ historyTotal }} rows
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="goPrevPage"
              :disabled="historyOffset === 0 || loading"
              class="rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              @click="goNextPage"
              :disabled="!historyHasNext || loading"
              class="rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="mt-4 text-center text-sm text-cyan-300">
        Loading middleware data...
      </div>

      <div
        v-if="confirmModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      >
        <div class="w-full max-w-md rounded-xl border border-slate-600 bg-slate-800 p-5 shadow-2xl">
          <div class="mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-red-400">warning</span>
            <h3 class="text-base font-bold text-white">{{ confirmModalTitle }}</h3>
          </div>

          <p class="mb-2 text-sm font-semibold text-red-300">{{ confirmModalActionLabel }}</p>
          <p class="mb-5 text-sm text-gray-300">{{ confirmModalMessage }}</p>

          <div class="flex items-center justify-end gap-2">
            <button
              @click="closeDangerConfirmation"
              :disabled="dangerActionLoading"
              class="rounded-lg border border-slate-500 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>
            <button
              @click="confirmDangerAction"
              :disabled="dangerActionLoading"
              class="rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-red-700 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{
                dangerActionLoading
                  ? 'Memproses...'
                  : confirmModalStep === 1
                    ? 'Lanjutkan'
                    : 'Ya, Eksekusi'
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
