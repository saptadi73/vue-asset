<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import BaseIcon from '@/components/BaseIcon.vue'
import type { RelatedActionItem } from '@/types/app'

const props = defineProps<{
  actions: RelatedActionItem[]
}>()

const inferCategory = (action: RelatedActionItem) => {
  const label = action.label.toLowerCase()

  if (label.includes('maintenance')) return 'Maintenance'
  if (label.includes('transfer')) return 'Movement'
  if (label.includes('stocktake') || label.includes('tracking') || label.includes('scan')) return 'Audit'
  if (label.includes('lease') || label.includes('contract') || label.includes('license')) return 'Contract'
  return 'Core'
}

const groupedActions = computed(() => {
  const groups = new Map<string, RelatedActionItem[]>()

  for (const action of props.actions) {
    const category = inferCategory(action)
    const current = groups.get(category) ?? []
    current.push(action)
    groups.set(category, current)
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
})

const activeTab = ref<string>('')

watch(
  groupedActions,
  (groups) => {
    if (!groups.length) {
      activeTab.value = ''
      return
    }

    if (!groups.some((group) => group.label === activeTab.value)) {
      activeTab.value = groups[0]!.label
    }
  },
  { immediate: true },
)

const activeActions = computed(() => groupedActions.value.find((group) => group.label === activeTab.value)?.items ?? [])

const toneClass: Record<'primary' | 'secondary' | 'danger', string> = {
  primary:
    'border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500',
  secondary:
    'border-slate-200/80 bg-white/90 text-slate-700 hover:border-sky-300 hover:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200',
  danger:
    'border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200',
}

const iconToneClass: Record<'primary' | 'secondary' | 'danger', string> = {
  primary: 'border-white/20 bg-white/10 text-white',
  secondary: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
  danger: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200',
}
</script>

<template>
  <div v-if="groupedActions.length" class="space-y-4">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="group in groupedActions"
        :key="group.label"
        type="button"
        class="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold tracking-[0.08em] transition"
        :class="
          activeTab === group.label
            ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:border-sky-600 dark:bg-sky-600 dark:shadow-sky-950/20'
            : 'border-slate-200/80 bg-slate-50/80 text-slate-500 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-sky-500/20 dark:hover:text-sky-200'
        "
        @click="activeTab = group.label"
      >
        {{ group.label }}
        <span
          class="inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold"
          :class="activeTab === group.label ? 'bg-white/15 text-white' : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-200'"
        >
          {{ group.items.length }}
        </span>
      </button>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <RouterLink
        v-for="action in activeActions"
        :key="`${activeTab}-${action.label}`"
        :to="action.to"
        class="flex min-h-[88px] items-center justify-between gap-4 rounded-[22px] border px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5"
        :class="toneClass[action.tone || 'secondary']"
      >
        <span class="inline-flex items-center gap-3">
          <span
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border"
            :class="iconToneClass[action.tone || 'secondary']"
          >
            <BaseIcon :name="action.icon" :size="16" />
          </span>
          <span class="leading-6">{{ action.label }}</span>
        </span>
        <BaseIcon
          name="ArrowRight"
          :size="16"
          :class="action.tone === 'primary' ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'"
        />
      </RouterLink>
    </div>
  </div>
</template>
