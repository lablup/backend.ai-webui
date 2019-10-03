
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
      webpreferences:"nativeWindowOpen=yes"
      //preload: path.join(electronPath, 'preload.js'),
    }
});
let mainView = tab1.webview;
mainView.addEventListener('dom-ready', () =>{
  mainView.executeJavaScript('window.__local_proxy="'+window.__local_proxy+'";');
  mainView.openDevTools();
  let mainViewContents = mainView.getWebContents();
  console.log(mainViewContents);
  mainViewContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    console.log('new window requested');
    newTabWindow(event, url, frameName, disposition, options, additionalFeatures);
  });
});
console.log(mainView);
//console.log(tab1.webContents);

function newTabWindow(event, url, frameName, disposition, options, additionalFeatures) {
  event.preventDefault();
  Object.assign(options, {
    visible: true,
    backgroundColor: '#EFEFEF',
    //parent: win,
    closable: true,
    src: url,
    width: windowWidth,
    height: windowHeight,
    webviewAttributes: {
      nodeintegration: false,
      allowpopups: 'on',
      autosize: true,
      blinkfeatures: '',
      webpreferences:"nativeWindowOpen=yes"
    }
  });
  if (frameName === 'modal') {
    options.modal = true;
  }
  console.log(url);
  let newTab = tabGroup.addTab(options);
  //newTab.webview.loadURL(url);
  newTab.webview.addEventListener('page-title-updated', () => {
    const newTitle = newTab.webview.getTitle();
    newTab.setTitle(newTitle);
  });
  newTab.webview.addEventListener('dom-ready', () => {
    console.log('added');
    let newTabContents = newTab.webview.getWebContents();
    newTabContents.on('new-window',(event, url, frameName, disposition, options, additionalFeatures) => {
      newTabWindow(event, url, frameName, disposition, options, additionalFeatures);
    });
  });

  //event.newGuest.webContents.on('new-window',(event, url, frameName, disposition, options, additionalFeatures) => {
  //  newPopupWindow(event, url, frameName, disposition, options, additionalFeatures, event.newGuest);
  //});
  //event.newGuest.on('close', (e) => {
  //  let c = BrowserWindow.getFocusedWindow();
   // c.destroy();
  //});
}
//mainView.loadURL(mainURL);
