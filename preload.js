// Preload script for electron environment
const {ipcRenderer, contextBridge} = require('electron');

// FR-3620 W4: silent PDF export bridge; the renderer feature-detects this and
// falls back to window.print() when absent.
contextBridge.exposeInMainWorld('electronPrintAPI', {
  printToPDF: (defaultFileName) =>
    ipcRenderer.invoke('usage-report:print-to-pdf', defaultFileName),
});

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
