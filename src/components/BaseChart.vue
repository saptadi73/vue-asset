<script setup lang="ts">
import type { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexOptions } from 'apexcharts'
import { defineAsyncComponent } from 'vue'

const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))

defineProps<{
  type: 'line' | 'area' | 'bar' | 'donut' | 'radialBar'
  height?: number
  options: ApexOptions
  series: ApexAxisChartSeries | ApexNonAxisChartSeries
}>()
</script>

<template>
  <VueApexCharts :type="type" :height="height" :options="options" :series="series" />
</template>
