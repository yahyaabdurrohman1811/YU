# Security Specification

## 1. Data Invariants
- Setiap manifest penumpang harus memiliki data tiket, nama lengkap, NIK/identitas, jenis kelamin, kelas tiket, nomor kursi, dan status.
- Setiap manifest muatan kapal harus memiliki nomor manifest, pengirim, penerima, kategori muatan, bobot (kg), dan lokasi penempatan dek.
- Setiap data kapal harus memiliki nama, kode IMO/Call sign, kapasitas penumpang, kapasitas kargo, dan nakhoda.
- Operasi tulis (Create, Update, Delete) membutuhkan pengguna yang terautentikasi (admin/petugas pelabuhan).
- Format ID dokumen dibatasi karakter alfanumerik aman (maksimal 128 karakter).

## 2. Hardened Rules Pillars
1. Catch-all default deny to avoid unintentional leaks.
2. Isolated validation helpers for Ship, Voyage, Passenger, and Cargo.
3. String size boundaries on all input fields to prevent resource exhaustion attacks.
4. Validation of enum values and numeric limits.
5. Testing connection doc allowed for health check.
