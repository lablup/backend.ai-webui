/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
const {
  app,
  Menu,
  shell,
  BrowserWindow,
  protocol,
  session,
  clipboard,
  dialog,
  ipcMain,
} = require('electron');
process.env.electronPath = app.getAppPath();
function isDev() {
  return process.argv[2] == '--dev';
}
let debugMode = true;
if (isDev()) {
  // Dev mode from Makefile
  process.env.serveMode = 'dev'; // Prod OR debug
} else {
  process.env.serveMode = 'prod'; // Prod OR debug
  debugMode = false;
}
const url = require('url');
const path = require('path');
const toml = require('markty-toml');
const nfs = require('fs');
const fs = require('fs').promises;
const mime = require('mime-types');
const npjoin = require('path').join;
const BASE_DIR = __dirname;
let ProxyManager;
let versions;
let es6Path;
let electronPath;
let mainIndex;
if (process.env.serveMode == 'dev') {
  ProxyManager = require(path.join(__dirname, 'app/wsproxy/wsproxy.js'));
  versions = require(path.join(__dirname, 'app/version'));
  es6Path = npjoin(__dirname, 'app'); // ES6 module loader with custom protocol
  electronPath = npjoin(__dirname);
  mainIndex = 'app/index.html';
} else {
  ProxyManager = require('./app/wsproxy/wsproxy.js');
  versions = require('./app/version');
  es6Path = npjoin(__dirname, 'app'); // ES6 module loader with custom protocol
  electronPath = npjoin(__dirname);
  mainIndex = 'app/index.html';
}

const windowWidth = 1280;
const windowHeight = 970;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'es6',
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      supportFetchAPI: true,
    },
  },
]);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let mainContent;
let devtools;
const manager = new ProxyManager();
let mainURL;

app.once('ready', function () {
  let template;
  if (process.platform === 'darwin') {
    template = [
      {
        label: 'Backend.AI',
        submenu: [
          {
            label: 'About Backend.AI Desktop',
            click: function () {
              mainContent.executeJavaScript(
                'let event = new CustomEvent("backend-ai-show-splash", {"detail": ""});' +
                  '    document.dispatchEvent(event);',
              );
            },
          },
          {
            label:
              'App version ' +
              versions.package +
              ' (rev.' +
              versions.revision +
              ')',
            click: function () {
              clipboard.writeText(
                versions.package + ' (rev.' + versions.revision + ')',
              );
              const response = dialog.showMessageBox({
                type: 'info',
                message: 'Version information is copied to clipboard.',
              });
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Refresh App',
            accelerator: 'Command+R',
            click: function () {
              // mainContent.reloadIgnoringCache();
              const proxyUrl = `http://localhost:${manager.port}/`;
              mainWindow.loadURL(
                url.format({
                  // Load HTML into new Window
                  pathname: path.join(mainIndex),
                  protocol: 'file',
                  slashes: true,
                }),
              );
              mainContent.executeJavaScript(
                `window.__local_proxy = {}; window.__local_proxy.url = '${proxyUrl}';`,
              );
              console.log('Re-connected to proxy: ' + proxyUrl);
            },
          },
          {
            type: 'separator',
          },
          {
            label: 'Services',
            submenu: [],
          },
          {
            type: 'separator',
          },
          {
            label: 'Hide Backend.AI Desktop',
            accelerator: 'Command+H',
            selector: 'hide:',
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:',
          },
          {
            label: 'Show All',
            selector: 'unhideAllApplications:',
          },
          {
            type: 'separator',
          },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function () {
              app.quit();
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: 'Command+Z',
            selector: 'undo:',
          },
          {
            label: 'Redo',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:',
          },
          {
            type: 'separator',
          },
          {
            label: 'Cut',
            accelerator: 'Command+X',
            selector: 'cut:',
          },
          {
            label: 'Copy',
            accelerator: 'Command+C',
            selector: 'copy:',
          },
          {
            label: 'Paste',
            accelerator: 'Command+V',
            selector: 'paste:',
          },
          {
            label: 'Select All',
            accelerator: 'Command+A',
            selector: 'selectAll:',
          },
        ],
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Zoom In',
            accelerator: 'Command+=',
            role: 'zoomin',
          },
          {
            label: 'Zoom Out',
            accelerator: 'Command+-',
            role: 'zoomout',
          },
          {
            label: 'Actual Size',
            accelerator: 'Command+0',
            role: 'resetzoom',
          },
          {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click: function () {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
              }
            },
          },
        ],
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:',
          },
          {
            label: 'Close',
            accelerator: 'Command+W',
            selector: 'performClose:',
          },
          {
            type: 'separator',
          },
          {
            label: 'Bring All to Front',
            selector: 'arrangeInFront:',
          },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Online Manual',
            click: function () {
              shell.openExternal('https://webui.docs.backend.ai/');
            },
          },
          {
            label: 'Backend.AI Project Site',
            click: function () {
              shell.openExternal('https://www.backend.ai/');
            },
          },
        ],
      },
    ];
  } else {
    template = [
      {
        label: '&File',
        submenu: [
          {
            label: 'Refresh App',
            accelerator: 'CmdOrCtrl+R',
            click: function () {
              const proxyUrl = `http://localhost:${manager.port}/`;
              mainWindow.loadURL(
                url.format({
                  // Load HTML into new Window
                  pathname: path.join(mainIndex),
                  protocol: 'file',
                  slashes: true,
                }),
              );
              mainContent.executeJavaScript(
                `window.__local_proxy = {}; window.__local_proxy.url = '${proxyUrl}';`,
              );
              console.log('Re-connected to proxy: ' + proxyUrl);
            },
          },
          {
            type: 'separator',
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: function () {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.close();
              }
            },
          },
        ],
      },
      {
        label: '&View',
        submenu: [
          {
            label: 'Zoom In',
            accelerator: 'CmdOrCtrl+=',
            role: 'zoomin',
          },
          {
            label: 'Zoom Out',
            accelerator: 'CmdOrCtrl+-',
            role: 'zoomout',
          },
          {
            label: 'Actual Size',
            accelerator: 'CmdOrCtrl+0',
            role: 'resetzoom',
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            role: 'togglefullscreen',
          },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Online Manual',
            click: function () {
              shell.openExternal('https://webui.docs.backend.ai/');
            },
          },
          {
            label: 'Backend.AI Project Site',
            click: function () {
              shell.openExternal('https://www.backend.ai/');
            },
          },
        ],
      },
    ];
  }

  const appmenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(appmenu);
});

function createWindow() {
  // Create the browser window.
  devtools = null;
  setSameSitePolicy();
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    title: 'Backend.AI',
    frame: true,
    titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: false,
      preload: path.join(electronPath, 'preload.js'),
      devTools: debugMode === true,
      worldSafeExecuteJavaScript: false,
      contextIsolation: true,
    },
  });
  // and load the index.html of the app.
  if (process.env.LIVE_DEBUG === '1') {
    const endpoint = process.env.LIVE_DEBUG_ENDPOINT || 'http://127.0.0.1:9081';

    // Load HTML into new Window (dynamic serving for develop)
    console.log(`Running on live debug(${endpoint}) mode...`);
    mainWindow.loadURL(endpoint);
  } else {
    // Load HTML into new Window (file-based serving)
    nfs.readFile(path.join(es6Path, 'config.toml'), 'utf-8', (err, data) => {
      console.log('Running on build-resource debug mode...');
      if (err) {
        console.log('No configuration file found.');
        return;
      }
      const config = toml(data);
      if (
        'wsproxy' in config &&
        'disableCertCheck' in config.wsproxy &&
        config.wsproxy.disableCertCheck == true
      ) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }
      if (
        'server' in config &&
        'webServerURL' in config.server &&
        config.server.webServerURL != ''
      ) {
        mainURL = config.server.webServerURL;
      } else {
        mainURL = url.format({
          pathname: path.join(mainIndex),
          protocol: 'file',
          slashes: true,
        });
      }
      mainWindow.loadURL(mainURL);
    });
  }
  mainContent = mainWindow.webContents;
  if (debugMode === true) {
    devtools = new BrowserWindow();
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  // Emitted when the window is closed.
  mainWindow.on('close', (e) => {
    if (mainWindow) {
      e.preventDefault();
      mainWindow.webContents.send('app-close-window');
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (manager.port) {
      const url = 'http://localhost:' + manager.port + '/';
      mainWindow.webContents.send('proxy-ready', url);
    } else {
      manager.once('ready', () => {
        const url = 'http://localhost:' + manager.port + '/';
        mainWindow.webContents.send('proxy-ready', url);
      });
      manager.start();
    }
  });

  ipcMain.on('app-closed', (_) => {
    if (process.platform !== 'darwin') {
      // Force close app when it is closed even on macOS.
      // app.quit()
    }
    mainWindow = null;
    mainContent = null;
    devtools = null;
    app.quit();
  });
  mainWindow.on('closed', function () {
    mainWindow = null;
    mainContent = null;
    devtools = null;
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    return newPopupWindow(details);
  });
}

function newPopupWindow(details) {
  // let disposition = details.disposition;
  let options = {
    frame: true,
    show: false,
    backgroundColor: '#EFEFEF',
    // parent: win,
    titleBarStyle: 'default',
    width: windowWidth,
    height: windowHeight,
    closable: true,
    webPreferences: {},
  };
  Object.assign(options.webPreferences, {
    javascript: true,
  });
  if (details.frameName === 'modal') {
    options.modal = true;
  }
  newGuest = new BrowserWindow(options);
  newGuest.once('ready-to-show', () => {
    newGuest.show();
  });
  newGuest.loadURL(details.url);
  if (debugMode === true) {
    devtools = new BrowserWindow();
    newGuest.webContents.setDevToolsWebContents(devtools.webContents);
    newGuest.webContents.openDevTools({ mode: 'detach' });
  }
  newGuest.webContents.setWindowOpenHandler((details) => {
    return newPopupWindow(details);
  });
  newGuest.on('close', (e) => {
    const c = BrowserWindow.getFocusedWindow();
    if (c !== null) {
      c.destroy();
    }
  });
  return { action: 'deny' };
}

function setSameSitePolicy() {
  const filter = { urls: ['http://*/*', 'https://*/*'] };
  session.defaultSession.webRequest.onHeadersReceived(
    filter,
    (details, callback) => {
      const cookies = details.responseHeaders['Set-Cookie'] || [];
      cookies.map((cookie) => cookie.replace('SameSite=Lax', 'SameSite=None')); // Override SameSite Lax option to None for App mode cookie.
      if (cookies.length > 0 && !cookies.includes('SameSite')) {
        // Add SameSite policy if not present.
        details.responseHeaders['Set-Cookie'] =
          cookies + '; SameSite=None; Secure';
      }
      callback({ cancel: false, responseHeaders: details.responseHeaders });
    },
  );
}

app.on('ready', () => {
  // Registering the 'file' protocol
  protocol.handle('file', async (request) => {
    const url = request.url.substr(7); // strip 'file://' from the URL
    const normalizedPath = path.normalize(`${BASE_DIR}/${url}`);
    try {
      const data = await fs.readFile(normalizedPath);
      const mimeType = mime.lookup(normalizedPath);
      return new Response(data, { headers: { 'content-type': mimeType } });
    } catch (err) {
      console.error('Error reading file:', err);
      return { error: -2 }; // -2 corresponds to net::ERR_FAILED in Chromium
    }
  });
  // Registering the 'es6' protocol
  protocol.handle('es6', async (request) => {
    const filePath = request.url.replace('es6://', '');
    const fullPath = npjoin(es6Path, filePath);
    try {
      const data = await fs.readFile(fullPath);
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';

      return new Response(data, {
        headers: { 'content-type': mimeType },
      });
    } catch (err) {
      console.error('Error reading file:', err);
      return { error: -2 };
    }
  });
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (mainWindow) {
    e.preventDefault();
    mainWindow.webContents.send('app-close-window');
  }
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
app.on(
  'certificate-error',
  function (event, webContents, url, error, certificate, callback) {
    event.preventDefault();
    callback(true);
  },
);
// Let windows without node integration
app.on('web-contents-created', (event, contents) => {
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    delete webPreferences.preloadURL;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;
  });
});
