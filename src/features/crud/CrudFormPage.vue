<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ApiEndpointList from '@/components/ApiEndpointList.vue'
import ApiSessionPanel from '@/components/ApiSessionPanel.vue'
import CrudPageShell from '@/components/CrudPageShell.vue'
import FormField from '@/components/FormField.vue'
import SectionCard from '@/components/SectionCard.vue'
import { getCrudConfig } from '@/config/crud'
import { submitCrudForm } from '@/services/crud'
import { ApiError } from '@/services/http'

const route = useRoute()
const router = useRouter()
const crudKey = computed(() => String(route.meta.crudKey || ''))
const mode = computed(() => String(route.meta.crudMode || 'create'))
const config = computed(() => getCrudConfig(crudKey.value))
const itemId = computed(() => String(route.params.id || config.value?.seedId || 'sample-record'))

const formState = reactive<Record<string, string>>({})
const validationErrors = reactive<string[]>([])
const requestState = reactive({
  isSubmitting: false,
  successMessage: '',
  errorMessage: '',
})

const syncFormState = () => {
  const nextKeys = new Set<string>()

  for (const section of config.value?.sections || []) {
    for (const field of section.fields) {
      nextKeys.add(field.key)
    }
  }

  for (const key of Object.keys(formState)) {
    if (!nextKeys.has(key)) {
      delete formState[key]
    }
  }

  const initialValues = config.value?.sampleValues || {}

  for (const key of nextKeys) {
    formState[key] = initialValues[key] || ''
  }

  if (mode.value === 'edit' && itemId.value) {
    const editSeed = itemId.value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

    if ('asset_name' in formState) formState.asset_name = `Sample ${editSeed}`
    if ('name' in formState) formState.name = `Sample ${editSeed}`
    if ('notes' in formState && !formState.notes) formState.notes = `Updated context for ${editSeed}.`
  }
}

watch([config, mode, itemId], syncFormState, { immediate: true })

const pageTitle = computed(() => (mode.value === 'edit' ? config.value?.editTitle : config.value?.createTitle) || 'Form')
const pageDescription = computed(() => (mode.value === 'edit' ? config.value?.editDescription : config.value?.createDescription) || '')
const submitLabel = computed(() => (mode.value === 'edit' ? 'Save Changes' : 'Create Record'))

const endpoints = computed(() => {
  if (!config.value) return []
  return [mode.value === 'edit' ? config.value.endpoints.edit : config.value.endpoints.create]
})

const handleSubmit = async () => {
  if (!config.value) return

  validationErrors.splice(0, validationErrors.length)
  requestState.successMessage = ''
  requestState.errorMessage = ''

  const errors = config.value.validate?.(formState) || []
  if (errors.length) {
    validationErrors.push(...errors)
    requestState.errorMessage = 'Masih ada field yang perlu diperbaiki sebelum request dikirim.'
    return
  }

  requestState.isSubmitting = true

  try {
    const response = await submitCrudForm(config.value, mode.value as 'create' | 'edit', formState, itemId.value)
    requestState.successMessage = response.message || `${config.value.entityName} berhasil diproses.`

    window.setTimeout(() => {
      void router.push(config.value!.basePath)
    }, 900)
  } catch (error) {
    requestState.errorMessage =
      error instanceof ApiError
        ? `${error.message}${error.code ? ` [${error.code}]` : ''}`
        : 'Terjadi kegagalan saat mengirim data ke backend.'
  } finally {
    requestState.isSubmitting = false
  }
}
</script>

<template>
  <CrudPageShell
    v-if="config"
    :eyebrow="config.title"
    :title="pageTitle"
    :description="pageDescription"
    :back-to="config.basePath"
    :submit-label="submitLabel"
    :is-submitting="requestState.isSubmitting"
    @submit="handleSubmit"
  >
    <div class="grid gap-6 2xl:grid-cols-[1.55fr_0.95fr]">
      <div class="space-y-6">
        <SectionCard
          v-if="validationErrors.length || requestState.successMessage || requestState.errorMessage"
          :title="requestState.successMessage ? 'Request Success' : 'Request Failed'"
          :description="requestState.successMessage ? 'Backend merespons request CRUD dengan sukses.' : 'Periksa field wajib, token, payload, dan endpoint yang dipanggil.'"
        >
          <div
            class="rounded-2xl border px-4 py-3 text-sm leading-6"
            :class="
              requestState.successMessage
                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200'
            "
          >
            <p>{{ requestState.successMessage || requestState.errorMessage }}</p>
            <ul v-if="validationErrors.length" class="mt-3 list-disc space-y-1 pl-5">
              <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
          </div>
        </SectionCard>

        <SectionCard
          v-for="section in config.sections"
          :key="section.title"
          :title="section.title"
          :description="section.description"
        >
          <div class="grid gap-4 md:grid-cols-2">
            <FormField
              v-for="field in section.fields"
              :key="field.key"
              :model-value="formState[field.key] ?? ''"
              @update:model-value="formState[field.key] = $event"
              :field="field"
              :class="field.fullWidth || field.type === 'textarea' ? 'md:col-span-2' : ''"
            />
          </div>
        </SectionCard>
      </div>

      <div class="space-y-6">
        <ApiEndpointList title="Form Endpoint" :endpoints="endpoints" />
        <ApiSessionPanel />
        <SectionCard title="Frontend Note" description="Halaman ini sudah siap untuk dihubungkan ke service API nyata.">
          <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>Struktur field dibangun dari dokumen implementasi agar tiap feature punya section yang jelas.</p>
            <p>Mode `Create` dan `Update` sekarang sudah memakai sample seed, validasi per modul, dan endpoint backend dengan bearer token dari localStorage frontend.</p>
            <p>Setelah submit sukses, halaman akan kembali ke list modul terkait secara otomatis.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  </CrudPageShell>
</template>
