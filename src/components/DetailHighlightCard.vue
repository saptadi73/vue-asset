<script setup lang="ts">
import BaseIcon from '@/components/BaseIcon.vue'

withDefaults(
  defineProps<{
    eyebrow: string
    statusLabel?: string
    note: string
    icon: string
    tone: string
    badgeTone?: string
  }>(),
  {
    statusLabel: '',
    badgeTone:
      'bg-slate-200/80 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
  },
)
</script>

<template>
  <div class="rounded-[22px] border p-5" :class="tone">
    <div class="flex items-start gap-3">
      <div class="rounded-2xl bg-white/80 p-2 ring-1 ring-white/60 dark:bg-slate-950/40 dark:ring-white/10">
        <BaseIcon :name="icon" :size="18" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold tracking-[0.18em] uppercase opacity-70">{{ eyebrow }}</p>
        <div v-if="statusLabel" class="mt-3">
          <span
            class="inline-flex max-w-full rounded-full px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ring-1"
            :class="badgeTone"
          >
            {{ statusLabel }}
          </span>
        </div>
        <p class="mt-3 text-sm leading-7 opacity-90">{{ note }}</p>
      </div>
    </div>
  </div>
</template>
