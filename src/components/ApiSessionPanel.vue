<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import BaseIcon from '@/components/BaseIcon.vue'
import SectionCard from '@/components/SectionCard.vue'
import { clearSessionTokens, getAccessToken, getRefreshToken, setSessionTokens } from '@/services/session'

const accessToken = ref('')
const refreshToken = ref('')
const statusMessage = ref('Belum ada token sesi aktif.')

const hasToken = computed(() => Boolean(accessToken.value))

const saveTokens = () => {
  setSessionTokens({
    accessToken: accessToken.value.trim(),
    refreshToken: refreshToken.value.trim(),
  })

  statusMessage.value = accessToken.value.trim()
    ? 'Token berhasil disimpan ke localStorage frontend.'
    : 'Access token kosong. Simpan token valid agar request CRUD bisa diautentikasi.'
}

const clearTokens = () => {
  clearSessionTokens()
  accessToken.value = ''
  refreshToken.value = ''
  statusMessage.value = 'Token sesi dibersihkan.'
}

onMounted(() => {
  accessToken.value = getAccessToken()
  refreshToken.value = getRefreshToken()
  statusMessage.value = accessToken.value
    ? 'Access token terdeteksi. Request CRUD akan memakai bearer token ini.'
    : 'Belum ada token sesi aktif.'
})
</script>

<template>
  <SectionCard title="API Session" description="Simpan bearer token lokal untuk request CRUD ke backend.">
    <div class="space-y-4">
      <label class="block">
        <span class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Access Token</span>
        <textarea
          v-model="accessToken"
          rows="4"
          class="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
          placeholder="Paste access token dari POST /api/v1/auth/login"
        />
      </label>

      <label class="block">
        <span class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Refresh Token</span>
        <input
          v-model="refreshToken"
          type="text"
          class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
          placeholder="Opsional, untuk flow refresh token berikutnya"
        />
      </label>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:scale-[1.01] dark:bg-sky-600"
          @click="saveTokens"
        >
          <BaseIcon name="Save" :size="16" />
          Save Session
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
          @click="clearTokens"
        >
          <BaseIcon name="Trash2" :size="16" />
          Clear Session
        </button>
      </div>

      <div
        class="rounded-2xl border px-4 py-3 text-sm"
        :class="
          hasToken
            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
            : 'border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200'
        "
      >
        {{ statusMessage }}
      </div>
    </div>
  </SectionCard>
</template>
