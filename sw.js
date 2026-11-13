/* Planora PWA v1: kullanıcı verileri ve oturumlar kesinlikle önbelleğe alınmaz. */
const CACHE='planora-offline-v2';
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

/* iOS home-screen and desktop Web Push notifications. */
self.addEventListener('push',event=>{
 let payload={};
 try{payload=event.data?.json()||{}}catch{payload={body:event.data?.text()||''}}
 const title=String(payload.title||'Planora hatırlatması').slice(0,120);
 const options={
  body:String(payload.body||'Hatırlatma zamanı geldi.').slice(0,200),
  icon:'./icon-192.png',
  badge:'./icon-192.png',
  tag:'planora-due-'+String(payload.id||'reminder'),
  renotify:true,
  data:{url:'/planora/'}
 };
 event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const all=await clients.matchAll({type:'window',includeUncontrolled:true});
  const existing=all.find(c=>new URL(c.url).pathname.startsWith('/planora/'));
  if(existing){await existing.focus();return}
  await clients.openWindow('/planora/');
 })());
});
