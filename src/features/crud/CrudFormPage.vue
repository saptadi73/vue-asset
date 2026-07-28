<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import ApiEndpointList from '@/components/ApiEndpointList.vue'
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
import { formatEnumLabel } from '@/utils/formatters'

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

  for (const item of config.value?.parentContext || []) {
    nextKeys.add(item.queryKey)
  }

  for (const key of Object.keys(config.value?.sampleValues || {})) {
    nextKeys.add(key)
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

  for (const key of nextKeys) {
    const queryValue = route.query[key]
    if (typeof queryValue === 'string' && queryValue) {
      formState[key] = queryValue
    }
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
const isSubForm = computed(() => config.value?.formRole === 'sub')
const submitLabel = computed(() => {
  if (isSubForm.value) return 'Save Related Update'
  return mode.value === 'edit' ? 'Save Changes' : 'Create Record'
})
const isAssetForm = computed(() => crudKey.value === 'assets')
const isLeaseForm = computed(() => crudKey.value === 'leases')
const isLicenseForm = computed(() => crudKey.value === 'licenses')
const isMasterDataForm = computed(() => crudKey.value === 'masterData')
const relatedHeaderActions = computed(() => {
  if (!config.value?.relatedActions?.length || config.value.formRole === 'sub') return []

  return config.value.relatedActions
    .filter((action) => !action.onlyModes || action.onlyModes.includes(mode.value as 'create' | 'edit'))
    .map((action) => ({
      ...action,
      to: action.resolveTo({
        mode: mode.value as 'create' | 'edit',
        itemId: itemId.value,
        values: formState,
      }),
    }))
})
const missingParentContextLabels = computed(() => {
  if (!isSubForm.value) return []

  const requiredKeys = config.value?.requiredParentContextKeys || []

  return requiredKeys
    .filter((key) => !String(formState[key] || '').trim())
    .map((key) => config.value?.parentContext?.find((item) => item.queryKey === key)?.label || key)
})
const hasMissingParentContext = computed(() => missingParentContextLabels.value.length > 0)
const parentContextRows = computed(() => {
  if (!isSubForm.value) return []

  const rows: Array<{ label: string; value: string }> = []

  for (const item of config.value?.parentContext || []) {
    const value = formState[item.queryKey]
    if (value) {
      rows.push({
        label: item.label,
        value,
      })
    }
  }

  if (formState.asset_name) rows.push({ label: 'Parent Asset', value: formState.asset_name })
  if (formState.transfer_number) rows.push({ label: 'Transfer Ref', value: formState.transfer_number })
  if (formState.request_number) rows.push({ label: 'Request Ref', value: formState.request_number })
  if (formState.requested_by) rows.push({ label: 'Requested By', value: formState.requested_by })
  if (formState.location) rows.push({ label: 'Location Scope', value: selectedLocation.value?.name || formState.location })
  if (formState.notes) rows.push({ label: 'Linked Note', value: formState.notes })

  return rows
    .filter((item, index, source) => source.findIndex((candidate) => candidate.label === item.label && candidate.value === item.value) === index)
    .slice(0, 6)
})

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
  vendorRecords.find((item) => item.id === (formState.vendor_partner || formState.vendor_name)),
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

const leaseMonthlyPaymentFormatted = computed(() => {
  if (!formState.monthly_payment) return 'Belum diisi'
  const amount = Number(formState.monthly_payment)
  if (!Number.isFinite(amount)) return formState.monthly_payment
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
})

const licenseAvailableSeats = computed(() => {
  const capacity = Number(formState.seat_capacity || '0')
  const used = Number(formState.used_seats || '0')
  if (!Number.isFinite(capacity) || !Number.isFinite(used)) return 'Belum valid'
  return String(Math.max(capacity - used, 0))
})

const licenseUtilizationPct = computed(() => {
  const capacity = Number(formState.seat_capacity || '0')
  const used = Number(formState.used_seats || '0')
  if (capacity <= 0 || !Number.isFinite(capacity) || !Number.isFinite(used)) return '0%'
  return `${Math.round((used / capacity) * 100)}%`
})

const handleSubmit = async () => {
  if (!config.value) return

  validationErrors.splice(0, validationErrors.length)
  requestState.successMessage = ''
  requestState.errorMessage = ''

  if (hasMissingParentContext.value) {
    validationErrors.push(
      `Subform ini wajib memiliki parent context: ${missingParentContextLabels.value.join(', ')}.`,
    )
    requestState.errorMessage = 'Form turunan tidak boleh diproses tanpa referensi data induk.'
    return
  }

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
    :header-actions="relatedHeaderActions"
    :is-submitting="requestState.isSubmitting"
    @submit="handleSubmit"
  >
    <div class="grid gap-6 2xl:grid-cols-[1.55fr_0.95fr]">
      <div class="space-y-6">
        <SectionCard
          v-if="config.formRole === 'main' && relatedHeaderActions.length"
          title="Related Form Actions"
          description="Aksi relasional dijalankan langsung dari parent form yang sama agar operator bisa melanjutkan proses tanpa keluar konteks."
        >
          <div class="grid gap-3 md:grid-cols-2">
            <RouterLink
              v-for="action in relatedHeaderActions"
              :key="`${config.key}-${action.label}-inline`"
              :to="action.to"
              class="flex items-center justify-between gap-4 rounded-[22px] border px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5"
              :class="
                action.tone === 'primary'
                  ? 'border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                  : 'border-slate-200/80 bg-slate-50/80 text-slate-700 hover:border-sky-300 hover:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200'
              "
            >
              <span class="inline-flex items-center gap-3">
                <span
                  class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border"
                  :class="
                    action.tone === 'primary'
                      ? 'border-white/20 bg-white/10 text-white'
                      : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200'
                  "
                >
                  <BaseIcon :name="action.icon" :size="16" />
                </span>
                {{ action.label }}
              </span>
              <BaseIcon
                name="ArrowRight"
                :size="16"
                :class="action.tone === 'primary' ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'"
              />
            </RouterLink>
          </div>
        </SectionCard>

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

        <SectionCard
          v-if="config.formRole === 'sub'"
          title="Subform Scope"
          description="Subform dipakai khusus untuk perubahan data turunan yang terkait parent record."
        >
          <div class="space-y-4">
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200">
              <p class="font-medium text-slate-900 dark:text-white">Pola baku subform</p>
              <p class="mt-2">
                Form ini hanya menangani update konteks operasional yang terkait data induk. Penambahan relasi baru tetap dimulai dari main form.
              </p>
            </div>

            <div
              v-if="hasMissingParentContext"
              class="rounded-[22px] border border-rose-200 bg-rose-50/80 p-4 text-sm leading-6 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
            >
              <div class="flex items-start gap-3">
                <div class="rounded-2xl bg-white/80 p-2 ring-1 ring-white/70 dark:bg-slate-950/40 dark:ring-white/10">
                  <BaseIcon name="ShieldAlert" :size="16" />
                </div>
                <div>
                  <p class="font-semibold">Parent context wajib dilengkapi</p>
                  <p class="mt-1">
                    Subform ini membutuhkan referensi induk berikut: {{ missingParentContextLabels.join(', ') }}.
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="parentContextRows.length"
              class="rounded-[22px] border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-500/20 dark:bg-sky-500/10"
            >
              <p class="text-xs font-semibold tracking-[0.2em] text-sky-700 uppercase dark:text-sky-200">Parent Context</p>
              <div class="mt-3 space-y-2">
                <div
                  v-for="item in parentContextRows"
                  :key="item.label"
                  class="flex items-start justify-between gap-4 rounded-2xl bg-white/75 px-3 py-2 text-sm dark:bg-slate-950/40"
                >
                  <span class="font-medium text-slate-700 dark:text-slate-200">{{ item.label }}</span>
                  <span class="text-right text-slate-500 dark:text-slate-400">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

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

        <SectionCard v-if="isLeaseForm" title="Lease Contract Context">
          <div class="space-y-4">
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">Vendor & Ownership</p>
              <div class="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Vendor:</span> {{ selectedVendor?.name || 'Belum dipilih' }}</p>
                <p><span class="font-medium">Owner Team:</span> {{ formState.owner_team || 'Belum diisi' }}</p>
                <p><span class="font-medium">Contract Type:</span> {{ formState.contract_type ? formatEnumLabel(formState.contract_type) : 'Belum dipilih' }}</p>
              </div>
            </div>

            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">Payment Snapshot</p>
              <div class="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Monthly Payment:</span> {{ leaseMonthlyPaymentFormatted }}</p>
                <p><span class="font-medium">Payment Cycle:</span> {{ formState.payment_cycle ? formatEnumLabel(formState.payment_cycle) : 'Belum dipilih' }}</p>
                <p><span class="font-medium">Next Due Date:</span> {{ formState.next_due_date || 'Belum diisi' }}</p>
                <p><span class="font-medium">Renewal Review:</span> {{ formState.renewal_review_date || 'Belum dijadwalkan' }}</p>
              </div>
            </div>

            <div
              class="rounded-[22px] border p-4 text-sm leading-6"
              :class="
                formState.status === 'REVIEW'
                  ? 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100'
                  : formState.status === 'CLOSED'
                    ? 'border-slate-200 bg-slate-50/80 text-slate-800 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200'
                    : 'border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100'
              "
            >
              <p class="font-semibold">{{ formState.status ? formatEnumLabel(formState.status) : 'Lease Draft Context' }}</p>
              <p class="mt-2 opacity-90">
                {{ formState.scope_summary || formState.notes || 'Isi scope summary untuk membantu reviewer memahami cakupan kontrak, item leased, dan kebutuhan renewal.' }}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard v-if="isLicenseForm" title="License Allocation Context">
          <div class="space-y-4">
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">Vendor & Ownership</p>
              <div class="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Vendor:</span> {{ selectedVendor?.name || 'Belum dipilih' }}</p>
                <p><span class="font-medium">Owner Team:</span> {{ formState.owner_team || 'Belum diisi' }}</p>
                <p><span class="font-medium">License Type:</span> {{ formState.license_type ? formatEnumLabel(formState.license_type) : 'Belum dipilih' }}</p>
              </div>
            </div>

            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">Seat Snapshot</p>
              <div class="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Seat Capacity:</span> {{ formState.seat_capacity || '0' }}</p>
                <p><span class="font-medium">Used Seats:</span> {{ formState.used_seats || '0' }}</p>
                <p><span class="font-medium">Available Seats:</span> {{ licenseAvailableSeats }}</p>
                <p><span class="font-medium">Utilization:</span> {{ licenseUtilizationPct }}</p>
              </div>
            </div>

            <div
              class="rounded-[22px] border p-4 text-sm leading-6"
              :class="
                formState.status === 'EXPIRED'
                  ? 'border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100'
                  : formState.status === 'WARNING'
                    ? 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100'
                    : 'border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100'
              "
            >
              <p class="font-semibold">{{ formState.status ? formatEnumLabel(formState.status) : 'License Draft Context' }}</p>
              <p class="mt-2 opacity-90">
                {{ formState.notes || 'Isi policy assignment, owner team, dan renewal review date agar operator bisa menilai seat risk dengan cepat.' }}
              </p>
            </div>
          </div>
        </SectionCard>

      </div>
    </div>
  </CrudPageShell>
</template>
