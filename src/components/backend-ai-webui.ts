/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { default as TabCount } from '../lib/TabCounter';
import * as ai from '../lib/backend.ai-client-esm';
import './backend-ai-common-utils';
import BackendAICommonUtils from './backend-ai-common-utils';
import './backend-ai-indicator-pool';
// backend-ai-login is now a React component registered as 'backend-ai-react-login-view'
import BackendAIMetadataStore from './backend-ai-metadata-store';
import BackendAISettingsStore from './backend-ai-settings-store';
import BackendAITasker from './backend-ai-tasker';
import { BackendAIWebUIStyles } from './backend-ai-webui-styles';
import './lablup-notification';
import DOMPurify from 'dompurify';
import { LitElement, html, CSSResultGroup } from 'lit';
import {
  get as _text,
  registerTranslateConfig,
  use as setLanguage,
} from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';
import toml from 'markty-toml';

// Expose Backend.AI client classes globally for React components.
// Previously set by the now-removed backend-ai-login.ts.
// @ts-ignore
globalThis.BackendAIClient = ai.backend.Client;
// @ts-ignore
globalThis.BackendAIClientConfig = ai.backend.ClientConfig;

registerTranslateConfig({
  loader: (lang) =>
    fetch(`/resources/i18n/${lang}.json`).then((res) => res.json()),
});
globalThis.backendaioptions = new BackendAISettingsStore();
globalThis.backendaimetadata = new BackendAIMetadataStore();
globalThis.tasker = new BackendAITasker();
globalThis.backendaiutils = new BackendAICommonUtils();

/**
 Backend.AI Web UI

 `backend-ai-webui` is a minimal Lit shell that provides:
 - Global store initialization (settings, metadata, tasker, utils)
 - Config loading from config.toml
 - Notification and indicator pool (still Lit components)
 - Login view orchestration
 - Logout and Electron app-close handling

 All routing, page rendering, and UI is handled by React.

 @group Backend.AI Web UI
 @element backend-ai-webui
 */
@customElement('backend-ai-webui')
export default class BackendAIWebUI extends LitElement {
  @property({ type: Boolean }) hasLoadedStrings = false;
  @property({ type: Boolean }) is_connected = false;
  @property({ type: Object }) config = Object();
  @property({ type: Object }) notification;
  @property({ type: Boolean }) auto_logout = false;
  @property({ type: String }) edition = 'Open Source';
  @property({ type: String }) validUntil = '';
  @property({ type: Object }) plugins = Object();
  @property({ type: String }) proxy_url = '';
  @property({ type: String }) lang = 'default';
  @property({ type: Array }) supportLanguageCodes = [
    'en',
    'ko',
    'de',
    'el',
    'es',
    'fi',
    'fr',
    'id',
    'it',
    'ja',
    'mn',
    'ms',
    'pl',
    'pt',
    'pt-BR',
    'ru',
    'th',
    'tr',
    'vi',
    'zh-CN',
    'zh-TW',
  ];
  @property({ type: Object }) _refreshPage = this.refreshPage.bind(this);
  @query('#login-panel') loginPanel: any;

  static get styles(): CSSResultGroup {
    return [BackendAIWebUIStyles];
  }

  /**
   * Wait for the React-based login panel to expose its imperative handle.
   * The handle methods (login, block, etc.) are assigned via useEffect in
   * LoginView.tsx, so they may not be available immediately after the
   * web component element is in the DOM.
   */
  private _waitForLoginPanel(timeout = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loginPanel?.block) {
        resolve();
        return;
      }
      const start = Date.now();
      const check = () => {
        if (this.loginPanel?.block) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error('LoginPanel not ready within timeout'));
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });
  }

  firstUpdated() {
    globalThis.lablupNotification =
      this.shadowRoot?.querySelector('#notification');
    globalThis.lablupIndicator = this.shadowRoot?.querySelector('#indicator');
    this.notification = globalThis.lablupNotification;

    const configPath = globalThis.isElectron
      ? './config.toml'
      : '../../config.toml';

    // Logout handler
    document.addEventListener('backend-ai-logout', ((
      e: CustomEvent<{ callbackURL: string }>,
    ) => {
      this.logout(false, e.detail?.callbackURL);
    }) as EventListener);

    // Electron-specific handlers
    if (globalThis.isElectron) {
      document.addEventListener('backend-ai-app-close', () =>
        this.close_app_window(),
      );
    }

    globalThis.addEventListener('beforeunload', function () {
      globalThis.backendaioptions.set(
        'last_window_close_time',
        new Date().getTime() / 1000,
      );
    });

    // Wait for the React login panel handle to be ready before proceeding
    Promise.all([this._parseConfig(configPath), this._waitForLoginPanel()])
      .then(() => {
        this.loadConfig(this.config);
        // If disconnected, trigger login flow
        if (
          typeof globalThis.backendaiclient === 'undefined' ||
          globalThis.backendaiclient === null ||
          globalThis.backendaiclient.ready === false
        ) {
          // Check if on edu-applauncher page (handled by React route)
          const currentPage = window.location.pathname
            .replace(/^\//, '')
            .split('/')[0];
          if (
            currentPage === 'edu-applauncher' ||
            currentPage === 'applauncher'
          ) {
            // React component handles launch automatically
          } else {
            const tabcount = new TabCount();
            const isPageReloaded =
              (window.performance.navigation &&
                window.performance.navigation.type === 1) ||
              window.performance
                .getEntriesByType('navigation')
                .map((nav: any) => nav.type)
                .includes('reload');
            tabcount.tabsCount(true);
            if (
              this.auto_logout === true &&
              tabcount.tabsCounter === 1 &&
              !isPageReloaded
            ) {
              this.loginPanel.check_login().then((result) => {
                const current_time: number = new Date().getTime() / 1000;
                if (
                  result === true &&
                  current_time -
                    globalThis.backendaioptions.get(
                      'last_window_close_time',
                      current_time,
                    ) >
                    3.0
                ) {
                  // currently login.
                  this.loginPanel._logoutSession().then(() => {
                    this.loginPanel.open();
                  });
                } else if (result === true) {
                  this.loginPanel.login(false);
                } else {
                  this.loginPanel.open();
                }
              });
            } else {
              this.loginPanel.login(false);
            }
          }
        }
      })
      .catch(() => {
        if (
          typeof globalThis.backendaiclient === 'undefined' ||
          globalThis.backendaiclient === null ||
          globalThis.backendaiclient.ready === false
        ) {
          this.loginPanel?.block?.('Configuration is not loaded.', 'Error');
        }
      });

    // Keep lit-translate in sync when user changes language (for notification text)
    document.addEventListener('language-changed', async (e) => {
      await setLanguage((e as CustomEvent).detail.language);
    });
  }

  async connectedCallback() {
    super.connectedCallback();
    document.addEventListener('backend-ai-connected', this._refreshPage);

    const selectedLang = globalThis.backendaioptions.get('selected_language');
    let defaultLang = globalThis.navigator.language.split('-')[0];
    defaultLang = this.supportLanguageCodes.includes(defaultLang)
      ? defaultLang
      : 'en';

    if (!selectedLang) {
      this.lang = defaultLang;
    } else {
      if (selectedLang === 'default') {
        this.lang = defaultLang;
      } else {
        this.lang = this.supportLanguageCodes.includes(selectedLang)
          ? selectedLang
          : defaultLang;
      }
    }
    globalThis.backendaioptions.set('language', this.lang, 'general');
    await setLanguage(this.lang);
    this.hasLoadedStrings = true;
  }

  disconnectedCallback() {
    document.removeEventListener('backend-ai-connected', this._refreshPage);
    super.disconnectedCallback();
  }

  shouldUpdate(changedProperties) {
    return this.hasLoadedStrings && super.shouldUpdate(changedProperties);
  }

  /**
   * Load essential config values and dispatch events for React consumption.
   * Most config parsing is handled by React's loginConfig.ts via refreshWithConfig.
   */
  loadConfig(config): void {
    // Auto-logout setting
    if (
      typeof config.general !== 'undefined' &&
      'autoLogout' in config.general &&
      globalThis.backendaioptions.get('auto_logout') === null
    ) {
      this.auto_logout = config.general.autoLogout;
    } else {
      this.auto_logout = globalThis.backendaioptions.get('auto_logout', false);
    }

    // Package edition and license info (used by React SplashModal/AboutModal)
    if (typeof config.license !== 'undefined' && 'edition' in config.license) {
      this.edition = config.license.edition;
    }
    globalThis.packageEdition = this.edition;
    if (
      typeof config.license !== 'undefined' &&
      'validUntil' in config.license
    ) {
      this.validUntil = config.license.validUntil;
    }
    globalThis.packageValidUntil = this.validUntil;

    // Proxy URL (used by refreshPage)
    if (typeof config.wsproxy !== 'undefined' && 'proxyURL' in config.wsproxy) {
      this.proxy_url = config.wsproxy.proxyURL;
    }

    // Dispatch plugin configuration to React PluginLoader
    if (typeof config.plugin !== 'undefined') {
      if ('login' in config.plugin) {
        this.plugins['login'] = config.plugin.login;
      }
    }
    const pluginPages =
      typeof config.plugin !== 'undefined' && 'page' in config.plugin
        ? config.plugin.page
        : '';
    document.dispatchEvent(
      new CustomEvent('backend-ai-plugin-config', {
        detail: {
          pluginPages,
          apiEndpoint: this.loginPanel?.api_endpoint || '',
        },
      }),
    );

    // Pass full config to React LoginView for detailed parsing
    this.loginPanel.refreshWithConfig(config);

    // Notify React that config is loaded
    document.dispatchEvent(new CustomEvent('backend-ai-config-loaded'));
  }

  /**
   * Called when backend-ai-connected event fires (after successful login).
   * Sets up proxy URL and hides the loading curtain.
   */
  refreshPage(): void {
    globalThis.backendaiclient.proxyURL = this.proxy_url;
    document.body.style.backgroundImage = 'none';

    const curtain = this.shadowRoot?.getElementById('loading-curtain');
    curtain?.classList.add('visuallyhidden');
    curtain?.addEventListener(
      'transitionend',
      () => {
        curtain?.classList.add('hidden');
        this.is_connected = true;
      },
      {
        capture: false,
        once: true,
        passive: false,
      },
    );
  }

  /**
   * Show a notification when a new Web UI version is available.
   * Called from service-worker-driver.js.
   */
  showUpdateNotifier(): void {
    const indicator = <any>(
      this.shadowRoot?.getElementById('backend-ai-indicator')
    );
    if (indicator) {
      indicator.innerHTML = DOMPurify.sanitize(
        'New Web UI is available. Please <a onclick="globalThis.location.reload()">reload</a> to update.',
      );
      indicator.show();
    }
  }

  /**
   * Parse config.toml from the given path.
   * Also used by loginSessionAuth.ts to load webserver config.
   */
  _parseConfig(fileName, returning = false): Promise<void> {
    const _preprocessToml = (config) => {
      if (config?.general?.apiEndpointText) {
        config.general.apiEndpointText = JSON.parse(
          `"${config.general.apiEndpointText}"`,
        );
      }
    };
    return fetch(fileName)
      .then((res) => {
        if (res.status == 200) {
          return res.text();
        }
        return '';
      })
      .then((res) => {
        const tomlConfig = toml(res);
        _preprocessToml(tomlConfig);
        if (returning) {
          return tomlConfig;
        } else {
          this.config = tomlConfig;
        }
      })
      .catch(() => undefined);
  }

  /**
   * When user closes the Electron app window, clean up login information.
   */
  async close_app_window() {
    if (globalThis.backendaioptions.get('preserve_login') === false) {
      this.notification.text = _text('webui.CleanUpLoginSession');
      this.notification.show();
      const keys = Object.keys(localStorage);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (/^(BackendAIWebUI\.login\.)/.test(key)) {
          localStorage.removeItem(key);
        }
      }
      sessionStorage.clear();
      if (
        typeof globalThis.backendaiclient != 'undefined' &&
        globalThis.backendaiclient !== null
      ) {
        if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
          await globalThis.backendaiclient.logout();
        }
        globalThis.backendaiclient = null;
      }
    }
  }

  /**
   * Logout from the backend.ai client.
   */
  async logout(performClose = false, callbackURL: string = '/') {
    globalThis.backendaiutils._deleteRecentProjectGroupInfo();
    if (
      typeof globalThis.backendaiclient != 'undefined' &&
      globalThis.backendaiclient !== null
    ) {
      this.notification.text = _text('webui.CleanUpNow');
      this.notification.show();
      if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
        await globalThis.backendaiclient.logout();
      }
      globalThis.backendaiclient = null;
      const keys = Object.keys(localStorage);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (/^(BackendAIWebUI\.login\.)/.test(key)) {
          localStorage.removeItem(key);
        }
      }
      sessionStorage.clear();
      if (performClose === true) {
        // Do nothing. this window will be closed.
      } else if (globalThis.isElectron) {
        globalThis.location.href = globalThis.electronInitialHref;
      } else {
        globalThis.history.pushState({}, '', callbackURL);
        document.dispatchEvent(
          new CustomEvent('react-navigate', { detail: callbackURL }),
        );
        globalThis.location.reload();
      }
    }
  }

  protected render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/fonts/font-awesome-all.min.css" />
      <link rel="stylesheet" href="resources/custom.css" />
      <div id="loading-curtain" class="loading-background">
        <div id="loading-drag-area" class="loading-background-drag-area"></div>
      </div>
      <backend-ai-react-login-view
        id="login-panel"
      ></backend-ai-react-login-view>
      <lablup-notification id="notification"></lablup-notification>
      <backend-ai-indicator-pool id="indicator"></backend-ai-indicator-pool>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-webui': BackendAIWebUI;
  }
}
