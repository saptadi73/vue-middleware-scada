<script setup>
import { computed } from 'vue'
import taskProgressData from '@/assets/data/task-progress.json'

const summary = taskProgressData.summary

const activeTasks = computed(() =>
  taskProgressData.gantt
    .filter((task) => (task.status || '').toLowerCase() === 'on progress')
    .sort((a, b) => new Date(a.end) - new Date(b.end)),
)

const totalActiveProgress = computed(() => {
  if (!activeTasks.value.length) return 0
  const total = activeTasks.value.reduce((sum, task) => sum + task.progress, 0)
  return (total / activeTasks.value.length).toFixed(1)
})

const progressClass = (progress) => {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-blue-500'
  return 'bg-orange-500'
}

const daysToDeadline = (endDate) => {
  const today = new Date()
  const deadline = new Date(endDate)
  const diffMs = deadline - today
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

const deadlineClass = (days) => {
  if (days <= 3) return 'text-red-600 bg-red-100'
  if (days <= 7) return 'text-orange-600 bg-orange-100'
  return 'text-green-600 bg-green-100'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6 font-poppins">
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold text-gray-800">Task Monitor</h1>
      <p class="text-gray-600">
        Monitoring task yang sedang berjalan secara real-time berdasarkan status On Progress.
      </p>
    </div>

    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-md">
        <p class="text-sm font-semibold text-gray-600">Task Sedang Berjalan</p>
        <p class="mt-2 text-3xl font-bold text-gray-800">{{ summary.inProgressTasks }}</p>
      </div>
      <div class="rounded-lg border-l-4 border-purple-500 bg-white p-6 shadow-md">
        <p class="text-sm font-semibold text-gray-600">Rata-rata Progress Aktif</p>
        <p class="mt-2 text-3xl font-bold text-gray-800">{{ totalActiveProgress }}%</p>
      </div>
      <div class="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-md">
        <p class="text-sm font-semibold text-gray-600">Task Selesai</p>
        <p class="mt-2 text-3xl font-bold text-gray-800">{{ summary.completedTasks }}</p>
      </div>
      <div class="rounded-lg border-l-4 border-red-500 bg-white p-6 shadow-md">
        <p class="text-sm font-semibold text-gray-600">Task Blocked</p>
        <p class="mt-2 text-3xl font-bold text-gray-800">{{ summary.blockedTasks }}</p>
      </div>
    </div>

    <div class="rounded-lg bg-white p-6 shadow-md">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Daftar Task Sedang Berjalan</h2>
        <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          {{ activeTasks.length }} task aktif
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="px-4 py-3 text-left font-semibold">Task</th>
              <th class="px-4 py-3 text-left font-semibold">PIC</th>
              <th class="px-4 py-3 text-left font-semibold">Periode</th>
              <th class="px-4 py-3 text-left font-semibold">Progress</th>
              <th class="px-4 py-3 text-left font-semibold">Deadline</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in activeTasks"
              :key="`${task.task}-${task.assignee}`"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-4 py-3 font-medium text-gray-800">{{ task.task }}</td>
              <td class="px-4 py-3 text-gray-600">{{ task.assignee }}</td>
              <td class="px-4 py-3 text-gray-600">
                {{ new Date(task.start).toLocaleDateString('id-ID') }} -
                {{ new Date(task.end).toLocaleDateString('id-ID') }}
              </td>
              <td class="px-4 py-3">
                <div class="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{{ task.progress }}%</span>
                </div>
                <div class="h-2 w-40 rounded-full bg-gray-200">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="progressClass(task.progress)"
                    :style="{ width: `${task.progress}%` }"
                  ></div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-1 text-xs font-semibold"
                  :class="deadlineClass(daysToDeadline(task.end))"
                >
                  {{ daysToDeadline(task.end) }} hari
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
