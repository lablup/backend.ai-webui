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

var ua = window.navigator.userAgent;
var iOS = /iPhone|iPad|iPod/i.test(ua);
var webkit = !!ua.match(/WebKit/i);
window.supportedBrowserMinimums = {
  Chrome: [123],
  Edge: [123],
  Safari: [17, 5],
  Firefox: [125]
};

(function () {
  var minimums = window.supportedBrowserMinimums;
  var browserPatterns = [
    ['Edge', /Edg(?:e|A)?\/(\d+)/],
    ['Firefox', /Firefox\/(\d+)/],
    ['Chrome', /(?:Chrome|Chromium)\/(\d+)/],
    ['Safari', /Version\/(\d+)(?:\.(\d+))?.*Safari\//]
  ];

  function isVersionBelow(version, minimum) {
    for (var i = 0; i < minimum.length; i++) {
      var current = version[i] || 0;
      if (current !== minimum[i]) {
        return current < minimum[i];
      }
    }
    return false;
  }

  function identifyBrowser() {
    var match;
    if (iOS) {
      match = ua.match(/OS (\d+)[_.](\d+)/);
      return match ? { name: 'Safari', version: match.slice(1).map(Number) } : null;
    }
    if (/CriOS|FxiOS|EdgiOS/.test(ua)) {
      return null;
    }
    for (var i = 0; i < browserPatterns.length; i++) {
      match = ua.match(browserPatterns[i][1]);
      if (match) {
        return { name: browserPatterns[i][0], version: match.slice(1).map(Number) };
      }
    }
    return null;
  }

  function isUserAgentBelowSupportedRange() {
    var browser = identifyBrowser();
    return !!browser && isVersionBelow(browser.version, minimums[browser.name]);
  }

  function lacksRequiredBrowserFeatures() {
    var hasPopover = typeof HTMLElement !== 'undefined' &&
      HTMLElement.prototype.hasOwnProperty('popover');
    var hasLightDark = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' &&
      CSS.supports('color', 'light-dark(#000, #fff)');
    return !hasPopover || !hasLightDark;
  }

  var labels = [];
  for (var name in minimums) {
    labels.push(name + ' ' + minimums[name].join('.') + '+');
  }
  function hasAcceptedUnsupportedBrowser() {
    try {
      return window.sessionStorage.getItem(window.unsupportedBrowserAcceptedKey) === '1';
    } catch (e) {
      return false;
    }
  }

  window.supportedBrowsersText = labels.join(', ');
  window.unsupportedBrowserAcceptedKey = 'backendaiwebui.unsupportedBrowserAccepted';
  window.isBrowserBelowSupportedRange = !isElectron() &&
    (isUserAgentBelowSupportedRange() || lacksRequiredBrowserFeatures());
  // ADR 0038: "Use anyway" on the block screen lifts the block for this tab's session.
  window.isUnsupportedBrowser = window.isBrowserBelowSupportedRange &&
    !hasAcceptedUnsupportedBrowser();
})();
window.iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
