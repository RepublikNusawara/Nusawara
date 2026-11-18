
// ===================== FILM DAY 7 — KANTOR POLISI (hanya untuk perekaman) =====================
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
  polisi: findG(u=>u.data && u.data.id==='POLISI-NUSAWARA'),
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
  cx.fillStyle='#fff'; cx.font=`900 58px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('DAY 7',190,106); cx.restore();
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

// ===================== DAY 7 (suara-day7.mp3, 47,4 dtk) — jeda diukur dengan silencedetect =====================
const D7 = {hook:0, janji:1.57, hari:5.14, vote:8.29, kas:9.81, kas17:10.6, ban:11.77, ban17:12.59, pem:13.75, kp:15.14, kp67:16.2,
  lihat:17.93, resmi:19.14, stamp:21.0, tiga:22.92, panji:24.2, taman:25.3, aman:26.64, giliran:29.32, mau:30.88, tulis:32.78, usul:33.95,
  belum:37.2, daftar:38.32, follow:41.82, tutup:44.9, end:47.39};
try { kasFront.map = kasTex(19805); kasFront.needsUpdate = true; } catch(e){}
function panel(x,y,w,h,title,a,col){ if (a<=0) return; cx.save(); cx.globalAlpha = a; rr(x,y,w,h,34); cx.fillStyle='rgba(255,255,255,.97)'; cx.fill(); cx.lineWidth=8; cx.strokeStyle=col||'#13233b'; cx.stroke();
  rr(x,y,w,96,34); cx.fillStyle=col||'#13233b'; cx.fill(); cx.fillRect(x,y+60,w,36); cx.fillStyle='#fff'; cx.font=`900 46px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(title, x+w/2, y+50); cx.restore(); }
function txt(s,x,y,size,col,align,a,weight){ if (a<=0) return; cx.save(); cx.globalAlpha=a; cx.font=`${weight||800} ${size}px ${FONT2}`; cx.fillStyle=col; cx.textAlign=align||'center'; cx.textBaseline='middle'; cx.fillText(s,x,y); cx.restore(); }
function dim(a){ if (a<=0) return; cx.fillStyle=`rgba(5,10,20,${a})`; cx.fillRect(0,0,1080,1920); }
// panel hasil polling: batang naik saat disebut
function poll(a, t){ if (a<=0) return; panel(110,820,860,640,'🗳️ HASIL POLLING WARGA',a,'#1c3f7a');
  const R = [['🎰 Kasino',17,D7.kas,D7.kas17,'#8a94a6'],['✈️ Bandara',17,D7.ban,D7.ban17,'#8a94a6'],['🚓 Kantor Polisi',67,D7.pem+.9,D7.kp67,'#c8102e']];
  R.forEach(([nm,pc,t0,t1,col],i)=>{ const y = 1010 + i*150, on = t > t0, win = i===2 && t > D7.kp;
    if (!on) { txt(nm, 160, y-34, 44, '#13233b', 'left', a*.35, 900); return; }
    if (win){ cx.save(); cx.globalAlpha=a; rr(140,y-80,800,140,24); cx.fillStyle='#fff4c2'; cx.fill(); cx.restore(); }
    txt(nm, 160, y-34, 44, '#13233b', 'left', a, 900);
    const k = 1-Math.pow(1-cl((t-t0)/.6,0,1),3), W = 620*pc/67*k; cx.save(); cx.globalAlpha=a; rr(160,y+4,620,40,20); cx.fillStyle='#e3e8f0'; cx.fill(); if (W>4){ rr(160,y+4,Math.max(40,W),40,20); cx.fillStyle = win ? col : '#4a6fa5'; cx.fill(); } cx.restore();
    txt(t > t1 ? pc+'%' : '', 910, y+24, win ? 64 : 50, win ? '#c8102e' : '#13233b', 'right', a, 900);
    if (win && t > D7.kp) txt('👑', 640, y-36, 56, '#000', 'center', a, 400); }); }
function bubble(x,y,w,txt1,a,col){ if (a<=0) return; cx.save(); cx.globalAlpha=a; rr(x,y,w,110,40); cx.fillStyle='#fff'; cx.fill(); cx.lineWidth=6; cx.strokeStyle='#13233b'; cx.stroke();
  cx.beginPath(); cx.moveTo(x+60,y+108); cx.lineTo(x+40,y+150); cx.lineTo(x+110,y+108); cx.fill(); cx.fillStyle=col||'#13233b'; cx.font=`800 44px ${FONT2}`; cx.textAlign='left'; cx.textBaseline='middle'; cx.fillText(txt1, x+36, y+56); cx.restore(); }

window.FILM = { info: Object.fromEntries(Object.keys(INFO).map(k=>[k,{c:INFO[k].c.toArray(), s:INFO[k].s.toArray()}])), dur:D7.end, frame(t){
  const dt = 1/30;
  try { kotaTick(dt, t); } catch(e){}
  Object.keys(INFO).forEach(k=>{ if (k!=='polisi') progress(k,1); });
  const pb = t < D7.lihat ? 0 : sm(D7.lihat+.1, D7.stamp, t);
  progress('polisi', t < D7.lihat ? 0 : (pb >= .999 ? 1 : pb));
  try { const pa = flagGeo.attributes.position.array; for (let i=0;i<pa.length;i+=3){ const x = flagBase[i] + 2.25; pa[i+2] = Math.sin(x*1.6 - t*4)*.18*(x/4.5); } flagGeo.attributes.position.needsUpdate = true; } catch(e){}
  setCount(300);
  chick.position.y = CH0.y + ((t > D7.kp && t < D7.lihat) || t > D7.follow ? Math.abs(Math.sin(t*7))*.15 : 0);
  // ---- kamera ----
  let C, T; const P = PRES0, KP = INFO.polisi, G = INFO.garuda;
  const presCam = (d,h,ox)=>[V3(P.x + (ox||0), P.y + h, P.z + d), V3(P.x + .4, P.y + 1.9, P.z)];
  if (t < D7.hari){ const k = sm(0, D7.hari, t); [C,T] = presCam(lerp(14,8.5,k), lerp(3.6,2.7,k), lerp(-2.5,1.5,k)); }
  else if (t < D7.vote){ const u = (t-D7.hari)/(D7.vote-D7.hari); [C,T] = G ? orbit(G, .6 - u*.5, 1.6, 1.1, .3) : presCam(30,14); }
  else if (t < D7.lihat){ const u = (t-D7.vote)/(D7.lihat-D7.vote); [C,T] = orbit(KP, 2.4 + u*.5, 1.5, 1.4, .2); }
  else if (t < D7.tiga){ const u = (t-D7.lihat)/(D7.tiga-D7.lihat); [C,T] = orbit(KP, 2.9 + u*.9, lerp(1.35,1.0,u), lerp(1.2,.7,u), .3); }
  else if (t < D7.giliran){ const u = (t-D7.tiga)/(D7.giliran-D7.tiga); [C,T] = orbit(KP, 3.8 + u*1.0, lerp(1.15,1.0,u), lerp(.85,.65,u), .3); }
  else if (t < D7.usul){ const u = (t-D7.giliran)/(D7.usul-D7.giliran); [C,T] = G ? orbit(G, 4.2 + u*.6, 2.4, 1.8, .2) : presCam(40,20); }
  else { const k = sm(D7.usul,D7.end,t); [C,T] = presCam(lerp(13,8.2,k), lerp(3.4,2.6,k), lerp(-1.8,1.6,k)); }
  shot(C,T);
  renderer.render(scene, camera);
  // ---- overlay ----
  cx.clearRect(0,0,1080,1920);
  const vig = cx.createLinearGradient(0,0,0,1920); vig.addColorStop(0,'rgba(0,0,0,.35)'); vig.addColorStop(.18,'rgba(0,0,0,0)'); vig.addColorStop(.78,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.4)'); cx.fillStyle = vig; cx.fillRect(0,0,1080,1920);
  const pop = a=>cl((t-a)/.25,0,1), inout = (a,b)=>sm(a,a+.25,t)*(1-sm(b-.25,b,t));
  if (t < D7.hari){ const a = inout(0,D7.hari);
    headline([['RAKYAT','#ffffff',120],['NUSAWARA!','#ffd21f',140]], 330, a*(1-sm(1.4,1.57,t)), pop(0)); flash(0,t);
    headline([['PRESIDEN','#ffffff',110],['MENEPATI JANJI!','#ffd21f',110]], 330, sm(D7.janji,D7.janji+.2,t)*a, pop(D7.janji));
 }
  else if (t < D7.vote){ const a = inout(D7.hari,D7.vote);
    headline([['HARI KE-7','#ffd21f',170]], 360, a, pop(D7.hari)); flash(D7.hari,t);
    pill('🇮🇩 Republik Nusawara', 1620, '#ffffff', '#13233b', a, 52); confetti(D7.hari, t, 110, .8); }
  else if (t < D7.lihat){ const a = inout(D7.vote,D7.lihat); dim(.35*a);
    headline([['KEMARIN','#ffffff',100],['KALIAN VOTING!','#ffd21f',110]], 330, a*(1-sm(D7.pem-.2,D7.pem,t)), pop(D7.vote));
    headline([['DAN PEMENANGNYA…','#ffd21f',100]], 330, sm(D7.pem,D7.pem+.2,t)*(1-sm(D7.kp-.15,D7.kp,t)), pop(D7.pem));
    headline([['🚓 KANTOR','#ffffff',120],['POLISI!','#ffd21f',150]], 330, sm(D7.kp,D7.kp+.2,t)*a, pop(D7.kp));
    poll(a, t); if (t > D7.kp){ flash(D7.kp,t); confetti(D7.kp,t,160,.9); firework(D7.kp+.3,t,240,620,'#ffd21f'); firework(D7.kp67,t,840,600,'#ff6fa8'); } }
  else if (t < D7.tiga){ const a = inout(D7.lihat,D7.tiga);
    headline([['DAN LIHAT INI!','#ffd21f',120]], 330, a*(1-sm(D7.resmi-.15,D7.resmi,t)), pop(D7.lihat));
    headline([['KANTOR POLISI','#ffffff',100],['REPUBLIK NUSAWARA','#ffd21f',86]], 330, sm(D7.resmi,D7.resmi+.2,t)*a, pop(D7.resmi));
    if (t < D7.stamp + .1) tlBadge(sm(D7.lihat,D7.lihat+.3,t)*(1-sm(D7.stamp-.1,D7.stamp+.1,t)), cl(pb,0,1));
    if (t > D7.stamp){ flash(D7.stamp,t); stamp(D7.stamp,t); confetti(D7.stamp,t,180,1); firework(D7.stamp+.2,t,260,640,'#ffd21f'); firework(D7.stamp+.5,t,820,580,'#4aa3ea'); } }
  else if (t < D7.giliran){ const a = inout(D7.tiga,D7.giliran);
    pill('🏢 Tiga lantai', 1300, '#ffffff', '#13233b', sm(D7.tiga,D7.tiga+.3,t)*a, 54);
    pill('🚩 Panji berlencana', 1440, '#ffd21f', '#13233b', sm(D7.panji,D7.panji+.3,t)*a, 54);
    pill('🌳 Taman di belakangnya', 1580, '#ffffff', '#13233b', sm(D7.taman,D7.taman+.3,t)*a, 54);
    headline([['🚓 KANTOR POLISI','#ffd21f',110]], 330, a*(1-sm(D7.aman-.2,D7.aman,t)), pop(D7.tiga));
    headline([['NUSAWARA','#ffffff',110],['MAKIN AMAN!','#ffd21f',130]], 330, sm(D7.aman,D7.aman+.2,t)*a, pop(D7.aman)); if (t > D7.aman){ flash(D7.aman,t); confetti(D7.aman,t,120,.8); } }
  else if (t < D7.usul){ const a = inout(D7.giliran,D7.usul); dim(.2*a);
    headline([['SEKARANG','#ffffff',110],['GILIRAN KALIAN!','#ffd21f',110]], 330, a*(1-sm(D7.mau-.15,D7.mau,t)), pop(D7.giliran));
    headline([['MAU DIBANGUN','#ffffff',100],['APA LAGI? 🤔','#ffd21f',120]], 330, sm(D7.mau,D7.mau+.2,t)*a, pop(D7.mau));
    const q = sm(D7.mau,D7.mau+.4,t)*a; txt('❓', 540, 960 + Math.sin(t*3)*20, 260, '#000', 'center', q*(1-sm(D7.tulis,D7.tulis+.3,t)), 400);
    const ba = sm(D7.tulis,D7.tulis+.25,t)*a; bubble(120, 860, 620, '💬 Kasino!', ba); bubble(330, 1040, 640, '💬 Bandara dong!', sm(D7.tulis+.35,D7.tulis+.6,t)*a); bubble(160, 1220, 700, '💬 Stadion baru!', sm(D7.tulis+.7,D7.tulis+.95,t)*a);
    pill('✍️ TULIS DI KOMENTAR!', 1600, '#c8102e', '#ffffff', ba, 60); }
  else if (t < D7.belum){ const a = inout(D7.usul,D7.belum);
    headline([['USULAN TERBANYAK','#ffd21f',96],['BESOK DIBANGUN!','#ffffff',110]], 330, a, pop(D7.usul)); flash(D7.usul,t);
    pill('🏗️ Dibangun langsung oleh Presiden', 1600, '#ffd21f', '#13233b', sm(D7.usul+.3,D7.usul+.6,t)*a, 50); }
  else { headline([['BELUM JADI','#ffffff',100],['WARGA?','#ffd21f',140]], 340, sm(D7.belum,D7.belum+.25,t)*(1-sm(D7.follow-.2,D7.follow,t)), pop(D7.belum));
    headline([['SAMPAI JUMPA','#ffffff',100],['DI DAY 8!','#ffd21f',140]], 340, sm(D7.follow,D7.follow+.3,t)*(1-sm(D7.tutup-.2,D7.tutup,t)), pop(D7.follow));
    headline([['REPUBLIK NUSAWARA','#ffd21f',90],['TERUS MEMBANGUN!','#ffffff',100]], 340, sm(D7.tutup,D7.tutup+.3,t), pop(D7.tutup));
    pill('💬 Komentar "DAFTAR"', 1380, '#ffd21f', '#13233b', sm(D7.daftar,D7.daftar+.3,t), 54);
    pill('🎁 Warga baru dapat N$300!', 1520, '#ffffff', '#13233b', sm(D7.daftar+1.2,D7.daftar+1.5,t), 50);
    pill('➕ FOLLOW akun ini', 1660, '#c8102e', '#ffffff', sm(D7.follow,D7.follow+.3,t), 58);
    if (t > D7.daftar+1.2) confetti(D7.daftar+1.2, t, 140, .9); if (t > D7.tutup){ flash(D7.tutup,t); confetti(D7.tutup,t,180,1); firework(D7.tutup+.3,t,260,640,'#ffd21f'); firework(D7.tutup+.6,t,820,600,'#7ed957'); } }
  dayBadge();
  return 1;
}, look(c,t){ cx.clearRect(0,0,1080,1920); camera.position.set(...c); camera.lookAt(...t); renderer.render(scene,camera); } };
return true;
};
