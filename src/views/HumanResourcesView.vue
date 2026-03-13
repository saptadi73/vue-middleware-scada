<template>
  <div class="min-h-screen bg-gray-50 p-6 font-poppins">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Human Resources Management</h1>
      <p class="text-gray-600">
        Detailed view of team allocation, workload, skills, and productivity
      </p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-600 text-sm font-semibold">Total Employees</h3>
          <span class="material-symbols-outlined text-purple-500">groups</span>
        </div>
        <p class="text-3xl font-bold text-gray-800">{{ hrData.summary.totalEmployees }}</p>
        <p class="text-sm text-gray-500 mt-1">
          {{ hrData.summary.activeProjects }} Active Projects
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-600 text-sm font-semibold">Utilization Rate</h3>
          <span class="material-symbols-outlined text-blue-500">work</span>
        </div>
        <p class="text-3xl font-bold text-gray-800">{{ hrData.summary.utilizationRate }}%</p>
        <p class="text-sm text-gray-500 mt-1">
          {{ hrData.summary.totalWorkingHours }}h / {{ hrData.summary.totalCapacityHours }}h
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-600 text-sm font-semibold">Attendance Rate</h3>
          <span class="material-symbols-outlined text-green-500">check_circle</span>
        </div>
        <p class="text-3xl font-bold text-gray-800">{{ hrData.summary.averageAttendance }}%</p>
        <p class="text-sm text-gray-500 mt-1">
          {{ hrData.attendanceData.availability[0].count }} Available Today
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-gray-600 text-sm font-semibold">Avg Productivity</h3>
          <span class="material-symbols-outlined text-orange-500">trending_up</span>
        </div>
        <p class="text-3xl font-bold text-gray-800">{{ hrData.summary.averageProductivity }}</p>
        <p class="text-sm text-gray-500 mt-1">Score out of 100</p>
      </div>
    </div>

    <!-- Project Allocation Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span class="material-symbols-outlined mr-2 text-purple-600">folder_open</span>
        Personnel Allocation per Project
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <apexchart
            type="bar"
            height="320"
            :options="projectAllocationOptions"
            :series="projectAllocationSeries"
          ></apexchart>
        </div>
        <div class="space-y-4">
          <div
            v-for="project in hrData.projectAllocation"
            :key="project.projectName"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="font-semibold text-gray-800">{{ project.projectName }}</h3>
                <span class="text-sm text-gray-500">{{ project.totalMembers }} Members</span>
              </div>
              <span
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="
                  project.completionRate >= 80
                    ? 'bg-green-100 text-green-800'
                    : project.completionRate >= 50
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-800'
                "
              >
                {{ project.completionRate }}% Complete
              </span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div v-for="(count, role) in project.roles" :key="role">
                <span class="text-gray-600">{{ role }}:</span>
                <span class="font-semibold ml-1">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Workload Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-symbols-outlined mr-2 text-blue-600">schedule</span>
          Workload Analysis
        </h2>
        <apexchart
          type="line"
          height="300"
          :options="workloadOptions"
          :series="workloadSeries"
        ></apexchart>
        <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div class="bg-blue-50 p-3 rounded">
            <p class="text-gray-600">Total Working Hours</p>
            <p class="text-2xl font-bold text-blue-600">{{ totalWorkedHours }}</p>
          </div>
          <div class="bg-purple-50 p-3 rounded">
            <p class="text-gray-600">Total Capacity</p>
            <p class="text-2xl font-bold text-purple-600">{{ totalCapacityHours }}</p>
          </div>
        </div>
      </div>

      <!-- Attendance & Availability -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-symbols-outlined mr-2 text-green-600">event_available</span>
          Attendance & Availability
        </h2>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <apexchart
            type="donut"
            height="220"
            :options="availabilityOptions"
            :series="availabilitySeries"
          ></apexchart>
          <apexchart
            type="bar"
            height="220"
            :options="attendanceWeeklyOptions"
            :series="attendanceWeeklySeries"
          ></apexchart>
        </div>
        <div class="grid grid-cols-3 gap-3 text-sm">
          <div class="bg-green-50 p-3 rounded text-center">
            <p class="text-gray-600 text-xs">Present Rate</p>
            <p class="text-xl font-bold text-green-600">
              {{ hrData.attendanceData.summary.attendanceRate }}%
            </p>
          </div>
          <div class="bg-blue-50 p-3 rounded text-center">
            <p class="text-gray-600 text-xs">On Leave</p>
            <p class="text-xl font-bold text-blue-600">
              {{ hrData.attendanceData.availability[1].count }}
            </p>
          </div>
          <div class="bg-red-50 p-3 rounded text-center">
            <p class="text-gray-600 text-xs">Sick</p>
            <p class="text-xl font-bold text-red-600">
              {{ hrData.attendanceData.availability[2].count }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Skill Matrix Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span class="material-symbols-outlined mr-2 text-indigo-600">psychology</span>
        Skill Matrix & Role Mapping
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <apexchart
            type="heatmap"
            height="350"
            :options="skillMatrixOptions"
            :series="skillMatrixSeries"
          ></apexchart>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Skill Breakdown</h3>
          <div class="space-y-3">
            <div
              v-for="skill in getTopSkills()"
              :key="skill.skill + skill.level"
              class="border-l-4 pl-3 py-2"
              :class="skill.level === 'Expert' ? 'border-indigo-500' : 'border-blue-300'"
            >
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-medium text-gray-800 text-sm">{{ skill.skill }}</p>
                  <p class="text-xs text-gray-500">{{ skill.level }}</p>
                </div>
                <span class="text-lg font-bold text-indigo-600">{{ skill.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Productivity Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Individual Productivity -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-symbols-outlined mr-2 text-orange-600">person</span>
          Individual Productivity Score
        </h2>
        <apexchart
          type="bar"
          height="350"
          :options="individualProductivityOptions"
          :series="individualProductivitySeries"
        ></apexchart>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left p-2 text-gray-600">Name</th>
                <th class="text-left p-2 text-gray-600">Role</th>
                <th class="text-center p-2 text-gray-600">Tasks</th>
                <th class="text-center p-2 text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="person in hrData.individualProductivity.slice(0, 5)"
                :key="person.name"
                class="border-t hover:bg-gray-50"
              >
                <td class="p-2 font-medium">{{ person.name }}</td>
                <td class="p-2 text-gray-600">{{ person.role }}</td>
                <td class="p-2 text-center">{{ person.tasksCompleted }}</td>
                <td class="p-2 text-center">
                  <span
                    class="px-2 py-1 rounded font-semibold"
                    :class="
                      person.productivityScore >= 95
                        ? 'bg-green-100 text-green-800'
                        : person.productivityScore >= 90
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                    "
                  >
                    {{ person.productivityScore }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Team Productivity -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span class="material-symbols-outlined mr-2 text-pink-600">groups_3</span>
          Team Productivity Score
        </h2>
        <apexchart
          type="radar"
          height="350"
          :options="teamProductivityOptions"
          :series="teamProductivitySeries"
        ></apexchart>
        <div class="mt-4 space-y-3">
          <div
            v-for="team in hrData.teamProductivity"
            :key="team.team"
            class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
          >
            <div>
              <p class="font-semibold text-gray-800">{{ team.team }}</p>
              <p class="text-xs text-gray-500">{{ team.tasksCompleted }} tasks completed</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <p class="text-xs text-gray-500">Avg Score</p>
                <p class="font-bold text-lg text-purple-600">{{ team.avgProductivity }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">On-Time</p>
                <p class="font-bold text-lg text-green-600">{{ team.onTimeDelivery }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import humanResourcesData from '@/assets/data/human-resources.json'

const hrData = ref(humanResourcesData)

// Computed values
const totalWorkedHours = computed(() => {
  return hrData.value.workloadData.reduce((sum, week) => sum + week.workedHours, 0)
})

const totalCapacityHours = computed(() => {
  return hrData.value.workloadData.reduce((sum, week) => sum + week.capacityHours, 0)
})

// Project Allocation Chart
const projectAllocationSeries = ref([
  {
    name: 'Team Members',
    data: hrData.value.projectAllocation.map((p) => p.totalMembers),
  },
])

const projectAllocationOptions = ref({
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
    formatter: (val) => val + ' members',
    offsetX: 30,
  },
  xaxis: {
    categories: hrData.value.projectAllocation.map((p) => p.projectName),
    labels: {
      show: true,
    },
  },
  yaxis: {
    labels: {
      show: true,
      maxWidth: 150,
    },
  },
  colors: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  legend: { show: false },
})

// Workload Chart
const workloadSeries = ref([
  {
    name: 'Worked Hours',
    data: hrData.value.workloadData.map((w) => w.workedHours),
  },
  {
    name: 'Capacity Hours',
    data: hrData.value.workloadData.map((w) => w.capacityHours),
  },
])

const workloadOptions = ref({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  stroke: {
    width: [4, 2],
    curve: 'smooth',
    dashArray: [0, 5],
  },
  xaxis: {
    categories: hrData.value.workloadData.map((w) => w.week),
  },
  yaxis: {
    title: { text: 'Hours' },
  },
  colors: ['#3B82F6', '#9CA3AF'],
  markers: {
    size: [6, 0],
  },
  legend: { position: 'top' },
})

// Availability Donut Chart
const availabilitySeries = ref(hrData.value.attendanceData.availability.map((a) => a.count))

const availabilityOptions = ref({
  chart: {
    type: 'donut',
    fontFamily: 'Poppins, sans-serif',
  },
  labels: hrData.value.attendanceData.availability.map((a) => a.status),
  colors: ['#10B981', '#3B82F6', '#EF4444'],
  legend: {
    position: 'bottom',
    fontSize: '12px',
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => val.toFixed(1) + '%',
  },
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

// Attendance Weekly Chart
const attendanceWeeklySeries = ref([
  {
    name: 'Present %',
    data: hrData.value.attendanceData.weeklyTrend.map((w) => w.present),
  },
])

const attendanceWeeklyOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '60%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: hrData.value.attendanceData.weeklyTrend.map((w) => w.week.replace('Week ', 'W')),
  },
  yaxis: {
    max: 100,
    labels: {
      formatter: (val) => val + '%',
    },
  },
  colors: ['#10B981'],
})

// Skill Matrix Heatmap
const getTopSkills = () => {
  return hrData.value.skillMatrix.slice(0, 5)
}

const skillMatrixSeries = ref([
  {
    name: 'Expert',
    data: hrData.value.skillMatrix
      .filter((s) => s.level === 'Expert')
      .map((s) => ({ x: s.skill, y: s.count })),
  },
  {
    name: 'Intermediate',
    data: hrData.value.skillMatrix
      .filter((s) => s.level === 'Intermediate')
      .map((s) => ({ x: s.skill, y: s.count })),
  },
])

const skillMatrixOptions = ref({
  chart: {
    type: 'heatmap',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  dataLabels: {
    enabled: true,
  },
  colors: ['#5B21B6'],
  plotOptions: {
    heatmap: {
      radius: 4,
      colorScale: {
        ranges: [
          { from: 0, to: 2, color: '#DDD6FE', name: 'Low' },
          { from: 3, to: 4, color: '#A78BFA', name: 'Medium' },
          { from: 5, to: 10, color: '#7C3AED', name: 'High' },
        ],
      },
    },
  },
})

// Individual Productivity Chart
const individualProductivitySeries = ref([
  {
    name: 'Productivity Score',
    data: hrData.value.individualProductivity.map((p) => p.productivityScore),
  },
])

const individualProductivityOptions = ref({
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
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => val,
  },
  xaxis: {
    categories: hrData.value.individualProductivity.map((p) => p.name),
    max: 100,
  },
  colors: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1', '#3B82F6', '#10B981', '#14B8A6'],
  legend: { show: false },
})

// Team Productivity Radar Chart
const teamProductivitySeries = ref([
  {
    name: 'Avg Productivity',
    data: hrData.value.teamProductivity.map((t) => t.avgProductivity),
  },
  {
    name: 'On-Time Delivery',
    data: hrData.value.teamProductivity.map((t) => t.onTimeDelivery),
  },
])

const teamProductivityOptions = ref({
  chart: {
    type: 'radar',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif',
  },
  xaxis: {
    categories: hrData.value.teamProductivity.map((t) => t.team),
  },
  yaxis: {
    max: 100,
  },
  colors: ['#8B5CF6', '#10B981'],
  markers: {
    size: 4,
  },
  stroke: {
    width: 2,
  },
  fill: {
    opacity: 0.2,
  },
  legend: {
    position: 'top',
  },
})
</script>
