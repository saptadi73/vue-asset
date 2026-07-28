<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { CrudHeaderAction } from '@/types/crud'

import BaseIcon from './BaseIcon.vue'

withDefaults(
  defineProps<{
  eyebrow: string
  title: string
  description: string
  backTo: string
  submitLabel: string
  headerActions?: Array<CrudHeaderAction & { to: string }>
  isDanger?: boolean
  isSubmitting?: boolean
}>(),
  {
    headerActions: () => [],
    isDanger: false,
    isSubmitting: false,
  },
)

const emit = defineEmits<{
  submit: []
}>()
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-[30px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_24px_90px_-44px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-900/72">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase dark:text-sky-200">{{ eyebrow }}</p>
          <h1 class="font-display mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {{ title }}
          </h1>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{{ description }}</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <RouterLink
            v-for="action in headerActions"
            :key="`${title}-${action.label}`"
            :to="action.to"
            class="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5"
            :class="
              action.tone === 'primary'
                ? 'border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                : 'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200'
            "
          >
            <BaseIcon :name="action.icon" :size="16" />
            {{ action.label }}
          </RouterLink>
          <RouterLink
            :to="backTo"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-400 hover:text-sky-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
          >
            <BaseIcon name="ArrowLeft" :size="16" />
            Back to List
          </RouterLink>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            :class="isDanger ? 'bg-rose-600 shadow-rose-950/30' : 'bg-slate-950 shadow-slate-950/20 dark:bg-sky-600 dark:shadow-sky-950/30'"
            :disabled="isSubmitting"
            @click="emit('submit')"
          >
            <BaseIcon :name="isSubmitting ? 'LoaderCircle' : isDanger ? 'Trash2' : 'Save'" :size="16" :class="isSubmitting ? 'animate-spin' : ''" />
            {{ isSubmitting ? 'Processing...' : submitLabel }}
          </button>
        </div>
      </div>
    </section>

    <slot />
  </div>
</template>
