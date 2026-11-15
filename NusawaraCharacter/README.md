# Republik Nusawara — Aset Karakter Warga

Semua keperluan karakter warga: model dasar, katalog pakaian & aksesori, referensi, kode, dan prompt pembuatan aset.

## Isi folder
| Folder | Isi |
|---|---|
| `models/base/` | `citizen_base.glb`: karakter dasar (chibi, botak, T-pose, tinggi 2 unit, menghadap +Z, origin di kaki, 21 tulang humanoid, tulang dada `Chest`). |
| `models/shirts/` `pants/` `shoes/` | Tempat GLB baju, celana, sepatu (skinned ke skeleton dasar). Nama file = ID item. |
| `models/hair/` `hats/` `glasses/` | Tempat GLB rambut, topi, kacamata (dipasang ke tulang `Head`). |
| `models/wings/` | Sayap (tulang `Chest`). Sudah ada: `wings_honor_lv30.glb`. |
| `models/weapons/` `props/` | Senjata hiasan (`RightHand`) dan aksesori (`LeftHand`; Ransel/Kamera di `Chest`). |
| `models/outfits/` | Cadangan untuk outfit lengkap. |
| `config/catalog.json` | **Katalog resmi**: 83 item, ID, harga N$, item bawaan, preset outfit, paket. Sama dengan tabel Supabase `public.butik_item`. |
| `code/` | `nusawara-wardrobe.js` (pemasang GLB untuk nanti) dan `buat_citizen_base.py` (pembuat model dasar). |
| `reference/` | Gambar referensi karakter, pakaian, aksesori, Sayap Kehormatan, dan render 8 sudut model dasar. |
| `prompts/` | Prompt untuk membuat model dasar dan model pakaian/aksesori dengan AI 3D. |
| `docs/` | Checklist validasi aset. |
| `thumbnails/` `textures/` | Tempat gambar ikon toko dan tekstur item. |

## Status saat ini (November 2026)
- Di peta uji (`uji/index.html`) karakter dan **semua item dibuat langsung dengan kode** (bentuk sederhana), gambar ikon item di Wardrobe juga dirender otomatis di browser. GLB di folder `models/` belum dipakai, kecuali Sayap Kehormatan.
- Begitu GLB item jadi, simpan dengan nama `models/<folder>/<id>.glb` sesuai `config/catalog.json`, lalu karakter peta bisa dipindah ke `citizen_base.glb` + `code/nusawara-wardrobe.js`.

## Aturan katalog
- Bawaan gratis: Baju Warga Nusawara, **Celana Pendek (gratis)**, tanpa sepatu, botak, ekspresi Normal.
- Ekspresi lain N$100 (sementara, menunggu keputusan harga).
- Barang yang dibeli tersimpan permanen, hanya kosmetik, uangnya masuk Kas Negara.
- Harga & kepemilikan selalu divalidasi server (RPC `beli_item`, `pakai_item`, `koleksi_saya`).
- Sayap Kehormatan Nusawara: tidak dijual/ditukar, hadiah Level 30 (sistem level warga belum dibuat).
- Paket (Casual N$550, Petualang N$1.350, Premium N$2.800) belum aktif.

## Perbedaan dengan starter kit sebelumnya
- ID item mengikuti server (mis. `shirt_default`, `shorts_default`, `sneakers`), bukan `shirt_citizen_white`/`shoes_sneakers`.
- Tulang dada bernama `Chest`, bukan `Spine2`.
- Kode memakai Three.js r128 klasik (`THREE` global, tanpa `import`).
