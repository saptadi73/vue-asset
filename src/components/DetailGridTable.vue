<script setup lang="ts">
import { computed } from 'vue'

import type { DetailGridColumn } from '@/types/app'

const props = withDefaults(
  defineProps<{
    columns: DetailGridColumn[]
    rows: any[]
    desktopGridClass: string
    rowKey?: string
    emptyMessage?: string
  }>(),
  {
    rowKey: 'id',
    emptyMessage: 'Data belum tersedia.',
  },
)

const hasRows = computed(() => props.rows.length > 0)

const getRowKey = (row: any, index: number) => {
  const value = row[props.rowKey]
  return typeof value === 'string' || typeof value === 'number' ? value : index
}

const getCellValue = (row: any, key: string) => row[key]

const formatCellValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

const headerAlignClass = (column: DetailGridColumn) => {
  if (column.align === 'right') return 'md:text-right'
  if (column.align === 'center') return 'md:text-center'
  return ''
}

const cellAlignClass = (column: DetailGridColumn) => {
  if (column.align === 'right') return 'flex flex-col gap-1 md:items-end md:text-right'
  if (column.align === 'center') return 'flex flex-col gap-1 md:items-center md:text-center'
  return 'space-y-1'
}
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10">
    <template v-if="hasRows">
      <div
        class="hidden border-b border-slate-200/80 bg-slate-100/80 px-4 py-3 text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-500 md:grid"
        :class="desktopGridClass"
      >
        <p
          v-for="column in columns"
          :key="column.key"
          :class="headerAlignClass(column)"
        >
          {{ column.label }}
        </p>
      </div>

      <div
        v-for="(row, index) in rows"
        :key="getRowKey(row, index)"
        class="grid border-b border-slate-200/70 px-4 py-4 last:border-b-0 dark:border-white/8"
        :class="[desktopGridClass, index % 2 === 0 ? 'bg-white/80 dark:bg-slate-900/50' : 'bg-slate-50/65 dark:bg-slate-950/45']"
      >
        <div
          v-for="column in columns"
          :key="column.key"
          :class="cellAlignClass(column)"
        >
          <slot
            :name="`cell-${column.key}`"
            :row="row"
            :value="getCellValue(row, column.key)"
            :column="column"
          >
            <p :class="column.valueClass ?? 'text-sm text-slate-700 dark:text-slate-200'">
              {{ formatCellValue(getCellValue(row, column.key)) }}
            </p>
          </slot>
          <p class="text-xs tracking-[0.14em] text-slate-400 uppercase dark:text-slate-500 md:hidden">
            {{ column.mobileLabel ?? column.label }}
          </p>
        </div>
      </div>
    </template>

    <div
      v-else
      class="rounded-[22px] border border-dashed border-slate-200/80 bg-slate-50/70 px-4 py-5 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-400"
    >
      {{ emptyMessage }}
    </div>
  </div>
</template>
