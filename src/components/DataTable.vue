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
    selectedRowId?: string | number | null
    clickableRows?: boolean
  }>(),
  {
    actions: () => [],
    rowActions: undefined,
    description: '',
    searchPlaceholder: 'Cari data...',
    searchKeys: () => [],
    pageSize: 6,
    selectedRowId: null,
    clickableRows: false,
  },
)

const emit = defineEmits<{
  delete: [row: Record<string, unknown>]
  select: [row: Record<string, unknown>]
}>()

const search = ref('')
const currentPage = ref(1)
const localRows = ref<Record<string, unknown>[]>([...props.rows])
const deleteCandidate = ref<Record<string, unknown> | null>(null)
const deleteRequestState = ref({
  isSubmitting: false,
  errorMessage: '',
})

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

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, total]
  }

  if (current >= total - 2) {
    return [1, total - 3, total - 2, total - 1, total]
  }

  return [1, current - 1, current, current + 1, total]
})

const secondVisiblePage = computed(() => visiblePages.value[1] ?? null)
const penultimateVisiblePage = computed(() => {
  const items = visiblePages.value
  return items.length > 1 ? items[items.length - 2] ?? null : null
})
const showLeadingEllipsis = computed(() => secondVisiblePage.value !== null && secondVisiblePage.value > 2)
const showTrailingEllipsis = computed(() => {
  return penultimateVisiblePage.value !== null && penultimateVisiblePage.value < totalPages.value - 1
})
const leadingEllipsisPage = computed(() => secondVisiblePage.value)
const trailingEllipsisPage = computed(() => penultimateVisiblePage.value)

const confirmDelete = () => {
  if (!deleteCandidate.value) return
}

const handleDelete = async () => {
  if (!deleteCandidate.value) return

  deleteRequestState.value.isSubmitting = true
  deleteRequestState.value.errorMessage = ''

  try {
    if (props.rowActions?.onDelete) {
      await props.rowActions.onDelete(deleteCandidate.value)
    }

    localRows.value = localRows.value.filter((row) => row !== deleteCandidate.value)
    emit('delete', deleteCandidate.value)
    deleteCandidate.value = null

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (error) {
    deleteRequestState.value.errorMessage =
      error instanceof Error ? error.message : 'Terjadi kegagalan saat menghapus data di backend.'
  } finally {
    deleteRequestState.value.isSubmitting = false
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

const resolveRowId = (row: Record<string, unknown>, index: number) => String(row.id ?? index)

watch(deleteCandidate, (value) => {
  if (value) {
    deleteRequestState.value.errorMessage = ''
  }
})
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
            <tr
              v-for="(row, index) in paginatedRows"
              :key="resolveRowId(row, index)"
              class="align-top transition"
              :class="
                clickableRows
                  ? [
                      'cursor-pointer hover:bg-sky-50/70 dark:hover:bg-slate-800/40',
                      String(selectedRowId ?? '') === resolveRowId(row, index)
                        ? 'bg-sky-50/80 dark:bg-sky-500/8'
                        : '',
                    ]
                  : ''
              "
              @click="clickableRows ? emit('select', row) : undefined"
            >
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
                    @click.stop
                  >
                    <BaseIcon name="PencilLine" :size="16" />
                  </RouterLink>

                  <button
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 transition hover:-translate-y-0.5 hover:border-rose-300 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                    aria-label="Delete row"
                    title="Delete"
                    @click.stop="deleteCandidate = row"
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

    <div class="mt-4 flex justify-end">
      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          aria-label="Previous page"
          title="Previous page"
        >
          <BaseIcon name="ChevronLeft" :size="16" />
        </button>

        <div class="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/90 px-2 py-1 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-900/80">
          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            class="inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-semibold transition"
            :class="
              page === currentPage
                ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-sky-500 dark:text-white dark:shadow-sky-950/30'
                : 'text-slate-500 hover:bg-white hover:text-sky-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-200'
            "
            @click="goToPage(page)"
          >
            <template v-if="page === visiblePages[0]">
              {{ page }}
            </template>
            <template v-else-if="showLeadingEllipsis && page === leadingEllipsisPage">
              <span class="inline-flex items-center gap-1">
                <span class="text-slate-400">...</span>
                <span>{{ page }}</span>
              </span>
            </template>
            <template v-else-if="showTrailingEllipsis && page === trailingEllipsisPage">
              <span class="inline-flex items-center gap-1">
                <span>{{ page }}</span>
                <span class="text-slate-400">...</span>
              </span>
            </template>
            <template v-else>
              {{ page }}
            </template>
          </button>
        </div>

        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          aria-label="Next page"
          title="Next page"
        >
          <BaseIcon name="ChevronRight" :size="16" />
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
            :disabled="deleteRequestState.isSubmitting"
            @click="deleteCandidate = null"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-950/20 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="deleteRequestState.isSubmitting"
            @click="handleDelete"
          >
            <BaseIcon :name="deleteRequestState.isSubmitting ? 'LoaderCircle' : 'Trash2'" :size="15" :class="deleteRequestState.isSubmitting ? 'animate-spin' : ''" />
            {{ deleteRequestState.isSubmitting ? 'Deleting...' : 'Yes, Delete' }}
          </button>
        </div>

        <p v-if="deleteRequestState.errorMessage" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm leading-6 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {{ deleteRequestState.errorMessage }}
        </p>
      </div>
    </div>
  </SectionCard>
</template>
