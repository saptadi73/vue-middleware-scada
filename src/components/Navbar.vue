<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const isActive = (path) => computed(() => route.path === path)
</script>

<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center gap-6">
          <div class="flex-shrink-0 flex items-center gap-2">
            <span class="material-symbols-outlined text-3xl text-purple-600">dashboard</span>
            <span class="text-xl font-bold text-gray-800 font-poppins">PM Dashboard</span>
          </div>
        </div>
        <div class="hidden sm:flex sm:items-center sm:space-x-4">
          <RouterLink
            to="/"
            :class="[
              isActive('/').value
                ? 'border-purple-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors font-poppins',
            ]"
          >
            <span class="material-symbols-outlined text-sm mr-1">home</span>
            Dashboard
          </RouterLink>
          <RouterLink
            to="/scada"
            :class="[
              isActive('/scada').value
                ? 'border-purple-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors font-poppins',
            ]"
          >
            <span class="material-symbols-outlined text-sm mr-1">build</span>
            SCADA
          </RouterLink>
          <RouterLink
            to="/reports"
            :class="[
              isActive('/reports').value
                ? 'border-purple-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors font-poppins',
            ]"
          >
            <span class="material-symbols-outlined text-sm mr-1">assessment</span>
            Laporan
          </RouterLink>
          <RouterLink
            to="/hr"
            :class="[
              isActive('/hr').value
                ? 'border-purple-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors font-poppins',
            ]"
          >
            <span class="material-symbols-outlined text-sm mr-1">groups</span>
            Human Resources
          </RouterLink>
          <RouterLink
            to="/task-monitor"
            :class="[
              isActive('/task-monitor').value
                ? 'border-purple-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors font-poppins',
            ]"
          >
            <span class="material-symbols-outlined text-sm mr-1">task_alt</span>
            Task Monitor
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 0,
    'wght' 400,
    'GRAD' 0,
    'opsz' 24;
}
</style>
