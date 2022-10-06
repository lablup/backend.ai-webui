// Preload script for electron environment
const {contextBridge, ipcRenderer} = require('electron');
global.appRoot = window.appRoot = __dirname;

process.once('loaded', () => {
  contextBridge.exposeInMainWorld('electronAPI', {
    appSettings: (callback) => ipcRenderer.on('app-settings', callback)
  });

  ipcRenderer.on('proxy-ready', (event, proxy_url) => {
    window.__local_proxy = proxy_url;
  });

  ipcRenderer.on('app-close-window', _ => {
    let event = new CustomEvent('backend-ai-app-close', {'detail': ''});
    document.dispatchEvent(event);
    setTimeout(function() {
      ipcRenderer.send('app-closed');
    }, 1000);
  });
});
