# RPG Life Simulator Mobile

Aplikasi mobile RPG Life Simulator berbasis Expo dan React Native.

## Alur branch

Seluruh pekerjaan mobile harus melewati `local` sebagai gerbang pertama sebelum dipromosikan ke environment berikutnya:

```text
feature/*, bugfix/*, hotfix/*, fix/*, chore/*, release/*
                              |
                              v
                            local
                              |
                              v
                           develop
                              |
                              v
                           staging
                              |
                              v
                            main
```

Aturan Pull Request:

| Branch tujuan | Branch sumber yang diizinkan | Fungsi |
| --- | --- | --- |
| `local` | `feature/*`, `bugfix/*`, `hotfix/*`, `fix/*`, `chore/*`, `release/*` | Gerbang pertama dan validasi integrasi |
| `develop` | `local` | Integrasi pengembangan |
| `staging` | `develop` | Uji pra-produksi |
| `main` | `staging` | Rilis production |

Branch kerja tidak boleh langsung membuat Pull Request ke `develop`, `staging`, atau `main`. Validasi aturan ini tersedia di `.github/workflows/protected-branches.yml`.

## Setelah melakukan clone

### 1. Masuk ke project dan gunakan branch `local`

```bash
cd mobile
git fetch origin
git switch local
git pull --ff-only origin local
```

Buat branch kerja baru dari `local`:

```bash
git switch -c feature/nama-fitur
```

### 2. Siapkan perangkat lunak

Pastikan perangkat berikut sudah tersedia:

- Node.js versi 24 atau yang kompatibel dengan workflow CI
- npm
- Expo SDK 57
- Expo Go untuk menjalankan aplikasi pada perangkat fisik atau emulator yang sesuai

### 3. Install dependency

```bash
npm ci --legacy-peer-deps
```

Gunakan `npm ci` agar versi dependency mengikuti `package-lock.json`.

### 4. Siapkan environment

Salin `.env.example` menjadi `.env`.

Pada Windows:

```bash
copy .env.example .env
```

Pada Linux atau macOS:

```bash
cp .env.example .env
```

Atur nilai berikut sesuai environment lokal:

- `EXPO_PUBLIC_APP_ENV` — pilih `local`, `development`, `staging`, atau `production`.
- `EXPO_PUBLIC_API_URL_LOCAL`, `EXPO_PUBLIC_API_URL_DEVELOPMENT`, `EXPO_PUBLIC_API_URL_STAGING`, dan `EXPO_PUBLIC_API_URL_PRODUCTION` — URL backend untuk masing-masing environment.
- `EXPO_PUBLIC_API_URL` — fallback untuk konfigurasi lama. URL environment-specific memiliki prioritas lebih tinggi.
- `EXPO_PUBLIC_API_PORT` — port backend, default `5000`.
- `EXPO_PUBLIC_API_DEBUG` — gunakan `true` hanya saat membutuhkan log API tambahan.

Untuk perangkat fisik, komputer dan perangkat harus berada pada jaringan Wi-Fi yang sama. Jika backend berjalan di komputer host, gunakan alamat IP LAN komputer tersebut bila alamat otomatis Expo tidak dapat diakses.

Untuk mengganti environment, ubah `EXPO_PUBLIC_APP_ENV` pada `.env`, lalu restart Expo dengan cache dibersihkan:

```bash
npm start -- --clear
```

Contoh konfigurasi:

```dotenv
EXPO_PUBLIC_APP_ENV=staging
EXPO_PUBLIC_API_URL_STAGING=https://staging-api.example.com/api/mobile
```

Jangan commit file `.env` atau credential asli.

Pemetaan environment aplikasi:

| Environment | Branch backend/mobile | `EXPO_PUBLIC_APP_ENV` |
| --- | --- | --- |
| Local developer | `local` | `local` |
| Development | `develop` | `development` |
| Staging | `staging` | `staging` |
| Production | `main` | `production` |

### 5. Jalankan pemeriksaan

```bash
npm run lint
npm exec tsc -- --noEmit
```

Kedua pemeriksaan tersebut wajib lulus sebelum membuat Pull Request.

### 6. Jalankan aplikasi

Untuk development biasa:

```bash
npm start
```

Perintah lain yang tersedia:

```bash
npm run start:tunnel
npm run android
npm run ios
npm run web
```

Gunakan `start:tunnel` jika perangkat tidak dapat terhubung melalui jaringan lokal. Perintah `ios` umumnya memerlukan macOS dan simulator iOS.

### 7. Kirim perubahan melalui `local`

Setelah perubahan selesai:

1. Jalankan lint dan typecheck.
2. Pastikan tidak ada secret yang ikut berubah.
3. Commit perubahan dengan pesan yang jelas.
4. Buat Pull Request dari branch kerja menuju `local`.
5. Setelah merge dan validasi berhasil, promosikan secara berurutan: `local` → `develop` → `staging` → `main`.

## Pemeriksaan otomatis

Pull Request ke branch terlindungi menjalankan:

- Validasi aturan alur Pull Request
- Validasi file sensitif dan pola secret
- Lint Expo mobile
- Typecheck TypeScript
- Audit dependency npm
- Scan keamanan Semgrep
- Scan secret dengan Gitleaks
- Analisis keamanan CodeQL

Konfigurasi Ruleset tersedia di `.github/rulesets/branch-protection.json`. Ruleset dan branch protection harus diaktifkan pada pengaturan GitHub agar push langsung ke branch terlindungi benar-benar diblokir.

## Deployment dan rilis

- `develop` digunakan untuk integrasi development.
- `staging` digunakan untuk uji pra-produksi.
- `main` digunakan untuk rilis production.
- Deployment staging dan production dilakukan melalui workflow manual dengan approval environment.

Detail tersedia di `.github/BRANCH_PROTECTION.md` dan `.github/DEPLOYMENT_PROTECTION.md`.

## Struktur utama

- `src/app/` — route dan screen Expo Router
- `src/components/` — komponen UI bersama
- `src/hooks/` — custom hooks
- `src/services/` — integrasi API dan service aplikasi
- `assets/` — asset aplikasi
- `app.json` — konfigurasi Expo
