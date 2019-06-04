const { ipcRenderer } = require('electron')

process.once('loaded', () => {
  ipcRenderer.once('proxy-ready', (event, proxy_url) => {
    window.__local_proxy = proxy_url;
  })
  ipcRenderer.send('ready')
})
