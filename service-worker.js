this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        // '/deps-build.js',

        '/assets/styles.css',
        '/assets/no-signal.jpg',
        '/assets/bgk-pattern.png',

        '/assets/visual-fiha.svg',
        '/assets/zeropaper-fat.svg',

        '/assets/sky1/sky1-back.png',
        '/assets/sky1/sky1-front.png',
        '/assets/sky1/sky1-front-cache.png',
        '/assets/sky1/sky1-middle.png',
        '/assets/sky1/sky1-back-grey.png',
        '/assets/sky1/sky1-front-grey.png',
        '/assets/sky1/sky1-front-cache-grey.png',
        '/assets/sky1/sky1-middle-grey.png',

        '/assets/sky2/sky2-back.png',
        '/assets/sky2/sky2-front.png'
      ]);
    })
  );
});

this.addEventListener('fetch', function(event) {
  var response;
  event.respondWith(caches.match(event.request).catch(function() {
    return fetch(event.request);
  }).then(function(r) {
    response = r;
    caches.open('v1').then(function(cache) {
      cache.put(event.request, response);
    });
    return response.clone();
  }).catch(function() {
    return caches.match('/assets/no-signal.jpg');
  }));
});