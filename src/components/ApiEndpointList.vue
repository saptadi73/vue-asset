<script setup lang="ts">
import type { EndpointReference } from '@/types/app'

import SectionCard from './SectionCard.vue'

defineProps<{
  title: string
  endpoints: EndpointReference[]
}>()

const methodTone: Record<EndpointReference['method'], string> = {
  GET: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  POST: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  PATCH: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  DELETE: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
}
</script>

<template>
  <SectionCard :title="title" description="Endpoint penting dari dokumen implementasi backend.">
    <div class="space-y-3">
      <div
        v-for="endpoint in endpoints"
        :key="`${endpoint.method}-${endpoint.path}`"
        class="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-slate-950/40"
      >
        <div class="flex flex-wrap items-center gap-3">
          <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold ring-1', methodTone[endpoint.method]]">
            {{ endpoint.method }}
          </span>
          <code class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ endpoint.path }}</code>
        </div>
        <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ endpoint.note }}</p>
      </div>
    </div>
  </SectionCard>
</template>
