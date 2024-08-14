# PWA

## 1. Add a manifest.json file

```json
{
  "name": "Food Cart", // Name of your app, appears on the splash screen
  "short_name": "FoodCart", // Appears under the icon after install
  "start_url": "index.html",
  "display": "standalone", // Means native; other options can be "browser"
  "background_color": "FFE9D2", // Background color of the splash screen
  "theme_color": "#FFE1C4", // Color of the top bar, making it look more like a native app
  "orientation": "portrait-primary", // Opens in this mode
  "icons": [
    {
      "src": "/img/icons/icon-72x72.png",
      "type": "image/png",
      "sizes": "72x72"
    }
  ]
}
```

Add this in your html files, and you should be able to see the manifest details on the browser under Application > Manifest

```html
<link rel="manifest" href="/manifest.json" />
```

More on manifest here

```
https://web.dev/articles/add-manifest
```

## 2. Add a Service Worker

#### Why?

- Can load content offline, can still open and view the app from cached assets
- Background sync, post a status update in background when you are back online
- push notifications, firebase etc.
- Service Worker Runs in the background until the browser/app is closed

#### How?

Add in root directory, determines the scope. If placed in root then it has access to all the files.

Lifecycle of a service worker

- Install event, what should happen when the install happens, like asset caching, to be used when offline. Fires only once. Reinstall only if there is some change in the sw.js file.
- Active event, once active sw.js can access all files within it's scope, fetch requests etc. and intercept them if needed.

### Registering a service worker

#### 1. check if service workers are supported by the browser in your app.js

```js
if ('serviceWorker' in navigator) {
  //navigator is an object in js that represents the browser and information about it, this line checks if browser supports service worker
  navigator.serviceWorker
    .register('/sw.js') // registers the service worker
    .then((reg) => console.log('service worker registered'))
    .catch((err) => console.log('service worker not registered', err));
}
```

To test if it is running, you should be able to see the service worker details on the browser under Application > Service Workers

#### 2. setup the sw.js file

Install Event

```js
self.addEventListener('install', (evt) => {});
```

Active Event

```js
self.addEventListener('activate', (evt) => {});
```

Fetch Event

```js
self.addEventListener('fetch', (evt) => {
  //evt will have all the requests like css, images, api's etc
});
```

## 3. offline mode

Problem with browser cache is we cannot control it
Cache from service worker is something we can control, like what to cache and what not to

#### Pre-caching assets

images, css files etc, basically the app-shell/core design of the application.
Do this when the "Install Event" happens, because we need to cache the assets only once.

```js
const staticCacheName = 'site-static-v4';
const assets = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  'src/pages/fallback.html'
]; //all the request urls to cache

self.addEventListener('install', evt => {
//install might happen very quickly, and browser will stop the SW, but we need to wait for the caching to complete, hence we add a waitUntil method
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
        //open this cache if it exists, if does not exist then create and then open it
        cache.addAll(assets); //all the resources to be cached during install event
    });
  );
});
```

You can confirm this is done successfully by going to Application > Cache Storage

#### Getting Cached Assets

```js
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches
      .match(evt.request) //evt.request has all the details like methods:GET, url, headers etc.
      .then((cacheRes) => {
        // all the pre-cached response, stored in Application > Cache Storage
        return (
          cacheRes || // cacheRes has the assets stored in cache, if not then return the initial requests from the server(requires internet)
          fetch(evt.request) // fetched all other non-cached requests
        );
      })
  );
});
```

for versioning purpose, delete the old cache and use the new one

```js
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      //goes through all of our caches and looks for the keys
      return Promise.all(
        keys
          //if the key does not match with latest version then store it in the array
          .filter((key) => key !== staticCacheName)
          // delete that array, this keeps just one active cache version
          .map((key) => caches.delete(key))
      );
    })
  );
});
```

#### Dynamic caching

Caches pages while browsing in online mode, and caches these page data making it available later when user is offline.
So the fetch event changes in the following way

```js
const dynamicCacheName = 'site-dynamic-v4';

caches.match(evt.request).then((cacheRes) => {
  return (
    cacheRes ||
    fetch(evt.request).then((fetchRes) => {
      return caches
        .open(dynamicCacheName)
        .then((cache) => {
          //put the request urls it in the cache list, we dont modify the original result but instead store a cloned version here
          cache.put(evt.request.url, fetchRes.clone());
          return fetchRes;
        })
        .catch(() => {
          //return only if it is an actual page, otherwise if suppose there is an image which is not cached then also we will see the fallback page which is not correct
          if (evt.request.url.indexOf('.html') > -1) {
            //if a page was never visited, have a fallback page instead of the default browser message that says "This site can't be reached"
            return caches.match('/pages/fallback.html');
          }
          // can do this for different resource types, have a fallback image etc
        });
    })
  );
});
```

and under activate event we need to update the line to not delete dynamic cache during activation

```js
.filter(key => key !== staticCacheName && key !== dynamicCacheName)
```

#### Limiting cache size

to avoid over-caching and using extra resources

```js
const limitCacheSize = (name, size) => {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      //keys are all the items in the cache array
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size)); //delete the oldest item, and recall the function to check if size is finally below the size limit
      }
    });
  });
};
```

call this function where dynamic data cache list is being formed

```js
cache.put(evt.request.url, fetchRes.clone());
limitCacheSize(dynamicCacheName, 15);
```

## 4. Working with firestore DB
```js
// real-time listener
db.collection('recipes').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    //docChanges - anything that gets added and removed to the recipes DB
    if (change.type === 'added') {
      renderRecipe(change.doc.data(), change.doc.id);
    }
    if (change.type === 'removed') {
      removeRecipe(change.doc.id);
    }
  });
});
```

## 5. Indexed DB for offline data

```js
db.enablePersistence().catch(function (err) {
  // enablePersistence - data persistence
  if (err.code == 'failed-precondition') {
    // probably multible tabs open at once
    console.log('persistance failed');
  } else if (err.code == 'unimplemented') {
    // lack of browser support for the feature
    console.log('persistance not available');
  }
});
```

## 6. Push notifications

Have used firebase cloud messaging to implement push notifications, here is the link to the full documentation
https://firebase.google.com/docs/cloud-messaging/js/client

