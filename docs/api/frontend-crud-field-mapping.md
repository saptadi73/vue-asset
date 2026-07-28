# Frontend CRUD Field Mapping

Dokumen ini memetakan field frontend CRUD ke payload backend agar implementasi
form tidak hanya konsisten secara UI, tetapi juga lebih siap untuk integrasi
API nyata.

Tanggal acuan dokumen ini adalah **Tuesday, July 28, 2026**.

Dokumen ini melengkapi:

- `docs/api/frontend-api-reference.md`
- `docs/api/frontend-crud-ui-options.md`
- `docs/api/frontend-crud-state-options.md`
- `docs/api/frontend-crud-implementation-checklist.md`

## 1. Tujuan

Dokumen ini dipakai untuk:

- menyamakan nama field frontend dan payload backend;
- mengurangi mismatch antara label UI dan request JSON;
- memberi catatan transformasi data sebelum submit;
- membantu implementasi service CRUD dan prefill edit form.

## 2. Aturan Mapping Umum

### 2.1 Prinsip Dasar

- label frontend boleh human-friendly;
- key state frontend boleh sederhana;
- payload backend tetap harus mengikuti kontrak endpoint;
- field turunan di frontend tidak selalu perlu dikirim ke backend.

### 2.2 Transformasi Yang Diizinkan

Frontend boleh melakukan transformasi berikut sebelum submit:

- string angka menjadi number
- `yes/no` menjadi boolean
- trim whitespace
- gabung field UI menjadi struktur request backend
- buang field kosong yang tidak wajib

### 2.3 Field Yang Sebaiknya Tidak Dikirim Manual

Sesuai dokumen auth backend, frontend tidak perlu mengirim manual field audit
seperti:

- `created_by`
- `updated_by`
- `actor_id`
- `uploaded_by`
- `deleted_by`
- `scanned_by`

## 3. Asset Registry

### 3.1 Create / Update Asset

Contoh mapping frontend ke payload:

| Frontend Field | Backend Payload | Catatan |
|---|---|---|
| `asset_code` | `asset_code` | kirim apa adanya |
| `asset_name` | `asset_name` | kirim apa adanya |
| `category` | `asset_category_id` atau field backend setara | frontend sebaiknya simpan `id`, bukan label |
| `asset_class` | `asset_class_id` | pilih dari master class |
| `location` | `current_location_id` atau field backend setara | simpan id lokasi |
| `status` | `status` | gunakan enum backend |
| `custodian` | opsional, tergantung kontrak endpoint | jika bukan field asset utama, jangan campur ke PATCH asset |
| `purchase_date` | `purchase_date` | format tanggal backend |
| `purchase_cost` | `purchase_cost` | ubah ke number |
| `replacement_priority` | `replacement_priority` | enum/string sesuai backend |

Catatan penting:

- perubahan ownership, assignment, status history, dan location history
  sebaiknya tidak dicampur ke update asset master bila backend menyediakan
  command endpoint terpisah.

### 3.2 Dynamic Attributes

Frontend field seperti:

- `dynamic_attributes`

lebih baik dipecah ke struktur backend seperti:

```json
[
  {
    "attribute_definition_id": "<uuid>",
    "value_text": "Intel Core Ultra 7"
  }
]
```

Artinya:

- textarea gabungan boleh dipakai hanya sebagai placeholder tahap awal;
- implementasi final sebaiknya menjadi form dinamis berdasarkan attribute
  definition backend.

## 4. Asset Transfers

### 4.1 Create Transfer

| Frontend Field | Backend Payload | Catatan |
|---|---|---|
| `transfer_number` | `transfer_number` | jika backend generate otomatis, frontend tidak perlu kirim |
| `transfer_date` | `transfer_date` | format tanggal |
| `movement_purpose` | `movement_purpose` | kirim string |
| `from_location` | `from_location_id` | kirim id |
| `to_location` | `to_location_id` | kirim id |
| `requested_by` | opsional | kirim hanya jika diminta kontrak |
| `notes` | `notes` | opsional |

### 4.2 State Action Transfer

Frontend action:

- `Move to Submitted`
- `Move to Approved`
- `Move to Completed`

tidak harus mengubah field `status` lewat endpoint update umum.

Lebih baik map ke action endpoint:

- `POST /api/v1/asset-transfers/{asset_transfer_id}/submit`
- `POST /api/v1/asset-transfers/{asset_transfer_id}/approve`
- `POST /api/v1/asset-transfers/{asset_transfer_id}/complete`

## 5. Lease Contracts

### 5.1 Create / Update Lease

| Frontend Field | Backend Payload | Catatan |
|---|---|---|
| `contract_number` | `contract_number` | kirim string |
| `vendor_name` | `business_partner_id` atau vendor id | sebaiknya pilih dari master partner |
| `status` | `status` | enum backend |
| `start_date` | `start_date` | format tanggal |
| `end_date` | `end_date` | format tanggal |
| `monthly_payment` | `monthly_payment` | ubah ke number |
| `notes` | `notes` | opsional |

Catatan:

- bila backend memisahkan header kontrak, asset item, dan payment, frontend
  jangan memaksa semua field jadi satu request besar.

## 6. Software Licenses

### 6.1 Create / Update License

| Frontend Field | Backend Payload | Catatan |
|---|---|---|
| `product_name` | `software_product_id` atau field produk setara | sebaiknya pilih dari master product |
| `license_key` | `license_key` | kirim string |
| `status` | `status` | enum backend |
| `seat_capacity` | `seat_capacity` | ubah ke number |
| `used_seats` | sebaiknya readonly / derived | tidak selalu dikirim saat create |
| `expires_at` | `expires_at` | format tanggal |
| `notes` | `notes` | opsional |

Catatan:

- `used_seats` pada banyak kasus lebih cocok berasal dari assignment data,
  bukan input manual.

## 7. Tracking / Stocktake

### 7.1 Create / Update Stocktake Session

| Frontend Field | Backend Payload | Catatan |
|---|---|---|
| `session_name` | `session_name` | kirim string |
| `start_date` | `start_date` | format tanggal |
| `end_date` | `end_date` | format tanggal |
| `location` | `location_id` | kirim id |
| `approver` | `approver_id` atau text sesuai kontrak | pilih bentuk sesuai backend |
| `notes` | `notes` | opsional |

### 7.2 State Transition Stocktake

Jika backend final memakai action spesifik, frontend sebaiknya memisahkan:

- update data sesi
- submit approval
- complete session

## 8. Maintenance

### 8.1 Create / Update Maintenance Request

| Frontend Field | Backend Payload | Catatan |
|---|---|---|
| `request_number` | `request_number` | bila auto-generated, frontend tidak wajib kirim |
| `asset_name` | `asset_id` | frontend final sebaiknya memilih asset by id |
| `priority` | `priority_id` atau `priority_code` | ikuti master priority backend |
| `request_date` | `request_date` | format tanggal |
| `symptom` | `symptom_description` atau field setara | kirim string |
| `team` | `maintenance_team_id` | simpan id tim |
| `requires_vendor` | `requires_vendor` | ubah ke boolean |

### 8.2 State Action Maintenance

Frontend action seperti:

- `Move to Assigned`
- `Move to In Progress`
- `Move to Completed`

lebih baik dipetakan ke endpoint workflow bila backend menyiapkannya, bukan
sekadar `PATCH status`.

## 9. Master Data

### 9.1 Frontend Field Dinamis

Field:

- `master_type`
- `code`
- `name`
- `is_active`
- `description`

harus dipetakan ke endpoint berbeda tergantung tipe record.

### 9.2 Mapping Berdasarkan Tipe

#### Asset Category

| Frontend Field | Backend Payload |
|---|---|
| `code` | `category_code` |
| `name` | `category_name` |
| `description` | `description` |
| `is_active` | `is_active` |

#### Asset Class

| Frontend Field | Backend Payload |
|---|---|
| `code` | `class_code` |
| `name` | `class_name` |
| `description` | `description` atau field setara |
| `is_active` | `is_active` |

#### Location

| Frontend Field | Backend Payload |
|---|---|
| `code` | `location_code` |
| `name` | `location_name` |
| `description` | `description` |
| `is_active` | `is_active` |

#### Business Partner

| Frontend Field | Backend Payload |
|---|---|
| `code` | `partner_code` |
| `name` | `partner_name` |
| `description` | `address` atau note field setara |
| `is_active` | `is_active` |

Catatan:

- mapping master data biasanya paling membutuhkan adapter function frontend.

## 10. Mapping Untuk Delete

Delete page biasanya tidak butuh banyak field input.

Yang dibutuhkan frontend:

- `id`
- `entityName`
- current state atau label
- warning message

Payload delete biasanya:

- tidak ada body
- atau body opsional berupa reason

Jika backend nanti mendukung reason:

| Frontend Field | Backend Payload |
|---|---|
| `delete_reason` | `reason` |

## 11. Mapping Untuk Feedback Error

Frontend sebaiknya memetakan:

| Backend Response | Frontend Behavior |
|---|---|
| `401` | minta login ulang / perbarui token |
| `403` | tampilkan permission warning |
| `404` | tampilkan record not found |
| `409` | tampilkan conflict warning |
| `422` | tampilkan validation error per field bila tersedia |

## 12. Adapter Function Yang Disarankan

Frontend sebaiknya menyiapkan dua adapter utama:

### 12.1 UI To API

Contoh tugas:

- rename field
- ubah string ke number
- ubah `yes/no` ke boolean
- pilih endpoint berdasar tipe

### 12.2 API To UI

Contoh tugas:

- prefill edit form
- ubah id menjadi selected option
- format tanggal untuk input
- flatten struktur response agar mudah dipakai di form

## 13. Checklist Cepat Mapping

- [ ] semua field frontend punya pasangan payload backend
- [ ] field yang hanya visual tidak ikut terkirim
- [ ] field boolean benar-benar boolean
- [ ] field number benar-benar number
- [ ] field id tidak dikirim sebagai label
- [ ] endpoint state transition tidak dicampur ke update umum

## 14. Kesimpulan

Dokumen ini membantu menjaga agar implementasi form frontend tidak hanya
terlihat rapi, tetapi juga benar secara payload dan workflow.

Saat backend final bertambah rinci, dokumen ini bisa diperluas menjadi mapping
per endpoint dan per field validation rule.
