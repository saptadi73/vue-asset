<script setup lang="ts">
import { computed, ref } from 'vue'

import type { DataTableColumn } from '@/types/app'

import BaseIcon from './BaseIcon.vue'
import SectionCard from './SectionCard.vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    rows: Record<string, unknown>[]
    columns: DataTableColumn[]
    searchPlaceholder?: string
    searchKeys?: string[]
    pageSize?: number
  }>(),
  {
    description: '',
    searchPlaceholder: 'Cari data...',
    searchKeys: () => [],
    pageSize: 6,
  },
)

const search = ref('')
const currentPage = ref(1)

const resolvedSearchKeys = computed(() =>
  props.searchKeys.length ? props.searchKeys : props.columns.map((column) => column.key),
)

const filteredRows = computed(() => {
  if (!search.value) return props.rows

  const keyword = search.value.toLowerCase()

  return props.rows.filter((row) =>
    resolvedSearchKeys.value.some((key) => String(row[key] ?? '').toLowerCase().includes(keyword)),
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / props.pageSize)))

const paginatedRows = computed(() => {
  const startIndex = (currentPage.value - 1) * props.pageSize
  return filteredRows.value.slice(startIndex, startIndex + props.pageSize)
})

const pageStart = computed(() => {
  if (!filteredRows.value.length) return 0
  return (currentPage.value - 1) * props.pageSize + 1
})

const pageEnd = computed(() => Math.min(currentPage.value * props.pageSize, filteredRows.value.length))

const resolveCellText = (column: DataTableColumn, row: Record<string, unknown>) => {
  const value = row[column.key]
  return column.formatter ? column.formatter(value, row) : String(value ?? '-')
}

const resolveBadgeTone = (column: DataTableColumn, row: Record<string, unknown>) => {
  const value = String(row[column.key] ?? '')
  return (
    column.toneMap?.[value] ||
    'bg-slate-200/80 text-slate-700 ring-slate-300/70 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10'
  )
}

const goToPage = (page: number) => {
  currentPage.value = Math.min(Math.max(1, page), totalPages.value)
}
</script>

<template>
  <SectionCard :title="title" :description="description">
    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <label class="relative w-full md:max-w-sm">
        <BaseIcon
          name="Search"
          :size="16"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="search"
          type="search"
          :placeholder="searchPlaceholder"
          class="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
          @input="goToPage(1)"
        />
      </label>

      <div class="text-sm text-slate-500 dark:text-slate-400">
        Menampilkan {{ pageStart }}-{{ pageEnd }} dari {{ filteredRows.length }} item
      </div>
    </div>

    <div class="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200/80 dark:divide-white/10">
          <thead class="bg-slate-100/70 dark:bg-slate-950/70">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                class="px-4 py-3 text-left text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/70 bg-white/80 dark:divide-white/8 dark:bg-slate-900/50">
            <tr v-for="(row, index) in paginatedRows" :key="String(row.id ?? index)" class="align-top">
              <td
                v-for="column in columns"
                :key="column.key"
                class="px-4 py-4 text-sm leading-6 text-slate-700 dark:text-slate-200"
              >
                <span
                  v-if="column.type === 'badge'"
                  :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1', resolveBadgeTone(column, row)]"
                >
                  {{ resolveCellText(column, row) }}
                </span>
                <span v-else>{{ resolveCellText(column, row) }}</span>
              </td>
            </tr>
            <tr v-if="!paginatedRows.length">
              <td :colspan="columns.length" class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                Tidak ada data yang cocok dengan pencarian saat ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="text-sm text-slate-500 dark:text-slate-400">
        Pagination mengikuti kontrak backend `page` dan `page_size`.
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Prev
        </button>
        <span class="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          type="button"
          class="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </SectionCard>
</template>
