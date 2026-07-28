<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import { appConfig } from '@/config/env'
import { navigationGroups } from '@/config/navigation'

import BaseIcon from './BaseIcon.vue'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const isMobileMenuOpen = ref(false)
const isDark = ref(false)
const isDesktopSidebarCollapsed = ref(false)
const expandedGroups = ref<Record<string, boolean>>(
  Object.fromEntries(navigationGroups.map((group, index) => [group.id, index < 2])),
)

const pageTitle = computed(() => String(route.meta.title || 'Dashboard'))
const pageDescription = computed(() =>
  String(route.meta.description || 'Asset operations workspace aligned with backend implementation docs.'),
)
const activeGroupCount = computed(() => navigationGroups.length)
const activeMenuCount = computed(() => navigationGroups.reduce((total, group) => total + group.items.length, 0))
const currentSectionLabel = computed(() => {
  const group = navigationGroups.find((item) => item.items.some((entry) => entry.to === route.path))
  return group?.label || 'Workspace'
})

const setTheme = (dark: boolean) => {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('asset-hub-theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => setTheme(!isDark.value)
const toggleDesktopSidebar = () => {
  isDesktopSidebarCollapsed.value = !isDesktopSidebarCollapsed.value
}
const toggleGroup = (groupId: string) => {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId]
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
  },
)

onMounted(() => {
  const storedTheme = localStorage.getItem('asset-hub-theme')
  if (storedTheme) {
    setTheme(storedTheme === 'dark')
    return
  }

  setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches)
})
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fafc_34%,#f8fafc_100%)] text-slate-900 transition dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
    <div class="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.12),_transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.16),_transparent_26%)]" />

    <div class="relative mx-auto flex min-h-screen max-w-[1640px] gap-5 px-3 py-3 md:px-4 lg:px-5">
      <aside
        class="hidden shrink-0 transition-[width] duration-300 lg:flex"
        :class="isDesktopSidebarCollapsed ? 'w-[118px]' : 'w-[340px]'"
      >
        <div class="flex h-[calc(100vh-1.5rem)] w-full flex-col overflow-hidden rounded-[34px] border border-white/50 bg-white/78 p-4 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/62 dark:shadow-[0_35px_120px_-55px_rgba(8,145,178,0.45)]">
          <div
            class="mb-5 rounded-[28px] bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(99,102,241,0.08),rgba(244,114,182,0.12))] p-4 ring-1 ring-white/40 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(56,189,248,0.08),rgba(14,116,144,0.16))] dark:ring-white/10"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="rounded-2xl bg-slate-950 p-3 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-950">
                  <BaseIcon name="ShieldCheck" :size="22" />
                </div>
                <div v-if="!isDesktopSidebarCollapsed">
                  <p class="font-display text-lg font-semibold tracking-tight">{{ appConfig.appName }}</p>
                  <p class="text-sm text-slate-600 dark:text-slate-300">Asset management workspace</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2">
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/70 text-slate-700 transition hover:scale-[1.03] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
                  @click="toggleDesktopSidebar"
                >
                  <BaseIcon :name="isDesktopSidebarCollapsed ? 'PanelLeftOpen' : 'PanelLeftClose'" :size="16" />
                </button>
                <span
                  v-if="!isDesktopSidebarCollapsed"
                  class="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-slate-700 uppercase dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  Live
                </span>
              </div>
            </div>

            <div v-if="!isDesktopSidebarCollapsed" class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-white/50 bg-white/65 p-3 dark:border-white/10 dark:bg-slate-900/55">
                <p class="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
                  Groups
                </p>
                <p class="mt-2 text-2xl font-semibold">{{ activeGroupCount }}</p>
              </div>
              <div class="rounded-2xl border border-white/50 bg-white/65 p-3 dark:border-white/10 dark:bg-slate-900/55">
                <p class="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
                  Menus
                </p>
                <p class="mt-2 text-2xl font-semibold">{{ activeMenuCount }}</p>
              </div>
            </div>
          </div>

          <div class="mb-4 flex items-center justify-between gap-3">
            <div v-if="!isDesktopSidebarCollapsed">
              <p class="text-xs font-semibold tracking-[0.26em] text-slate-400 uppercase dark:text-slate-500">
                Navigation
              </p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Foldable menu groups by feature area</p>
            </div>
            <div
              class="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300"
              :class="isDesktopSidebarCollapsed ? 'mx-auto' : ''"
            >
              {{ currentSectionLabel }}
            </div>
          </div>

          <nav class="flex-1 space-y-3 overflow-y-auto pr-1">
          <div
            v-for="group in navigationGroups"
            :key="group.id"
            class="rounded-[26px] border border-slate-200/70 bg-slate-50/80 p-3 shadow-sm transition hover:border-sky-200/80 hover:bg-white/85 dark:border-white/10 dark:bg-slate-900/55 dark:hover:border-sky-500/20 dark:hover:bg-slate-900/72"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-white/80 dark:hover:bg-slate-800/70"
              @click="toggleGroup(group.id)"
            >
              <span class="flex items-center gap-3" :class="isDesktopSidebarCollapsed ? 'mx-auto' : ''">
                <span class="rounded-2xl bg-white p-2.5 text-slate-700 ring-1 ring-slate-200 shadow-sm dark:bg-slate-950 dark:text-slate-200 dark:ring-white/10">
                  <BaseIcon :name="group.icon" :size="16" />
                </span>
                <span v-if="!isDesktopSidebarCollapsed">
                  <span class="block text-sm font-semibold">{{ group.label }}</span>
                  <span class="block text-xs text-slate-500 dark:text-slate-400">{{ group.items.length }} menu</span>
                </span>
              </span>
              <span v-if="!isDesktopSidebarCollapsed" class="inline-flex items-center gap-2">
                <span class="rounded-full bg-slate-200/80 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {{ group.items.length }}
                </span>
                <BaseIcon :name="expandedGroups[group.id] ? 'ChevronDown' : 'ChevronRight'" :size="16" />
              </span>
            </button>

            <div v-if="expandedGroups[group.id] && !isDesktopSidebarCollapsed" class="mt-2 space-y-1.5">
              <RouterLink
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                class="group flex items-start gap-3 rounded-[22px] px-3 py-3 transition"
                :class="
                  route.path === item.to
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(30,41,59,0.9))] dark:text-sky-100'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800/70'
                "
              >
                <span
                  class="mt-0.5 inline-flex rounded-2xl p-2 ring-1 transition"
                  :class="
                    route.path === item.to
                      ? 'bg-white/10 ring-white/10'
                      : 'bg-slate-100 text-slate-700 ring-slate-200 group-hover:bg-sky-50 group-hover:text-sky-700 dark:bg-slate-950 dark:text-slate-200 dark:ring-white/10'
                  "
                >
                  <BaseIcon :name="item.icon" :size="16" class="shrink-0" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center justify-between gap-3">
                    <span class="block text-sm font-medium">{{ item.label }}</span>
                    <BaseIcon
                      name="ArrowUpRight"
                      :size="14"
                      class="shrink-0 opacity-40 transition group-hover:opacity-100"
                    />
                  </span>
                  <span class="mt-1 block text-xs leading-5 opacity-75">{{ item.description }}</span>
                </span>
              </RouterLink>
            </div>
            <div v-else-if="isDesktopSidebarCollapsed" class="mt-2 space-y-1.5">
              <RouterLink
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                class="group flex justify-center rounded-[22px] px-2 py-2.5 transition"
                :class="
                  route.path === item.to
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(30,41,59,0.9))] dark:text-sky-100'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800/70'
                "
                :title="item.label"
              >
                <span
                  class="inline-flex rounded-2xl p-2.5 ring-1 transition"
                  :class="
                    route.path === item.to
                      ? 'bg-white/10 ring-white/10'
                      : 'bg-slate-100 text-slate-700 ring-slate-200 group-hover:bg-sky-50 group-hover:text-sky-700 dark:bg-slate-950 dark:text-slate-200 dark:ring-white/10'
                  "
                >
                  <BaseIcon :name="item.icon" :size="16" />
                </span>
              </RouterLink>
            </div>
          </div>
        </nav>

          <div class="mt-4 rounded-[28px] border border-slate-200/80 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/62">
            <div class="flex items-start justify-between gap-3" :class="isDesktopSidebarCollapsed ? 'flex-col items-center text-center' : ''">
              <div>
                <p class="text-sm font-semibold">Backend target</p>
                <p v-if="!isDesktopSidebarCollapsed" class="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  {{ appConfig.apiBaseUrl }}{{ appConfig.apiPrefix }}
                </p>
              </div>
              <div class="rounded-2xl bg-emerald-500/12 p-2 text-emerald-700 ring-1 ring-emerald-400/20 dark:text-emerald-200">
                <BaseIcon name="Wifi" :size="16" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[34px] border border-white/50 bg-white/55 shadow-[0_30px_120px_-48px_rgba(15,23,42,0.42)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/34 dark:shadow-[0_30px_120px_-58px_rgba(8,145,178,0.36)]">
        <header class="sticky top-0 z-20 border-b border-slate-200/70 bg-white/68 px-4 py-4 backdrop-blur-xl md:px-6 lg:px-8 dark:border-white/10 dark:bg-slate-950/48">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                @click="isMobileMenuOpen = true"
              >
                <BaseIcon name="Menu" :size="18" />
              </button>

              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm text-slate-500 dark:text-slate-400">Tuesday, July 28, 2026</p>
                  <span class="rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] text-sky-700 uppercase dark:text-sky-200">
                    {{ currentSectionLabel }}
                  </span>
                </div>
                <h1 class="font-display text-2xl font-semibold tracking-tight md:text-3xl">{{ pageTitle }}</h1>
              </div>
            </div>

            <div class="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                class="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-[1.03] lg:inline-flex dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
                @click="toggleDesktopSidebar"
              >
                <BaseIcon :name="isDesktopSidebarCollapsed ? 'PanelLeftOpen' : 'PanelLeftClose'" :size="18" />
              </button>
              <div class="hidden xl:flex xl:w-[300px] xl:items-center xl:gap-3 xl:rounded-full xl:border xl:border-slate-200 xl:bg-white/85 xl:px-4 xl:py-3 xl:text-sm xl:text-slate-500 dark:xl:border-white/10 dark:xl:bg-slate-900/70 dark:xl:text-slate-300">
                <BaseIcon name="Search" :size="16" />
                <span class="flex-1">Search assets, transfers, maintenance...</span>
                <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] dark:bg-slate-800">/</span>
              </div>
              <ThemeToggle :is-dark="isDark" @toggle="toggleTheme" />
              <div class="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-sm text-slate-600 md:flex dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
                <span class="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Docs-driven frontend
              </div>
              <div class="hidden rounded-full border border-slate-200 bg-white/85 p-1 md:flex dark:border-white/10 dark:bg-slate-900/70">
                <div class="flex items-center gap-3 rounded-full px-2 py-1">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    GR
                  </div>
                  <div class="pr-2">
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-100">System Admin</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Superuser session</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <p class="max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {{ pageDescription }}
            </p>

            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:w-[420px]">
              <div class="rounded-2xl border border-slate-200/80 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-slate-900/58">
                <p class="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">Sync</p>
                <p class="mt-1 text-sm font-semibold">09:24</p>
              </div>
              <div class="rounded-2xl border border-slate-200/80 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-slate-900/58">
                <p class="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">Theme</p>
                <p class="mt-1 text-sm font-semibold">{{ isDark ? 'Dark' : 'Light' }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200/80 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-slate-900/58">
                <p class="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">Scope</p>
                <p class="mt-1 text-sm font-semibold">{{ activeMenuCount }} menus</p>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <RouterView />
        </main>
      </div>
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isMobileMenuOpen" class="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" @click="closeMobileMenu" />
    </transition>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="isMobileMenuOpen"
        class="fixed inset-y-0 left-0 z-50 flex w-[88vw] max-w-[360px] flex-col border-r border-slate-200/70 bg-white/96 px-5 py-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
      >
        <div class="mb-6 rounded-[28px] bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(99,102,241,0.08),rgba(244,114,182,0.10))] p-4 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(56,189,248,0.08),rgba(14,116,144,0.16))]">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-display text-lg font-semibold tracking-tight">{{ appConfig.appName }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Mobile navigation</p>
            </div>
          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
            @click="closeMobileMenu"
          >
            <BaseIcon name="X" :size="18" />
          </button>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <div class="rounded-2xl border border-white/50 bg-white/65 p-3 dark:border-white/10 dark:bg-slate-900/55">
              <p class="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">Groups</p>
              <p class="mt-1 text-lg font-semibold">{{ activeGroupCount }}</p>
            </div>
            <div class="rounded-2xl border border-white/50 bg-white/65 p-3 dark:border-white/10 dark:bg-slate-900/55">
              <p class="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">Menus</p>
              <p class="mt-1 text-lg font-semibold">{{ activeMenuCount }}</p>
            </div>
          </div>
        </div>

        <nav class="space-y-3 overflow-y-auto">
          <div v-for="group in navigationGroups" :key="group.id" class="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-900/50">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left"
              @click="toggleGroup(group.id)"
            >
              <span class="flex items-center gap-3">
                <span class="rounded-2xl bg-white p-2 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-white/10">
                  <BaseIcon :name="group.icon" :size="16" />
                </span>
                <span>
                  <span class="block text-sm font-semibold">{{ group.label }}</span>
                  <span class="block text-xs text-slate-500 dark:text-slate-400">{{ group.items.length }} menu</span>
                </span>
              </span>
              <span class="inline-flex items-center gap-2">
                <span class="rounded-full bg-slate-200/80 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {{ group.items.length }}
                </span>
                <BaseIcon :name="expandedGroups[group.id] ? 'ChevronDown' : 'ChevronRight'" :size="16" />
              </span>
            </button>

            <div v-if="expandedGroups[group.id]" class="mt-2 space-y-1.5">
              <RouterLink
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                class="block rounded-[22px] px-3 py-3 text-sm transition"
                :class="
                  route.path === item.to
                    ? 'bg-slate-900 text-white dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(30,41,59,0.9))] dark:text-sky-100'
                    : 'text-slate-600 dark:text-slate-300'
                "
              >
                <div class="flex items-start gap-3">
                  <span
                    class="mt-0.5 inline-flex rounded-2xl p-2 ring-1"
                    :class="
                      route.path === item.to
                        ? 'bg-white/10 ring-white/10'
                        : 'bg-white ring-slate-200 dark:bg-slate-950 dark:ring-white/10'
                    "
                  >
                    <BaseIcon :name="item.icon" :size="16" class="shrink-0" />
                  </span>
                  <div>
                    <p class="font-medium">{{ item.label }}</p>
                    <p class="mt-1 text-xs leading-5 opacity-75">{{ item.description }}</p>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>
        </nav>
      </aside>
    </transition>
  </div>
</template>
