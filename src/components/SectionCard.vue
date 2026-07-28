<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    padded?: boolean
  }>(),
  {
    title: '',
    description: '',
    padded: true,
  },
)
</script>

<template>
  <section
    class="rounded-[28px] border border-slate-200/70 bg-white/88 shadow-[0_22px_80px_-38px_rgba(15,23,42,0.45)] backdrop-blur transition dark:border-white/10 dark:bg-slate-900/72 dark:shadow-[0_24px_90px_-48px_rgba(2,132,199,0.55)]"
    :class="padded ? 'p-5 md:p-6' : ''"
  >
    <header v-if="title || description" class="mb-5">
      <h2 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {{ description }}
      </p>
    </header>

    <slot />
  </section>
</template>
