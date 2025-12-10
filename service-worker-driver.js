window.isUpdateAvailable = new Promise(function(resolve, reject) {
  if ('serviceWorker' in navigator && ['localhost', '127.0.0.1'].indexOf(location.hostname) === -1) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('service-worker.js').then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            switch (installingWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  // new update available
                  return Promise.resolve(true);
                } else {
                  // no update available
                  return Promise.resolve(false);
                }
                break;
            }
          };
        };
      }).catch(function() {
        return undefined;
      });
    });
  }
});
window['isUpdateAvailable']
    .then((isAvailable) => {
      if (isAvailable) {
        document.addEventListener('backend-ai-connected', (e) => {
          document.querySelector('#webui-shell').showUpdateNotifier();
        });
      }
    });
