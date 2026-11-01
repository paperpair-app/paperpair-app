const V='paperpair-v153';
const SHELL=['./','index.html','paperpair.webmanifest','lib/pdf.min.js','lib/pdf.worker.min.js','lib/pdf-lib.min.js','lib/jszip.min.js','icons/icon-192.png','icons/icon-512.png','icons/apple-180.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('paperpair-')&&k!==V&&k!==V+'-f').map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='go')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin&&r.mode==='navigate'){ // newest page when online, saved copy when offline
    e.respondWith(Promise.race([fetch(r,{cache:'no-store'}).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(k=>k.put('index.html',c))}return x}),new Promise((_,no)=>setTimeout(no,4000))]).catch(()=>caches.match('index.html')));return}
  if(u.origin===location.origin&&/\.webmanifest$/.test(u.pathname)){e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return} // the app's name, logo and id always come fresh
  if(u.origin===location.origin){e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r)));return}
  if(u.host.includes('fonts.g')||u.host==='cdnjs.cloudflare.com'||u.host==='unpkg.com'){e.respondWith(caches.open(V+'-f').then(c=>c.match(r).then(m=>m||fetch(r).then(x=>{c.put(r,x.clone());return x}))))}
});
