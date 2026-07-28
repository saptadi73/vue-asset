# Frontend CRUD UI Options

Dokumen ini menjelaskan opsi implementasi frontend untuk halaman CRUD agar tim
frontend tidak hanya membuat form dasar, tetapi juga menyiapkan pilihan
interaksi yang fleksibel sesuai kompleksitas modul.

Semua rekomendasi berikut mengacu pada kontrak backend yang tervalidasi live
per **Tuesday, July 28, 2026**.

Dokumen ini melengkapi:

- `docs/api/frontend-api-reference.md`
- `docs/api/frontend-functional-blueprint.md`
- `docs/api/frontend-page-endpoint-map.md`
- `docs/api/frontend-seed-scenarios.md`

## 1. Tujuan

Dokumen ini dibuat agar implementasi CRUD frontend:

- konsisten antar modul;
- tetap ringan untuk modul sederhana;
- punya opsi tambahan untuk modul kompleks;
- lebih siap dihubungkan ke backend nyata tanpa refactor besar.

## 2. Pola Dasar CRUD Page

Setiap halaman CRUD sebaiknya memiliki struktur minimum:

1. header halaman
2. ringkasan entitas
3. form section yang dipisah logis
4. feedback sukses/gagal
5. tombol aksi utama
6. tombol kembali ke list

Rekomendasi implementasi:

- `Create` dan `Update` memakai shell halaman yang sama;
- `Delete` memakai halaman konfirmasi terpisah;
- tombol CRUD utama ditempatkan langsung di card table list;
- action yang berisiko tinggi jangan disatukan dengan action informasional.

## 3. Opsi UI Untuk Form CRUD

Frontend boleh memilih salah satu pola berikut tergantung kebutuhan modul.

### 3.1 Full Page Form

Cocok untuk:

- asset registry
- maintenance request
- lease contract
- software license

Karakter:

- form multi-section
- penjelasan field lebih mudah
- cocok untuk data panjang dan kompleks

### 3.2 Slide Over / Drawer Form

Cocok untuk:

- master data sederhana
- update minor
- edit cepat pada entitas list-heavy

Karakter:

- cepat
- tidak memutus konteks halaman list
- cocok bila field sedikit

Catatan:

- gunakan hanya bila field < 8-10 input utama;
- jangan dipakai untuk asset create penuh atau workflow historis.

### 3.3 Modal Confirmation

Cocok untuk:

- delete
- quick confirm
- operasi state transition ringan

Karakter:

- singkat
- fokus ke satu keputusan
- jangan berisi form panjang

## 4. Opsi Sectioning Pada Form

Frontend dianjurkan memecah form dalam section berbeda. Berikut opsi yang bisa
dipilih:

### 4.1 Section Statis

Semua section tampil bersamaan.

Cocok untuk:

- lease
- license
- transfer

### 4.2 Section Bertahap

Form dipecah menjadi step.

Cocok untuk:

- asset create
- maintenance create kompleks
- master data yang bergantung pada tipe record

Rekomendasi step asset:

1. Primary Data
2. Operational Context
3. Financial / Dynamic Attributes
4. Review & Submit

### 4.3 Accordion Section

Form tetap satu halaman tetapi section bisa fold/unfold.

Cocok untuk:

- mobile
- form menengah
- saat ingin mengurangi beban visual

## 5. Opsi Input Frontend Yang Direkomendasikan

### 5.1 Select Dengan Search

Gunakan untuk:

- category
- class
- location
- vendor
- team

Frontend dapat mulai dari select biasa, lalu upgrade ke searchable select bila
data master membesar.

### 5.2 Textarea Dengan Hint

Gunakan untuk:

- notes
- symptom
- dynamic attributes manual
- business explanation

Tambahkan helper text agar user tahu format yang diharapkan.

### 5.3 Readonly Derived Field

Opsional di sisi frontend bila ada nilai turunan seperti:

- available seats
- progress ratio
- estimated replacement exposure
- summary label dari beberapa input

Readonly field jangan dikirim ke backend bila bukan bagian kontrak request.

## 6. Opsi Validasi Frontend

Frontend tidak boleh menggantikan validasi backend, tetapi boleh menambah
guard cepat.

### 6.1 Validasi Minimum

- required field
- number format
- date format
- select tidak kosong

### 6.2 Validasi Kontekstual

- `end_date` tidak boleh sebelum `start_date`
- `used_seats` tidak boleh melebihi `seat_capacity`
- `to_location` tidak boleh sama dengan `from_location`

### 6.3 Validasi Bertahap

Opsional untuk multi-step form:

- validasi hanya step aktif
- validasi penuh saat submit final

## 7. Opsi Feedback Setelah Submit

Frontend disarankan menyiapkan tiga variasi response UX:

### 7.1 Inline Success Card

Dipakai bila user tetap berada di halaman.

### 7.2 Redirect Kembali Ke List

Dipakai bila submit sukses dan user kemungkinan lanjut melihat list lagi.

### 7.3 Tetap Di Form Dengan Pesan Error

Dipakai bila backend mengembalikan:

- `400`
- `401`
- `403`
- `422`
- `409`

## 8. Opsi Tombol Aksi

Tombol aksi pada CRUD frontend boleh dibedakan menjadi:

### 8.1 Primary Action

- `Create New`
- `Save Changes`
- `Confirm Delete`

### 8.2 Secondary Action

- `Back to List`
- `Cancel`
- `Reset`

### 8.3 Context Action

- `Move to Submitted`
- `Move to Approved`
- `Move to Completed`

Action jenis ini tidak perlu muncul di semua modul.

## 9. Rekomendasi Per Modul

### 9.1 Asset Registry

Direkomendasikan:

- full page form
- multi-section
- opsional multi-step
- dynamic field berdasarkan category

### 9.2 Asset Transfers

Direkomendasikan:

- form sederhana
- table action baku
- next state action terpisah

### 9.3 Leases

Direkomendasikan:

- full page form
- cost summary card opsional
- review period validation

### 9.4 Software Licenses

Direkomendasikan:

- form sedang
- readonly capacity summary
- expiry highlight

### 9.5 Tracking / Stocktake

Direkomendasikan:

- create/update sederhana
- date window validation
- coverage summary opsional

### 9.6 Maintenance

Direkomendasikan:

- form multi-section
- severity/priority emphasis
- next state action terpisah dari edit umum

### 9.7 Master Data

Direkomendasikan:

- drawer atau compact page
- tipe record menjadi field pertama
- field turunan berubah mengikuti tipe master

## 10. Opsi Yang Bisa Ditambahkan Nanti

Berikut opsi frontend yang belum wajib, tetapi layak dipertimbangkan:

- autosave draft lokal
- dirty state warning sebelum pindah halaman
- duplicate record warning
- audit preview
- compare before/after untuk update
- role-based disabling tombol tertentu
- optimistic UI untuk perubahan ringan

## 11. Kesimpulan

Frontend tidak perlu memaksakan satu bentuk CRUD untuk semua modul.
Pendekatan yang disarankan:

- satu shell utama agar konsisten;
- opsi section berbeda per modul;
- action baku berada di table card;
- state transition dipisah dari edit umum bila workflow backend memang berbeda.
