if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => console.log('service worker registered'))
    .catch((err) => console.log('service worker not registered', err));
}

// Request permission and get token
document
  .getElementById('enable-notifications')
  .addEventListener('click', function () {
    messaging
      .requestPermission()
      .then(function () {
        console.log('Notification permission granted.');
        return messaging.getToken();
      })
      .then(function (token) {
        console.log('Token:', token);
      })
      .catch(function (err) {
        console.log('Unable to get permission to notify.', err);
      });
  });

// Handle incoming messages
messaging.onMessage(function (payload) {
  console.log('Message received. ', payload);
  // Customize notification here
  var notificationTitle = payload.notification.title;
  var notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };

  if (Notification.permission === 'granted') {
    var notification = new Notification(notificationTitle, notificationOptions);
    notification.onclick = function (event) {
      event.preventDefault();
      window.open(payload.notification.click_action, '_blank');
    };
  }
});
