importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyAiLboPaKcUEQsJPpxcgbV-5eArOBbRvAY',
  authDomain: 'foodcart-9d5b7.firebaseapp.com',
  projectId: 'foodcart-9d5b7',
  storageBucket: 'foodcart-9d5b7.appspot.com',
  messagingSenderId: '173849797247',
  appId: '1:173849797247:web:a82e3f7ae368864c6d954a',
  measurementId: 'G-ZBR1C73CJW'
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './img/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});