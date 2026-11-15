/*
 * Republik Nusawara — Wardrobe untuk model GLB (Three.js r128 klasik: THREE global, tanpa import)
 * Diperbarui dari starter kit: memakai ID & kategori yang sama dengan Supabase (public.butik_item)
 * dan config/catalog.json, serta tulang dada bernama "Chest" (bukan Spine2).
 *
 * CATATAN: peta saat ini membuat karakter & semua item langsung dengan kode (lihat uji/index.html:
 * makeAvatar). File ini dipakai NANTI, saat model GLB tiap item sudah dibuat di models/<folder>/<id>.glb.
 * Kepemilikan & harga selalu divalidasi server (RPC beli_item / pakai_item); jangan memotong saldo di browser.
 */
(function () {
  'use strict';

  var TULANG = { hair: 'Head', hats: 'Head', glasses: 'Head', wings: 'Chest', weapons: 'RightHand', props: 'LeftHand' };
  var SKINNED = { clothes: true, pants: true, shoes: true };

  window.NusawaraWardrobe = function (opsi) {
    opsi = opsi || {};
    var karakter = opsi.character;            // root citizen_base.glb (berisi skeleton)
    var katalog = opsi.catalog;               // isi config/catalog.json
    var akar = opsi.assetRoot || 'NusawaraCharacter/';
    var dimiliki = opsi.owned || [];          // dari RPC koleksi_saya
    if (!karakter || !katalog) throw new Error('character dan catalog wajib diberikan.');

    var terpasang = {}, cache = {};

    function cari(id) {
      for (var k in katalog.kategori) {
        var l = katalog.kategori[k].item;
        for (var i = 0; i < l.length; i++) if (l[i].id === id) return { item: l[i], kategori: k };
      }
      return null;
    }
    function tulang(nama) {
      var t = null;
      karakter.traverse(function (o) { if (!t && o.isBone && o.name === nama) t = o; });
      return t;
    }
    function lepas(kat) {
      var o = terpasang[kat];
      if (o && o.parent) o.parent.remove(o);
      terpasang[kat] = null;
    }

    function pakai(id, cb) {
      var c = cari(id);
      if (!c) return cb && cb(new Error('Item tidak ditemukan: ' + id));
      var item = c.item, kat = c.kategori;
      if (item.eksklusif) return cb && cb(new Error('Item eksklusif, hanya diberikan server.'));
      if (item.harga > 0 && dimiliki.indexOf(id) === -1) return cb && cb(new Error('Item belum dimiliki: ' + id));
      lepas(kat);
      if (!item.file) return cb && cb(null, null);   // item bawaan: botak, tanpa topi, tanpa sepatu, dll.
      var muat = function (scene) {
        var obj = scene.clone(true);
        obj.traverse(function (n) { if (n.isMesh) { n.castShadow = true; n.frustumCulled = !n.isSkinnedMesh; } });
        if (SKINNED[kat]) {
          // GLB pakaian harus di-skin ke skeleton dengan nama tulang yang sama persis seperti citizen_base.glb.
          var sk = null; karakter.traverse(function (n) { if (!sk && n.isSkinnedMesh) sk = n.skeleton; });
          obj.traverse(function (n) { if (n.isSkinnedMesh && sk) n.bind(sk, n.bindMatrix); });
          karakter.add(obj);
        } else {
          var t = tulang(TULANG[kat]);
          if (!t) return cb && cb(new Error('Tulang ' + TULANG[kat] + ' tidak ditemukan.'));
          t.add(obj);
        }
        terpasang[kat] = obj;
        if (cb) cb(null, obj);
      };
      if (cache[item.file]) return muat(cache[item.file]);
      new THREE.GLTFLoader().load(akar + item.file, function (g) { cache[item.file] = g.scene; muat(g.scene); },
        undefined, function (e) { if (cb) cb(e); });
    }

    return {
      pakai: pakai,
      lepas: lepas,
      setDimiliki: function (ids) { dimiliki = (ids || []).slice(); },
      status: function () { var s = {}; for (var k in terpasang) s[k] = terpasang[k] ? terpasang[k].name : null; return s; }
    };
  };
})();
