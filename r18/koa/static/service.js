console.log('service work registered===')
self.addEventListener('push', function(event) {
  let {
    count,
    thumb,
    code,
    title,
    zhTitle,
    thumbSmall
  } = JSON.parse(event.data.text());
  
  event.waitUntil(self.registration.showNotification(`${count} VR videos updated at jvrlibrary!`, {
    body: code + ' ' + title,
    badge: thumb,
    image: thumb,
    icon: thumbSmall || thumb
  }));
});

function track() {
  self.registration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      fetch('/api/notificationTrack?endpoint=' + encodeURIComponent(subscription.endpoint)).then(data => console.log(data))
    }
  });
}

self.addEventListener('notificationclick', function(event) {
  track()
  event.waitUntil(self.clients.openWindow('./'))
})