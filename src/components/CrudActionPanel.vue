<script setup lang="ts">
import { RouterLink } from 'vue-router'

import BaseIcon from './BaseIcon.vue'
import SectionCard from './SectionCard.vue'

defineProps<{
  title: string
  description: string
  createTo: string
  editTo: string
  deleteTo: string
}>()
</script>

<template>
  <SectionCard :title="title" :description="description">
    <div class="grid gap-3 sm:grid-cols-3">
      <RouterLink
        :to="createTo"
        class="rounded-[22px] border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-800 transition hover:-translate-y-0.5 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
      >
        <div class="flex items-center gap-3">
          <span class="rounded-2xl bg-white/80 p-2 ring-1 ring-emerald-200 dark:bg-slate-950/40 dark:ring-emerald-500/20">
            <BaseIcon name="Plus" :size="16" />
          </span>
          <div>
            <p class="text-sm font-semibold">Create New</p>
            <p class="text-xs opacity-75">Buat record baru</p>
          </div>
        </div>
      </RouterLink>

      <RouterLink
        :to="editTo"
        class="rounded-[22px] border border-sky-200 bg-sky-50/70 p-4 text-sky-800 transition hover:-translate-y-0.5 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
      >
        <div class="flex items-center gap-3">
          <span class="rounded-2xl bg-white/80 p-2 ring-1 ring-sky-200 dark:bg-slate-950/40 dark:ring-sky-500/20">
            <BaseIcon name="PencilLine" :size="16" />
          </span>
          <div>
            <p class="text-sm font-semibold">Update</p>
            <p class="text-xs opacity-75">Edit sample record</p>
          </div>
        </div>
      </RouterLink>

      <RouterLink
        :to="deleteTo"
        class="rounded-[22px] border border-rose-200 bg-rose-50/70 p-4 text-rose-800 transition hover:-translate-y-0.5 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
      >
        <div class="flex items-center gap-3">
          <span class="rounded-2xl bg-white/80 p-2 ring-1 ring-rose-200 dark:bg-slate-950/40 dark:ring-rose-500/20">
            <BaseIcon name="Trash2" :size="16" />
          </span>
          <div>
            <p class="text-sm font-semibold">Delete</p>
            <p class="text-xs opacity-75">Konfirmasi hapus</p>
          </div>
        </div>
      </RouterLink>
    </div>
  </SectionCard>
</template>
