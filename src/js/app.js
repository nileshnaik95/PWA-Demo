if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => console.log('service worker registered'))
    .catch((err) => console.log('service worker not registered', err));

  navigator.serviceWorker
    .register('../firebase-messaging-sw.js')
    .then((reg) => console.log('firebase service worker registered'))
    .catch((err) => console.log('firebase service worker not registered', err));
}

// Request permission and get token
document
  .getElementById('enable-notifications')
  .addEventListener('click', function () {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        messaging.getToken({ vapidKey: 'BNAEQxGLlsNnwinPpiN7KpJKfKG8wCBILBz5xAkQf9AjTLMbkTkf365pXxVAPtEdQkysfCqCC34zzEFNrEsGaNA' }).then((currentToken) => {
          if (currentToken) {
            console.log('currentToken', currentToken);
            // Send the token to your server and update the UI if necessary
          } else {
            // Show permission request UI
            console.log('No registration token available. Request permission to generate one.');
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
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
