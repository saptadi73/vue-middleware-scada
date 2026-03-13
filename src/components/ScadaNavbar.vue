<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const isActive = (path) => computed(() => route.path === path)
</script>

<template>
  <nav
    class="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 shadow-lg sticky top-0 z-50"
  >
    <div class="px-6">
      <div class="flex justify-between items-center h-16">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
            <span class="material-symbols-outlined text-white text-2xl">build</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-white font-poppins">SCADA Dashboard</h1>
            <p class="text-xs text-gray-400">Pengolahan Pakan Ternak</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="hidden sm:flex sm:items-center sm:space-x-6">
          <RouterLink
            to="/middleware"
            :class="[
              isActive('/middleware').value
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200',
              'inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors font-poppins',
            ]"
          >
            <span class="material-symbols-outlined text-sm mr-1">sync_alt</span>
            Middleware
          </RouterLink>
          <RouterLink
            to="/middleware-kiosk"
            :class="[
              isActive('/middleware-kiosk').value
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-200',
              'inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors font-poppins',
            ]"
          >
            <span class="material-symbols-outlined text-sm mr-1">tv</span>
            TV Kiosk
          </RouterLink>
        </div>

        <!-- Status Indicator -->
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full"
          >
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span class="text-xs text-green-300 font-semibold">ONLINE</span>
          </span>
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
