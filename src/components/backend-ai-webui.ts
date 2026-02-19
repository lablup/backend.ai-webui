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
 - Notification and indicator pool (still Lit components)
 - Login view orchestration
 - Logout and Electron app-close handling

 Config loading from config.toml is handled entirely by React
 (see react/src/hooks/useWebUIConfig.ts).

 All routing, page rendering, and UI is handled by React.

 @group Backend.AI Web UI
 @element backend-ai-webui
 */
@customElement('backend-ai-webui')
export default class BackendAIWebUI extends LitElement {
  @property({ type: Boolean }) hasLoadedStrings = false;
  @property({ type: Boolean }) is_connected = false;
  @property({ type: Object }) notification;
  @property({ type: Boolean }) auto_logout = false;
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

  /**
   * Wait for React to finish loading and processing config.toml.
   * React dispatches 'backend-ai-config-loaded' when config is ready.
   * The event detail contains { autoLogout: boolean } for the login flow.
   */
  private _waitForConfigLoaded(timeout = 15000): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if React already dispatched the event before this listener
      // was attached. React sets this flag on globalThis immediately before
      // dispatching 'backend-ai-config-loaded' to prevent the race condition.
      const alreadyLoaded = (globalThis as Record<string, unknown>)
        .__backendai_config_loaded__ as { autoLogout?: boolean } | undefined;
      if (alreadyLoaded) {
        resolve(alreadyLoaded.autoLogout ?? false);
        return;
      }

      const handleConfigLoaded = (e: Event) => {
        document.removeEventListener(
          'backend-ai-config-loaded',
          handleConfigLoaded,
        );
        const detail = (e as CustomEvent<{ autoLogout?: boolean }>).detail;
        resolve(detail?.autoLogout ?? false);
      };

      document.addEventListener('backend-ai-config-loaded', handleConfigLoaded);

      // Timeout fallback - resolve with false (no auto-logout) if config
      // loading takes too long
      setTimeout(() => {
        document.removeEventListener(
          'backend-ai-config-loaded',
          handleConfigLoaded,
        );
        resolve(false);
      }, timeout);
    });
  }

  firstUpdated() {
    globalThis.lablupNotification =
      this.shadowRoot?.querySelector('#notification');
    globalThis.lablupIndicator = this.shadowRoot?.querySelector('#indicator');
    this.notification = globalThis.lablupNotification;

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

    // Wait for both the React login panel handle and React config loading
    Promise.all([this._waitForConfigLoaded(), this._waitForLoginPanel()])
      .then(([autoLogout]) => {
        this.auto_logout = autoLogout;

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
   * Called when backend-ai-connected event fires (after successful login).
   * Proxy URL is now set by React (useConfigRefreshPageEffect in useWebUIConfig.ts).
   */
  refreshPage(): void {
    this.is_connected = true;
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
