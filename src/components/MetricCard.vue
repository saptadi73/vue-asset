<script setup lang="ts">
import type { MetricCardItem } from '@/types/app'

import BaseIcon from './BaseIcon.vue'

defineProps<{
  item: MetricCardItem
}>()
</script>

<template>
  <article class="flex min-h-[158px] flex-col justify-between rounded-[24px] border border-slate-200/70 bg-white/92 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] dark:border-white/10 dark:bg-slate-900/76">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="max-w-[12rem] text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{{ item.title }}</p>
        <p class="mt-3 text-[2.15rem] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
          {{ item.value }}
        </p>
      </div>

      <div :class="['rounded-2xl p-2.5 ring-1', item.tone]">
        <BaseIcon :name="item.icon" :size="18" />
      </div>
    </div>

    <p
      v-if="item.detail"
      class="mt-4 border-t border-slate-200/80 pt-3 text-xs font-medium leading-5 text-slate-500 dark:border-white/10 dark:text-slate-400"
    >
      {{ item.detail }}
    </p>
  </article>
</template>
