# Frontend CRUD Implementation Checklist

Dokumen ini adalah checklist eksekusi untuk implementasi halaman CRUD frontend
di aplikasi Asset Management.

Tanggal acuan dokumen ini adalah **Tuesday, July 28, 2026**.

Dokumen ini melengkapi:

- `docs/api/frontend-crud-ui-options.md`
- `docs/api/frontend-crud-state-options.md`
- `docs/api/frontend-api-reference.md`
- `docs/api/frontend-functional-blueprint.md`

## 1. Tujuan

Checklist ini dibuat agar tim frontend bisa memastikan setiap halaman CRUD:

- konsisten secara UX;
- sesuai kontrak backend;
- punya validasi minimum;
- punya handling state dan feedback yang aman;
- siap diuji manual maupun dihubungkan ke API nyata.

## 2. Checklist Global Untuk Semua Halaman CRUD

### 2.1 Struktur Halaman

- [ ] halaman memiliki judul yang jelas
- [ ] ada deskripsi singkat fungsi halaman
- [ ] ada tombol kembali ke list
- [ ] action utama terlihat jelas
- [ ] tampilan mobile tetap rapi

### 2.2 Integrasi Data

- [ ] endpoint create sudah ditentukan
- [ ] endpoint update sudah ditentukan
- [ ] endpoint delete atau deactivate sudah ditentukan
- [ ] payload request sudah dipetakan dari field frontend
- [ ] response envelope backend sudah ditangani

### 2.3 Auth dan Session

- [ ] bearer token tersedia
- [ ] request frontend mengirim `Authorization: Bearer <token>`
- [ ] error `401` ditangani
- [ ] error `403` ditangani

### 2.4 Feedback UX

- [ ] loading state terlihat saat submit
- [ ] success feedback muncul
- [ ] error feedback muncul
- [ ] user tidak bingung setelah submit berhasil
- [ ] redirect atau refresh setelah sukses sudah jelas

## 3. Checklist Halaman List Dengan Action CRUD

- [ ] table memiliki search
- [ ] table memiliki pagination
- [ ] tombol `Create New` ada di card table
- [ ] tombol `Update` ada di card table
- [ ] tombol `Delete` ada di card table
- [ ] style tombol CRUD konsisten antar modul

Opsional:

- [ ] quick filter tersedia
- [ ] badge status tersedia
- [ ] chart operasional tersedia di side panel

## 4. Checklist Halaman Create

- [ ] field wajib sudah ditentukan
- [ ] default value aman
- [ ] select field punya opsi yang jelas
- [ ] helper text ada untuk field yang ambigu
- [ ] validasi minimum berjalan sebelum submit
- [ ] submit memanggil endpoint create
- [ ] success message tampil
- [ ] redirect setelah create sudah sesuai

## 5. Checklist Halaman Update

- [ ] data awal bisa diprefill
- [ ] identifier record terlihat jelas
- [ ] perubahan field tidak merusak workflow state
- [ ] submit memanggil endpoint update
- [ ] perubahan sukses memberi feedback jelas

Opsional:

- [ ] tampilkan ringkasan data awal
- [ ] tampilkan perubahan sebelum submit
- [ ] field readonly untuk data turunan

## 6. Checklist Halaman Delete

- [ ] halaman delete terpisah dari update umum
- [ ] identifier record terlihat jelas
- [ ] warning risiko tampil
- [ ] user tahu apakah delete final atau deactivate
- [ ] submit memanggil endpoint delete
- [ ] success/error message jelas

## 7. Checklist Untuk State Transition

Gunakan untuk modul yang punya workflow seperti transfer, maintenance,
stocktake, atau retirement.

- [ ] current state terlihat jelas
- [ ] next state action tidak bercampur dengan update umum
- [ ] action `Submitted`, `Approved`, `Completed`, dll tampil terpisah
- [ ] tombol next state disabled bila belum valid
- [ ] ada penjelasan singkat arti action
- [ ] ada feedback setelah transition sukses atau gagal

Opsional:

- [ ] confirmation sebelum transition besar
- [ ] reason / note field sebelum transition
- [ ] audit info actor dan timestamp

## 8. Checklist Validasi Frontend

- [ ] required field
- [ ] date consistency
- [ ] number consistency
- [ ] select consistency
- [ ] business rule minimum

Contoh business rule:

- [ ] `to_location` tidak sama dengan `from_location`
- [ ] `end_date` tidak lebih awal dari `start_date`
- [ ] `used_seats` tidak lebih besar dari `seat_capacity`

## 9. Checklist Modul Per Modul

### 9.1 Asset Registry

- [ ] create asset punya section yang jelas
- [ ] category dan class tidak membingungkan
- [ ] lokasi dan status awal bisa dipilih
- [ ] dynamic attributes punya tempat yang layak

### 9.2 Asset Transfers

- [ ] create transfer punya lokasi asal dan tujuan
- [ ] next state `Submitted`
- [ ] next state `Approved`
- [ ] next state `Completed`

### 9.3 Leases

- [ ] kontrak punya periode jelas
- [ ] biaya bulanan bisa diisi
- [ ] status kontrak mudah dibaca

### 9.4 Software Licenses

- [ ] seat capacity jelas
- [ ] used seats jelas
- [ ] expiry date mudah dibaca

### 9.5 Tracking / Stocktake

- [ ] session name jelas
- [ ] window date tervalidasi
- [ ] approval state bisa dipahami

### 9.6 Maintenance

- [ ] priority terlihat jelas
- [ ] symptom punya textarea layak
- [ ] next state tersedia
- [ ] dispatch note atau assignment context tersedia

### 9.7 Master Data

- [ ] tipe master record dipilih dulu
- [ ] field menyesuaikan konteks
- [ ] active/inactive mudah dipahami

## 10. Checklist Sebelum Merge

- [ ] `npm run type-check` lolos
- [ ] `npm run build` lolos
- [ ] layout desktop oke
- [ ] layout mobile oke
- [ ] dark mode oke
- [ ] icon dan button alignment rapi
- [ ] text tidak terpotong
- [ ] empty state ada

## 11. Checklist Uji Manual Minimal

- [ ] buka list page
- [ ] cari data dengan search
- [ ] buka create page
- [ ] submit create dengan data valid
- [ ] buka update page
- [ ] ubah satu field penting
- [ ] buka delete page
- [ ] uji feedback success atau error
- [ ] uji next state action bila ada

## 12. Cara Pakai Dokumen Ini

Disarankan alur penggunaannya:

1. baca `frontend-crud-ui-options.md`
2. baca `frontend-crud-state-options.md` bila modul punya workflow state
3. gunakan checklist ini saat membangun halaman
4. tandai item yang sudah selesai saat QA internal

## 13. Kesimpulan

Dokumen ini bukan pengganti spesifikasi modul, tetapi alat bantu agar
implementasi CRUD frontend tetap konsisten, aman, dan cepat diverifikasi.
