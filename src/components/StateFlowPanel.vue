<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { RouterLink } from 'vue-router'

import BaseIcon from './BaseIcon.vue'
import SectionCard from './SectionCard.vue'

defineProps<{
  title: string
  description: string
  items: Array<{
    label: string
    detail: string
    to: RouteLocationRaw
    icon: string
    tone: string
  }>
}>()
</script>

<template>
  <SectionCard :title="title" :description="description">
    <div class="space-y-3">
      <RouterLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="flex items-start gap-3 rounded-[22px] border p-4 transition hover:-translate-y-0.5"
        :class="item.tone"
      >
        <span class="rounded-2xl bg-white/80 p-2 ring-1 ring-white/60 dark:bg-slate-950/30 dark:ring-white/10">
          <BaseIcon :name="item.icon" :size="16" />
        </span>
        <span>
          <span class="block text-sm font-semibold">{{ item.label }}</span>
          <span class="mt-1 block text-xs leading-5 opacity-80">{{ item.detail }}</span>
        </span>
      </RouterLink>
    </div>
  </SectionCard>
</template>
