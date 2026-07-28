<script setup lang="ts">
import type { MetricCardItem } from '@/types/app'

import BaseIcon from './BaseIcon.vue'

defineProps<{
  item: MetricCardItem
}>()
</script>

<template>
  <article class="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-slate-900/76">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.title }}</p>
        <p class="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {{ item.value }}
        </p>
      </div>

      <div :class="['rounded-2xl p-3 ring-1', item.tone]">
        <BaseIcon :name="item.icon" :size="20" />
      </div>
    </div>

    <p class="mt-4 text-sm text-slate-600 dark:text-slate-300">{{ item.detail }}</p>
  </article>
</template>
