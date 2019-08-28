const { ipcRenderer } = require('electron')

process.once('loaded', () => {
  ipcRenderer.on('proxy-ready', (event, proxy_url) => {
    window.__local_proxy = proxy_url;
  });

  ipcRenderer.on('app-close-window', _ => {
    let event = new CustomEvent("backend-ai-logout", {"detail": ""});
    document.dispatchEvent(event);
    setTimeout(function () {
      ipcRenderer.send('app-closed');
    }, 1000);
  });
});
