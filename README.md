# THE SPARTAN QUIZ V5 — Railway + PostgreSQL

Versi ini dibuat khusus untuk Railway. Tidak memakai Vercel Functions atau Neon.

## Isi
- 7 soal, satu per satu
- Durasi 8 menit
- Token peserta: `SPARTAN2026` (bisa diganti)
- Auto-submit saat waktu habis
- Mencoba auto-submit ketika halaman ditinggalkan/dipindah aplikasi
- Admin dapat melihat skor dan status setiap jawaban
- PostgreSQL Railway menyimpan semua pengerjaan

## Deploy paling mudah
1. Buat project baru di Railway.
2. Tambahkan service **PostgreSQL**: `+ New` → `Database` → `PostgreSQL`.
3. Tambahkan service aplikasi dari folder/ZIP ini. Cara yang paling stabil adalah upload kode lewat GitHub lalu pilih repo tersebut, atau deploy memakai Railway CLI.
4. Pada service aplikasi, set variable:
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - `QUIZ_TOKEN=SPARTAN2026`
   - `ADMIN_USER=admin`
   - `ADMIN_PASS=andrian11`
5. Railway akan menjalankan `npm start`.
6. Pada Settings → Networking, generate domain untuk mendapatkan link quiz.

PostgreSQL Railway menyediakan `DATABASE_URL` dan dapat direferensikan dari service aplikasi.

## Catatan
Tabel `quiz_attempts` dibuat otomatis saat server menerima request pertama. Tidak perlu membuat tabel manual.

Browser tidak bisa menjamin pengiriman data jika aplikasi/browser dibunuh paksa oleh sistem. Event `visibilitychange` dan `pagehide` sudah dipakai untuk mencoba auto-submit ketika halaman ditinggalkan.
