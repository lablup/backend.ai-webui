
const TabGroup = require("electron-tabs");
const { ipcRenderer } = require('electron');
const url = require('url');
const path = require('path');
let windowWidth = 1280;
let windowHeight = 970;

mainIndex = 'build/electron-app/app/index.html';
const electronPath = path.join(__dirname, 'build/electron-app');

mainURL = url.format({
  pathname: path.join(mainIndex),
  protocol: 'file',
  slashes: true
});

let tabGroup = new TabGroup();

let tab1 = tabGroup.addTab({
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
      //preload: path.join(electronPath, 'preload.js'),
    }
});
let mainView = tab1.webview;
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
  Object.assign(options, {
    title: "Preparing...",
    visible: true,
    backgroundColor: '#EFEFEF',
    closable: true,
    src: url,
    width: windowWidth,
    height: windowHeight,
    webviewAttributes: {
      nodeintegration: false,
      allowpopups: 'on',
      autosize: true,
      blinkfeatures: '',
      webpreferences:"nativeWindowOpen=true"
    }
  });
  if (frameName === 'modal') {
    options.modal = true;
  }
  let newTab = tabGroup.addTab(options);
  newTab.webview.addEventListener('page-title-updated', () => {
    const newTitle = newTab.webview.getTitle();
    newTab.setTitle(newTitle);
  });
  newTab.webview.addEventListener('dom-ready', () => {
    let newTabContents = newTab.webview.getWebContents();
    newTabContents.on('new-window',(event, url, frameName, disposition, options) => {
      event.preventDefault();
      newTabWindow(event, url, frameName, disposition, options);
    });
  });

  return false;
}
