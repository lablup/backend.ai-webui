var forEach = function (array, callback, scope) {
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i]);
  }
};

function isElectron() {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' &&
    window.process.type === 'renderer') {
    return true;
  }
  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' &&
    Boolean(process.versions.electron)) {
    return true;
  }
  // Detect the user agent when the `nodeIntegration` option is set to true
  if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' &&
    navigator.userAgent.indexOf('Electron') >= 0) {
    return true;
  }
  return false;
}

let ua = window.navigator.userAgent;
let iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
let webkit = !!ua.match(/WebKit/i);
window.supportedBrowserMinimums = [
  { name: 'Chrome', version: [123] },
  { name: 'Edge', version: [123] },
  { name: 'Safari', version: [17, 5] },
  { name: 'Firefox', version: [125] }
];

function findSupportedBrowserMinimum(name) {
  var minimums = window.supportedBrowserMinimums;
  for (var i = 0; i < minimums.length; i++) {
    if (minimums[i].name === name) {
      return minimums[i].version;
    }
  }
  return null;
}

function parseBrowserVersion(parts) {
  var version = [];
  for (var i = 0; i < parts.length; i++) {
    version.push(parseInt(parts[i] || '0', 10));
  }
  return version;
}

function isVersionBelow(version, minimum) {
  for (var i = 0; i < minimum.length; i++) {
    var current = version[i] || 0;
    if (current !== minimum[i]) {
      return current < minimum[i];
    }
  }
  return false;
}

function identifyBrowser(userAgent) {
  var match;
  if (/MSIE|Trident/.test(userAgent)) {
    return { name: 'Internet Explorer', version: null };
  }
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    match = userAgent.match(/OS (\d+)[_.](\d+)/);
    return match ? { name: 'Safari', version: parseBrowserVersion([match[1], match[2]]) } : null;
  }
  match = userAgent.match(/Edg(?:e|A)?\/(\d+)/);
  if (match) {
    return { name: 'Edge', version: parseBrowserVersion([match[1]]) };
  }
  match = userAgent.match(/Firefox\/(\d+)/);
  if (match) {
    return { name: 'Firefox', version: parseBrowserVersion([match[1]]) };
  }
  match = userAgent.match(/(?:Chrome|Chromium)\/(\d+)/);
  if (match) {
    return { name: 'Chrome', version: parseBrowserVersion([match[1]]) };
  }
  match = userAgent.match(/Version\/(\d+)(?:\.(\d+))?.*Safari\//);
  if (match) {
    return { name: 'Safari', version: parseBrowserVersion([match[1], match[2]]) };
  }
  return null;
}

function isUserAgentBelowSupportedRange(userAgent) {
  var browser = identifyBrowser(userAgent);
  if (!browser) {
    return false;
  }
  if (browser.name === 'Internet Explorer') {
    return true;
  }
  var minimum = findSupportedBrowserMinimum(browser.name);
  return !!minimum && isVersionBelow(browser.version, minimum);
}

function lacksRequiredBrowserFeatures() {
  var hasPopover = typeof HTMLElement !== 'undefined' &&
    HTMLElement.prototype.hasOwnProperty('popover');
  var hasLightDark = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' &&
    CSS.supports('color', 'light-dark(#000, #fff)');
  return !hasPopover || !hasLightDark;
}

function isUnsupportedBrowser() {
  if (isElectron()) {
    return false;
  }
  return isUserAgentBelowSupportedRange(window.navigator.userAgent) || lacksRequiredBrowserFeatures();
}

function formatSupportedBrowsers() {
  var minimums = window.supportedBrowserMinimums;
  var labels = [];
  for (var i = 0; i < minimums.length; i++) {
    labels.push(minimums[i].name + ' ' + minimums[i].version.join('.') + '+');
  }
  return labels.join(', ');
}

window.isUnsupportedBrowser = isUnsupportedBrowser();
globalThis.iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
