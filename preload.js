// Preload script for electron environment
const {ipcRenderer, contextBridge} = require('electron');

process.once('loaded', () => {
  ipcRenderer.on('proxy-ready', (event, proxy_url) => {
	contextBridge.exposeInMainWorld('__local_proxy', {
	  url: proxy_url
    });
  });

  ipcRenderer.on('app-close-window', _ => {
    let event = new CustomEvent('backend-ai-app-close', {'detail': ''});
    document.dispatchEvent(event);
    setTimeout(function() {
      ipcRenderer.send('app-closed');
    }, 1000);
  });
});
