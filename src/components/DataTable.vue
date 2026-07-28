<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import type { DataTableColumn, DataTableHeaderAction, DataTableRowActions } from '@/types/app'

import BaseIcon from './BaseIcon.vue'
import SectionCard from './SectionCard.vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    rows: Record<string, unknown>[]
    columns: DataTableColumn[]
    actions?: DataTableHeaderAction[]
    rowActions?: DataTableRowActions
    searchPlaceholder?: string
    searchKeys?: string[]
    pageSize?: number
  }>(),
  {
    actions: () => [],
    rowActions: undefined,
    description: '',
    searchPlaceholder: 'Cari data...',
    searchKeys: () => [],
    pageSize: 6,
  },
)

const emit = defineEmits<{
  delete: [row: Record<string, unknown>]
}>()

const search = ref('')
const currentPage = ref(1)
const localRows = ref<Record<string, unknown>[]>([...props.rows])
const deleteCandidate = ref<Record<string, unknown> | null>(null)

watch(
  () => props.rows,
  (rows) => {
    localRows.value = [...rows]
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  },
  { deep: true },
)

const resolvedSearchKeys = computed(() =>
  props.searchKeys.length ? props.searchKeys : props.columns.map((column) => column.key),
)

const filteredRows = computed(() => {
  if (!search.value) return localRows.value

  const keyword = search.value.toLowerCase()

  return localRows.value.filter((row) =>
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

const actionToneClass: Record<'primary' | 'secondary' | 'danger', string> = {
  primary:
    'border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500',
  secondary:
    'border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
  danger:
    'border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200',
}

const confirmDelete = () => {
  if (!deleteCandidate.value) return

  localRows.value = localRows.value.filter((row) => row !== deleteCandidate.value)
  emit('delete', deleteCandidate.value)
  deleteCandidate.value = null

  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
}

const resolveDeleteLabel = (row: Record<string, unknown>) => {
  if (props.rowActions?.resolveRowLabel) return props.rowActions.resolveRowLabel(row)
  return String(row.name ?? row.title ?? row.code ?? row.id ?? 'record')
}

const resolveDeleteMessage = (row: Record<string, unknown>) => {
  if (props.rowActions?.deleteMessage) return props.rowActions.deleteMessage(row)
  return `Record ${resolveDeleteLabel(row)} akan dihapus dari tampilan tabel ini.`
}
</script>

<template>
  <SectionCard :title="title" :description="description">
    <div v-if="actions.length" class="mb-4 flex flex-wrap gap-3">
      <RouterLink
        v-for="action in actions"
        :key="`${title}-${action.label}`"
        :to="action.to"
        class="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5"
        :class="actionToneClass[action.tone || 'secondary']"
      >
        <BaseIcon :name="action.icon" :size="15" />
        {{ action.label }}
      </RouterLink>
    </div>

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
              <th
                v-if="rowActions"
                class="px-4 py-3 text-right text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400"
              >
                Actions
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
              <td v-if="rowActions" class="px-4 py-4">
                <div class="flex items-center justify-end gap-2">
                  <RouterLink
                    v-if="rowActions.editPath"
                    :to="rowActions.editPath(row)"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-800 transition hover:-translate-y-0.5 hover:border-sky-300 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
                    aria-label="Update row"
                    title="Update"
                  >
                    <BaseIcon name="PencilLine" :size="16" />
                  </RouterLink>

                  <button
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 transition hover:-translate-y-0.5 hover:border-rose-300 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                    aria-label="Delete row"
                    title="Delete"
                    @click="deleteCandidate = row"
                  >
                    <BaseIcon name="Trash2" :size="16" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!paginatedRows.length">
              <td :colspan="columns.length + (rowActions ? 1 : 0)" class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
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

    <div
      v-if="deleteCandidate"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-slate-900">
        <div class="flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            <BaseIcon name="ShieldAlert" :size="20" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">
              {{ rowActions?.deleteTitle || 'Confirm Delete' }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {{ resolveDeleteMessage(deleteCandidate) }}
            </p>
            <p class="mt-3 text-xs font-medium tracking-[0.18em] text-rose-600 uppercase dark:text-rose-300">
              Double check sebelum melanjutkan.
            </p>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-400 hover:text-sky-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
            @click="deleteCandidate = null"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-950/20 transition hover:bg-rose-500"
            @click="confirmDelete"
          >
            <BaseIcon name="Trash2" :size="15" />
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </SectionCard>
</template>
