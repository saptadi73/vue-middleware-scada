import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/middleware',
    },
    {
      path: '/scada',
      name: 'scada',
      component: () => import('../views/SCADADashboardView.vue'),
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/ProductionReportView.vue'),
    },
    {
      path: '/quality',
      name: 'quality',
      component: () => import('../views/QualityReportView.vue'),
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('../views/InventoryDashboardView.vue'),
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: () => import('../views/MaintenanceDashboardView.vue'),
    },
    {
      path: '/kpi',
      name: 'kpi',
      component: () => import('../views/RTKPIDashboardView.vue'),
    },
    {
      path: '/middleware',
      name: 'middleware',
      component: () => import('../views/ScadaMiddlewareView.vue'),
    },
    {
      path: '/middleware-kiosk',
      name: 'middleware-kiosk',
      component: () => import('../views/MiddlewareKioskView.vue'),
    },
    {
      path: '/hr',
      name: 'hr',
      component: () => import('../views/HumanResourcesView.vue'),
    },
    {
      path: '/task-monitor',
      name: 'task-monitor',
      component: () => import('../views/TaskMonitorView.vue'),
    },
  ],
})

export default router
