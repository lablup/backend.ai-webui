
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
let openPageEvent = {};
let defaultWebPreferences = "allowRunningInsecureContent=true,isBrowserView=false,javascript=true,nativeWindowOpen=yes,scrollBounce=true";

let mainAppTab = tabGroup.addTab({
    title: "Backend.AI",
    src: mainURL,
  visible: true,
    closable: false,
    active: true,
    webviewAttributes: {
      allowpopups: 'on',
      webpreferences: defaultWebPreferences
    }
});
mainAppTab.webview.addEventListener('page-title-updated', () => {
  const newTitle = mainAppTab.webview.getTitle();
  let bgColor;
  mainAppTab.setTitle(newTitle);
  switch (newTitle) {
    case 'Backend.AI - Summary':
      bgColor = '#2e7d32';
      break;
    case 'Backend.AI - Sessions':
      bgColor = '#c62828';
      break;
    case 'Backend.AI - Experiments':
      bgColor = '#0277bd';
      break;
    case 'Backend.AI - Storage':
      bgColor = '#ef6c00';
      break;
    case 'Backend.AI - Statistics':
      bgColor = '#00838f';
      break;
    case 'Backend.AI - User Credentials & Policies':
      bgColor = '#9e9d24';
      break;
    case 'Backend.AI - Environments & Presets':
      bgColor = '#f9a825';
      break;
    case 'Backend.AI - Computation Resources':
      bgColor = '#0277bd';
      break;
    case 'Backend.AI - Settings':
      bgColor = '#2e7d32';
      break;
    case 'Backend.AI - Maintenance':
      bgColor = '#ad1457';
      break;
    default:
      bgColor = '#cccccc';
  }
  document.querySelector(".etabs-tab:first-child").style.backgroundColor = bgColor;
  document.querySelector(".etabs-tab:first-child").style.color = '#efefef';
});

mainAppTab.on("webview-ready", (tab) =>{
  tab.show();
});

let mainWebView = mainAppTab.webview;
mainWebView.addEventListener('dom-ready', (e) => {
  mainWebView.executeJavaScript('window.__local_proxy="' + window.__local_proxy + '";');
  mainWebView.openDevTools();
  let mainWebViewWebContents = mainWebView.getWebContents();
  mainWebView.addEventListener('will-navigate', ({url}) => {
    console.log('navigate to', url);
  });

  mainWebViewWebContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    event.preventDefault();
    newTabWindow(event, url, frameName, disposition, options, additionalFeatures);
  });
});

function newTabWindow(event, url, frameName, disposition, options, additionalFeatures) {
  console.log('------- requested URL:', url);
  const ev = event;
  openPageEvent = event;
  console.log('event log:', ev);
  openPageURL = url;
  Object.assign(options, {
    title: "Loading...",
    frame: true,
    visible: false,
    backgroundColor: '#EFEFEF',
    closable: true,
    //src: url,
    webviewAttributes: {
      allowpopups: true,
      webpreferences: defaultWebPreferences
    },
    ready: loadURLonTab
  });
  if (frameName === 'modal') {
    options.modal = true;
  }
  let tab = tabGroup.addTab(options);
  event.newGuest = tab;
  event.newGuest.webview.addEventListener('page-title-updated', (e) => {
    const newTitle = e.target.getTitle();
    tab.setTitle(newTitle);
  });
  event.newGuest.on("webview-ready", (tab) => {
    tab.show(true);
    console.log('webview ready', tab);
    //event.newGuest = tab.webview.getWebContents();
    //console.log('new guest: ', event.newGuest);
  });
  event.newGuest.webview.addEventListener('dom-ready', (e) => {
    //console.log('from event,', ev);
    //console.log("new tab", e);
    if (openPageURL != '') {
      e.target.openDevTools();
      let newTabContents = e.target.getWebContents();
      let newURL = openPageURL;
      openPageURL = '';
      e.target.loadURL(newURL);
      newTabContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault();
        newTabWindow(event, url, frameName, disposition, options, additionalFeatures);
      });
      openPageEvent.newGuest = newTabContents.webContents;
      console.log('window? ', openPageEvent.newGuest.window);
      console.log('window22? ', openPageEvent.newGuest);
      ev.newGuest = newTabContents;
    }
  });
  event.newGuest.webview.addEventListener('did-navigate', (url) => {
    console.log('navigate to 222', url);
  });

  //event.newGuest = tab.webview.getWebContents();
  //event.newGuest = newTab.webview.getWebContents();
  //console.log("New window: ", newTab.webview);
  //return newTab.webview;
}

function loadURLonTab(tab) {
  //console.log("tab opened:", tab);
}
function showSplash() {
  mainWebView.executeJavaScript('let event = new CustomEvent("backend-ai-show-splash", {"detail": ""});' +
   '    document.dispatchEvent(event);');
}
window.showSplash = showSplash;
