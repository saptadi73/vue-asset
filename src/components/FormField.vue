<script setup lang="ts">
import type { CrudField } from '@/types/crud'

defineProps<{
  field: CrudField
  modelValue: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
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
