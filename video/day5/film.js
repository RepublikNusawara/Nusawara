
// ===================== FILM DAY 5 v2 (audio Day_6.mp3 + Day_5_2.mp3, ±67 dtk; hanya untuk perekaman) =====================
window.FILM_INIT = function(){
if (!houseGroups['BKT-MAWAR-002']) return false;
const V3 = (x,y,z)=>new THREE.Vector3(x,y,z);
const cl = (v,a,b)=>Math.max(a,Math.min(b,v));
const sm = (a,b,t)=>{ const k = cl((t-a)/(b-a),0,1); return k*k*(3-2*k); };
const lerp = (a,b,k)=>a+(b-a)*k;
const lv = (A,B,k)=>V3(lerp(A.x,B.x,k),lerp(A.y,B.y,k),lerp(A.z,B.z,k));
camera.fov = 58; camera.aspect = 1080/1920; camera.updateProjectionMatrix();
renderer.setPixelRatio(1); renderer.setSize(1080,1920);
controls.enabled = false;

// ---------- cari bangunan ----------
function findG(fn){ let r=null; scene.traverse(o=>{ if(!r && o.userData && fn(o.userData)) r=o; }); return r; }
const BLD = {
  mall: findG(u=>u.data && u.data.id==='MALL-NUSAWARA'),
  stad: findG(u=>u.type==='stadion'),
  kam:  findG(u=>u.data && u.data.id==='KAMERA-NUSAWARA'),
  bkl:  (typeof houseGroups!=='undefined' && houseGroups['BKT-MAWAR-002']) || findG(u=>u.data && u.data.id==='BKT-MAWAR-002'),
  pel:  findG(u=>u.data && u.data.id==='PELABUHAN-NUSAWARA'),
};
const INFO = {};
Object.keys(BLD).forEach(k=>{
  const g = BLD[k]; if (!g){ console.warn('FILM: tidak ketemu',k); return; }
  g.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(g), c = box.getCenter(V3()), s = box.getSize(V3());
  const items = []; let i = 0;
  g.traverse(o=>{ if ((o.isMesh || o.isSprite) && o !== g){
    const b = new THREE.Box3().setFromObject(o); const y0 = isFinite(b.min.y) ? b.min.y : box.min.y;
    items.push({o, sc:o.scale.clone(), th: cl((y0-box.min.y)/Math.max(1,s.y),0,1)*.86 + ((i++*37)%11)/11*.08}); } });
  INFO[k] = {g, box, c, s, items};
});
function progress(k,p){ const I = INFO[k]; if (!I) return;
  I.items.forEach(it=>{ const d = p - it.th; const vis = p >= 1 || d >= 0; it.o.visible = vis;
    if (vis){ const q = p>=1 ? 1 : cl(d/.06,0,1), e = 1 - Math.pow(1-q,3); it.o.scale.set(it.sc.x*(.3+.7*e), it.sc.y*e+1e-3, it.sc.z*(.3+.7*e)); } }); }

// ---------- kapal feri besar + rombongan warga ----------
const ferry = new THREE.Group(); scene.add(ferry);
(function(){ const g = ferry, b = (w,h,d,c,x,y,z)=>box(w,h,d,c,x,y,z,g);
  b(9,3.2,40,0xffffff,0,1.6,0); b(9.1,1.0,40.1,0xc8102e,0,.5,0); b(9.15,.25,40.15,0xf2b134,0,1.1,0);
  const bow = new THREE.Mesh(new THREE.ConeGeometry(6.4,9,4), M(0xffffff)); bow.rotation.x = Math.PI/2; bow.rotation.y = Math.PI/4; bow.scale.set(1,1,.5); bow.position.set(0,1.6,24.4); g.add(bow);
  b(8.6,.2,38,0xd9dde3,0,3.3,0);                                     // dek terbuka
  b(8,3.0,18,0xf7f7f4,0,4.9,-8); for (let i=0;i<8;i++){ b(.1,1.1,1.6,0x2e3d4f,4.02,5.1,-16+i*2.2); b(.1,1.1,1.6,0x2e3d4f,-4.02,5.1,-16+i*2.2); }
  b(7,2.6,10,0xffffff,0,7.7,-10); b(7.1,.8,10.1,0x1f3a5f,0,8.4,-10); b(1.8,3.4,1.8,0xc8102e,0,10.6,-13); b(1.9,.5,1.9,0x1f3a5f,0,12.4,-13);
  b(.15,4,.15,0xdddddd,0,11.3,-6); const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.7), capFlagMat); fl.position.set(1.35,12.4,-6); g.add(fl);
  for (let x=-4;x<=4;x+=8) for (let z=-18;z<=18;z+=1.5) b(.06,.8,.06,0xdde3ea,x,3.8,z); b(.08,.08,38,0xdde3ea,4,4.2,0); b(.08,.08,38,0xdde3ea,-4,4.2,0);
  const t = canvasTex(1024,128,(c,w,h)=>{ c.fillStyle='#fff'; c.fillRect(0,0,w,h); c.fillStyle='#1f3a5f'; c.font='900 84px Poppins, sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('FERI NUSAWARA',w/2,h/2+4); });
  [-1,1].forEach(s=>{ const p = new THREE.Mesh(new THREE.PlaneGeometry(22,2.75), new THREE.MeshBasicMaterial({map:t})); p.position.set(s*4.62,2.15,2); p.rotation.y = s*Math.PI/2; g.add(p); });
  ferry.rotation.y = Math.PI/2;           // haluan ke timur (+x)
})();
const ramp = box(16,.35,3.6,0x8a8f98,-115.5,1.9,-18); ramp.visible = false;
const BOW_END = -124, FERRY_X1 = BOW_END - 28.9, FERRY_X0 = -330, FZ = -18;
const NAMES = ['ayu','bima','citra','dimas','eka','fajar','gita','hadi','intan','joko','kirana','lutfi','maya','nanda','oki','putri','rizky','sinta','tegar','umar'];
const crowd = NAMES.map((n,i)=>{ const av = makeAvatar(avatarSpec0({username:'warga_'+n})), a = av.g; scene.add(a); return {a, av, i, col:i%4, row:Math.floor(i/4)}; });
{ const hb = new THREE.Box3().setFromObject(crowd[0].a); const h = hb.getSize(V3()).y; const pb = new THREE.Box3().setFromObject(pres).getSize(V3()).y; const s = (pb*.82)/Math.max(.01,h); crowd.forEach(c=>c.a.scale.multiplyScalar(s)); }
const PRES0 = pres.position.clone(), PRESR = pres.rotation.y, CH0 = chick.position.clone(), CHR = chick.rotation.y;
// FERRY asli (lokal KG (-142,0,-42), dunia x -124, haluan ke selatan) dipakai untuk adegan kapal datang
const RF_X = -124, RF_Z = -42, RF_LZ0 = -42 - 170, DECK_Y = 7.1, EXIT_Z = -30.8, PIER_END = -90.5, PX = -82.5, PZ = -31.5;   // jalur turun: tangga -> dermaga jari (z -30.8) -> apron Gate 2 tempat Presiden menyambut
const gang = new THREE.Group(); scene.add(gang); { const L = Math.hypot(6.6, DECK_Y-1.3), m = box(L,.3,2.4,0x8a8f98,0,0,0,gang); m.rotation.z = -Math.atan2(DECK_Y-1.3, 6.6); [-1,1].forEach(s=>{ const r = box(L,.08,.08,0xdde3ea,0,1,s*1.15,gang); r.rotation.z = m.rotation.z; }); gang.position.set(RF_X+6+3.3, (DECK_Y+1.3)/2, EXIT_Z); gang.visible = false; }
function crowdAt(t, fz){
  crowd.forEach(c=>{ const a = c.a; const deckX = RF_X + 1.6 - c.col*1.4, deckZ = fz + 4 + c.row*2.4;
    const leave = 6.0 + c.i*.16;                                   // mulai turun
    if (t < leave){ a.position.set(deckX, DECK_Y, deckZ); a.rotation.y = Math.PI/2; return; }
    const lz = EXIT_Z+(c.col-1.5)*.4;
    const path = [V3(deckX,DECK_Y,deckZ), V3(RF_X+5.4,DECK_Y,lz), V3(RF_X+12.9,1.3,lz), V3(PIER_END,1.3,lz), V3(PX - 4.5 - c.row*1.4, 1.3, PZ - 2.4 + c.col*1.6)];
    const L = [0]; for (let i=1;i<path.length;i++) L.push(L[i-1] + path[i].distanceTo(path[i-1])); const N = path.length-1;
    let d = (t-leave)*10.5; if (d >= L[N]){ a.position.copy(path[N]); a.rotation.y = Math.PI/2; return; }
    let k = 1; while (L[k] < d) k++; const f = (d-L[k-1])/(L[k]-L[k-1]); a.position.copy(lv(path[k-1],path[k],f)); a.position.y += Math.abs(Math.sin(d*2.2))*.18;
    const dir = V3().subVectors(path[k],path[k-1]); a.rotation.y = Math.atan2(dir.x,dir.z);
    const sw = Math.sin(d*2.2)*.6; if (c.av.legL) c.av.legL.rotation.x = sw; if (c.av.legR) c.av.legR.rotation.x = -sw; if (c.av.armL) c.av.armL.rotation.x = -sw; if (c.av.armR) c.av.armR.rotation.x = sw; });
}
window.FILM_CROWD = ()=>crowd.map(c=>c.a.position.toArray().map(v=>+v.toFixed(1)));
function crowdHide(v){ crowd.forEach(c=>c.a.visible = v); }

// ---------- papan penduduk ----------
let cntW = V3(); cntBoard.updateMatrixWorld(true); cntBoard.getWorldPosition(cntW); let lastN = -1;
function setCount(n){ if (n === lastN) return; lastN = n; cntFront.map = counterTex(n); cntFront.needsUpdate = true; }

// ---------- overlay 2D ----------
const ov = document.createElement('canvas'); ov.width = 1080; ov.height = 1920; ov.id = 'filmOv';
ov.style.cssText = 'position:fixed;left:0;top:0;width:1080px;height:1920px;z-index:99999;pointer-events:none'; document.body.appendChild(ov);
const cx = ov.getContext('2d');
const IMG = {}; ['poll','fajri','kindom','iruzz'].forEach(k=>{ const im = new Image(); im.src = 'img/'+k+'.jpg'; IMG[k] = im; });
const FONT2 = 'Poppins, "Noto Color Emoji", sans-serif';
function rr(x,y,w,h,r){ cx.beginPath(); cx.moveTo(x+r,y); cx.arcTo(x+w,y,x+w,y+h,r); cx.arcTo(x+w,y+h,x,y+h,r); cx.arcTo(x,y+h,x,y,r); cx.arcTo(x,y,x+w,y,r); cx.closePath(); }
function fit(txt, max, size, weight){ let s = size; do { cx.font = `${weight||900} ${s}px ${FONT2}`; s -= 2; } while (cx.measureText(txt).width > max && s > 20); return s+2; }
// teks judul besar bergaya pill kuning + garis navy
function headline(lines, y, a, pop){ if (a <= 0) return; cx.save(); cx.globalAlpha = a; const sc = 1 + .25*(1-pop);
  cx.translate(540,y); cx.scale(sc,sc); let yy = 0;
  lines.forEach(([txt,col,size])=>{ const s = fit(txt, 960, size); cx.textAlign='center'; cx.textBaseline='middle'; cx.lineJoin='round';
    cx.lineWidth = s*.22; cx.strokeStyle = '#13233b'; cx.strokeText(txt,0,yy); cx.fillStyle = col; cx.fillText(txt,0,yy); yy += s*1.12; });
  cx.restore(); }
function pill(txt, y, bg, fg, a, size){ if (a <= 0) return; cx.save(); cx.globalAlpha = a; const s = fit(txt, 900, size||46, 800);
  const w = cx.measureText(txt).width + 70, h = s*1.6; rr(540-w/2,y-h/2,w,h,h/2); cx.fillStyle = bg; cx.fill(); cx.lineWidth = 6; cx.strokeStyle = '#13233b'; cx.stroke();
  cx.fillStyle = fg; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(txt,540,y+2); cx.restore(); }
function dayBadge(){ cx.save(); rr(40,60,230,86,22); cx.fillStyle='#c8102e'; cx.fill(); cx.lineWidth=6; cx.strokeStyle='#fff'; cx.stroke();
  cx.fillStyle='#fff'; cx.font=`900 58px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('DAY 5',155,106); cx.restore();
  cx.save(); cx.font=`700 30px ${FONT2}`; cx.fillStyle='rgba(255,255,255,.95)'; cx.textAlign='right'; cx.lineWidth=6; cx.strokeStyle='rgba(19,35,59,.8)'; cx.strokeText('@republiknusawara',1040,108); cx.fillText('@republiknusawara',1040,108); cx.restore(); }
// kartu gambar usulan / hasil voting
function card(kind, key, who, a, t0, t){ if (a <= 0) return; const im = IMG[key]; if (!im || !im.complete) return;
  const pop = 1 - Math.pow(1 - cl((t-t0)/.35,0,1),3); cx.save(); cx.globalAlpha = a; cx.fillStyle = 'rgba(8,14,26,.55)'; cx.fillRect(0,0,1080,1920);
  const W = 960, ih = W * im.height / im.width, H = ih + 230, x = 60, y = 960 - H/2 - 40;
  cx.translate(540, 960); cx.scale(.7+.3*pop, .7+.3*pop); cx.rotate((1-pop)*-.08); cx.translate(-540,-960);
  rr(x-14,y-14,W+28,H+28,44); cx.fillStyle='#f2b134'; cx.fill(); rr(x,y,W,H,34); cx.fillStyle='#13233b'; cx.fill();
  cx.fillStyle = kind==='vote' ? '#2fb5a8' : '#c8102e'; rr(x+30,y+28,W-60,96,48); cx.fill();
  cx.fillStyle='#fff'; cx.textAlign='center'; cx.textBaseline='middle'; const head = kind==='vote' ? '🗳️ HASIL VOTING WARGA' : kind==='desain' ? '📐 DESAIN DARI PEMENANG UNDIAN' : '💡 USULAN WARGA';
  fit(head, W-100, 50, 900); cx.fillText(head,540,y+78);
  cx.save(); rr(x+30,y+150,W-60,ih*(W-60)/W,20); cx.clip(); cx.drawImage(im,x+30,y+150,W-60,ih*(W-60)/W); cx.restore();
  cx.fillStyle='#ffd21f'; fit(who, W-80, 50, 900); cx.fillText(who,540,y+150+ih*(W-60)/W+50); cx.restore(); }
// confetti deterministik
function confetti(t0, t, n, power){ const dt = t - t0; if (dt < 0 || dt > 3.4) return; const C = ['#c8102e','#f2b134','#ffffff','#2fb5a8','#4aa3ea','#ff6fa8','#7ed957'];
  for (let i=0;i<n;i++){ const s = Math.sin(i*12.9898)*43758.5453, r = s - Math.floor(s), r2 = (Math.sin(i*78.233)*12345.678)%1, side = i%2 ? 1 : -1;
    const vx = side*(-(160+r*520)*power), vy = -(900+Math.abs(r2)*900)*power, x0 = side>0 ? 1080 : 0;
    const x = x0 + vx*dt + Math.sin(dt*6+i)*30, y = 1500 + vy*dt + 900*dt*dt; if (y > 1980) continue;
    cx.save(); cx.globalAlpha = cl(3.4-dt,0,1); cx.translate(x,y); cx.rotate(dt*(6+r*8)+i); cx.fillStyle = C[i%C.length]; cx.fillRect(-11,-6*Math.abs(Math.cos(dt*9+i)),22,12*Math.abs(Math.cos(dt*9+i))+2); cx.restore(); } }
function firework(t0, t, x, y, col){ const dt = t - t0; if (dt < 0 || dt > 1.6) return; cx.save(); cx.globalAlpha = cl(1.6-dt,0,1); cx.fillStyle = col;
  for (let i=0;i<40;i++){ const a = i/40*Math.PI*2, r = 260*(1-Math.pow(1-cl(dt/1.1,0,1),3)); cx.beginPath(); cx.arc(x+Math.cos(a)*r, y+Math.sin(a)*r + dt*dt*60, 9*(1-dt/1.6)+2, 0, 7); cx.fill(); } cx.restore(); }
function flash(t0,t){ const a = 1 - cl((t-t0)/.35,0,1); if (t < t0 || a <= 0) return; cx.fillStyle = `rgba(255,255,255,${a*.85})`; cx.fillRect(0,0,1080,1920); }
function tlBadge(a, p){ if (a <= 0) return; cx.save(); cx.globalAlpha = a; rr(300,1560,480,92,46); cx.fillStyle='rgba(19,35,59,.88)'; cx.fill();
  cx.fillStyle='#ffd21f'; cx.font=`900 46px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('⏩ TIMELAPSE',540,1590);
  rr(340,1626,400,12,6); cx.fillStyle='rgba(255,255,255,.25)'; cx.fill(); rr(340,1626,400*p,12,6); cx.fillStyle='#ffd21f'; cx.fill(); cx.restore(); }
function stamp(t0,t){ const d = t - t0; if (d < 0) return; const k = 1 - Math.pow(1-cl(d/.3,0,1),3), a = cl(2.2-d,0,1); if (a<=0) return; cx.save(); cx.globalAlpha = a; cx.translate(540,1250); cx.rotate(-.12); cx.scale(2.2-1.2*k, 2.2-1.2*k);
  rr(-330,-70,660,140,24); cx.fillStyle='rgba(47,181,90,.95)'; cx.fill(); cx.lineWidth=10; cx.strokeStyle='#fff'; cx.stroke(); cx.fillStyle='#fff'; cx.font=`900 74px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('✅ RESMI BERDIRI!',0,6); cx.restore(); }

// ---------- kamera ----------
function shot(C,T){ camera.position.copy(C); camera.lookAt(T); }
function orbit(I, ang, distK, hK, tY){ const r = Math.max(I.s.x, I.s.z)*distK + 10; return [V3(I.c.x + Math.sin(ang)*r, I.box.min.y + I.s.y*hK + 6, I.c.z + Math.cos(ang)*r), V3(I.c.x, I.box.min.y + I.s.y*(tY==null?.35:tY), I.c.z)]; }

// ---------- LINIMASA v2 (sesuai jeda di audio Day_6.mp3 + Day_5_2.mp3) ----------
// 0–9.4 kapal | 9.4–13.0 sambutan | 13.0–17.7 hari ke-5, 300 warga | 17.7–21.3 4 bangunan + 1 fasilitas
// 21.3 Mall | 26.9 Stadion | 34.9 Toko Kamera | 40.3 Bengkel | 44.9 Pelabuhan | 51.4 kota | 56.03–66.95 ajakan
const E_SAMBUT = 9.4, E_HARI = 13.0, E_4B = 17.7, E_SEG = 21.3, E_PEL = 44.9, E_KOTA = 51.4, E_CTA = 56.03, E_END = 66.95;
// segmen pembangunan: [kunci, mulai, gambar sampai, timelapse sampai, selesai]
const SEG = [['mall',21.3,23.9,25.9,26.9],['stad',26.9,29.0,30.6,34.9],['kam',34.9,37.0,39.2,40.3],['bkl',40.3,41.9,43.6,44.9]];
const PEL = {t0:44.9, tl0:45.8, tl1:50.0, stamp:50.26, t1:51.4};
const CARD = {mall:['vote','poll','Bangun Mall — 56% suara'], stad:['usul','fajri','Usulan @f4jr1_aj487'], kam:['usul','kindom','Usulan @kindomcream'], bkl:['desain','iruzz','Milik @iruzz']};
const TITLE = {mall:[['#1 MALL MODERN','#ffd21f',96],['Pilihan Voting Warga','#ffffff',54]], stad:[['#2 STADION BOLA','#ffd21f',96],['Usulan @f4jr1_aj487','#ffffff',54]], kam:[['#3 TOKO KAMERA','#ffd21f',96],['Usulan @kindomcream','#ffffff',54]], bkl:[['#4 BENGKEL KACA','#ffd21f',96],['Milik @iruzz','#ffffff',54]]};
const ANG = {mall:.35, stad:.5, kam:-.35, bkl:.4, pel:-.6};
// waktu kapal/warga: adegan lama 0–5.5 & 5.5–10.05 diregangkan ke 0–9.4 & 9.4–13.0
const tf = t => t < E_SAMBUT ? t*5.5/E_SAMBUT : t < E_HARI ? 5.5 + (t-E_SAMBUT)*4.55/(E_HARI-E_SAMBUT) : 10.05 + (t-E_HARI);
const STAD_SCR = (()=>{ const I = INFO.stad; return I ? {x:I.c.x, z:I.box.max.z} : null; })();

window.FILM = { info: Object.fromEntries(Object.keys(INFO).map(k=>[k,{c:INFO[k].c.toArray(), s:INFO[k].s.toArray()}])), dur:E_END, frame(t){
  const dt = 1/30, u0 = tf(t);
  try { kotaTick(dt, t); } catch(e){}
  // bendera
  const pa = flagGeo.attributes.position.array; for (let i=0;i<pa.length;i+=3){ const x = flagBase[i] + 2.25; pa[i+2] = Math.sin(x*1.6 - t*4)*.18*(x/4.5); } flagGeo.attributes.position.needsUpdate = true;
  // status bangunan
  Object.keys(INFO).forEach(k=>{ let p = 0;
    if (k === 'pel'){ p = t < E_SEG ? 1 : t < PEL.tl0 ? 0 : t < PEL.tl1 ? sm(PEL.tl0,PEL.tl1,t) : 1; }
    else { const S = SEG.find(s=>s[0]===k); p = t < E_4B ? 0 : t < E_SEG ? 1 : t < S[2] ? 0 : t < S[3] ? sm(S[2],S[3],t) : 1; }
    progress(k, p); });
  // kapal (waktu diregangkan)
  // kapal: FERRY asli datang dari utara ke dermaganya (waktu diregangkan); ferry lama film tidak dipakai
  const fk = 1 - Math.pow(1 - cl(u0/5.6,0,1), 2.4), fzL = t < E_HARI ? lerp(RF_LZ0, RF_Z, fk) : RF_Z, fz = fzL;
  ferry.visible = false; ramp.visible = false;
  try { FERRY.visible = true; FERRY.position.z = fzL; FERRY.position.y = t < E_HARI ? Math.sin(t*1.3)*.1 : FERRY.position.y; FERRY2.visible = t >= E_HARI; } catch(e){}
  gang.visible = u0 > 5.6 && t < E_HARI;
  crowdHide(t < E_HARI); if (t < E_HARI) crowdAt(u0, fz);
  // presiden & ayam
  if (t < E_HARI){ pres.position.set(PX, 1.3, PZ); pres.rotation.y = -Math.PI/2; chick.position.set(PX - .3, 1.3, PZ + 2.2); chick.rotation.y = -Math.PI/2 + Math.sin(t*3)*.3; chick.position.y = 1.3 + Math.abs(Math.sin(t*7))*.15*(t>10.9&&t<12.8?1:0); }
  else { pres.position.copy(PRES0); pres.rotation.y = PRESR; chick.position.copy(CH0); chick.rotation.y = CHR; chick.position.y = CH0.y + (t > E_CTA ? Math.abs(Math.sin(t*6))*.12 : 0); }
  // penduduk
  const nWarga = t < 14.4 ? 278 : Math.round(lerp(278,300, sm(14.4,15.95,t)));
  setCount(nWarga);
  // ---- kamera per adegan ----
  let C, T;
  if (t < E_SAMBUT){ const k = sm(0,E_SAMBUT,t); C = V3(lerp(-150,-156,k), lerp(13,15,k), lerp(-4,8,k)); T = V3(lerp(RF_X,RF_X+8,k), 6, lerp(fz+20, fz, k)); }
  else if (t < E_HARI){ const k = sm(E_SAMBUT,E_HARI,t); const ctr = V3(); crowd.forEach(c=>ctr.add(c.a.position)); ctr.multiplyScalar(1/crowd.length); const tx = Math.max(-114, Math.min(-83, lerp(ctr.x, -83, sm(12.0,12.9,t)))); C = V3(tx + 5, lerp(8,7,k), -18.5); T = V3(tx - 1, 2.2, -31.2); }
  else if (t < E_4B){ const k = sm(E_HARI,E_4B,t); C = V3(cntW.x + lerp(5,1.5,k), cntW.y + lerp(-2.5,-1,k), cntW.z + lerp(30,15,k)); T = V3(cntW.x, cntW.y - lerp(3.5,1.6,k), cntW.z); }
  else if (t < E_SEG){ const keys = ['mall','stad','kam','bkl','pel'], L = (E_SEG-E_4B)/5, i = cl(Math.floor((t-E_4B)/L),0,4), I = INFO[keys[i]], k = (t-E_4B-i*L)/L; [C,T] = orbit(I, ANG[keys[i]] + .25 - k*.5, keys[i]==='pel' ? .75 : 1.15, .7); }
  else if (t < E_PEL){ const S = SEG.find(s=>t>=s[1] && t<s[4]) || SEG[3], k = S[0], I = INFO[k], u = (t - S[1])/(S[4]-S[1]);
    if (k === 'stad' && t > S[3]){ const q = sm(S[3],S[4],t); C = V3(STAD_SCR.x + lerp(-10,0,q), lerp(16,12,q), STAD_SCR.z + lerp(40,26,q)); T = V3(STAD_SCR.x, lerp(8,10,q), STAD_SCR.z - 8); }   // billboard layar besar
    else if (k === 'kam' && t > S[3]){ const q = sm(S[3],S[4],t); C = V3(I.c.x + lerp(14,4,q), lerp(12,15,q), I.box.max.z + lerp(30,18,q)); T = V3(I.c.x, lerp(9,13.5,q), I.box.max.z - 6); }
    else if (k === 'bkl' && t > S[3]){ const q = sm(S[3],S[4],t), K = INFO.kam; const m = lv(I.c, K.c, .5); C = V3(lerp(I.c.x+12, m.x+8, q), lerp(16,28,q), Math.max(I.box.max.z,K.box.max.z) + lerp(34,56,q)); T = V3(lerp(I.c.x,m.x,q), 6, lerp(I.c.z,m.z,q)); }
    else [C,T] = orbit(I, ANG[k] - u*.9, k==='stad' ? .95 : 1.15, k==='stad' ? 1.6 : .75); }
  else if (t < E_KOTA){ const I = INFO.pel, u = (t-PEL.t0)/(PEL.t1-PEL.t0); [C,T] = orbit(I, ANG.pel - u*.8, .8, .9); }
  else if (t < E_CTA){ const k = sm(E_KOTA,E_CTA,t); C = V3(lerp(40,120,k), lerp(30,150,k), lerp(90,230,k)); T = V3(lerp(14,60,k), 0, lerp(-6,-90,k)); }
  else { const k = sm(E_CTA,E_END,t); C = V3(PRES0.x + lerp(-1.5,1.5,k), PRES0.y + lerp(3.4,2.6,k), PRES0.z + lerp(14,8.5,k)); T = V3(PRES0.x+.6, PRES0.y + 1.9, PRES0.z); }
  shot(C,T);
  renderer.render(scene, camera);
  // ---- overlay ----
  cx.clearRect(0,0,1080,1920);
  const vig = cx.createLinearGradient(0,0,0,1920); vig.addColorStop(0,'rgba(0,0,0,.35)'); vig.addColorStop(.18,'rgba(0,0,0,0)'); vig.addColorStop(.78,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.4)'); cx.fillStyle = vig; cx.fillRect(0,0,1080,1920);
  dayBadge();
  const pop = a=>cl((t-a)/.25,0,1);
  if (t < E_SAMBUT){ headline([['LIHAT!','#ffd21f',150],['KAPAL BESAR DATANG!','#ffffff',96]], 360, sm(0,.15,t)*(1-sm(E_SAMBUT-.3,E_SAMBUT,t)), pop(0)); flash(0,t);
    pill('🚢 Bawa apa kapal ini?', 1660, '#ffd21f', '#13233b', sm(3.7,4.0,t)*(1-sm(5.4,5.6,t)), 52);
    pill('🎉 Warga Baru Nusawara tiba!', 1660, '#ffffff', '#13233b', sm(7.0,7.3,t)*(1-sm(E_SAMBUT-.3,E_SAMBUT,t)), 52); }
  else if (t < E_HARI){ headline([['SELAMAT DATANG','#ffffff',104],['DI NUSAWARA!','#ffd21f',120]], 360, sm(E_SAMBUT,E_SAMBUT+.3,t)*(1-sm(E_HARI-.25,E_HARI,t)), pop(E_SAMBUT)); confetti(10.95, t, 260, 1.15); flash(10.95,t); pill('Disambut langsung Bapak Presiden', 1660, '#ffffff', '#13233b', sm(9.7,10,t)*(1-sm(E_HARI-.25,E_HARI,t)), 46); }
  else if (t < E_4B){ const n = nWarga;
    const a = sm(E_HARI,E_HARI+.25,t)*(1-sm(E_4B-.2,E_4B,t)), big = t > 15.95 ? 1 + .18*Math.max(0,1-(t-15.95)/.4) : 1;
    cx.save(); cx.globalAlpha = a; rr(140,1260,800,330,40); cx.fillStyle='rgba(31,58,95,.95)'; cx.fill(); cx.lineWidth=12; cx.strokeStyle='#f2b134'; cx.stroke();
    cx.fillStyle='#fff'; cx.font=`900 52px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('JUMLAH PENDUDUK',540,1330);
    cx.translate(540,1470); cx.scale(big,big); cx.fillStyle='#ffd21f'; cx.font=`900 170px ${FONT2}`; cx.fillText(String(n),0,0); cx.restore();
    if (t > 15.95){ headline([['🔥 300 WARGA','#ffd21f',120],['RESMI!','#ffffff',110]], 380, sm(15.95,16.15,t)*(1-sm(E_4B-.2,E_4B,t)), pop(15.95)); firework(15.95,t,250,700,'#ffd21f'); firework(16.2,t,830,620,'#ff6fa8'); firework(16.45,t,540,520,'#7ed957'); confetti(15.95,t,140,.9); flash(15.95,t); }
    else headline([['HARI KE-5','#ffd21f',130],['NUSAWARA','#ffffff',96]], 380, a, pop(E_HARI)); }
  else if (t < E_SEG){ cx.fillStyle='rgba(5,10,20,.55)'; cx.fillRect(0,0,1080,1920); const L = (E_SEG-E_4B)/5, i = cl(Math.floor((t-E_4B)/L),0,4); flash(E_4B+i*L, t);
    headline(t < 19.06 ? [['4 BANGUNAN','#ffd21f',130],['BARU!','#ffffff',112]] : [['4 BANGUNAN','#ffd21f',120],['+ 1 FASILITAS','#ffffff',104]], 400, 1, pop(t < 19.06 ? E_4B : 19.06));
    cx.save(); cx.font=`900 300px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillStyle='rgba(255,255,255,.9)'; cx.lineWidth=16; cx.strokeStyle='#13233b'; cx.strokeText('?',540,1050); cx.fillText('?',540,1050); cx.restore();
    pill(i < 4 ? `${i+1} / 4` : '⚓ + 1 FASILITAS', 1660, '#c8102e', '#ffffff', 1, 56); }
  else if (t < E_PEL){ const S = SEG.find(s=>t>=s[1] && t<s[4]) || SEG[3], k = S[0], cd = CARD[k];
    headline(TITLE[k], 330, sm(S[1],S[1]+.25,t)*(1-sm(S[4]-.2,S[4],t)), pop(S[1]));
    card(cd[0], cd[1], cd[2], sm(S[1],S[1]+.2,t)*(1-sm(S[2]-.25,S[2],t)), S[1], t);
    if (t > S[2] && t < S[3]){ tlBadge(sm(S[2],S[2]+.2,t)*(1-sm(S[3]-.1,S[3],t)), sm(S[2],S[3],t)); cx.fillStyle=`rgba(255,200,80,${.08+.05*Math.sin(t*40)})`; cx.fillRect(0,0,1080,1920); }
    if (t >= S[3]){ stamp(S[3],t); confetti(S[3],t,120,.85); flash(S[3],t); }
    if (k==='stad' && t > 30.55){ pill('⚽ Daftar jadi PEMAIN & PELATIH!', 1520, '#ffd21f', '#13233b', sm(30.55,30.8,t)*(1-sm(S[4]-.2,S[4],t)), 52);
      pill('Pertandingan pertama segera dimulai!', 1660, '#ffffff', '#13233b', sm(32.5,32.8,t)*(1-sm(S[4]-.2,S[4],t)), 44); }
    if (k==='bkl' && t > S[3]) pill('Tepat di sebelah Toko Kamera!', 1660, '#ffd21f', '#13233b', sm(S[3],S[3]+.2,t)*(1-sm(S[4]-.2,S[4],t)), 48); }
  else if (t < E_KOTA){
    headline([['⚓ PELABUHAN','#ffd21f',110],['DIPERBESAR!','#ffffff',110]], 330, sm(PEL.t0,PEL.t0+.25,t)*(1-sm(PEL.t1-.2,PEL.t1,t)), pop(PEL.t0));
    pill('🚢 Warga terus berdatangan…', 1520, '#ffffff', '#13233b', sm(45.0,45.3,t)*(1-sm(PEL.tl0+.6,PEL.tl0+.9,t)), 50);
    if (t > PEL.tl0 && t < PEL.tl1){ tlBadge(sm(PEL.tl0,PEL.tl0+.2,t)*(1-sm(PEL.tl1-.1,PEL.tl1,t)), sm(PEL.tl0,PEL.tl1,t)); cx.fillStyle=`rgba(255,200,80,${.08+.05*Math.sin(t*40)})`; cx.fillRect(0,0,1080,1920); }
    if (t >= PEL.stamp){ const d = t - PEL.stamp, k = 1 - Math.pow(1-cl(d/.3,0,1),3), a = cl(PEL.t1 - t, 0, .25)*4; cx.save(); cx.globalAlpha = a; cx.translate(540,1250); cx.rotate(-.12); cx.scale(2.2-1.2*k, 2.2-1.2*k);
      rr(-330,-70,660,140,24); cx.fillStyle='rgba(200,16,46,.95)'; cx.fill(); cx.lineWidth=10; cx.strokeStyle='#fff'; cx.stroke(); cx.fillStyle='#fff'; cx.font=`900 74px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('✂️ RESMI DIBUKA!',0,6); cx.restore();
      confetti(PEL.stamp,t,160,.95); flash(PEL.stamp,t); } }
  else if (t < E_CTA){ headline([['KOTA INI MILIK','#ffffff',100],['KITA SEMUA!','#ffd21f',130]], 380, sm(E_KOTA+.1,E_KOTA+.4,t)*(1-sm(E_CTA-.2,E_CTA,t)), pop(E_KOTA+.1)); }
  else { const a = sm(E_CTA,E_CTA+.3,t);
    headline([['IKUT MEMBANGUN','#ffffff',100],['NUSAWARA!','#ffd21f',130]], 340, a*(1-sm(64.4,64.6,t)), pop(E_CTA));
    headline([['SAMPAI JUMPA','#ffffff',104],['DI DAY 6!','#ffd21f',140]], 340, sm(64.6,64.9,t), pop(64.6));
    pill('➕ FOLLOW akun ini', 1300, '#c8102e', '#ffffff', sm(57.9,58.2,t), 58);
    pill('📝 DAFTAR jadi warga · link di bio', 1450, '#ffd21f', '#13233b', sm(59.0,59.3,t), 52);
    pill('💬 KOMEN: Day 6 bangun apa?', 1600, '#ffffff', '#13233b', sm(61.1,61.4,t), 54);
    const b = 1 + .06*Math.sin(t*8); cx.save(); cx.globalAlpha = sm(62.8,63.1,t); cx.translate(540,1760); cx.scale(b,b); cx.font=`900 70px ${FONT2}`; cx.textAlign='center'; cx.fillText('👇👇👇',0,0); cx.restore();
    confetti(64.6, t, 200, 1.0); }
  return 1;
}, look(c,t){ cx.clearRect(0,0,1080,1920); camera.position.set(...c); camera.lookAt(...t); renderer.render(scene,camera); } };
return true;
};
