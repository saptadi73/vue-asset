<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ApiEndpointList from '@/components/ApiEndpointList.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CrudPageShell from '@/components/CrudPageShell.vue'
import SectionCard from '@/components/SectionCard.vue'
import { getCrudConfig } from '@/config/crud'
import { submitWorkflowAction } from '@/services/crud'
import { ApiError } from '@/services/http'

const route = useRoute()
const router = useRouter()

const crudKey = computed(() => String(route.meta.crudKey || ''))
const actionKey = computed(() => String(route.params.actionKey || ''))
const itemId = computed(() => String(route.params.id || ''))
const config = computed(() => getCrudConfig(crudKey.value))
const action = computed(() => config.value?.workflowActions?.find((item) => item.key === actionKey.value))

const note = reactive({
  value: '',
})

const requestState = reactive({
  isSubmitting: false,
  successMessage: '',
  errorMessage: '',
})

const endpoints = computed(() => {
  if (!action.value) return []

  return [
    {
      method: action.value.method,
      path: action.value.resolvePath(itemId.value),
      note: action.value.description,
    },
  ]
})

const handleSubmit = async () => {
  if (!config.value || !action.value || !itemId.value) return

  requestState.isSubmitting = true
  requestState.successMessage = ''
  requestState.errorMessage = ''

  try {
    const response = await submitWorkflowAction(config.value, action.value.key, itemId.value, note.value || undefined)
    requestState.successMessage = response.message || `${config.value.entityName} berhasil dipindahkan ke status ${action.value.nextState}.`

    window.setTimeout(() => {
      void router.push(config.value!.basePath)
    }, 900)
  } catch (error) {
    requestState.errorMessage =
      error instanceof ApiError
        ? `${error.message}${error.code ? ` [${error.code}]` : ''}`
        : 'Terjadi kegagalan saat menjalankan workflow action.'
  } finally {
    requestState.isSubmitting = false
  }
}
</script>

<template>
  <CrudPageShell
    v-if="config && action"
    :eyebrow="config.title"
    :title="action.label"
    :description="action.description"
    :back-to="config.basePath"
    :submit-label="`Move to ${action.nextState}`"
    :is-submitting="requestState.isSubmitting"
    @submit="handleSubmit"
  >
    <div class="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
      <div class="space-y-6">
        <SectionCard
          title="Workflow Summary"
          description="Konfirmasi perpindahan state sebelum command dikirim ke backend."
        >
          <div class="rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <div class="flex items-start gap-4">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white/80 dark:bg-slate-950/50"
                :class="action.tone"
              >
                <BaseIcon :name="action.icon" :size="20" />
              </div>
              <div class="space-y-2">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ config.entityName }} ID: {{ itemId }}</p>
                <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">{{ action.description }}</p>
                <p class="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase dark:text-slate-400">
                  Next State: {{ action.nextState }}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          v-if="requestState.successMessage || requestState.errorMessage"
          :title="requestState.successMessage ? 'Workflow Success' : 'Workflow Failed'"
          :description="requestState.successMessage ? 'Command workflow berhasil dikirim.' : 'Periksa endpoint, token, atau catatan yang dikirim.'"
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

        <SectionCard
          title="Action Note"
          :description="action.noteFieldPlaceholder || 'Catatan ini opsional dan akan ikut dikirim jika diisi.'"
        >
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {{ action.noteFieldLabel || 'Workflow Note' }}
            </span>
            <textarea
              v-model="note.value"
              rows="5"
              :placeholder="action.noteFieldPlaceholder || 'Tambahkan catatan workflow...'"
              class="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
            />
          </label>
        </SectionCard>
      </div>

      <div class="space-y-6">
        <ApiEndpointList title="Workflow Endpoint" :endpoints="endpoints" />
      </div>
    </div>
  </CrudPageShell>
</template>
