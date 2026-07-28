<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'

defineProps<{
  isDark: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-sky-400/40 dark:hover:text-sky-200"
    @click="emit('toggle')"
  >
    <BaseIcon :name="isDark ? 'SunMedium' : 'MoonStar'" :size="16" />
    <span>{{ isDark ? 'Light mode' : 'Dark mode' }}</span>
  </button>
</template>
