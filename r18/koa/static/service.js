console.log('service work registered===')
self.addEventListener('push', function(event) {
  let {
    count,
    thumb,
    code,
    title,
    zhTitle
  } = JSON.parse(event.data.text());
  
  event.waitUntil(self.registration.showNotification(`${count} VR videos updated at jvrlibrary!`, {
    body: code + ' ' + title,
    badge: thumb,
    image: thumb
  }));
});

self.addEventListener('notificationclick', function(event) {
  event.waitUntil(self.clients.openWindow('./'))
})