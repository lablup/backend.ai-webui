// Modules to control application life and create native browser window / Local tester file
const {app, Menu, shell, BrowserWindow, protocol, clipboard, dialog, ipcMain} = require('electron');
process.env.electronPath = app.getAppPath();
const url = require('url');
const path = require('path');
const toml = require('markty-toml');
const BASE_DIR = __dirname;
const ProxyManager = require('./build/electron-app/app/wsproxy/wsproxy.js');
const versions = require('./version');
process.env.liveDebugMode = false;
let windowWidth = 1280;
let windowHeight = 970;

// ES6 module loader with custom protocol
const nfs = require('fs');
const npjoin = require('path').join;
const es6Path = npjoin(__dirname, 'build/electron-app/app');
protocol.registerSchemesAsPrivileged([
  { scheme: 'es6', privileges: {  standard: true, secure: true, bypassCSP: true } }
]);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let mainContent;
let devtools;
let manager = new ProxyManager();
// reference to the app directory. It will merge into local test / electron app version
var mainIndex = 'build/electron-app/app/index.html';
let mainURL;

app.once('ready', function() {
  var template;
  if (process.platform === 'darwin') {
    template = [
      {
        label: 'Backend.AI',
        submenu: [
          {
            label: 'About Backend.AI Console',
            click: function () {
              mainContent.executeJavaScript('let event = new CustomEvent("backend-ai-show-splash", {"detail": ""});' +
                '    document.dispatchEvent(event);');
            }
          },
          {
            label: 'App version ' + versions.package +' (rev.' + versions.revision + ')',
            click: function () {
              clipboard.writeText(versions.package +' (rev.' + versions.revision + ')');
              const response = dialog.showMessageBox({type:'info', message:'Version information is copied to clipboard.'});
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Login',
            click: function() {
              mainWindow.loadURL(url.format({ // Load HTML into new Window
                pathname: path.join(mainIndex),
                protocol: 'file',
                slashes: true
              }));
            }
          },
          {
            label: 'Logout',
            click: function () {
              mainContent.executeJavaScript('let event = new CustomEvent("backend-ai-logout", {"detail": ""});' +
                '    document.dispatchEvent(event);');
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Force Update Screen',
            click: function () {
              mainContent.reloadIgnoringCache();
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
            click: function() {
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
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow && focusedWindow.webContents) {
                focusedWindow.webContents.executeJavaScript('_zoomIn()');
              }
            }
          },
          {
            label: 'Zoom Out',
            accelerator: 'Command+-',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow && focusedWindow.webContents) {
                focusedWindow.webContents.executeJavaScript('_zoomOut()');
              }
            }
          },
          {
            label: 'Actual Size',
            accelerator: 'Command+0',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow && focusedWindow.webContents) {
                focusedWindow.webContents.executeJavaScript(
                  '_zoomActualSize()');
              }
            }
          },
          {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
              }
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.toggleDevTools();
              }
            }
          },
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
            label: 'Learn More',
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
            label: 'Login',
            click: function() {
              mainWindow.loadURL(url.format({ // Load HTML into new Window
                pathname: path.join(mainIndex),
                protocol: 'file',
                slashes: true
              }));
            }
          },
          {
            label: 'Logout',
            click: function () {
              mainContent.executeJavaScript('let event = new CustomEvent("backend-ai-logout", {"detail": ""});' +
                '    document.dispatchEvent(event);');
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Force Update Screen',
            click: function () {
              mainContent.reloadIgnoringCache();
            }
          },
          {
            type: 'separator'
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
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
            accelerator: 'Ctrl+=',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow && focusedWindow.webContents) {
                focusedWindow.webContents.executeJavaScript('_zoomIn()');
              }
            }
          },
          {
            label: 'Zoom Out',
            accelerator: 'Ctrl+-',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow && focusedWindow.webContents) {
                focusedWindow.webContents.executeJavaScript('_zoomOut()');
              }
            }
          },
          {
            label: 'Actual Size',
            accelerator: 'Ctrl+0',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow && focusedWindow.webContents) {
                focusedWindow.webContents.executeJavaScript(
                  '_zoomActualSize()');
              }
            }
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
              }
            }
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click: function() {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.toggleDevTools();
              }
            }
          },
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
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


function createWindow () {
  // Create the browser window.
  devtools = null;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    title: "Backend.AI",
    frame: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: false,
      preload: path.join(BASE_DIR, 'preload.js'),
      devTools: true
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
    nfs.readFile('build/electron-app/app/config.toml', 'utf-8', (err, data) => {
      if (err) {
        console.log('No configuration file found.');
        return;
      }
      let config = toml(data);
      if ('server' in config && 'consoleServerURL' in config.server && config.server.consoleServerURL != "") {
        mainURL = config.server.consoleServerURL;
      } else {
        mainURL = url.format({
          pathname: path.join(mainIndex),
          protocol: 'file',
          slashes: true
        });
      }
      mainWindow.loadURL(mainURL);
    });
  }
  mainContent = mainWindow.webContents;
  devtools = new BrowserWindow();
  mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
  mainWindow.webContents.openDevTools({ mode: 'detach' });
  // Emitted when the window is closed.
  mainWindow.on('close', (e) => {
    if (mainWindow) {
      e.preventDefault();
      mainWindow.webContents.send('app-close-window');
    }
  });

  mainWindow.webContents.once('did-finish-load', () => {
    manager.once("ready", () => {
      let url = 'http://localhost:' + manager.port + "/";
      console.log("Proxy is ready:" + url);
      mainWindow.webContents.send('proxy-ready', url);
    });
    manager.start();
  });

  ipcMain.on('app-closed', _ => {
    if (process.platform !== 'darwin') {  // Force close app when it is closed even on macOS.
      //app.quit()
    }
    mainWindow = null;
    mainContent = null;
    devtools = null;
    app.quit()
  });
  mainWindow.on('closed', function () {
    mainWindow = null;
    mainContent = null;
    devtools = null;
  });

  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    newPopupWindow(event, url, frameName, disposition, options, additionalFeatures, mainWindow);
  });
}

function newPopupWindow(event, url, frameName, disposition, options, additionalFeatures) {
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
  event.newGuest = new BrowserWindow(options);
  event.newGuest.once('ready-to-show', () => {
    event.newGuest.show()
  });
  event.newGuest.loadURL(url);
  event.newGuest.webContents.on('new-window',(event, url, frameName, disposition, options, additionalFeatures) => {
    newPopupWindow(event, url, frameName, disposition, options, additionalFeatures);
  });
  event.newGuest.on('close', (e) => {
    let c = BrowserWindow.getFocusedWindow();
    if (c !== null) {
      c.destroy();
    }
  });
}

app.on('ready', () => {
  protocol.interceptFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7);    /* all urls start with 'file://' */
    const extension = url.split('.').pop();
    let options = { path: path.normalize(`${BASE_DIR}/${url}`)};
    callback(options);
  }, (err) => {
    if (err) console.error('Failed to register protocol');
  });
  // Force mime-type to javascript
  protocol.registerBufferProtocol('es6', (req, cb) => {
    nfs.readFile(
      npjoin(es6Path, req.url.replace('es6://', '')),
      (e, b) => { cb({ mimeType: 'text/javascript', data: b }) }
    )
  });
  createWindow()
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (mainWindow) {
    e.preventDefault();
    mainWindow.webContents.send('app-close-window');
  }
});


app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
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
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    delete webPreferences.preloadURL;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;

    // Verify URL being loaded
    //if (!params.src.startsWith('https://yourapp.com/')) {
    //  event.preventDefault()
    //}
  })
});
