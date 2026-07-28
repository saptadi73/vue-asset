<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseIcon from '@/components/BaseIcon.vue'
import { appConfig } from '@/config/env'
import { loginWithPassword } from '@/services/auth'
import { ApiError } from '@/services/http'

const route = useRoute()
const router = useRouter()
const formState = reactive({
  email: 'admin@example.com',
  password: 'Admin12345!',
  isSubmitting: false,
  errorMessage: '',
})

const resolveRedirectTarget = () => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/tracking'
}

const handleSubmit = async () => {
  formState.isSubmitting = true
  formState.errorMessage = ''

  try {
    await loginWithPassword(formState.email.trim(), formState.password)
    await router.replace(resolveRedirectTarget())
  } catch (error) {
    formState.errorMessage =
      error instanceof ApiError
        ? `${error.message}${error.code ? ` [${error.code}]` : ''}`
        : 'Login tidak berhasil. Periksa email, password, dan koneksi backend.'
  } finally {
    formState.isSubmitting = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),linear-gradient(180deg,#eef6ff_0%,#f8fafc_46%,#ffffff_100%)] px-4 py-10 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.2),_transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
    <div class="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <section class="rounded-[36px] border border-white/60 bg-white/78 p-6 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.34)] backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-slate-950/54">
        <div class="max-w-xl">
          <div class="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-sky-700 uppercase dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
            <BaseIcon name="ShieldCheck" :size="14" />
            Backend Session
          </div>

          <h1 class="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Login frontend untuk akses backend asset management.
          </h1>

          <p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Setelah login berhasil, frontend akan menyimpan bearer token dan otomatis menempelkannya ke request yang memakai `apiRequest()`.
          </p>

          <div class="mt-8 grid gap-4 md:grid-cols-2">
            <div class="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-900/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Auth Endpoint</p>
              <p class="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{{ appConfig.apiBaseUrl }}{{ appConfig.apiPrefix }}/auth/login</p>
              <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Dipakai untuk mengambil access token dan refresh token dari backend.</p>
            </div>

            <div class="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-900/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Protected Flow</p>
              <p class="mt-3 text-sm font-semibold text-slate-900 dark:text-white">Tracking, stocktake, dan CRUD live</p>
              <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Halaman yang terhubung langsung ke backend akan diarahkan ke login saat sesi belum aktif.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[36px] border border-white/60 bg-white/88 p-6 shadow-[0_35px_120px_-55px_rgba(15,23,42,0.34)] backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-slate-950/68">
        <div class="rounded-[28px] bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(255,255,255,0.72))] p-5 ring-1 ring-white/60 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(15,23,42,0.86))] dark:ring-white/10">
          <p class="text-sm font-semibold text-slate-900 dark:text-white">Sign In</p>
          <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Gunakan akun backend yang valid. Form ini akan menyimpan sesi untuk seluruh aplikasi.</p>
        </div>

        <form class="mt-6 space-y-5" @submit.prevent="handleSubmit">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
            <input
              v-model="formState.email"
              type="email"
              autocomplete="username"
              class="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
              placeholder="admin@example.com"
            >
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
            <input
              v-model="formState.password"
              type="password"
              autocomplete="current-password"
              class="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
              placeholder="Masukkan password backend"
            >
          </label>

          <div
            v-if="formState.errorMessage"
            class="rounded-[22px] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm leading-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
          >
            {{ formState.errorMessage }}
          </div>

          <button
            type="submit"
            class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500"
            :disabled="formState.isSubmitting"
          >
            <BaseIcon :name="formState.isSubmitting ? 'LoaderCircle' : 'LogIn'" :size="16" :class="formState.isSubmitting ? 'animate-spin' : ''" />
            {{ formState.isSubmitting ? 'Signing In...' : 'Sign In to Backend' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>
