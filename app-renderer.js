
const TabGroup = require("electron-tabs");
const { remote, ipcRenderer } = require('electron');
const url = require('url');
const path = require('path');
if (remote.process.env.serveMode == 'dev') {
  mainIndex = 'build/electron-app/app/index.html';
} else { // Production
  mainIndex = 'app/index.html';
}

if (remote.process.env.siteDescription != '') {
  document.querySelector('#description').innerHTML = remote.process.env.siteDescription;
}

mainURL = url.format({
  pathname: path.join(mainIndex),
  protocol: 'file',
  slashes: true
});

let tabGroup = new TabGroup();

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
  Object.assign(options, {
    title: "Preparing...",
    visible: true,
    backgroundColor: '#EFEFEF',
    closable: true,
    src: url,
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
function showSplash() {
  //let code = 'console.log(document);let event = new CustomEvent("backend-ai-show-splash", {"detail": ""});console.log(event);console.log("test");document.dispatchEvent(event);';
  //console.log(mainView);
  //console.log(code);
  //mainView.executeJavaScript(code);
  mainView.executeJavaScript('let event = new CustomEvent("backend-ai-show-splash", {"detail": ""});' +
   '    document.dispatchEvent(event);');
}
window.showSplash = showSplash;
