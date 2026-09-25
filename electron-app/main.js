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
const path = require('path');
const { parse: toml } = require('smol-toml');
const nfs = require('fs');
const fs = require('fs').promises;
const mime = require('mime-types');
const npjoin = require('path').join;
const BASE_DIR = __dirname;
let ProxyManager;
let versions;
let es6Path;
let electronPath;
if (process.env.serveMode == 'dev') {
  ProxyManager = require(path.join(__dirname, 'app/wsproxy/wsproxy.js'));
  versions = require(path.join(__dirname, 'app/version'));
  es6Path = npjoin(__dirname, 'app'); // ES6 module loader with custom protocol
  electronPath = npjoin(__dirname);
} else {
  ProxyManager = require('./app/wsproxy/wsproxy.js');
  versions = require('./app/version');
  es6Path = npjoin(__dirname, 'app'); // ES6 module loader with custom protocol
  electronPath = npjoin(__dirname);
}

// The renderer's origin (ADR 0010). A file:// document has an opaque origin,
// for which Chromium keeps no V8 code cache.
const APP_ORIGIN = 'es6://app';
const mainIndexURL = `${APP_ORIGIN}/index.html`;

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
      corsEnabled: true,
      // Requires `standard`; only takes effect for an es6:// document (ADR 0010).
      codeCache: true,
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
              mainWindow.loadURL(mainIndexURL);
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
              mainWindow.loadURL(mainIndexURL);
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
    // macOS only: always-visible traffic lights at their native title-bar
    // position (FR-3828); the renderer grows the topmost band by the
    // title-bar height to clear them (`electron-macos` rules in the web
    // styles). Elsewhere 'hidden' would drop the native window controls.
    ...(process.platform === 'darwin' ? { titleBarStyle: 'hidden' } : {}),
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
    const loadFallbackIndex = async () => {
      await migrateFileOriginStorage();
      mainURL = mainIndexURL;
      mainWindow.loadURL(mainURL);
    };
    nfs.readFile(path.join(es6Path, 'config.toml'), 'utf-8', (err, data) => {
      console.log('Running on build-resource debug mode...');
      if (err) {
        console.log('No configuration file found.');
        loadFallbackIndex();
        return;
      }
      try {
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
          config.server.webServerURL != '' &&
          config.server.webServerURL != '""'
        ) {
          mainURL = config.server.webServerURL;
          mainWindow.loadURL(mainURL);
        } else {
          loadFallbackIndex();
        }
      } catch (parseErr) {
        console.error('config.toml parse error:', parseErr);
        loadFallbackIndex();
      }
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
      // HTTP header names are case-insensitive and Electron may normalize the
      // Set-Cookie key differently across platforms/versions, so find the
      // actual key rather than assuming 'Set-Cookie'.
      const cookieKey = Object.keys(details.responseHeaders).find(
        (key) => key.toLowerCase() === 'set-cookie',
      );
      if (cookieKey) {
        details.responseHeaders[cookieKey] = details.responseHeaders[
          cookieKey
        ].map((cookie) => {
          // Normalize any SameSite value (Lax, Strict, or missing) to None so
          // the cookie is sent on cross-site requests. Case-insensitive to
          // match RFC 6265.
          const withSameSite = /SameSite=/i.test(cookie)
            ? cookie.replace(/SameSite=\w+/i, 'SameSite=None')
            : cookie + '; SameSite=None';
          // SameSite=None requires the Secure attribute, otherwise
          // Chromium/Electron rejects the cookie.
          return /;\s*Secure/i.test(withSameSite)
            ? withSameSite
            : withSameSite + '; Secure';
        });
      }
      callback({ cancel: false, responseHeaders: details.responseHeaders });
    },
  );
}

// Maps an app-relative path to a packaged file: resources/ and manifest/ sit
// beside app/, everything else lives in app/. Returns null outside BASE_DIR.
function resolveAppFile(relPath) {
  let rel = relPath.replace(/^\/+/, '');
  if (!/^(app|resources|manifest)\//.test(rel)) {
    rel = path.join('app', rel);
  }
  const fullPath = path.normalize(path.join(BASE_DIR, rel));
  return fullPath.startsWith(BASE_DIR + path.sep) ? fullPath : null;
}

async function serveAppFile(encodedPath, extraHeaders = {}) {
  let relPath;
  try {
    relPath = decodeURIComponent(encodedPath);
  } catch {
    return new Response(null, { status: 400 });
  }
  const fullPath = resolveAppFile(relPath);
  if (!fullPath) {
    return new Response(null, { status: 403 });
  }
  try {
    const data = await fs.readFile(fullPath);
    const mimeType = mime.lookup(fullPath) || 'application/octet-stream';
    return new Response(data, {
      headers: { 'content-type': mimeType, ...extraHeaders },
    });
  } catch (err) {
    console.error('Error reading file:', err);
    return new Response(null, { status: 404 });
  }
}

// One-time copy of localStorage from the file:// origin used before ADR 0010
// into es6://app. Keys already present in es6://app win. Gives up after
// MIGRATION_MAX_ATTEMPTS failures so a broken install does not pay every launch.
const MIGRATION_MAX_ATTEMPTS = 3;
async function migrateFileOriginStorage() {
  const marker = path.join(app.getPath('userData'), 'es6-origin-migrated');
  let state = { done: false, attempts: 0 };
  try {
    state = { ...state, ...JSON.parse(nfs.readFileSync(marker, 'utf-8')) };
  } catch {}
  if (state.done || state.attempts >= MIGRATION_MAX_ATTEMPTS) return;
  const writeState = (next) =>
    fs.writeFile(marker, JSON.stringify({ ...next, at: new Date().toISOString() }));
  const win = new BrowserWindow({ show: false });
  try {
    // Same file://app/… form the pre-ADR-0010 main window loaded from.
    await win.loadURL('file://app/version.json');
    const entries = await win.webContents.executeJavaScript(
      'JSON.stringify(Object.entries(localStorage))',
    );
    await win.loadURL(`${APP_ORIGIN}/version.json`);
    const copied = await win.webContents.executeJavaScript(
      `(() => { let n = 0; for (const [k, v] of ${entries}) { if (localStorage.getItem(k) === null) { localStorage.setItem(k, v); n++; } } return n; })()`,
    );
    await win.webContents.session.flushStorageData();
    await writeState({ done: true, attempts: state.attempts + 1, copied });
    console.log(`Migrated ${copied} localStorage entries to ${APP_ORIGIN}.`);
  } catch (err) {
    console.error('localStorage migration to es6://app failed:', err);
    await writeState({ done: false, attempts: state.attempts + 1 }).catch(() => {});
  } finally {
    win.destroy();
  }
}

app.on('ready', () => {
  protocol.handle('file', (request) => {
    const { host, pathname } = new URL(request.url);
    return serveAppFile(`${host}${pathname}`);
  });
  protocol.handle('es6', (request) => {
    const { host, pathname } = new URL(request.url);
    // es6://app/<path> is the app origin; es6://<path> is the older asset form
    // (es6://assets/…, es6://config.toml) that builds and the renderer still use.
    const relPath = (host === 'app' ? pathname : `${host}${pathname}`).replace(
      /\/$/,
      '',
    );
    return serveAppFile(relPath, { 'access-control-allow-origin': '*' });
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
