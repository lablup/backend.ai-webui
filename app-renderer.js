
const TabGroup = require("electron-tabs");
const { remote, ipcRenderer } = require('electron');
const url = require('url');
const path = require('path');
if (remote.process.env.serveMode === 'dev') {
  mainIndex = 'build/electron-app/app/index.html';
} else { // Production
  mainIndex = 'app/index.html';
}

if (remote.process.env.siteDescription !== '') {
  document.querySelector('#description').innerHTML = remote.process.env.siteDescription;
}

mainURL = url.format({
  pathname: path.join(mainIndex),
  protocol: 'file',
  slashes: true
});

let tabGroup = new TabGroup();
let openPageURL = '';
let mainAppTab = tabGroup.addTab({
    title: "Backend.AI",
    src: mainURL,
    visible: true,
    closable: false,
    active: true,
    webviewAttributes: {
      nodeintegration: false,
      allowpopups: 'on',
      autosize: true,
      blinkfeatures: '',
      webpreferences:"nativeWindowOpen=true"
    }
});
mainAppTab.webview.addEventListener('page-title-updated', () => {
  const newTitle = mainAppTab.webview.getTitle();
  mainAppTab.setTitle(newTitle);
});

let mainView = mainAppTab.webview;
mainView.addEventListener('dom-ready', () =>{
  mainView.executeJavaScript('window.__local_proxy="'+window.__local_proxy+'";');
  //mainView.openDevTools();
  let mainViewContents = mainView.getWebContents();
  mainView.addEventListener('will-navigate', ({url}) => {
    console.log('navigate to', url);
  });

  mainViewContents.on('new-window', (event, url, frameName, disposition, options) => {
    event.preventDefault();
    newTabWindow(event, url, frameName, disposition, options);
  });
});

function newTabWindow(event, url, frameName, disposition, options) {
  console.log('requested URL:', url);
  openPageURL = url;
  Object.assign(options, {
    title: "Preparing...",
    frame: true,
    visible: true,
    backgroundColor: '#EFEFEF',
    closable: true,
    src: url,
    webviewAttributes: {
      nodeintegration: false,
      allowpopups: 'on',
      autosize: true,
      blinkfeatures: '',
      //webviewTag: true,
      webpreferences: "allowRunningInsecureContent,preload='',isBrowserView=false,javascript=true,nativeWindowOpen=true"
    },
    ready: loadURLonTab
  });
  if (frameName === 'modal') {
    options.modal = true;
  }
  let newTab = tabGroup.addTab(options);
  newTab.webview.addEventListener('page-title-updated', () => {
    const newTitle = newTab.webview.getTitle();
    newTab.setTitle(newTitle);
  });
  newTab.webview.addEventListener('dom-ready', (e) => {
    console.log(e);
    if (openPageURL !== '') {
      let newTabContents = newTab.webview.getWebContents();
      let newURL = openPageURL;
      openPageURL = '';
      newTab.webview.loadURL(newURL);
      newTabContents.on('new-window', (event, url, frameName, disposition, options) => {
        event.preventDefault();
        newTabWindow(event, url, frameName, disposition, options);
      });
    }
  });
  return true;
}

function loadURLonTab(tab) {
  //console.log("tab opened:", tab);
}
function showSplash() {
  mainView.executeJavaScript('let event = new CustomEvent("backend-ai-show-splash", {"detail": ""});' +
   '    document.dispatchEvent(event);');
}
window.showSplash = showSplash;
