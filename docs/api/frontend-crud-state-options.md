# Frontend CRUD State Transition Options

Dokumen ini fokus pada implementasi frontend untuk aksi perubahan state yang
tidak cukup direpresentasikan oleh tombol `Update` biasa.

Tanggal acuan dokumen ini adalah **Tuesday, July 28, 2026**.

Dokumen ini melengkapi:

- `docs/api/frontend-crud-ui-options.md`
- `docs/api/frontend-api-reference.md`
- `docs/api/frontend-page-endpoint-map.md`

## 1. Mengapa State Transition Dipisah

Pada beberapa modul, perubahan status bukan sekadar update field biasa.
Status tertentu memiliki makna workflow dan audit trail.

Contoh:

- transfer: `DRAFT -> SUBMITTED -> APPROVED -> COMPLETED`
- maintenance request: `OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED`
- stocktake: `ACTIVE -> PENDING_APPROVAL -> COMPLETED`
- retirement request: `REQUESTED -> APPROVED -> CONFIRMED`

Karena itu frontend sebaiknya:

- tidak selalu menyatukan semua perubahan ke form `Update`;
- menyediakan area khusus untuk action `next state`;
- menampilkan konteks yang cukup sebelum user menekan tombol.

## 2. Pola UI Yang Direkomendasikan

### 2.1 Next State Action Panel

Pola ini paling direkomendasikan.

Isi panel:

- daftar action state berikutnya
- ringkasan arti action
- visual warna berbeda per tahap

Kapan dipakai:

- transfer
- maintenance
- retirement
- approval flow lain

### 2.2 Inline Action Pada Table Row

Opsional bila list sangat operasional.

Kelebihan:

- cepat
- efisien untuk admin power user

Kekurangan:

- berisiko salah klik
- sulit memberi konteks

Gunakan hanya untuk state ringan dan reversible.

### 2.3 Confirmation Modal Sebelum Transition

Disarankan untuk state yang berdampak besar.

Contoh:

- `Approve`
- `Complete`
- `Confirm`
- `Close`

Isi minimal modal:

- current state
- next state
- identifier record
- warning singkat

## 3. Rekomendasi State UX Per Modul

### 3.1 Asset Transfers

State utama:

- `DRAFT`
- `SUBMITTED`
- `APPROVED`
- `COMPLETED`

Frontend sebaiknya menampilkan:

- current state badge
- tombol `Move to Submitted`
- tombol `Move to Approved`
- tombol `Move to Completed`

Aturan UI:

- action yang belum valid dinonaktifkan;
- tombol `Delete` hanya untuk draft atau record yang masih aman dibatalkan;
- edit umum dipisah dari next state panel.

### 3.2 Maintenance

State umum yang sering dibutuhkan di frontend:

- `OPEN`
- `ASSIGNED`
- `IN_PROGRESS`
- `COMPLETED`
- opsional `CANCELLED`

Frontend sebaiknya menampilkan:

- current state badge
- ringkasan priority
- panel next state
- catatan dispatch / vendor readiness

### 3.3 Stocktake

State umum:

- `ACTIVE`
- `PENDING_APPROVAL`
- `COMPLETED`

Frontend sebaiknya menampilkan:

- progres verifikasi
- approval readiness
- action lanjut hanya jika coverage sudah cukup

### 3.4 Retirement Request

State umum:

- `REQUESTED`
- `APPROVED`
- `CONFIRMED`

Frontend sebaiknya memberi:

- warning bahwa konfirmasi final berdampak ke status asset;
- penjelasan singkat per stage;
- action confirmation yang tidak bercampur dengan edit data biasa.

## 4. Opsi Tombol State

Frontend boleh memilih salah satu bentuk tombol berikut.

### 4.1 Single Next Button

Contoh:

- `Move to Submitted`

Cocok bila hanya satu state valid berikutnya.

### 4.2 Multiple State Choices

Contoh:

- `Approve`
- `Reject`
- `Return to Draft`

Cocok bila workflow bercabang.

### 4.3 Dropdown Action Menu

Dipakai bila pilihan banyak, tetapi sebaiknya dihindari untuk mobile jika terlalu
sering dipakai.

## 5. Opsi Informasi Pendukung Sebelum Transition

Frontend bisa menambahkan kartu ringkas sebelum user menjalankan next state:

- owner/requester
- tanggal request
- lokasi asal/tujuan
- priority
- current assignee
- jumlah item terkait

Tujuannya agar user tidak perlu pindah halaman hanya untuk memastikan konteks.

## 6. Opsi Disable / Enable Tombol

State action sebaiknya dikontrol dengan aturan visual berikut:

### 6.1 Enabled

Tombol aktif bila:

- current state sesuai;
- data minimum sudah lengkap;
- user punya permission;
- backend memang menyediakan endpoint action tersebut.

### 6.2 Disabled

Tombol nonaktif bila:

- current state belum cocok;
- dependency belum lengkap;
- record sudah final;
- backend endpoint belum siap.

Tambahkan helper text singkat bila action disabled karena alasan bisnis.

## 7. Opsi Feedback Setelah Transition

Setelah user menekan next state, frontend bisa memilih:

### 7.1 Stay on Page + Refresh Status

Cocok untuk detail page atau list operasional.

### 7.2 Redirect to List

Cocok bila halaman action berdiri sendiri.

### 7.3 Toast + Inline Status Update

Cocok bila action dilakukan cepat dari dashboard atau queue table.

## 8. Opsi Audit-Oriented UX

Untuk state penting, frontend dapat menampilkan:

- label `irreversible`
- timestamp preview
- actor note field
- reason field opsional

Tidak semua modul wajib memakai ini, tetapi sangat disarankan untuk:

- approval
- final confirmation
- completion
- closing

## 9. Hubungan Dengan CRUD Umum

Frontend disarankan membedakan dua jenis aksi:

### 9.1 CRUD Umum

Dipakai untuk:

- create record
- edit data dasar
- delete / deactivate

### 9.2 Workflow Action

Dipakai untuk:

- submit
- approve
- complete
- confirm
- assign

Kesimpulan penting:

- ubah data dasar tetap lewat `Update`;
- pindah state workflow lewat `Next State Actions`.

## 10. Checklist Implementasi Frontend

Sebelum halaman state transition dianggap siap, cek:

1. current state terlihat jelas
2. next state action terpisah dari edit umum
3. action yang tidak valid benar-benar disabled
4. success/error feedback tampil jelas
5. user tahu dampak action sebelum menekan tombol
6. mobile layout tetap nyaman

## 11. Kesimpulan

Frontend yang baik tidak memperlakukan perubahan state sebagai edit biasa.
Untuk modul yang punya workflow, action transition harus:

- terlihat jelas
- mudah dijalankan
- aman
- sesuai business rule backend

Dokumen ini bisa dipakai sebagai acuan saat menambah panel `next state` pada
halaman list, detail, maupun dashboard operasional.
