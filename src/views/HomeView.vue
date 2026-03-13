<template>
  <div class="min-h-screen bg-gray-50 p-6 font-poppins">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Project Management Dashboard</h1>
      <p class="text-gray-600">Overview of project metrics and performance indicators</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Task Progress Card -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-600 text-sm font-semibold">Task Completion</h3>
          <span class="material-symbols-outlined text-blue-500">task_alt</span>
        </div>
        <p class="text-3xl font-bold text-gray-800">{{ taskData.summary.completionRate }}%</p>
        <p class="text-sm text-gray-500 mt-1">
          {{ taskData.summary.completedTasks }}/{{ taskData.summary.totalTasks }} tasks
        </p>
      </div>

      <!-- Budget Card -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-600 text-sm font-semibold">Budget Utilization</h3>
          <span class="material-symbols-outlined text-green-500">payments</span>
        </div>
        <p class="text-3xl font-bold text-gray-800">{{ budgetData.summary.utilizationRate }}%</p>
        <p class="text-sm text-gray-500 mt-1">
          ${{ formatNumber(budgetData.summary.spentBudget) }} / ${{
            formatNumber(budgetData.summary.totalBudget)
          }}
        </p>
      </div>

      <!-- Team Card -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-600 text-sm font-semibold">Team Members</h3>
          <span class="material-symbols-outlined text-purple-500">groups</span>
        </div>
        <p class="text-3xl font-bold text-gray-800">{{ hrData.summary.totalEmployees }}</p>
        <p class="text-sm text-gray-500 mt-1">{{ hrData.summary.utilizationRate }}% utilization</p>
      </div>

      <!-- Profit Card -->
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-600 text-sm font-semibold">Net Profit</h3>
          <span class="material-symbols-outlined text-orange-500">trending_up</span>
        </div>
        <p class="text-3xl font-bold text-gray-800">
          ${{ formatNumber(pnlData.summary.netProfit) }}
        </p>
        <p class="text-sm text-gray-500 mt-1">{{ pnlData.summary.profitMargin }}% margin</p>
      </div>
    </div>

    <!-- Task Delivery Detail -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold text-gray-800">Task Delivery Overview</h2>
          <p class="text-sm text-gray-600 mt-1">Breakdown by project -> milestone -> task</p>
          <div class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="status in taskData.statusBreakdown"
              :key="status.status"
              class="px-3 py-1 text-xs font-semibold rounded-full border"
              :class="statusChipClass(status.status)"
            >
              {{ status.status }}: {{ status.count }} ({{ status.percentage }}%)
            </span>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          <div class="bg-blue-50 px-3 py-2 rounded">
            <p class="text-xs text-gray-500">Weighted Progress</p>
            <p class="text-lg font-bold text-blue-700">
              {{ taskData.summary.avgProgressWeighted }}%
            </p>
          </div>
          <div class="bg-green-50 px-3 py-2 rounded">
            <p class="text-xs text-gray-500">SLA On Track</p>
            <p class="text-lg font-bold text-green-700">{{ taskData.sla.onTrack }}%</p>
          </div>
          <div class="bg-red-50 px-3 py-2 rounded">
            <p class="text-xs text-gray-500">Breach Rate</p>
            <p class="text-lg font-bold text-red-600">{{ taskData.summary.slaBreachRate }}%</p>
          </div>
          <div class="bg-yellow-50 px-3 py-2 rounded">
            <p class="text-xs text-gray-500">Overdue Tasks</p>
            <p class="text-lg font-bold text-yellow-700">{{ taskData.sla.overdueTasks }}</p>
          </div>
          <div class="bg-orange-50 px-3 py-2 rounded">
            <p class="text-xs text-gray-500">Avg Delay</p>
            <p class="text-lg font-bold text-orange-700">{{ taskData.sla.avgDelayDays }} days</p>
          </div>
          <div class="bg-gray-100 px-3 py-2 rounded">
            <p class="text-xs text-gray-500">At Risk</p>
            <p class="text-lg font-bold text-gray-700">{{ taskData.sla.atRisk }}%</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <!-- Milestone Progress & Project weights -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-symbols-outlined text-blue-600 mr-2">bar_chart</span>
          Progress per Milestone (weighted)
        </h2>
        <apexchart
          type="bar"
          height="320"
          :options="milestoneProgressOptions"
          :series="milestoneProgressSeries"
        ></apexchart>
        <div class="mt-4 pt-4 border-t grid sm:grid-cols-2 gap-3 text-sm">
          <div
            v-for="project in taskData.projects"
            :key="project.name"
            class="bg-gray-50 rounded p-3"
          >
            <div class="flex justify-between items-center">
              <p class="font-semibold text-gray-800">{{ project.name }}</p>
              <span class="text-xs text-gray-500">Weight {{ project.weight }}%</span>
            </div>
            <div class="mt-2 h-2 bg-gray-200 rounded">
              <div
                class="h-2 rounded"
                :style="{
                  width: project.overallProgress + '%',
                  backgroundColor: '#3B82F6',
                }"
              ></div>
            </div>
            <p class="text-xs text-gray-600 mt-1">Overall {{ project.overallProgress }}%</p>
          </div>
        </div>
      </div>

      <!-- Gantt Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-symbols-outlined text-purple-600 mr-2">calendar_month</span>
          Interactive Gantt
        </h2>
        <apexchart
          type="rangeBar"
          height="320"
          :options="ganttOptions"
          :series="ganttSeries"
        ></apexchart>
        <div class="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-sm">
          <div
            class="flex items-center gap-2"
            v-for="status in ['Not Started', 'On Progress', 'Blocked', 'Done']"
            :key="status"
          >
            <span
              class="inline-block w-3 h-3 rounded-full"
              :style="{ backgroundColor: statusColor(status) }"
            ></span>
            <span class="text-gray-700">{{ status }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <!-- Burndown / Burn-up -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-symbols-outlined text-emerald-600 mr-2">show_chart</span>
          Burndown & Burn-up
        </h2>
        <apexchart
          type="line"
          height="320"
          :options="burndownOptions"
          :series="burndownSeries"
        ></apexchart>
        <div class="mt-3 text-xs text-gray-600">
          Scope includes weighted story points; remaining auto-adjusts by completion.
        </div>
      </div>

      <!-- Overdue Heatmap & Dependencies -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-symbols-outlined text-red-600 mr-2">warning</span>
          Overdue Tracker & Dependencies
        </h2>
        <apexchart
          type="heatmap"
          height="260"
          :options="heatmapOptions"
          :series="heatmapSeries"
        ></apexchart>
        <div class="mt-4 pt-4 border-t">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Dependencies</h3>
          <div class="grid sm:grid-cols-2 gap-3 text-sm">
            <div
              v-for="dep in taskData.dependencies"
              :key="dep.task"
              class="border rounded p-3 flex justify-between items-start"
            >
              <div>
                <p class="font-semibold text-gray-800">{{ dep.task }}</p>
                <p class="text-xs text-gray-500">Depends on: {{ dep.dependsOn }}</p>
              </div>
              <div class="text-right">
                <span class="text-xs font-semibold block" :class="statusTextClass(dep.status)">{{
                  dep.status
                }}</span>
                <span class="text-xs text-gray-500">Risk: {{ dep.risk }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Other KPI sections -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Budget Progress Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Budget Progress Achievement</h2>
        <apexchart
          type="line"
          height="300"
          :options="budgetProgressOptions"
          :series="budgetProgressSeries"
        ></apexchart>
        <div class="mt-4 pt-4 border-t">
          <div class="grid grid-cols-2 gap-4">
            <div v-for="item in budgetData.budgetByCategory" :key="item.category" class="text-sm">
              <p class="text-gray-600">{{ item.category }}</p>
              <p class="font-semibold text-gray-800">
                ${{ formatNumber(item.spent) }} ({{ item.percentage.toFixed(1) }}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Human Resources Chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Human Resources</h2>
        <div class="grid grid-cols-2 gap-4">
          <apexchart
            type="donut"
            height="300"
            :options="hrCompositionOptions"
            :series="hrCompositionSeries"
          ></apexchart>
          <apexchart
            type="area"
            height="300"
            :options="hrProductivityOptions"
            :series="hrProductivitySeries"
          ></apexchart>
        </div>
        <div class="mt-4 pt-4 border-t">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Team Composition</h3>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="dept in hrData.teamComposition" :key="dept.department" class="text-xs">
              <p class="text-gray-600">{{ dept.department }}</p>
              <p class="font-semibold text-gray-800">{{ dept.members }} members</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Profit & Loss Chart -->
      <div class="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Profit & Loss (P&L)</h2>
        <apexchart type="bar" height="300" :options="pnlOptions" :series="pnlSeries"></apexchart>
        <div class="mt-4 pt-4 border-t">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-600">Total Revenue</p>
              <p class="text-lg font-bold text-green-600">
                ${{ formatNumber(pnlData.summary.totalRevenue) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Total Expenses</p>
              <p class="text-lg font-bold text-red-600">
                ${{ formatNumber(pnlData.summary.totalExpenses) }}
              </p>
            </div>
          </div>
          <div class="bg-blue-50 rounded p-3">
            <p class="text-sm text-gray-600">Growth Rate</p>
            <p class="text-xl font-bold text-blue-600">+{{ pnlData.summary.growthRate }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import taskProgressData from '@/assets/data/task-progress.json'
import budgetProgressData from '@/assets/data/budget-progress.json'
import humanResourcesData from '@/assets/data/human-resources.json'
import profitLossData from '@/assets/data/profit-loss.json'

const taskData = ref(taskProgressData)
const budgetData = ref(budgetProgressData)
const hrData = ref(humanResourcesData)
const pnlData = ref(profitLossData)

// Utility functions
const formatNumber = (num) => num.toLocaleString()

const statusColor = (status) => {
  const map = {
    'Not Started': '#9CA3AF',
    'On Progress': '#3B82F6',
    Blocked: '#EF4444',
    Done: '#10B981',
  }
  return map[status] || '#6B7280'
}

const statusChipClass = (status) => {
  const classes = {
    'Not Started': 'bg-gray-50 text-gray-700 border-gray-200',
    'On Progress': 'bg-blue-50 text-blue-700 border-blue-100',
    Blocked: 'bg-red-50 text-red-700 border-red-100',
    Done: 'bg-green-50 text-green-700 border-green-100',
  }
  return classes[status] || 'bg-gray-50 text-gray-700 border-gray-200'
}

const statusTextClass = (status) => {
  const classes = {
    'Not Started': 'text-gray-600',
    'On Progress': 'text-blue-600',
    Blocked: 'text-red-600',
    Done: 'text-green-600',
  }
  return classes[status] || 'text-gray-600'
}

// Milestone Progress (weighted)
const milestoneBarColors = taskData.value.milestoneProgress.map((m) => statusColor(m.status))
const milestoneProgressSeries = ref([
  {
    name: 'Progress',
    data: taskData.value.milestoneProgress.map((m) => m.progress),
  },
])

const milestoneProgressOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      borderRadius: 4,
      dataLabels: {
        position: 'top',
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val, opts) => {
      const weight = taskData.value.milestoneProgress[opts.dataPointIndex].weight
      return `${val}% · w${weight}%`
    },
    offsetX: 24,
    style: { fontSize: '12px', colors: ['#111827'] },
  },
  xaxis: {
    categories: taskData.value.milestoneProgress.map((m) => `${m.project} -> ${m.milestone}`),
    labels: {
      style: { fontSize: '11px' },
    },
    max: 100,
  },
  colors: milestoneBarColors,
  tooltip: {
    y: {
      formatter: (val, { dataPointIndex }) => {
        const m = taskData.value.milestoneProgress[dataPointIndex]
        return `${val}% · Status: ${m.status} · Weight ${m.weight}%`
      },
    },
  },
  legend: { show: false },
})

// Gantt (range bar)
const ganttSeries = ref([
  {
    data: taskData.value.gantt.map((task) => ({
      x: task.task,
      y: [new Date(task.start).getTime(), new Date(task.end).getTime()],
      fillColor: statusColor(task.status),
    })),
  },
])

const ganttOptions = ref({
  chart: {
    type: 'rangeBar',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      borderRadius: 4,
    },
  },
  xaxis: { type: 'datetime' },
  dataLabels: {
    enabled: true,
    formatter: (val, opts) => {
      const progress = taskData.value.gantt[opts.dataPointIndex].progress
      return `${progress}%`
    },
  },
  tooltip: {
    y: {
      formatter: (val, { dataPointIndex }) => {
        const t = taskData.value.gantt[dataPointIndex]
        return `${t.status} · ${t.assignee}`
      },
    },
  },
  colors: taskData.value.gantt.map((t) => statusColor(t.status)),
  legend: { show: false },
})

// Burndown / Burn-up
const burndownSeries = ref([
  {
    name: 'Scope',
    data: taskData.value.burndown.map((p) => p.scope),
  },
  {
    name: 'Remaining (Burn-down)',
    data: taskData.value.burndown.map((p) => p.remaining),
  },
  {
    name: 'Completed (Burn-up)',
    data: taskData.value.burndown.map((p) => p.completed),
  },
])

const burndownOptions = ref({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  stroke: { curve: 'smooth', width: [2, 3, 3], dashArray: [4, 0, 0] },
  xaxis: {
    categories: taskData.value.burndown.map((p) => p.label),
  },
  yaxis: {
    title: { text: 'Story Points' },
  },
  colors: ['#9CA3AF', '#EF4444', '#10B981'],
  markers: { size: 4 },
  legend: { position: 'top' },
})

// Overdue Heatmap
const heatmapSeries = ref(
  taskData.value.overdueHeatmap.map((month) => ({
    name: month.month,
    data: month.weeks.map((week) => ({ x: week.week, y: week.overdue })),
  })),
)

const heatmapOptions = ref({
  chart: {
    type: 'heatmap',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  dataLabels: { enabled: false },
  plotOptions: {
    heatmap: {
      distributed: true,
      colorScale: {
        ranges: [
          { from: 0, to: 0, color: '#E5E7EB', name: 'On Time' },
          { from: 1, to: 1, color: '#FBBF24', name: '+1' },
          { from: 2, to: 2, color: '#F97316', name: '+2' },
          { from: 3, to: 10, color: '#EF4444', name: '3+' },
        ],
      },
    },
  },
  xaxis: { labels: { style: { fontSize: '11px' } } },
  legend: { position: 'top' },
})

// Budget Progress Chart
const budgetProgressSeries = ref([
  {
    name: 'Allocated',
    data: budgetData.value.monthlyBudget.map((m) => m.allocated),
  },
  {
    name: 'Spent',
    data: budgetData.value.monthlyBudget.map((m) => m.spent),
  },
  {
    name: 'Variance',
    data: budgetData.value.monthlyBudget.map((m) => m.variance),
  },
])

const budgetProgressOptions = ref({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  stroke: { width: [3, 3, 3], curve: 'smooth' },
  xaxis: {
    categories: budgetData.value.monthlyBudget.map((m) => m.month),
  },
  yaxis: {
    title: { text: 'Budget ($)' },
    labels: {
      formatter: (val) => '$' + (val / 1000).toFixed(0) + 'K',
    },
  },
  colors: ['#3B82F6', '#EF4444', '#10B981'],
  markers: { size: 5 },
  tooltip: {
    y: {
      formatter: (val) => '$' + val.toLocaleString(),
    },
  },
  legend: { position: 'top' },
})

// HR Composition Chart (Donut)
const hrCompositionSeries = ref(hrData.value.teamComposition.map((d) => d.members))
const hrCompositionOptions = ref({
  chart: {
    type: 'donut',
    fontFamily: 'Poppins, sans-serif',
  },
  labels: hrData.value.teamComposition.map((d) => d.department),
  colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'],
  legend: { show: false },
  dataLabels: { enabled: true },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: () => hrData.value.summary.totalEmployees,
          },
        },
      },
    },
  },
})

// HR Productivity Chart (Area)
const hrProductivitySeries = ref([
  {
    name: 'Productivity',
    data: hrData.value.productivityTrend.map((p) => p.productivity),
  },
  {
    name: 'Utilization',
    data: hrData.value.productivityTrend.map((p) => p.utilization),
  },
])

const hrProductivityOptions = ref({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    categories: hrData.value.productivityTrend.map((p) => p.month),
  },
  yaxis: {
    title: { text: 'Percentage (%)' },
    min: 0,
    max: 100,
  },
  colors: ['#8B5CF6', '#EC4899'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
  dataLabels: { enabled: false },
  legend: { show: false },
})

// P&L Chart
const pnlSeries = ref([
  {
    name: 'Revenue',
    data: pnlData.value.monthlyPnL.map((m) => m.revenue),
  },
  {
    name: 'Expenses',
    data: pnlData.value.monthlyPnL.map((m) => m.expenses),
  },
  {
    name: 'Profit',
    data: pnlData.value.monthlyPnL.map((m) => m.profit),
  },
])

const pnlOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '60%',
      borderRadius: 4,
    },
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: pnlData.value.monthlyPnL.map((m) => m.month),
  },
  yaxis: {
    title: { text: 'Amount ($)' },
    labels: {
      formatter: (val) => '$' + (val / 1000).toFixed(0) + 'K',
    },
  },
  fill: { opacity: 1 },
  colors: ['#10B981', '#EF4444', '#3B82F6'],
  tooltip: {
    y: {
      formatter: (val) => '$' + val.toLocaleString(),
    },
  },
  legend: { position: 'top' },
})
</script>
