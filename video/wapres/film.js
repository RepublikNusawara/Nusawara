
// ===================== FILM DICARI WAKIL PRESIDEN (hanya untuk perekaman) =====================
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
  garuda: findG(u=>u.data && u.data.id==='EKO-PRN'),
  pabrik: findG(u=>u.type==='pabrik_uang'),
  donasi: findG(u=>u.data && u.data.id==='EKO-DONASI'),
  rs:     findG(u=>u.data && u.data.id==='RS-NUSAWARA'),
  mall:   findG(u=>u.data && u.data.id==='MALL-NUSAWARA'),
  kopi:   findG(u=>u.data && u.data.id==='KOPI-NUSAWARA'),
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

const PRES0 = pres.position.clone(), PRESR = pres.rotation.y, CH0 = chick.position.clone(), CHR = chick.rotation.y;

// ---------- papan penduduk ----------
let cntW = V3(); cntBoard.updateMatrixWorld(true); cntBoard.getWorldPosition(cntW); let lastN = -1;
function setCount(n){ if (n === lastN) return; lastN = n; cntFront.map = counterTex(n); cntFront.needsUpdate = true; }

// ---------- overlay 2D ----------
const ov = document.createElement('canvas'); ov.width = 1080; ov.height = 1920; ov.id = 'filmOv';
ov.style.cssText = 'position:fixed;left:0;top:0;width:1080px;height:1920px;z-index:99999;pointer-events:none'; document.body.appendChild(ov);
const cx = ov.getContext('2d');
const IMG = {}; [].forEach(k=>{ const im = new Image(); im.src = 'img/'+k+'.jpg'; IMG[k] = im; });
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
function dayBadge(){ cx.save(); rr(40,60,300,86,22); cx.fillStyle='#c8102e'; cx.fill(); cx.lineWidth=6; cx.strokeStyle='#fff'; cx.stroke();
  cx.fillStyle='#fff'; cx.font=`900 58px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('🚨 DICARI',190,106); cx.restore();
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


// ===================== DICARI WAKIL PRESIDEN (suara-wapres.mp3, 39,7 dtk) =====================
const W7 = {hook:0, kursi:3.2, cara:7.0, pemilu:8.44, donasi:9.99, papan:11.5, senin:16.0, gaji:20.1, gaji2:21.09, pen:23.7, misteri:27.0, kamu:30.19, cta:32.0, n300:34.19, follow:37.14, end:39.71};
const ISTZ = 650, ISTL = 50, THRONE_Z = ISTZ - ISTL + 7.5;            // singgasana: Presiden x=-1.5, Wakil Presiden x=+1.5
const VP = V3(1.5, 2.2, THRONE_Z), PRT = V3(-1.5, 2.2, THRONE_Z);
try { istanaLabelWapres(); } catch(e){}
// Papan Donasi diisi data asli dari database (papan_semua, 18 Nov 02:50)
try { PAPAN = [['varezhaaa','Kingkong',5460,599],['nis_katanyaa','nis_katanyaa',5457,0],['itsme.violaw','Vio',2030,0],['_muhamadrayhann','_muhamadrayhann',1455,0],['rhnmlnibrhm_','Ehan',1250,100]].map(([username,nama,poin,nsa])=>({username,nama,poin,nsa})); donGambar(); } catch(e){}
try { kasFront.map = kasTex(19805); kasFront.needsUpdate = true; } catch(e){}
function panel(x,y,w,h,title,a,col){ if (a<=0) return; cx.save(); cx.globalAlpha = a; rr(x,y,w,h,34); cx.fillStyle='rgba(255,255,255,.97)'; cx.fill(); cx.lineWidth=8; cx.strokeStyle=col||'#13233b'; cx.stroke();
  rr(x,y,w,96,34); cx.fillStyle=col||'#13233b'; cx.fill(); cx.fillRect(x,y+60,w,36); cx.fillStyle='#fff'; cx.font=`900 46px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(title, x+w/2, y+50); cx.restore(); }
function txt(s,x,y,size,col,align,a,weight){ if (a<=0) return; cx.save(); cx.globalAlpha=a; cx.font=`${weight||800} ${size}px ${FONT2}`; cx.fillStyle=col; cx.textAlign=align||'center'; cx.textBaseline='middle'; cx.fillText(s,x,y); cx.restore(); }
function dim(a){ if (a<=0) return; cx.fillStyle=`rgba(5,10,20,${a})`; cx.fillRect(0,0,1080,1920); }
function spot(x,y,r,a){ if (a<=0) return; cx.save(); const g = cx.createRadialGradient(x,y,r*.2,x,y,r); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,`rgba(0,0,0,${.7*a})`); cx.fillStyle=g; cx.fillRect(0,0,1080,1920); cx.restore(); }
function silhouette(x,y,s,a){ if (a<=0) return; cx.save(); cx.globalAlpha=a; cx.fillStyle='rgba(20,25,40,.85)'; cx.beginPath(); cx.arc(x,y-1.15*s,.42*s,0,7); cx.fill(); rr(x-.6*s,y-.7*s,1.2*s,1.3*s,.3*s); cx.fill();
  cx.fillStyle='#ffd21f'; cx.font=`900 ${.9*s}px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('?',x,y-1.1*s); cx.restore(); }
function wanted(a, t0, t){ if (a<=0) return; const k = 1-Math.pow(1-cl((t-t0)/.35,0,1),3); cx.save(); cx.globalAlpha=a; cx.translate(540,1080); cx.rotate(-.04); cx.scale(.6+.4*k,.6+.4*k);
  rr(-330,-430,660,860,18); cx.fillStyle='#f1e2bf'; cx.fill(); cx.lineWidth=10; cx.strokeStyle='#6b4a1d'; cx.stroke();
  cx.fillStyle='#8b1a1a'; cx.font=`900 130px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('DICARI!',0,-320);
  cx.fillStyle='#3b2a12'; cx.fillRect(-230,-230,460,400); cx.restore(); silhouette(540,1150,150,a*k);
  cx.save(); cx.globalAlpha=a*k; cx.translate(540,1080); cx.rotate(-.04); cx.fillStyle='#3b2a12'; cx.font=`900 54px ${FONT2}`; cx.textAlign='center'; cx.fillText('WAKIL PRESIDEN',0,240); cx.font=`800 38px ${FONT2}`; cx.fillText('Republik Nusawara',0,300);
  cx.fillStyle='#8b1a1a'; cx.font=`900 44px ${FONT2}`; cx.fillText('GAJI N$250 / HARI',0,370); cx.restore(); }

window.FILM = { info: Object.fromEntries(Object.keys(INFO).map(k=>[k,{c:INFO[k].c.toArray(), s:INFO[k].s.toArray()}])), dur:W7.end, frame(t){
  const dt = 1/30;
  try { kotaTick(dt, t); } catch(e){}
  Object.keys(INFO).forEach(k=>progress(k,1));
  try { const pa = flagGeo.attributes.position.array; for (let i=0;i<pa.length;i+=3){ const x = flagBase[i] + 2.25; pa[i+2] = Math.sin(x*1.6 - t*4)*.18*(x/4.5); } flagGeo.attributes.position.needsUpdate = true; } catch(e){}
  setCount(300);
  const inIst = (t >= W7.kursi && t < W7.cara) || (t >= W7.misteri && t < W7.cta);
  ISTG.visible = inIst;
  if (inIst){ pres.position.set(PRT.x, 1.2, THRONE_Z + .6); pres.rotation.y = 0; chick.position.set(PRT.x - 1.7, 1.2, THRONE_Z + .9); chick.rotation.y = .3; }
  else { pres.position.copy(PRES0); pres.rotation.y = PRESR; chick.position.copy(CH0); chick.rotation.y = CHR; chick.position.y = CH0.y + (t > W7.cta || (t>21.1 && t<23.5) ? Math.abs(Math.sin(t*7))*.15 : 0); }
  // ---- kamera ----
  let C, T; const P = PRES0, DN = INFO.donasi, G = INFO.garuda;
  const presCam = (d,h,ox)=>[V3(P.x + (ox||0), P.y + h, P.z + d), V3(P.x + .4, P.y + 1.9, P.z)];
  if (t < W7.kursi){ const u = t/W7.kursi; [C,T] = G ? orbit(G, .3 - u*.4, 1.05, .55, .45) : presCam(20,8); }
  else if (t < W7.cara){ const k = sm(W7.kursi, 6.2, t); C = V3(lerp(0,1.6,k), lerp(6.5,5.6,k), lerp(ISTZ + 30, THRONE_Z + 8.5, k)); T = V3(lerp(0,1.2,k), lerp(4,2.6,k), THRONE_Z); }
  else if (t < W7.papan){ const k = sm(W7.cara,W7.papan,t); [C,T] = presCam(lerp(12,8,k), lerp(3.4,2.8,k), lerp(-2,2,k)); }
  else if (t < W7.gaji){ const u = (t-W7.papan)/(W7.gaji-W7.papan); C = V3(7 + lerp(-3,3,u), 6.2, lerp(6,3.5,u)); T = V3(7, 5.6, -9); }
  else if (t < W7.misteri){ const k = sm(W7.gaji,W7.misteri,t); [C,T] = presCam(lerp(16,10,k), lerp(6,3.5,k), lerp(-4,3,k)); }
  else if (t < W7.cta){ const k = sm(W7.misteri, W7.cta, t); C = V3(lerp(3,1.6,k), lerp(6.4,5.4,k), THRONE_Z + lerp(12,8.2,k)); T = V3(lerp(.2,1.3,k), lerp(2.8,2.6,k), THRONE_Z); }
  else { const k = sm(W7.cta,W7.end,t); [C,T] = presCam(lerp(14,8.5,k), lerp(3.4,2.6,k), lerp(-1.5,1.5,k)); }
  shot(C,T);
  renderer.render(scene, camera);
  // ---- overlay ----
  cx.clearRect(0,0,1080,1920);
  const vig = cx.createLinearGradient(0,0,0,1920); vig.addColorStop(0,'rgba(0,0,0,.35)'); vig.addColorStop(.18,'rgba(0,0,0,0)'); vig.addColorStop(.78,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.4)'); cx.fillStyle = vig; cx.fillRect(0,0,1080,1920);
  const pop = a=>cl((t-a)/.25,0,1), inout = (a,b)=>sm(a,a+.25,t)*(1-sm(b-.25,b,t));
  // proyeksi kursi Wakil Presiden ke layar (untuk spotlight / siluet)
  const vp = VP.clone().project(camera), vx = (vp.x*.5+.5)*1080, vy = (-vp.y*.5+.5)*1920;
  if (t < W7.kursi){ const blink = (Math.floor(t*4)%2===0) ? .28 : .1; cx.fillStyle=`rgba(200,16,46,${blink})`; cx.fillRect(0,0,1080,1920);
    wanted(inout(0,W7.kursi), 0, t); headline([['🚨 DICARI!','#ffd21f',120]], 300, inout(0,W7.kursi), pop(0)); flash(0,t); }
  else if (t < W7.cara){ const a = inout(W7.kursi,W7.cara); spot(vx, vy, 520, sm(5.0,5.8,t)*a);
    headline([['KURSINYA','#ffffff',110],['MASIH KOSONG…','#ffd21f',100]], 330, a*(1-sm(4.8,5.0,t)), pop(W7.kursi));
    headline([['BISA JADI','#ffffff',110],['MILIK KAMU!','#ffd21f',130]], 330, sm(4.97,5.2,t)*a, pop(4.97)); if (t > 4.97) flash(4.97,t);
    pill('🏛️ Istana Republik Nusawara', 1640, '#ffffff', '#13233b', a, 46); }
  else if (t < W7.papan){ const a = inout(W7.cara,W7.papan); dim(.45*a);
    headline([['MAU TAHU','#ffffff',110],['CARANYA?','#ffd21f',130]], 330, a*(1-sm(8.3,8.44,t)), pop(W7.cara));
    if (t > W7.pemilu){ const b = sm(W7.pemilu,W7.pemilu+.2,t)*(1-sm(W7.donasi-.15,W7.donasi,t)); txt('🗳️', 540, 1000, 300, '#000', 'center', b, 400);
      const k = cl((t-W7.pemilu-.25)/.25,0,1); if (k>0){ cx.save(); cx.globalAlpha=b; cx.strokeStyle='#e5484d'; cx.lineWidth=36; cx.lineCap='round'; cx.beginPath(); cx.moveTo(340,800); cx.lineTo(340+400*k,800+400*k); cx.stroke(); cx.beginPath(); cx.moveTo(740,800); cx.lineTo(740-400*k,800+400*k); cx.stroke(); cx.restore(); }
      headline([['BUKAN LEWAT','#ffffff',100],['PEMILU…','#ff6b6b',120]], 330, b, pop(W7.pemilu)); }
    if (t > W7.donasi){ const b = sm(W7.donasi,W7.donasi+.2,t)*a; headline([['TAPI LEWAT','#ffffff',100],['DONASI!','#ffd21f',150]], 330, b, pop(W7.donasi));
      const k = 1 + .08*Math.sin(t*10); cx.save(); cx.globalAlpha=b; cx.translate(540,1050); cx.scale(k,k); cx.beginPath(); cx.arc(0,0,190,0,7); cx.fillStyle='#f2b134'; cx.fill(); cx.lineWidth=16; cx.strokeStyle='#8f5a00'; cx.stroke(); cx.fillStyle='#8f5a00'; cx.font=`900 120px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('N$',0,8); cx.restore(); flash(W7.donasi,t); confetti(W7.donasi,t,120,.8); } }
  else if (t < W7.senin){ const a = inout(W7.papan,W7.senin);
    headline([['🤝 PAPAN','#ffd21f',110],['DONASI','#ffffff',120]], 330, a, pop(W7.papan));
    pill('📍 Sebelah barat podium Presiden', 1500, '#ffffff', '#13233b', a, 46);
    pill('💵 Uang Nusa · 🧱 Bahan', 1630, '#ffd21f', '#13233b', sm(12.6,12.9,t)*(1-sm(W7.senin-.25,W7.senin,t)), 50); }
  else if (t < W7.gaji){ const a = inout(W7.senin,W7.gaji);
    headline([['DONATUR TERBANYAK','#ffd21f',86],['= WAKIL PRESIDEN!','#ffffff',96]], 330, a, pop(W7.senin));
    const pa = sm(16.2,16.5,t)*(1-sm(W7.gaji-.25,W7.gaji,t)); panel(150,1000,780,470,'🏆 Peringkat Donasi',pa,'#c8102e');
    [['🥇','#1','👑 Wakil Presiden'],['🥈','#2','Penasihat Negara'],['🥉','#3','Penasihat Negara']].forEach(([m,n,j],i)=>{ const y = 1150 + i*100, on = i===0 && t > 17.2;
      if (on){ cx.save(); cx.globalAlpha=pa; rr(180,y-44,720,88,20); cx.fillStyle='#fff4c2'; cx.fill(); cx.restore(); }
      txt(m+' '+n, 210, y, 42, '#13233b', 'left', pa, 800); txt(j, 870, y, 40, i===0?'#c8102e':'#1c3f7a', 'right', pa*(i===0?1:.35), 900); });
    pill('📅 Diangkat setiap hari SENIN', 1580, '#ffd21f', '#13233b', sm(16.0,16.3,t)*(1-sm(W7.gaji-.25,W7.gaji,t)), 52); if (t > 17.2) confetti(17.2,t,100,.8); }
  else if (t < W7.pen){ const a = inout(W7.gaji,W7.pen);
    headline([['GAJINYA?','#ffffff',130]], 380, a*(1-sm(20.95,21.09,t)), pop(W7.gaji));
    if (t > W7.gaji2){ const b = sm(W7.gaji2,W7.gaji2+.2,t)*a, s = 1 + .15*Math.max(0,1-(t-W7.gaji2)/.4); cx.save(); cx.globalAlpha=b; cx.translate(540,900); cx.scale(s,s); rr(-400,-170,800,340,40); cx.fillStyle='rgba(15,81,50,.96)'; cx.fill(); cx.lineWidth=12; cx.strokeStyle='#f2b134'; cx.stroke();
      cx.fillStyle='#f2b134'; cx.font=`900 190px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('N$250',0,-20); cx.fillStyle='#fff'; cx.font=`900 64px ${FONT2}`; cx.fillText('/ HARI',0,110); cx.restore();
      for (let i=0;i<26;i++){ const tt = W7.gaji2 + i*.08, d = t-tt; if (d>0 && d<1.6){ const x = 80 + ((i*197)%920), y = -80 + d*d*900; txt('🪙', x, y, 80, '#000', 'center', b, 400); } }
      flash(W7.gaji2,t); firework(W7.gaji2+.2,t,250,600,'#ffd21f'); firework(W7.gaji2+.45,t,830,560,'#7ed957'); } }
  else if (t < W7.misteri){ const a = inout(W7.pen,W7.misteri);
    headline([['JUARA 2 & 3','#ffffff',110],['PENASIHAT NEGARA!','#ffd21f',92]], 330, a, pop(W7.pen));
    panel(150,1000,780,470,'🏆 Peringkat Donasi',a,'#1c3f7a');
    [['🥇','#1','👑 Wakil Presiden'],['🥈','#2','🧑‍⚖️ Penasihat Negara'],['🥉','#3','🧑‍⚖️ Penasihat Negara']].forEach(([m,n,j],i)=>{ const y = 1150 + i*100, on = i>0 && t > 24.4 + (i-1)*.5;
      if (on){ cx.save(); cx.globalAlpha=a; rr(180,y-44,720,88,20); cx.fillStyle='#e7efff'; cx.fill(); cx.restore(); }
      txt(m+' '+n, 210, y, 42, '#13233b', 'left', a, 800); txt(j, 870, y, 38, i===0?'#c8102e':'#1c3f7a', 'right', a*(i===0||on?1:.35), 900); });
    if (t > 24.4) confetti(24.4,t,90,.7); }
  else if (t < W7.cta){ const a = inout(W7.misteri,W7.cta); dim(.25*a); spot(vx, vy, 460, a);
    headline([['📅 SENIN DEPAN…','#ffd21f',96]], 300, a*(1-sm(28.0,28.18,t)), pop(W7.misteri));
    headline([['SIAPA YANG DUDUK','#ffffff',90],['DI SAMPING PRESIDEN?','#ffd21f',84]], 300, sm(28.18,28.4,t)*(1-sm(30.0,30.19,t)), pop(28.18));
    const sa = sm(28.5,29.3,t)*a*(.55+.25*Math.sin(t*5)); silhouette(vx, vy, 120, sa);
    headline([['KAMU…','#ffd21f',150]], 300, sm(30.19,30.35,t)*(1-sm(30.8,30.95,t)), pop(30.19));
    headline([['ATAU ORANG LAIN?','#ffffff',100]], 300, sm(30.95,31.1,t)*a, pop(30.95)); }
  else { headline([['DAFTAR JADI','#ffffff',100],['WARGA!','#ffd21f',140]], 340, sm(W7.cta,W7.cta+.3,t)*(1-sm(W7.follow-.2,W7.follow,t)), pop(W7.cta));
    headline([['PANTAU TERUS','#ffffff',100],['PAPAN DONASI!','#ffd21f',112]], 340, sm(W7.follow,W7.follow+.3,t), pop(W7.follow));
    pill('📝 DAFTAR jadi warga · link di bio', 1380, '#ffd21f', '#13233b', sm(32.1,32.4,t), 52);
    pill('🎁 Warga baru dapat N$300!', 1520, '#ffffff', '#13233b', sm(W7.n300,W7.n300+.3,t), 50);
    pill('➕ FOLLOW akun ini', 1660, '#c8102e', '#ffffff', sm(W7.follow,W7.follow+.3,t), 58);
    if (t > W7.n300) confetti(W7.n300, t, 160, .9); }
  dayBadge();
  return 1;
}, look(c,t){ cx.clearRect(0,0,1080,1920); camera.position.set(...c); camera.lookAt(...t); renderer.render(scene,camera); } };
return true;
};
