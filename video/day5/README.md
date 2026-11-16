# Video DAY 5 — "1 HARI, 4 BANGUNAN BERDIRI"

Video 1080x1920, 30 fps, ±60 detik, direkam dari peta 3D (index.html) lewat Chrome headless.
Suara Presiden sudah jadi: `suara-day5.mp3` (60,6 dtk, ElevenLabs "Mark - Natural Conversations", eleven v4).

## Alat
- `film.js`  : disisipkan ke peta (sebelum `loop();` terakhir). Menyediakan `FILM_INIT()`, `FILM.frame(t)` (render detik ke-t lengkap dengan overlay) dan `FILM.look([cx,cy,cz],[tx,ty,tz])` (cek sudut kamera).
- `build.py` : membuat /tmp/film/index.html. three.js r128 harus ada di /tmp/film (three.min.js, OrbitControls.js, GLTFLoader.js) — ambil dari GitHub mrdoob/three.js tag r128 (sparse checkout folder build/ dan examples/js/).
- `drive.js` : Chrome headless + DevTools Protocol. `node drive.js still 2,8,12` (cuplikan), `node drive.js look "[x,y,z],[x,y,z]"`, `node drive.js render 0 1818` (pipa JPEG ke ffmpeg -> part_0.mp4).
- Server: `cd /tmp/film && python3 -m http.server 8765`.
- Gabung suara: `ffmpeg -i part_0.mp4 -i suara-day5.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -shortest DAY5.mp4`.

## Catatan koordinat
Kelompok Pelabuhan (KG) bergeser +18 di sumbu x (KX=18): koordinat dunia = lokal + 18.
Pelabuhan baru (17 Nov 07:30): Ferry asli `FERRY` di lokal (-142,0,-42) dan `FERRY2` di (-142,0,26), dermaga jari + koridor kaca, terminal menghadap timur.
`film.js` saat ini masih membuat kapal feri sendiri (kode lama) di dekat x -124 — GANTI adegan kapal agar memakai `FERRY` asli (gerakkan dari laut barat ke posisinya, warga turun lewat dermaga jari, Presiden + ayam menyambut di dermaga).

## Versi 2 (16 Nov 2026) — audio baru
Suara: `Day_6.mp3` (56,0 dtk, narasi utama) lalu `Day_5_2.mp3` (10,9 dtk, ajakan penutup) digabung jadi `suara-day5-v2.mp3` (±67 dtk).
`film.js` sudah diperbarui ke linimasa v2 (waktu diambil dari jeda di audio):

| Detik | Adegan |
|---|---|
| 0–9,4 | Kapal datang ("Lihat! … Warga Baru Nusawara telah tiba!") |
| 9,4–13,0 | Sambutan Presiden + confetti ("Selamat datang di Republik Nusawara!") |
| 13,0–17,7 | HARI KE-5, papan penduduk naik ke 300 |
| 17,7–21,3 | 4 bangunan + 1 fasilitas (5 potongan cepat) |
| 21,3–26,9 | Mall: kartu voting -> timelapse -> RESMI BERDIRI |
| 26,9–34,9 | Stadion: komentar @f4jr1_aj487 -> timelapse -> billboard layar besar + ajakan daftar pemain & pelatih |
| 34,9–40,3 | Toko Kamera: komentar @kindomcream -> timelapse |
| 40,3–44,9 | Bengkel Kaca @iruzz -> timelapse -> geser ke Toko Kamera |
| 44,9–51,4 | Pelabuhan diperbesar: timelapse -> RESMI DIBUKA |
| 51,4–56,0 | Kota dari udara ("Kota ini milik kita semua!") |
| 56,0–67,0 | Presiden di podium: FOLLOW, DAFTAR (link di bio), KOMEN Day 6, "Sampai jumpa di Day 6!" |

Render paralel: `PORT=9333 node drive.js render 0 1005` dan `PORT=9334 node drive.js render 1005 2010`, lalu gabung `part_0.mp4` + `part_1005.mp4` dan suara.

## Linimasa v1 (suara-day5.mp3, lama)
| Detik | Adegan | Kalimat |
|---|---|---|
| 0–5,5 | Kapal Ferry besar datang | "Lihat itu... kapal BESAR datang! Siapa saja... yang ada di dalamnya?!" |
| 5,5–10,05 | Warga baru turun, disambut Presiden + ayam, confetti ±7,7 dtk | "Selamat datang... di rumah baru kalian... REPUBLIK NUSAWARA!" |
| 10,05–14,1 | Papan Jumlah Penduduk berputar ke 300, kembang api ±13 dtk | "Hari ini... kita resmi punya... TIGA RATUS warga!" |
| 14,1–18,0 | 4 potongan cepat bangunan (gelap + tanda tanya) | "Dan untuk menyambut kalian... EMPAT bangunan berdiri SEKALIGUS!" |
| 18,0–25,85 | Mall: kartu hasil voting (img/poll.jpg) s/d 20,6 -> timelapse s/d 24,3 -> "RESMI BERDIRI" | "Pertama! Kalian memilih lewat voting... Mall Republik Nusawara... RESMI BERDIRI!" |
| 25,85–34,1 | Stadion: komentar @f4jr1_aj487 (img/fajri.jpg) s/d 29,6 -> timelapse s/d 32,6 | "Kedua! Usulan dari f4jr1... STADION SEPAK BOLA! Tiga tim... siap bertanding!" |
| 34,1–44,0 | Toko Kamera: komentar @kindomcream (img/kindom.jpg) s/d 36,5 -> timelapse s/d 40,3 -> zoom billboard | "Ketiga! Usulan kindomcream... Toko Kamera... studio kreatif!" |
| 44,0–50,15 | Bengkel Kaca: desain @iruzz (img/iruzz.jpg) s/d 46,6 -> timelapse s/d 48,9 -> geser ke Toko Kamera | "Dan keempat... bengkel milik iruzz... di sebelah Toko Kamera!" |
| 50,15–55,4 | Kamera naik melihat kota dari udara | "Rakyat Nusawara... Kota ini milik KITA semua!" |
| 55,4–60,6 | Presiden + ayam di podium, CTA "DAY 6 BANGUN APA?", "Klik link untuk DAFTAR", "Komen usulanmu" | "Ajak teman-temanmu!... Klik link di bawah untuk mendaftar... mau dibangun APA LAGI di hari ke-6?" |

## Aturan
- Setiap bangunan WAJIB menampilkan gambar usulan / hasil voting sebelum timelapse.
- Setiap bangunan yang dibangun WAJIB ada timelapse (naik bertahap dari tanah kosong).
- Hook kuat di detik pertama, caption besar kuning/putih bergaris navy, badge "DAY 5" kiri atas.
- Cek beberapa cuplikan (still) dulu sebelum render penuh; render penuh cukup sekali.
