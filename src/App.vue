<script setup>
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'

const route = useRoute()

// Check if current route should show SCADA navbar instead of regular navbar
const isSCADARoute = (path) =>
  path === '/' ||
  path === '/scada' ||
  path === '/reports' ||
  path === '/quality' ||
  path === '/inventory' ||
  path === '/maintenance' ||
  path === '/kpi' ||
  path === '/middleware' ||
  path === '/middleware-kiosk'
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Regular Navbar -->
    <Navbar v-if="!isSCADARoute(route.path)" />

    <!-- Main Content -->
    <router-view />
  </div>
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
