<script setup lang="ts">
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import {
  assetCategoryRecords,
  assetClassRecords,
  locationRecords,
  vendorRecords,
} from '@/data/master-data'
import { getCrudConfig } from '@/config/crud'
import { deleteCrudRecord } from '@/services/crud'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const crudConfig = getCrudConfig('masterData')!

const metrics: MetricCardItem[] = [
  { title: 'Categories', value: String(assetCategoryRecords.length), icon: 'FolderTree', tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200' },
  { title: 'Classes', value: String(assetClassRecords.length), icon: 'Layers3', tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200' },
  { title: 'Locations', value: String(locationRecords.length), icon: 'MapPinned', tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200' },
  { title: 'Vendors', value: String(vendorRecords.length), icon: 'BriefcaseBusiness', tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200' },
]

const baseColumns: DataTableColumn[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  {
    key: 'active',
    label: 'Active',
    type: 'badge',
    toneMap: {
      Yes: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      No: 'bg-slate-300/70 text-slate-700 ring-slate-300/50 dark:bg-slate-800 dark:text-slate-200',
    },
  },
]

const partnerColumns: DataTableColumn[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Vendor Name' },
  { key: 'kind', label: 'Partner Type' },
  { key: 'phone', label: 'Phone' },
  {
    key: 'active',
    label: 'Active',
    type: 'badge',
    toneMap: {
      Yes: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      No: 'bg-slate-300/70 text-slate-700 ring-slate-300/50 dark:bg-slate-800 dark:text-slate-200',
    },
  },
]

const categoryRows = assetCategoryRecords.map((item) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  active: item.isActive,
  master_type: 'asset-category',
}))

const classRows = assetClassRecords.map((item) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  active: item.isActive,
  master_type: 'asset-class',
}))

const locationRows = locationRecords.map((item) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  active: item.isActive,
  master_type: 'location',
}))

const vendorRows = vendorRecords.map((item) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  kind: item.kind,
  phone: item.phone,
  active: item.isActive,
  master_type: 'business-partner',
}))

const handleDeleteMasterRecord = async (row: Record<string, unknown>) => {
  await deleteCrudRecord(crudConfig, String(row.id), {
    master_type: String(row.master_type ?? 'asset-category'),
  })
}
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <SectionCard title="Master Data Domains">
      <div class="grid gap-6">
        <DataTable
          title="Asset Categories"
          :rows="categoryRows"
          :columns="baseColumns"
          :actions="[{ label: 'Create Category', to: '/master-data/new?master_type=asset-category', icon: 'Plus', tone: 'primary' }]"
          :row-actions="{
            editPath: (row) => `/master-data/${row.id}/edit?master_type=asset-category`,
            deleteTitle: 'Delete Asset Category',
            resolveRowLabel: (row) => String(row.code ?? row.name ?? row.id),
            deleteMessage: (row) => `Category ${String(row.code ?? row.id)} akan dihapus. Pastikan belum dipakai di asset registry atau class mapping.`,
            onDelete: handleDeleteMasterRecord,
          }"
          search-placeholder="Cari code atau nama category..."
          :search-keys="['code', 'name']"
          :page-size="4"
        />

        <DataTable
          title="Asset Classes"
          :rows="classRows"
          :columns="baseColumns"
          :actions="[{ label: 'Create Class', to: '/master-data/new?master_type=asset-class', icon: 'Plus', tone: 'primary' }]"
          :row-actions="{
            editPath: (row) => `/master-data/${row.id}/edit?master_type=asset-class`,
            deleteTitle: 'Delete Asset Class',
            resolveRowLabel: (row) => String(row.code ?? row.name ?? row.id),
            deleteMessage: (row) => `Class ${String(row.code ?? row.id)} akan dihapus. Cek dulu relasi lifecycle, depreciation, dan asset existing.`,
            onDelete: handleDeleteMasterRecord,
          }"
          search-placeholder="Cari code atau nama class..."
          :search-keys="['code', 'name']"
          :page-size="4"
        />

        <DataTable
          title="Locations"
          :rows="locationRows"
          :columns="baseColumns"
          :actions="[{ label: 'Create Location', to: '/master-data/new?master_type=location', icon: 'Plus', tone: 'primary' }]"
          :row-actions="{
            editPath: (row) => `/master-data/${row.id}/edit?master_type=location`,
            deleteTitle: 'Delete Location',
            resolveRowLabel: (row) => String(row.code ?? row.name ?? row.id),
            deleteMessage: (row) => `Location ${String(row.code ?? row.id)} akan dihapus. Pastikan tidak lagi dipakai transfer, stocktake, atau current asset placement.`,
            onDelete: handleDeleteMasterRecord,
          }"
          search-placeholder="Cari code atau nama lokasi..."
          :search-keys="['code', 'name']"
          :page-size="4"
        />

        <DataTable
          title="Vendors & Service Partners"
          :rows="vendorRows"
          :columns="partnerColumns"
          :actions="[{ label: 'Create Vendor', to: '/master-data/new?master_type=business-partner', icon: 'Plus', tone: 'primary' }]"
          :row-actions="{
            editPath: (row) => `/master-data/${row.id}/edit?master_type=business-partner`,
            deleteTitle: 'Delete Business Partner',
            resolveRowLabel: (row) => String(row.code ?? row.name ?? row.id),
            deleteMessage: (row) => `Partner ${String(row.name ?? row.code ?? row.id)} akan dihapus. Cek dulu relasi ke vendor asset, lease, dan maintenance contract.`,
            onDelete: handleDeleteMasterRecord,
          }"
          search-placeholder="Cari vendor, code, atau tipe partner..."
          :search-keys="['code', 'name', 'kind']"
          :page-size="4"
        />
      </div>
    </SectionCard>
  </div>
</template>
