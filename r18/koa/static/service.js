console.log('service work registered===')
self.addEventListener('push', function(event) {
  console.log('hahahahaha',event)
  event.waitUntil(self.registration.showNotification('News From Jvrlibrary.com', {
    body: 'News From Jvrlibrary.com'
  }));
});