<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ApiEndpointList from '@/components/ApiEndpointList.vue'
import ApiSessionPanel from '@/components/ApiSessionPanel.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CrudPageShell from '@/components/CrudPageShell.vue'
import FormField from '@/components/FormField.vue'
import SectionCard from '@/components/SectionCard.vue'
import { getCrudConfig } from '@/config/crud'
import {
  assetCategoryRecords,
  assetClassRecords,
  leaseContractRecords,
  locationRecords,
  maintenanceContractRecords,
  vendorRecords,
} from '@/data/master-data'
import { submitCrudForm } from '@/services/crud'
import { ApiError } from '@/services/http'

const route = useRoute()
const router = useRouter()
const crudKey = computed(() => String(route.meta.crudKey || ''))
const mode = computed(() => String(route.meta.crudMode || 'create'))
const config = computed(() => getCrudConfig(crudKey.value))
const itemId = computed(() => String(route.params.id || config.value?.seedId || 'sample-record'))
const masterTypeFromQuery = computed(() => String(route.query.master_type || ''))

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

  if (masterTypeFromQuery.value && 'master_type' in formState) {
    formState.master_type = masterTypeFromQuery.value
  }

  if (mode.value === 'edit' && itemId.value) {
    const editSeed = itemId.value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

    if ('asset_name' in formState) formState.asset_name = `Sample ${editSeed}`
    if ('name' in formState) formState.name = `Sample ${editSeed}`
    if ('last_maintenance' in formState && !formState.last_maintenance) formState.last_maintenance = '2026-07-18'
    if ('predictive_warning' in formState && !formState.predictive_warning) {
      formState.predictive_warning = 'Vibration pattern indicates preventive inspection is recommended.'
    }
    if ('notes' in formState && !formState.notes) formState.notes = `Updated context for ${editSeed}.`
  }
}

watch([config, mode, itemId, masterTypeFromQuery], syncFormState, { immediate: true })

const pageTitle = computed(() => (mode.value === 'edit' ? config.value?.editTitle : config.value?.createTitle) || 'Form')
const pageDescription = computed(() => (mode.value === 'edit' ? config.value?.editDescription : config.value?.createDescription) || '')
const submitLabel = computed(() => (mode.value === 'edit' ? 'Save Changes' : 'Create Record'))
const isAssetForm = computed(() => crudKey.value === 'assets')
const isMasterDataForm = computed(() => crudKey.value === 'masterData')

const endpoints = computed(() => {
  if (!config.value) return []
  return [mode.value === 'edit' ? config.value.endpoints.edit : config.value.endpoints.create]
})

const selectedCategory = computed(() =>
  assetCategoryRecords.find((item) => item.id === formState.category),
)
const selectedClass = computed(() =>
  assetClassRecords.find((item) => item.id === formState.asset_class),
)
const selectedLocation = computed(() =>
  locationRecords.find((item) => item.id === formState.location),
)
const selectedVendor = computed(() =>
  vendorRecords.find((item) => item.id === formState.vendor_partner),
)
const selectedLease = computed(() =>
  leaseContractRecords.find((item) => item.id === formState.lease_contract),
)
const selectedMaintenanceContract = computed(() =>
  maintenanceContractRecords.find((item) => item.id === formState.maintenance_contract),
)
const assetWarnings = computed(() => {
  const items: Array<{ tone: string; icon: string; title: string; detail: string }> = []

  if (formState.predictive_warning) {
    items.push({
      tone: 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100',
      icon: 'TriangleAlert',
      title: 'Predictive Warning',
      detail: formState.predictive_warning,
    })
  }

  if (formState.contract_expiry) {
    const expiry = new Date(formState.contract_expiry)
    const now = new Date('2026-07-28')
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 30) {
      items.push({
        tone: 'border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100',
        icon: 'ShieldAlert',
        title: 'Contract Expiry Warning',
        detail: `Kontrak terkait asset ini akan berakhir dalam ${diffDays} hari.`,
      })
    }
  }

  return items
})
const masterTypeLabel = computed(() => {
  switch (formState.master_type) {
    case 'asset-category':
      return 'Asset Category'
    case 'asset-class':
      return 'Asset Class'
    case 'location':
      return 'Location'
    case 'business-partner':
      return 'Vendor / Business Partner'
    default:
      return 'Master Record'
  }
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

        <SectionCard v-if="isAssetForm" title="Asset Relation Summary">
          <div class="space-y-4">
            <div class="grid gap-3">
              <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
                <p class="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">Classification</p>
                <div class="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                  <p><span class="font-medium">Category:</span> {{ selectedCategory?.name || 'Belum dipilih' }}</p>
                  <p><span class="font-medium">Class:</span> {{ selectedClass?.name || 'Belum dipilih' }}</p>
                  <p><span class="font-medium">Location:</span> {{ selectedLocation?.name || 'Belum dipilih' }}</p>
                </div>
              </div>

              <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
                <p class="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">Vendor & Contracts</p>
                <div class="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                  <p><span class="font-medium">Vendor:</span> {{ selectedVendor?.name || 'Belum dipilih' }}</p>
                  <p><span class="font-medium">Lease:</span> {{ selectedLease?.number || 'Tidak terhubung' }}</p>
                  <p><span class="font-medium">Maintenance:</span> {{ selectedMaintenanceContract?.number || 'Tidak terhubung' }}</p>
                  <p><span class="font-medium">Last Maintenance:</span> {{ formState.last_maintenance || 'Belum ada histori' }}</p>
                </div>
              </div>
            </div>

            <div v-if="assetWarnings.length" class="space-y-3">
              <div
                v-for="warning in assetWarnings"
                :key="warning.title"
                class="rounded-[22px] border p-4"
                :class="warning.tone"
              >
                <div class="flex items-start gap-3">
                  <div class="rounded-2xl bg-white/80 p-2 ring-1 ring-white/60 dark:bg-slate-950/40 dark:ring-white/10">
                    <BaseIcon :name="warning.icon" :size="16" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold">{{ warning.title }}</p>
                    <p class="mt-1 text-sm leading-6 opacity-90">{{ warning.detail }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard v-if="isMasterDataForm" title="Domain Context">
          <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200">
            <p><span class="font-medium">Master Domain:</span> {{ masterTypeLabel }}</p>
            <p class="mt-2 text-slate-500 dark:text-slate-400">
              Record ini akan menjadi sumber dropdown, validasi relasi, dan referensi transaksi di modul asset management.
            </p>
          </div>
        </SectionCard>

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
