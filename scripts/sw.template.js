const VERSION='wfk-public-__BUILD__';
const SHELL=['/offline.html','/fonts/nunito.woff2','/offline.css','/offline.js','/offline-games.js','/offline-srs.js','/offline-parent.js','/offline-identity.js','/offline-prepared-ipa.js','/offline-pronunciation.js','/open-illustrations.js','/illustrations/fox.svg','/icons/app-192.png','/icons/app-512.png',...['apple','bag','banana','bird','book','bread','car','cat','chair','desk','dog','egg','eraser','fish','glue','grapes','milk','notebook','orange','pen','pencil','ruler','scissors','shelf','sun','tree','water'].map(name=>`/illustrations/${name}.svg`)];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(async cache=>{for(const path of SHELL)await cache.add(path);})));
// Updates activate only after every existing tab closes; never interrupt an unsaved lesson.
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if((key.startsWith('wfk-public-')&&key!==VERSION)||key==='wfk-ocr-v1')await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(url.origin!==self.location.origin||event.request.method!=='GET')return;

 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/offline.html')));return;}
 // Only public assets. No API, RSC, document HTML, account content or remote resources.
 if(SHELL.includes(url.pathname)||/^\/illustrations\/online\/[A-F0-9-]+$/.test(url.pathname)||/^\/illustrations\/(?:[a-z-]+|openmoji\/[A-F0-9-]+)\.svg$/.test(url.pathname)){event.respondWith((async()=>{const cached=await caches.match(event.request);if(cached)return cached;const response=await fetch(event.request);if(response.ok){const cache=await caches.open(VERSION);await cache.put(event.request,response.clone());}return response;})());}
});
