
const TabGroup = require("electron-tabs");
const url = require('url');
const path = require('path');

mainIndex = 'build/electron-app/app/index.html';
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
    active: true
});
let mainView = tab1.webview;
console.log(mainView);

tab1.webview.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
  newPopupWindow(event, url, frameName, disposition, options, additionalFeatures, tab1);
});

function newPopupWindow(event, url, frameName, disposition, options, additionalFeatures, win) {
  event.preventDefault();
  Object.assign(options, {
    frame: true,
    show: false,
    backgroundColor: '#EFEFEF',
    //parent: win,
    titleBarStyle: '',
    width: windowWidth,
    height: windowHeight,
    closable: true
  });
  Object.assign(options.webPreferences, {
    preload: '',
    isBrowserView: false,
    javascript: true
  });
  if (frameName === 'modal') {
    options.modal = true;
  }
  let newTab = tabGroup.addTab(options);
  newTab.once('ready-to-show', () => {
    newTab.show()
  });
  newTab.webview.loadURL(url);
  //event.newGuest.webContents.on('new-window',(event, url, frameName, disposition, options, additionalFeatures) => {
  //  newPopupWindow(event, url, frameName, disposition, options, additionalFeatures, event.newGuest);
  //});
  //event.newGuest.on('close', (e) => {
  //  let c = BrowserWindow.getFocusedWindow();
   // c.destroy();
  //});
}
//mainView.loadURL(mainURL);

let tab2 = tabGroup.addTab({
    title: "Local File",
    src: "./local.html",
    visible: true,
    // If the page needs to access Node.js modules, be sure to
    // enable the nodeintegration
    webviewAttributes: {
        nodeintegration: true
    }
});
