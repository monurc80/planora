/* Planora PWA v1: kullanıcı verileri ve oturumlar kesinlikle önbelleğe alınmaz. */
const CACHE='planora-offline-v1';
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.add('./offline.html')));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('planora-offline-')&&key!==CACHE).map(key=>caches.delete(key))))]));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.mode!=='navigate'||request.method!=='GET')return;
 event.respondWith(fetch(request).catch(()=>caches.match('./offline.html')));
});
