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

function track() {
  self.registration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      fetch('./notificationTrack?endpoint=' + subscription.endpoint).then(data => console.log(data))
    }
  });
}

self.addEventListener('notificationclick', function(event) {
  track()
  event.waitUntil(self.clients.openWindow('./'))
})