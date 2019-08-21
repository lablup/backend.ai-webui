const { ipcRenderer } = require('electron')

process.once('loaded', () => {
  ipcRenderer.once('proxy-ready', (event, proxy_url) => {
    window.__local_proxy = proxy_url;
  });
  ipcRenderer.send('ready');

  ipcRenderer.on('app-close-window', _ => {
    let event = new CustomEvent("backend-ai-logout", {"detail": ""});
    document.dispatchEvent(event);
    setTimeout(function () {
      ipcRenderer.send('app-closed');
    }, 1000);
  });
});
