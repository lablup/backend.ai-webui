/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
const {app, Menu, shell, BrowserWindow, protocol, clipboard, dialog, ipcMain} = require('electron');
process.env.electronPath = app.getAppPath();
function isDev() {
  return process.argv[2] == '--dev';
}
let debugMode = true;
if (isDev()) { // Dev mode from Makefile
  process.env.serveMode = 'dev'; // Prod OR debug
} else {
  process.env.serveMode = 'prod'; // Prod OR debug
  debugMode = false;
}
process.env.liveDebugMode = false; // Special flag for live server debug.
const url = require('url');
const path = require('path');
const toml = require('markty-toml');
const nfs = require('fs');
const npjoin = require('path').join;
const BASE_DIR = __dirname;
let ProxyManager; let versions; let es6Path; let electronPath; let mainIndex;
if (process.env.serveMode == 'dev') {
  ProxyManager = require('./build/electron-app/app/wsproxy/wsproxy.js');
  versions = require('./version');
  es6Path = npjoin(__dirname, 'build/electron-app/app'); // ES6 module loader with custom protocol
  electronPath = npjoin(__dirname, 'build/electron-app');
  mainIndex = 'build/electron-app/app/index.html';
} else {
  ProxyManager = require('./app/wsproxy/wsproxy.js');
  versions = require('./app/version');
  es6Path = npjoin(__dirname, 'app'); // ES6 module loader with custom protocol
  electronPath = npjoin(__dirname);
  mainIndex = 'app.html';
}
const windowWidth = 1280;
const windowHeight = 970;

protocol.registerSchemesAsPrivileged([
  {scheme: 'es6', privileges: {standard: true, secure: true, bypassCSP: true}}
]);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let mainContent;
let devtools;
const manager = new ProxyManager();
let mainURL;

// Modules to control application life and create native browser window
app.once('ready', function() {
  let template;
  if (process.platform === 'darwin') {
    template = [
      {
        label: 'Backend.AI',
        submenu: [
          {
            label: 'About Backend.AI Desktop',
            click: function() {
              mainContent.executeJavaScript('let event = new CustomEvent("backend-ai-show-splash", {"detail": ""});' +
                '    document.dispatchEvent(event);');
            }
          },
          {
            label: 'App version ' + versions.package +' (rev.' + versions.revision + ')',
            click: function() {
              clipboard.writeText(versions.package +' (rev.' + versions.revision + ')');
              const response = dialog.showMessageBox({type: 'info', message: 'Version information is copied to clipboard.'});
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Refresh App',
            accelerator: 'Command+R',
            click: function() {
              // mainContent.reloadIgnoringCache();
              const proxyUrl = `http://localhost:${manager.port}/`;
              mainWindow.loadURL(url.format({ // Load HTML into new Window
                pathname: path.join(mainIndex),
                protocol: 'file',
                slashes: true
              }));
              mainContent.executeJavaScript(`window.__local_proxy = '${proxyUrl}'`);
              console.log('Re-connected to proxy: ' + proxyUrl);
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            label: 'Hide Backend.AI Console',
            accelerator: 'Command+H',
            selector: 'hide:'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          },
          {
            label: 'Show All',
            selector: 'unhideAllApplications:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function () {
              app.quit();
            }
          },
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: 'Command+Z',
            selector: 'undo:'
          },
          {
            label: 'Redo',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Cut',
            accelerator: 'Command+X',
            selector: 'cut:'
          },
          {
            label: 'Copy',
            accelerator: 'Command+C',
            selector: 'copy:'
          },
          {
            label: 'Paste',
            accelerator: 'Command+V',
            selector: 'paste:'
          },
          {
            label: 'Select All',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          },
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Zoom In',
            accelerator: 'Command+=',
            role: 'zoomin'
          },
          {
            label: 'Zoom Out',
            accelerator: 'Command+-',
            role: 'zoomout'
          },
          {
            label: 'Actual Size',
            accelerator: 'Command+0',
            role: 'resetzoom'
          },
          {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click: function() {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
              }
            }
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          },
          {
            label: 'Close',
            accelerator: 'Command+W',
            selector: 'performClose:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Bring All to Front',
            selector: 'arrangeInFront:'
          },
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Online Manual',
            click: function() {
              shell.openExternal('https://webui.docs.backend.ai/');
            }
          },
          {
            label: 'Backend.AI Project Site',
            click: function() {
              shell.openExternal('https://www.backend.ai/');
            }
          }
        ]
      }
    ];
  } else {
    template = [
      {
        label: '&File',
        submenu: [
          {
            label: 'Refresh App',
            accelerator: 'CmdOrCtrl+R',
            click: function() {
              const proxyUrl = `http://localhost:${manager.port}/`;
              mainWindow.loadURL(url.format({ // Load HTML into new Window
                pathname: path.join(mainIndex),
                protocol: 'file',
                slashes: true
              }));
              mainContent.executeJavaScript(`window.__local_proxy = '${proxyUrl}'`);
              console.log('Re-connected to proxy: ' + proxyUrl);
            }
          },
          {
            type: 'separator'
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: function() {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.close();
              }
            }
          },
        ]
      },
      {
        label: '&View',
        submenu: [
          {
            label: 'Zoom In',
            accelerator: 'CmdOrCtrl+=',
            role: 'zoomin'
          },
          {
            label: 'Zoom Out',
            accelerator: 'CmdOrCtrl+-',
            role: 'zoomout'
          },
          {
            label: 'Actual Size',
            accelerator: 'CmdOrCtrl+0',
            role: 'resetzoom'
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            role: 'togglefullscreen'
          },
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Online Manual',
            click: function() {
              shell.openExternal('https://webui.docs.backend.ai/');
            }
          },
          {
            label: 'Backend.AI Project Site',
            click: function() {
              shell.openExternal('https://www.backend.ai/');
            }
          }
        ]
      }
    ];
  }

  var appmenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(appmenu);
});


function createWindow() {
  // Create the browser window.
  devtools = null;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    title: 'Backend.AI',
    frame: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: true,
      webviewTag: true,
      preload: path.join(electronPath, 'preload.js'),
      devTools: (debugMode === true),
      worldSafeExecuteJavaScript: false,
      contextIsolation: false
    }
  });
  // and load the index.html of the app.
  if (process.env.liveDebugMode === true) {
    // Load HTML into new Window (dynamic serving for develop)
    mainWindow.loadURL(url.format({
      pathname: '127.0.0.1:9081',
      protocol: 'http',
      slashes: true
    }));
  } else {
    // Load HTML into new Window (file-based serving)
    nfs.readFile(path.join(es6Path, 'config.toml'), 'utf-8', (err, data) => {
      if (err) {
        console.log('No configuration file found.');
        return;
      }
      const config = toml(data);
      if ('wsproxy' in config && 'disableCertCheck' in config.wsproxy && config.wsproxy.disableCertCheck == true) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }
      if ('server' in config && 'webServerURL' in config.server && config.server.webServerURL != '') {
        mainURL = config.server.webServerURL;
      } else {
        mainURL = url.format({
          pathname: path.join(mainIndex),
          protocol: 'file',
          slashes: true
        });
      }
      if ('general' in config && 'siteDescription' in config.general) {
        process.env.siteDescription = config.general.siteDescription;
      } else {
        process.env.siteDescription = '';
      }
      mainWindow.loadURL(mainURL);
    });
  }
  mainContent = mainWindow.webContents;
  if (debugMode === true) {
    devtools = new BrowserWindow();
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    mainWindow.webContents.openDevTools({mode: 'detach'});
  }
  // Emitted when the window is closed.
  mainWindow.on('close', (e) => {
    if (mainWindow) {
      e.preventDefault();
      mainWindow.webContents.send('app-close-window');
    }
  });

  mainWindow.webContents.once('did-finish-load', () => {
    manager.once('ready', () => {
      const url = 'http://localhost:' + manager.port + '/';
      console.log('Proxy is ready:' + url);
      mainWindow.webContents.send('proxy-ready', url);
    });
    manager.start();
  });

  ipcMain.on('app-closed', (_) => {
    if (process.platform !== 'darwin') { // Force close app when it is closed even on macOS.
      // app.quit()
    }
    mainWindow = null;
    mainContent = null;
    devtools = null;
    app.quit();
  });
  mainWindow.on('closed', function() {
    mainWindow = null;
    mainContent = null;
    devtools = null;
  });

  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    newPopupWindow(event, url, frameName, disposition, options, additionalFeatures, mainWindow);
  });
}

function newPopupWindow(event, url, frameName, disposition, options, additionalFeatures, win) {
  event.preventDefault();
  Object.assign(options, {
    frame: true,
    show: false,
    backgroundColor: '#efefef',
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
  event.newGuest = new BrowserWindow(options);
  event.newGuest.once('ready-to-show', () => {
    event.newGuest.show();
  });
  event.newGuest.loadURL(url);
  event.newGuest.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    newPopupWindow(event, url, frameName, disposition, options, additionalFeatures, event);
  });
  event.newGuest.on('close', (e) => {
    const c = BrowserWindow.getFocusedWindow();
    if (c !== null) {
      c.destroy();
    }
  });
}

app.on('ready', () => {
  protocol.interceptFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7); /* all urls start with 'file://' */
    const extension = url.split('.').pop();
    const options = {path: path.normalize(`${BASE_DIR}/${url}`)};
    callback(options);
  }, (err) => {
    if (err) console.error('Failed to register protocol');
  });
  // Force mime-type to javascript
  protocol.registerBufferProtocol('es6', (req, cb) => {
    nfs.readFile(
        npjoin(es6Path, req.url.replace('es6://', '')),
        (e, b) => {
          cb({mimeType: 'text/javascript', data: b});
        }
    );
  });
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (mainWindow) {
    e.preventDefault();
    mainWindow.webContents.send('app-close-window');
  }
});


app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
app.on('certificate-error', function(event, webContents, url, error,
    certificate, callback) {
  event.preventDefault();
  callback(true);
});
// Let windows without node integration
app.on('web-contents-created', (event, contents) => {
  if (contents.getType() === 'webview') {
    contents.on('new-window', function (newWindowEvent, url) {
      newWindowEvent.preventDefault();
      newWindowEvent.newGuest = newWindowEvent.sender;
    });
  }
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    delete webPreferences.preloadURL;
    //webPreferences.nativeWindowOpen = true;
    // Disable Node.js integration
    webPreferences.nodeIntegration = false;
  });
});
