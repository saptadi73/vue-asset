<script setup lang="ts">
import BaseIcon from '@/components/BaseIcon.vue'
import type { DocumentReference } from '@/types/app'

const props = defineProps<{
  documents: DocumentReference[]
  activeDocumentId?: string | null
}>()

const emit = defineEmits<{
  preview: [document: DocumentReference]
}>()

const kindTone: Record<string, string> = {
  manual: 'bg-sky-500/12 text-sky-700 ring-sky-300/40 dark:text-sky-200 dark:ring-sky-500/20',
  contract: 'bg-emerald-500/12 text-emerald-700 ring-emerald-300/40 dark:text-emerald-200 dark:ring-emerald-500/20',
  support: 'bg-violet-500/12 text-violet-700 ring-violet-300/40 dark:text-violet-200 dark:ring-violet-500/20',
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="item in documents"
      :key="item.id"
      class="rounded-[22px] border p-4 transition"
      :class="
        item.id === props.activeDocumentId
          ? 'border-sky-300 bg-sky-50/70 shadow-[0_20px_50px_-35px_rgba(14,165,233,0.85)] dark:border-sky-500/30 dark:bg-sky-500/10'
          : 'border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-slate-950/40'
      "
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.label }}</p>
            <span
              v-if="item.kind"
              :class="['rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1', kindTone[item.kind] ?? kindTone.support]"
            >
              {{ item.kind }}
            </span>
          </div>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {{ item.fileName ?? 'Tidak ada dokumen' }}
          </p>
          <p class="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">{{ item.note }}</p>
        </div>

        <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button
            v-if="item.href"
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:border-sky-500/40 dark:hover:text-sky-200"
            @click="emit('preview', item)"
          >
            <BaseIcon name="Eye" :size="14" />
            View
          </button>
          <a
            v-if="item.href"
            :href="item.href"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <BaseIcon name="FileText" :size="14" />
            Open
          </a>
          <span
            v-else
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-400"
          >
            <BaseIcon name="FileX2" :size="14" />
            Not Available
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
