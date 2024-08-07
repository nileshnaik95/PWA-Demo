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
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        console.log('messaging.getToken()', messaging.getToken());
        
        // messaging
        //   .getToken()
        //   .then(function (currentToken) {
        //     if (currentToken) {
        //       console.log('Token:', currentToken);
        //     } else {
        //       console.log(
        //         'No registration token available. Request permission to generate one.'
        //       );
        //     }
        //   })
        //   .catch(function (err) {
        //     console.log('An error occurred while retrieving token. ', err);
        //   });
      } else {
        console.log('Unable to get permission to notify.');
      }
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
