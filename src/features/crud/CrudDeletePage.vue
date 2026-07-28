<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ApiEndpointList from '@/components/ApiEndpointList.vue'
import ApiSessionPanel from '@/components/ApiSessionPanel.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CrudPageShell from '@/components/CrudPageShell.vue'
import SectionCard from '@/components/SectionCard.vue'
import { getCrudConfig } from '@/config/crud'
import { deleteCrudRecord } from '@/services/crud'
import { ApiError } from '@/services/http'

const route = useRoute()
const router = useRouter()
const crudKey = computed(() => String(route.meta.crudKey || ''))
const config = computed(() => getCrudConfig(crudKey.value))
const itemId = computed(() => String(route.params.id || config.value?.seedId || 'sample-record'))
const requestState = reactive({
  isSubmitting: false,
  successMessage: '',
  errorMessage: '',
})

const endpoints = computed(() => {
  if (!config.value?.endpoints.delete) return []
  return [config.value.endpoints.delete]
})

const handleDelete = async () => {
  if (!config.value) return

  requestState.isSubmitting = true
  requestState.successMessage = ''
  requestState.errorMessage = ''

  try {
    const response = await deleteCrudRecord(config.value, itemId.value)
    requestState.successMessage = response.message || `${config.value.entityName} berhasil dihapus.`

    window.setTimeout(() => {
      void router.push(config.value!.basePath)
    }, 900)
  } catch (error) {
    requestState.errorMessage =
      error instanceof ApiError
        ? `${error.message}${error.code ? ` [${error.code}]` : ''}`
        : 'Terjadi kegagalan saat menghapus data di backend.'
  } finally {
    requestState.isSubmitting = false
  }
}
</script>

<template>
  <CrudPageShell
    v-if="config"
    :eyebrow="config.title"
    :title="config.deleteTitle"
    :description="config.deleteDescription"
    :back-to="config.basePath"
    submit-label="Confirm Delete"
    :is-danger="true"
    :is-submitting="requestState.isSubmitting"
    @submit="handleDelete"
  >
    <div class="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <div class="space-y-6">
        <SectionCard
          v-if="requestState.successMessage || requestState.errorMessage"
          :title="requestState.successMessage ? 'Delete Success' : 'Delete Failed'"
          :description="requestState.successMessage ? 'Backend merespons proses delete dengan sukses.' : 'Periksa token, endpoint delete, dan permission backend.'"
        >
          <div
            class="rounded-2xl border px-4 py-3 text-sm leading-6"
            :class="
              requestState.successMessage
                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200'
            "
          >
            {{ requestState.successMessage || requestState.errorMessage }}
          </div>
        </SectionCard>

        <SectionCard title="Delete Confirmation" description="Review ringkasan aksi sebelum record dihapus.">
          <div class="rounded-[24px] border border-rose-200 bg-rose-50/70 p-5 dark:border-rose-500/20 dark:bg-rose-500/10">
          <div class="flex items-start gap-4">
            <div class="rounded-2xl bg-white/80 p-3 text-rose-700 ring-1 ring-rose-200 dark:bg-slate-950/40 dark:text-rose-200 dark:ring-rose-500/20">
              <BaseIcon name="AlertTriangle" :size="20" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-rose-900 dark:text-rose-100">Delete {{ config.entityName }}</h2>
              <p class="mt-2 text-sm leading-6 text-rose-800/85 dark:text-rose-100/85">
                Anda akan menghapus atau menonaktifkan record dengan identifier
                <span class="font-semibold">{{ itemId }}</span>.
              </p>
              <ul class="mt-4 space-y-2 text-sm leading-6 text-rose-800/85 dark:text-rose-100/85">
                <li>1. Pastikan record ini memang tidak lagi dipakai oleh modul lain.</li>
                <li>2. Untuk data penting, pertimbangkan soft delete atau deactivate daripada hard delete.</li>
                <li>3. Saat backend siap, tombol konfirmasi dapat langsung memanggil endpoint destructive yang sesuai.</li>
              </ul>
            </div>
          </div>
          </div>
        </SectionCard>
      </div>

      <div class="space-y-6">
        <ApiEndpointList title="Delete Endpoint" :endpoints="endpoints" />
        <ApiSessionPanel />
        <SectionCard title="Why Separate Page?" description="Delete sengaja dipisah agar aksi berisiko lebih jelas.">
          <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Pemisahan halaman delete membuat pengguna berhenti sejenak sebelum menjalankan aksi destructive. Ini lebih aman untuk aplikasi asset management yang banyak record-nya saling terhubung.
          </p>
        </SectionCard>
      </div>
    </div>
  </CrudPageShell>
</template>
