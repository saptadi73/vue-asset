<script setup lang="ts">
import type { LucideProps } from '@lucide/vue'
import { icons } from '@lucide/vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
    strokeWidth?: number
  }>(),
  {
    size: 20,
    strokeWidth: 2,
  },
)

const iconRegistry = icons as Record<string, unknown>
const iconComponent = computed(() => iconRegistry[props.name] ?? iconRegistry.CircleHelp)
</script>

<template>
  <component
    :is="iconComponent"
    :size="size"
    :stroke-width="strokeWidth"
    v-bind="$attrs as LucideProps"
  />
</template>
