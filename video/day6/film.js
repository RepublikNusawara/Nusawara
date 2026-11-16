
// ===================== FILM DAY 6 (suara-day6.mp3, 62,4 dtk; hanya untuk perekaman) =====================
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
const IMG = {}; ['n1','n5'].forEach(k=>{ const im = new Image(); im.src = 'img/'+k+'.jpg'; IMG[k] = im; });
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
  cx.fillStyle='#fff'; cx.font=`900 58px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('DAY 6',155,106); cx.restore();
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

// ===================== LINIMASA DAY 6 (sesuai jeda di suara-day6.mp3, 62,4 dtk) =====================
// 0 hook | 2.3 mata uang | 6.39 pabrik uang | 10.58 pejabat/Garuda | 19.85 N$300 | 23.87 tap pabrik | 30.53 tap kerja
// 36.49 login beruntun | 41.54 donasi→Wapres | 45.31 undian | 49.7 berputar | 53.33 Fadil | 57.31 ajakan | 62.43 selesai
const D6 = {hook:0, uang:2.3, pab:6.39, jab:10.58, gar:13.44, n300:19.85, tap:23.87, kerja:30.53, login:36.49, bolos:40.26, don:41.54, und:45.31, cnt:48.2, spin:49.7, win:53.33, kav:54.97, cta:57.31, bye:60.83, end:62.43};
const SPIN = ["kalilaaa_12","ramatemeh","_12k1la","manzzkidz","iruzz","Roro","rafi__malo_178","82_syaa","shiatokojiro","zuhana","pahriprtama","Fajri","ardhiaadia","AndyniePutri","bangrajab84","Khanza","rafadityarizkyi","dina_destria109","Nazwa","keyypretty","4bidz4r","Indahhhcuyyy","fenndii","ilham","Martin","aadamaalto","rehanalfarizi","younkbayu","laila_ii"];
const WIN = '@fadil';
const KAV = (()=>{ try { const s = slotOf('PLG-MAWAR-004'); if (s){ const w = V3(); (s.ghost || s).updateMatrixWorld && (s.ghost||s).updateMatrixWorld(true); if (s.ghost){ s.ghost.getWorldPosition(w); return w; } return V3(s.x, 1, s.z); } } catch(e){} return V3(37, 1, 20); })();
const KSL = (()=>{ try { return slotOf('PLG-MAWAR-004'); } catch(e){ return null; } })();
const KAVG = new THREE.Group(); scene.add(KAVG); KAVG.position.copy(KAV); KAVG.visible = false;
{ const pl = new THREE.Mesh(new THREE.BoxGeometry(7,.12,8), new THREE.MeshLambertMaterial({color:0xd9b98a})); pl.position.y = .1; KAVG.add(pl);
  [[-3.5,0],[3.5,0]].forEach(([x])=>{ const e = new THREE.Mesh(new THREE.BoxGeometry(.15,.2,8), new THREE.MeshLambertMaterial({color:0xffffff})); e.position.set(x,.15,0); KAVG.add(e); });
  try { const L = label('🏆 TANAH @fadil', {h:1.4, size:34, bg:'rgba(200,16,46,.97)', fg:'#fff'}); L.position.set(0, 4.2, 0); KAVG.add(L); } catch(e){} }
function panel(x,y,w,h,title,a,col){ if (a<=0) return; cx.save(); cx.globalAlpha = a; rr(x,y,w,h,34); cx.fillStyle='rgba(255,255,255,.97)'; cx.fill(); cx.lineWidth=8; cx.strokeStyle=col||'#13233b'; cx.stroke();
  rr(x,y,w,96,34); cx.fillStyle=col||'#13233b'; cx.fill(); cx.fillRect(x,y+60,w,36); cx.fillStyle='#fff'; cx.font=`900 46px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText(title, x+w/2, y+50); cx.restore(); }
function txt(s,x,y,size,col,align,a,weight){ if (a<=0) return; cx.save(); cx.globalAlpha=a; cx.font=`${weight||800} ${size}px ${FONT2}`; cx.fillStyle=col; cx.textAlign=align||'center'; cx.textBaseline='middle'; cx.fillText(s,x,y); cx.restore(); }
function note(im, x, y, w, rot, a){ if (a<=0 || !im || !im.complete) return; const h = w*im.height/im.width; cx.save(); cx.globalAlpha=a; cx.translate(x,y); cx.rotate(rot); cx.shadowColor='rgba(0,0,0,.45)'; cx.shadowBlur=30; cx.drawImage(im,-w/2,-h/2,w,h); cx.restore(); }
function finger(x,y,press,a){ if (a<=0) return; cx.save(); cx.globalAlpha=a; cx.translate(x,y); cx.scale(press?.9:1, press?.9:1); cx.font=`110px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('👆',0,0); cx.restore(); }
function floatNum(s, t0, t, x, y, col){ const d = t-t0; if (d<0 || d>.9) return; txt(s, x, y - d*160, 64, col||'#2e9e48', 'center', 1-d/.9, 900); }
function dim(a){ if (a<=0) return; cx.fillStyle=`rgba(5,10,20,${a})`; cx.fillRect(0,0,1080,1920); }

window.FILM = { info: Object.fromEntries(Object.keys(INFO).map(k=>[k,{c:INFO[k].c.toArray(), s:INFO[k].s.toArray()}])), kav: KAV.toArray(), dur:D6.end, frame(t){
  const dt = 1/30;
  try { kotaTick(dt, t); } catch(e){}
  Object.keys(INFO).forEach(k=>progress(k,1));
  try { const pa = flagGeo.attributes.position.array; for (let i=0;i<pa.length;i+=3){ const x = flagBase[i] + 2.25; pa[i+2] = Math.sin(x*1.6 - t*4)*.18*(x/4.5); } flagGeo.attributes.position.needsUpdate = true; } catch(e){}
  pres.position.copy(PRES0); pres.rotation.y = PRESR; chick.position.copy(CH0); chick.rotation.y = CHR;
  const hop = (t > D6.bolos && t < D6.don) || (t > D6.win && t < D6.win+1.6) || t > D6.cta; chick.position.y = CH0.y + (hop ? Math.abs(Math.sin(t*7))*.15 : 0);
  if (t > D6.bolos && t < D6.don) pres.rotation.y = PRESR + Math.sin(t*9)*.18;
  setCount(300);
  KAVG.visible = t >= D6.kav && t < D6.cta; if (KSL && KSL.ghost) KSL.ghost.visible = !(t >= D6.kav && t < D6.cta);
  // ---- kamera ----
  let C, T; const P = PRES0, G = INFO.garuda, PU = INFO.pabrik, DN = INFO.donasi;
  const presCam = (d,h,ox)=>[V3(P.x + (ox||0), P.y + h, P.z + d), V3(P.x + .4, P.y + 1.9, P.z)];
  if (t < D6.uang){ const k = sm(0,D6.uang,t); [C,T] = presCam(lerp(16,9,k), lerp(4,3,k)); }
  else if (t < D6.pab){ const k = sm(D6.uang,D6.pab,t); C = V3(P.x + lerp(-20,20,k), P.y + 30, P.z + 60); T = V3(P.x, P.y + 4, P.z - 10); }
  else if (t < D6.jab){ const u = (t-D6.pab)/(D6.jab-D6.pab); [C,T] = PU ? orbit(PU, .7 - u*1.0, 1.05, .9, .4) : presCam(20,8); }
  else if (t < D6.gar){ const k = sm(D6.jab,D6.gar,t); [C,T] = presCam(lerp(10,22,k), lerp(3,9,k), lerp(0,-6,k)); }
  else if (t < D6.n300){ const u = (t-D6.gar)/(D6.n300-D6.gar); [C,T] = G ? orbit(G, -.5 + u*.8, 1.0, .8, .45) : presCam(20,8); }
  else if (t < D6.tap){ const k = sm(D6.n300,D6.tap,t); [C,T] = presCam(lerp(7,12,k), lerp(2.6,3.5,k), lerp(2,-2,k)); }
  else if (t < D6.kerja){ const u = (t-D6.tap)/(D6.kerja-D6.tap); [C,T] = PU ? orbit(PU, -.6 + u*.7, .8, .55, .35) : presCam(20,8); }
  else if (t < D6.login){ const L = (D6.login-D6.kerja)/3, i = cl(Math.floor((t-D6.kerja)/L),0,2), k = ['kopi','rs','mall'][i], I = INFO[k], u = (t-D6.kerja-i*L)/L; flashCut = D6.kerja + i*L; [C,T] = I ? orbit(I, .5 - u*.5, k==='mall'?.75:1.1, .7, .4) : presCam(20,8); }
  else if (t < D6.don){ const k = sm(D6.login,D6.don,t); [C,T] = presCam(lerp(14,7.5,k), lerp(5,2.8,k), lerp(-3,1,k)); }
  else if (t < D6.und){ const u = (t-D6.don)/(D6.und-D6.don); [C,T] = DN ? orbit(DN, -.3 + u*.6, 1.4, 1.0, .5) : presCam(20,8); }
  else if (t < D6.win){ const k = sm(D6.und,D6.win,t); [C,T] = presCam(lerp(18,9,k), lerp(6,3.2,k), lerp(-4,0,k)); }
  else if (t < D6.kav){ [C,T] = presCam(8.5, 3, 0); }
  else if (t < D6.cta){ const k = sm(D6.kav,D6.cta,t); C = V3(KAV.x + lerp(14,8,k), lerp(18,12,k), KAV.z + lerp(22,14,k)); T = V3(KAV.x, 1, KAV.z); }
  else { const k = sm(D6.cta,D6.end,t); [C,T] = presCam(lerp(14,8.5,k), lerp(3.4,2.6,k), lerp(-1.5,1.5,k)); }
  shot(C,T);
  renderer.render(scene, camera);
  // ---- overlay ----
  cx.clearRect(0,0,1080,1920);
  const vig = cx.createLinearGradient(0,0,0,1920); vig.addColorStop(0,'rgba(0,0,0,.35)'); vig.addColorStop(.18,'rgba(0,0,0,0)'); vig.addColorStop(.78,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.4)'); cx.fillStyle = vig; cx.fillRect(0,0,1080,1920);
  dayBadge();
  const pop = a=>cl((t-a)/.25,0,1), inout = (a,b)=>sm(a,a+.25,t)*(1-sm(b-.25,b,t));
  if (t < D6.uang){ headline([['TUNGGU','#ffffff',130],['DULU!','#ffd21f',150]], 380, inout(0,D6.uang), pop(0)); flash(0,t); }
  else if (t < D6.pab){ const a = inout(D6.uang,D6.pab); dim(.35*a);
    headline([['MATA UANG NUSA','#ffd21f',100],['RESMI!','#ffffff',130]], 330, a, pop(D6.uang));
    const k1 = 1-Math.pow(1-cl((t-2.5)/.5,0,1),3), k5 = 1-Math.pow(1-cl((t-3.2)/.5,0,1),3);
    note(IMG.n1, lerp(-500,540,k1), 860 + Math.sin(t*2)*12, 960, lerp(-.6,-.06,k1), a); note(IMG.n5, lerp(1600,540,k5), 1230 + Math.sin(t*2+1)*12, 960, lerp(.6,.05,k5), a);
    if (t > 4.0){ const d = t-4.0, k = 1-Math.pow(1-cl(d/.3,0,1),3); cx.save(); cx.globalAlpha = a; cx.translate(820,1520); cx.rotate(-.2); cx.scale(2-k,2-k); rr(-200,-70,400,140,24); cx.lineWidth=12; cx.strokeStyle='#c8102e'; cx.stroke(); cx.fillStyle='#c8102e'; cx.font=`900 84px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('RESMI!',0,6); cx.restore(); confetti(4.0,t,160,.95); flash(4.0,t); } }
  else if (t < D6.jab){ const a = inout(D6.pab,D6.jab);
    headline([['🏭 PABRIK UANG','#ffd21f',104],['NUSAWARA','#ffffff',110]], 330, a, pop(D6.pab));
    pill('Tempat uang Nusa dicetak!', 1640, '#ffd21f', '#13233b', sm(8.85,9.1,t)*(1-sm(D6.jab-.25,D6.jab,t)), 54);
    for (let i=0;i<5;i++){ const tt = 8.9 + i*.28; if (t>tt){ const d = t-tt; note(i%2?IMG.n5:IMG.n1, 540 + Math.sin(i*2.1)*260, 1500 - d*520, 360, Math.sin(d*3+i)*.4, cl(1.6-d,0,1)*a); } } }
  else if (t < D6.n300){ const a = inout(D6.jab,D6.n300);
    if (t < D6.gar) headline([['JADI PEJABAT','#ffffff',112],['NEGARA!','#ffd21f',140]], 380, a, pop(D6.jab));
    else { headline([['🦅 GEDUNG GARUDA','#ffd21f',92],['Distrik Pusat','#ffffff',58]], 300, a, pop(D6.gar));
      const pa = sm(15.3,15.6,t)*(1-sm(D6.n300-.25,D6.n300,t)); panel(110,820,860,640,'🏛️ Jabatan Kenegaraan',pa,'#1c3f7a');
      [['🧑‍💼','Gubernur','N$6.000'],['⚖️','Hakim','N$4.000'],['🏛️','DPR Nusawara','N$2.000'],['🧑‍💼','Camat','N$2.000']].forEach(([ic,n,h],i)=>{ const y = 970 + i*110, sel = i===2 && t>16.0;
        if (sel && pa>0){ cx.save(); cx.globalAlpha=pa; rr(140,y-48,800,96,20); cx.fillStyle='#fff4c2'; cx.fill(); cx.restore(); }
        txt(ic+'  '+n, 170, y, 46, '#13233b', 'left', pa); txt(h, 910, y, 46, '#c8102e', 'right', pa, 900); });
      finger(820, 1250 - (t<16?80:0), t>16.0 && t<16.4, pa);
      if (t > 17.3){ const ga = sm(17.3,17.6,t)*(1-sm(D6.n300-.25,D6.n300,t)); panel(190,1300,700,250,'💰 Gaji Harian',ga,'#2e9e48'); txt('+ N$40 / hari', 540, 1470, 70, '#2e9e48', 'center', ga, 900); confetti(17.3,t,90,.7); } } }
  else if (t < D6.tap){ const a = inout(D6.n300,D6.tap);
    headline([['BELUM PUNYA','#ffffff',104],['UANG?','#ffd21f',140]], 340, a*(1-sm(20.9,21.1,t)), pop(D6.n300));
    if (t > 20.98){ const ga = sm(20.98,21.25,t)*(1-sm(D6.tap-.25,D6.tap,t)); panel(150,700,780,470,'🎁 Hadiah warga baru',ga,'#c8102e'); txt('+N$300', 540, 940, 150, '#2e9e48', 'center', ga, 900); txt('Langsung masuk ke saldomu', 540, 1080, 40, '#13233b', 'center', ga, 700);
      headline([['WARGA BARU','#ffffff',96],['DAPAT N$300!','#ffd21f',112]], 330, ga, pop(20.98)); confetti(20.98,t,200,1.0); flash(20.98,t); } }
  else if (t < D6.kerja){ const a = inout(D6.tap,D6.kerja);
    headline([['TAP DI','#ffffff',96],['PABRIK UANG!','#ffd21f',116]], 330, a, pop(D6.tap));
    // mesin cetak: tombol koin besar
    cx.save(); cx.globalAlpha = a; const pr = (Math.floor(t*6)%2)===0 && t > 24.9; const R = pr ? 190 : 205; cx.beginPath(); cx.arc(540,1150,R,0,7); cx.fillStyle='#f2b134'; cx.fill(); cx.lineWidth=16; cx.strokeStyle='#8f5a00'; cx.stroke();
    cx.fillStyle='#8f5a00'; cx.font=`900 120px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('N$',540,1158); cx.restore();
    finger(660, 1290, pr, a);
    const val = t < 26.6 ? '+N$1' : t < 28.1 ? '+N$5' : '+N$10', col = t < 26.6 ? '#2e9e48' : t < 28.1 ? '#2f80ed' : '#c8102e';
    for (let i=0;i<40;i++){ const tt = 24.9 + i/6; if (tt < D6.kerja-.3) floatNum(val, tt, t, 540 + Math.sin(i*1.7)*150, 900, col); }
    pill(t < 26.6 ? 'Setiap tap = uang!' : 'Makin sering tap, nilainya makin besar!', 1580, '#ffd21f', '#13233b', sm(24.97,25.2,t)*(1-sm(D6.kerja-.25,D6.kerja,t)), 48);
    tlBadge(0,0); }
  else if (t < D6.login){ const L = (D6.login-D6.kerja)/3, i = cl(Math.floor((t-D6.kerja)/L),0,2); flash(D6.kerja+i*L, t); const a = inout(D6.kerja,D6.login);
    headline([['⚒️ TAP DI','#ffffff',96],['TEMPAT KERJA!','#ffd21f',112]], 330, a, pop(D6.kerja));
    pill(['☕ Toko','🏥 Rumah Sakit','🏬 Mall'][i], 560, '#ffffff', '#13233b', a, 54);
    if (t > 33.44){ const pa = sm(33.44,33.7,t)*(1-sm(D6.login-.25,D6.login,t)); panel(190,1130,700,400,'⚒️ Ruang Kerja',pa,'#2e9e48');
      const pr = (Math.floor(t*6)%2)===0; cx.save(); cx.globalAlpha=pa; rr(330,1280,420,120,30); cx.fillStyle= pr ? '#24803a' : '#2e9e48'; cx.fill(); cx.fillStyle='#fff'; cx.font=`900 64px ${FONT2}`; cx.textAlign='center'; cx.textBaseline='middle'; cx.fillText('⚒️ Kerja',540,1342); cx.restore();
      finger(700, 1400, pr, pa); txt('min. 20 tap/hari = DIGAJI', 540, 1475, 40, '#13233b', 'center', pa, 800); } }
  else if (t < D6.don){ const a = inout(D6.login,D6.don);
    if (t < D6.bolos){ headline([['LOGIN','#ffffff',110],['BERTURUT-TURUT!','#ffd21f',96]], 330, a, pop(D6.login));
      const pa = sm(36.7,37,t)*(1-sm(D6.bolos-.2,D6.bolos,t)); panel(110,760,860,600,'📅 Absen Harian',pa,'#1c3f7a');
      [[1,10],[2,10],[3,25],[4,25],[5,25],[6,50]].forEach(([d,n],i)=>{ const x = 250 + (i%3)*290, y = 980 + Math.floor(i/3)*220, on = t > 37.2 + i*.4;
        cx.save(); cx.globalAlpha = pa; rr(x-120,y-90,240,180,24); cx.fillStyle = on ? (n===50?'#ffd21f':'#e8f5e9') : '#eef1f5'; cx.fill(); cx.lineWidth=6; cx.strokeStyle = on ? '#2e9e48' : '#c9d1db'; cx.stroke(); cx.restore();
        txt('Hari '+d+(d===6?'+':''), x, y-40, 36, '#13233b', 'center', pa, 700); txt('N$'+n, x, y+30, on && n===50 ? 64 : 54, on ? '#2e9e48' : '#9aa5b1', 'center', pa, 900); });
      if (t > 39.2) confetti(39.2,t,120,.8); }
    else { headline([['JANGAN','#ffffff',120],['BOLOS, YA!','#ffd21f',130]], 380, a, pop(D6.bolos)); } }
  else if (t < D6.und){ const a = inout(D6.don,D6.und);
    headline([['DONASI TERBANYAK','#ffd21f',90],['= WAKIL PRESIDEN!','#ffffff',96]], 330, a, pop(D6.don));
    const pa = sm(41.8,42.1,t)*(1-sm(D6.und-.25,D6.und,t)); panel(150,1000,780,470,'🏆 Peringkat Donasi',pa,'#c8102e');
    [['🥇','#1','👑 Wakil Presiden'],['🥈','#2','Penasihat Negara'],['🥉','#3','Penasihat Negara']].forEach(([m,n,j],i)=>{ const y = 1150 + i*100, on = i===0 && t > 42.6;
      if (on){ cx.save(); cx.globalAlpha=pa; rr(180,y-44,720,88,20); cx.fillStyle='#fff4c2'; cx.fill(); cx.restore(); }
      txt(m+' '+n, 210, y, 42, '#13233b', 'left', pa, 800); txt(j, 870, y, 40, i===0?'#c8102e':'#1c3f7a', 'right', pa, 900); });
    pill('📅 Diangkat setiap hari SENIN', 1580, '#ffd21f', '#13233b', sm(43.6,43.9,t)*(1-sm(D6.und-.25,D6.und,t)), 50); if (t > 42.6) confetti(42.6,t,100,.8); }
  else if (t < D6.win){ const a = inout(D6.und,D6.win);
    headline([['🎰 UNDIAN','#ffd21f',120],['TANAH & RUMAH!','#ffffff',100]], 330, a, pop(D6.und)); if (t < 45.6) flash(D6.und,t);
    if (t > D6.cnt){ const n = Math.round(lerp(0,300, sm(D6.cnt, D6.spin-.2, t))); pill(`👥 ${n} warga ikut`, 640, '#ffffff', '#13233b', a, 56); }
    if (t > D6.spin){ dim(.35*sm(D6.spin,D6.spin+.5,t)); const pa = sm(D6.spin,D6.spin+.25,t); panel(140,900,800,560,'Nama berputar…',pa,'#1c3f7a');
      const sp = Math.max(0, 18 - (t-D6.spin)*4.2), off = (t-D6.spin)*sp + (t-D6.spin)*1.5; for (let j=-2;j<=2;j++){ const idx = ((Math.floor(off)+j)%SPIN.length+SPIN.length)%SPIN.length, f = off - Math.floor(off), y = 1180 + (j - f)*92;
        txt('@'+SPIN[idx], 540, y, j===0?64:48, j===0?'#13233b':'#9aa5b1', 'center', pa*(1-Math.abs(j-f)/3), j===0?900:700); }
      cx.save(); cx.globalAlpha=pa; cx.strokeStyle='#c8102e'; cx.lineWidth=8; rr(170,1130,740,100,20); cx.stroke(); cx.restore();
      if (t > 52.14) pill('Pemenangnya adalah…', 1560, '#ffd21f', '#13233b', sm(52.14,52.4,t), 54); } }
  else if (t < D6.kav){ dim(.25); headline([['🎉 '+WIN.toUpperCase()+'!','#ffd21f',130],['SELAMAT!','#ffffff',120]], 420, sm(D6.win,D6.win+.15,t), pop(D6.win));
    firework(D6.win,t,250,700,'#ffd21f'); firework(D6.win+.25,t,830,620,'#ff6fa8'); firework(D6.win+.5,t,540,520,'#7ed957'); confetti(D6.win,t,260,1.15); flash(D6.win,t);
    pill('🏆 Pemenang Undian Tanah & Rumah', 1580, '#c8102e', '#ffffff', 1, 50); }
  else if (t < D6.cta){ const a = inout(D6.kav,D6.cta);
    headline([['TANAH '+WIN,'#ffd21f',96],['BEBAS DESAIN RUMAH!','#ffffff',84]], 330, a, pop(D6.kav));
    pill('🏠 Lengkap dengan billboard!', 1580, '#ffd21f', '#13233b', sm(55.6,55.9,t)*(1-sm(D6.cta-.25,D6.cta,t)), 52); }
  else { headline([['DAFTAR JADI','#ffffff',100],['WARGA!','#ffd21f',140]], 340, sm(D6.cta,D6.cta+.3,t)*(1-sm(D6.bye-.2,D6.bye,t)), pop(D6.cta));
    headline([['SAMPAI JUMPA','#ffffff',104],['DI DAY 7!','#ffd21f',140]], 340, sm(D6.bye,D6.bye+.3,t), pop(D6.bye));
    pill('📝 DAFTAR jadi warga · link di bio', 1380, '#ffd21f', '#13233b', sm(57.5,57.8,t), 52);
    pill('🎁 Warga baru dapat N$300!', 1520, '#ffffff', '#13233b', sm(58.3,58.6,t), 50);
    pill('➕ FOLLOW akun ini', 1660, '#c8102e', '#ffffff', sm(59.6,59.9,t), 58);
    confetti(D6.bye, t, 200, 1.0); }
  return 1;
}, look(c,t){ cx.clearRect(0,0,1080,1920); camera.position.set(...c); camera.lookAt(...t); renderer.render(scene,camera); } };
var flashCut = 0;
return true;
};
