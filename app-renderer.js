/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
const {ipcRenderer} = require('electron');
const url = require('url');
const path = require('path');
let TabGroup;
let serveMode = 'dev';
let siteDescription = 'TEST';
let debugMode = true;
if (serveMode === 'dev') {
  mainIndex = 'build/electron-app/app/index.html';
  TabGroup = require("./tab");
  //TabGroup = require("electron-tabs");
} else { // Production
  mainIndex = 'app/index.html';
  TabGroup = require("./tab");

  //const dragula = require("../../node_modules/dragula");
  //TabGroup = require("electron-tabs");
}
const dragula = require("dragula");

if (siteDescription !== '') {
  document.querySelector('#description').innerHTML = siteDescription;
}

mainURL = url.format({
  pathname: path.join(mainIndex),
  protocol: 'file',
  slashes: true
});

let openPageURL = '';
let defaultWebPreferences = "allowRunningInsecureContent,nativeWindowOpen=yes";

let tabGroup = new TabGroup({
  ready: function (tabGroup) {
    dragula([tabGroup.tabContainer], {
      direction: "horizontal"
    });
  }
});
let mainAppTab = tabGroup.addTab({
  title: "Backend.AI",
  src: mainURL,
  visible: true,
  closable: false,
  active: true,
  webviewAttributes: {
    allowpopups: 'on',
    nativewindowopen: 'yes',
    webpreferences: defaultWebPreferences
  }
});
mainAppTab.webview.addEventListener('page-title-updated', () => {
  const newTitle = mainAppTab.webview.getTitle();
  let bgColor;
  switch (newTitle) {
    case 'Backend.AI':
      bgColor = '#2e7d32';
      break;
    case 'Backend.AI - Summary':
      bgColor = '#2e7d32';
      break;
    case 'Backend.AI - Sessions':
      bgColor = '#c62828';
      break;
    case 'Backend.AI - Experiments':
      bgColor = '#0277bd';
      break;
    case 'Backend.AI - Data & Storage':
      bgColor = '#ef6c00';
      break;
    case 'Backend.AI - Statistics':
      bgColor = '#00838f';
      break;
    case 'Backend.AI - Settings & Logs':
      bgColor = '#00695c';
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
    case 'Backend.AI - Information':
      bgColor = '#6a1b9a';
      break;
    default:
      bgColor = '#cccccc';
  }
  mainAppTab.setTitle(newTitle.replace("Backend.AI - ", ""));
  document.querySelector(".etabs-tab:first-child").style.background = bgColor;
  document.querySelector(".etabs-tab:first-child").style.color = '#efefef';
});

mainAppTab.on("webview-ready", (tab) => {
  tab.show();
});

let mainWebView = mainAppTab.webview;
mainWebView.addEventListener('dom-ready', (e) => {
  mainWebView.executeJavaScript('window.__local_proxy="' + window.__local_proxy + '";');
  if (debugMode === true) {
    mainWebView.openDevTools();
  }
  let mainWebViewWebContents = mainWebView.getWebContents();
  mainWebView.addEventListener('will-navigate', ({url}) => {
    console.log('navigate to', url);
  });

  mainWebViewWebContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    newTabWindow(event, url, frameName, disposition, options, additionalFeatures);
  });
});

function newTabWindow(event, url, frameName, disposition, options, additionalFeatures) {
  let guestInstanceId = options && options.webPreferences && options.webPreferences.guestInstanceId;
  event.preventDefault();
  openPageURL = url;
  Object.assign(options, {
  //let local_options = {
    title: "Loading...",
    frame: true,
    visible: true,
    backgroundColor: '#efefef',
    closable: true,
    webviewAttributes: {
      allowpopups: true,
      nativewindowopen: 'yes',
      webpreferences: defaultWebPreferences
    },
    ready: loadURLonTab
  });
  if (url !== '') {
    options['src'] = url;
  } else {
    options['src'] = "";
  }
  options.webviewAttributes['data-guest-instance-id'] = guestInstanceId;
  let tab = tabGroup.addTab(options);
  const newTabWebView = tab.webview;
  newTabWebView.addEventListener('page-title-updated', (e) => {
    let title = e.target.getTitle();
    if (title.length > 25) {
      title = title.substring(0, 20) + '...';
      tab.setTitle(title);
    }
    tab.setTitle(title);
  });
  tab.on("title-changed", (title, tab) => {
    if (title.length > 25) {
      title = title.substring(0, 20) + '...';
      tab.setTitle(title);
    }
  });
  tab.on("webview-ready", (tab) => {
  });
  newTabWebView.addEventListener('dom-ready', (e) => {
    if (debugMode === true) {
      e.target.openDevTools();
    }
    let newTabContents = e.target.getWebContents();
    newTabContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
      return newTabWindow(event, url, frameName, disposition, options, additionalFeatures);
    });
  });
  newTabWebView.addEventListener('did-finish-load', () => {
  });
  newTabWebView.addEventListener('did-navigate', (e) => {
  });
  newTabWebView.addEventListener('will-navigate', (e) => {
  });
  newTabWebView.addEventListener('page-favicon-updated', (e) => {
    tab.setIcon(e.favicons[0]);
  });
  return newTabWebView;
}

function loadURLonTab(tab) {
}

function showSplash() {
  mainWebView.executeJavaScript('let event = new CustomEvent("backend-ai-show-splash", {"detail": ""});' +
    '    document.dispatchEvent(event);');
}

window.showSplash = showSplash;
