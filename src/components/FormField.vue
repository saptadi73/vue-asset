<script setup lang="ts">
import type { CrudField } from '@/types/crud'

defineProps<{
  field: CrudField
  modelValue: string | number | File[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:files': [value: File[]]
}>()
</script>

<template>
  <label class="block">
    <span class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ field.label }}
      <span v-if="field.required" class="ml-1 text-rose-500">*</span>
    </span>

    <textarea
      v-if="field.type === 'textarea'"
      :value="String(modelValue ?? '')"
      :placeholder="field.placeholder"
      :readonly="field.readOnly"
      rows="4"
      class="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <select
      v-else-if="field.type === 'select'"
      :value="String(modelValue ?? '')"
      :disabled="field.readOnly"
      class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">Select {{ field.label }}</option>
      <option v-for="option in field.options || []" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <div v-else-if="field.type === 'file'" class="space-y-3">
      <input
        type="file"
        :accept="field.accept"
        :multiple="field.multiple"
        :disabled="field.readOnly"
        class="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700 focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100 dark:file:bg-sky-500/10 dark:file:text-sky-200"
        @change="emit('update:files', Array.from(($event.target as HTMLInputElement).files || []))"
      />

      <div
        v-if="Array.isArray(modelValue) && modelValue.length"
        class="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs leading-5 text-slate-600 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300"
      >
        <p class="font-medium text-slate-700 dark:text-slate-100">Selected file{{ modelValue.length > 1 ? 's' : '' }}</p>
        <ul class="mt-2 space-y-1">
          <li v-for="file in modelValue" :key="`${file.name}-${file.size}`">
            {{ file.name }} · {{ Math.max(1, Math.round(file.size / 1024)) }} KB
          </li>
        </ul>
      </div>
    </div>

    <input
      v-else
      :type="field.type"
      :value="String(modelValue ?? '')"
      :placeholder="field.placeholder"
      :readonly="field.readOnly"
      class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <p v-if="field.helper" class="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{{ field.helper }}</p>
  </label>
</template>
