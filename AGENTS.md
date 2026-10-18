## Bahasa Komunikasi

- Gunakan Bahasa Indonesia untuk komunikasi, penjelasan perubahan, laporan validasi, dan respons kepada pengguna. Pertahankan Bahasa Inggris untuk kode, nama teknis, endpoint, field, dan konfigurasi yang memang harus mengikuti standar proyek.
- Setelah setiap perubahan selesai, termasuk perubahan kecil, jalankan lint atau validasi yang relevan lalu buat commit dengan pesan yang jelas.

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- Gunakan date picker untuk seluruh input tanggal; jangan meminta pengguna mengetik tanggal secara manual. Field tanggal yang belum dipilih harus menampilkan placeholder dan date picker harus memiliki nilai awal yang valid.

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Log Keputusan Pengembangan

- 2026-10-18 — Alur branch dikunci sebagai `feature/* -> local -> develop -> staging -> main`. Setiap masalah utama dibuat dalam branch dan PR terpisah menuju `local`.
- 2026-10-18 — Environment aplikasi dipisahkan menjadi `local`, `development`, `staging`, dan `production`. Branch tetap memakai `develop`; environment `development` dipetakan ke branch tersebut. Perpindahan environment dilakukan melalui satu file `.env` lokal, sedangkan `.env.example` menjadi dokumentasi tanpa secret.
- 2026-10-18 — Form setelah login menggunakan modal, sementara login, register, reset password, dan onboarding tetap menjadi layar penuh. Feedback aksi in-app diarahkan ke modal terpusat.
- 2026-10-18 — Header profile menggunakan icon back di kiri, judul di tengah, dan icon aksi kontekstual di kanan. Reward skill tetap membuka `/profile/skills`.
- 2026-10-18 — Pengguna memilih agama saat onboarding sebelum menerima misi agama. Misi umum tetap tersedia untuk semua pengguna.
- 2026-10-18 — `streak_days` tetap menjadi bagian dari sistem misi. UI menjelaskan hari aktif, tanggal terakhir selesai, kondisi streak bertambah, dan kondisi streak terputus.

## Status Milestone

- Selesai di branch/PR terpisah: konfigurasi environment, modal form in-app, header profile, navigasi reward skill, onboarding agama, dan detail status streak.
- Validasi statis `git diff --check` berhasil pada perubahan yang dibuat.
- Lint dan typecheck belum dapat dijalankan pada mesin ini karena executable Node.js tidak tersedia di PATH; jalankan `npx expo lint` dan `npx tsc --noEmit` setelah Node.js tersedia.

## Standar Pull Request

- Gunakan judul singkat dengan format Conventional Commits.
- Gunakan struktur sederhana: `Tujuan`, `Perubahan`, `Validasi`, dan `Target`.
- Jelaskan hanya perubahan yang benar-benar ada di branch tersebut.
- Cantumkan keterbatasan validasi secara jujur dan jangan menyatakan test lulus jika belum dijalankan.
- Semua PR fitur dan perbaikan diarahkan ke `local`.
