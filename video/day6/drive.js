const {spawn}=require('child_process'); const fs=require('fs');
const [,,mode,a,b]=process.argv;
const chrome=spawn('google-chrome',['--headless=new','--no-sandbox','--remote-debugging-port='+(process.env.PORT||9333)+'','--window-size=1080,1920','--force-device-scale-factor=1','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--hide-scrollbars','--mute-audio','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let ws; for(let i=0;i<40;i++){ try{ const l=await (await fetch('http://127.0.0.1:'+(process.env.PORT||9333)+'/json')).json(); const p=l.find(x=>x.type==='page'); if(p){ws=new WebSocket(p.webSocketDebuggerUrl);break;} }catch(e){} await sleep(300); }
  await new Promise(r=>ws.onopen=r); let id=0; const pend={};
  ws.onmessage=m=>{const d=JSON.parse(m.data); if(d.method==='Runtime.exceptionThrown'){const x=d.params.exceptionDetails; console.log('PAGEERR',(x.exception&&x.exception.description||x.text).slice(0,500));} if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true}); if(r.result.exceptionDetails) console.log('EXC',JSON.stringify(r.result.exceptionDetails).slice(0,600)); return r.result.result&&r.result.result.value;};
  await send('Emulation.setDeviceMetricsOverride',{width:1080,height:1920,deviceScaleFactor:1,mobile:false});
  await send('Runtime.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:'+(process.env.HTTP||8770)+'/index.html'});
  for(let i=0;i<25;i++){ await sleep(1000); const ok=await ev("typeof FILM_INIT==='function' && FILM_INIT()"); if(ok) break; if(i==119) console.log('timeout tunggu'); }
  console.log('init', await ev("JSON.stringify(FILM.info)"));
  await ev("new Promise(r=>{const ims=[...document.images]; setTimeout(r,800);})");
  const shot=async()=>Buffer.from((await send('Page.captureScreenshot',{format:'jpeg',quality:92})).result.data,'base64');
  console.log('ERRBOX', await ev("(document.getElementById('errBox')||{}).textContent"), await ev('typeof FILM_INIT'));
  if(mode==='eval'){ console.log('EVAL', await ev(a)); fs.writeFileSync('/tmp/film6/eval.jpg', await shot()); }
  else if(mode==='look'){ let k=0; for(const v of a.split(';')){ await ev(`FILM.look(${v})`); fs.writeFileSync(`/tmp/film6/look_${k++}.jpg`,await shot()); } }
  else if(mode==='still'){ for(const t of a.split(',')){ await ev(`FILM.frame(${t})`); fs.writeFileSync(`/tmp/film6/still_${t}.jpg`,await shot()); } }
  else { const f0=+a,f1=+b; const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-r','30',`/tmp/film6/part_${f0}.tmp.mp4`]);
    const T0=Date.now(); for(let f=f0;f<f1;f++){ await ev(`FILM.frame(${(f/30).toFixed(4)})`); const buf=await shot(); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(f%60==0) console.log('f',f,((Date.now()-T0)/1000).toFixed(0)+'s'); }
    ff.stdin.end(); await new Promise(r=>ff.on('close',r)); fs.renameSync(`/tmp/film6/part_${f0}.tmp.mp4`,`/tmp/film6/part_${f0}.mp4`); }
  chrome.kill(); process.exit(0);
})();
