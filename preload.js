// Preload script for electron environment
const {ipcRenderer} = require('electron');
global.appRoot = window.appRoot = __dirname;

process.once('loaded', () => {
  ipcRenderer.on('proxy-ready', (event, proxy_url) => {
    window.__local_proxy = proxy_url;
  });

  ipcRenderer.on('app-close-window', _ => {
    let event = new CustomEvent("backend-ai-app-close", {"detail": ""});
    document.dispatchEvent(event);
    setTimeout(function () {
      ipcRenderer.send('app-closed');
    }, 1000);
  });
});
