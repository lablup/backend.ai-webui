/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { default as TabCount } from '../lib/TabCounter';
import * as ai from '../lib/backend.ai-client-esm';
import './backend-ai-common-utils';
// backend-ai-login is now a React component registered as 'backend-ai-react-login-view'
import { BackendAIWebUIStyles } from './backend-ai-webui-styles';
import { LitElement, html, CSSResultGroup } from 'lit';
import { registerTranslateConfig, use as setLanguage } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

// Expose Backend.AI client classes globally for React components.
// Previously set by the now-removed backend-ai-login.ts.
// @ts-ignore
globalThis.BackendAIClient = ai.backend.Client;
// @ts-ignore
globalThis.BackendAIClientConfig = ai.backend.ClientConfig;

// lit-translate configuration for remaining Lit components
registerTranslateConfig({
  loader: (lang) =>
    fetch(`/resources/i18n/${lang}.json`).then((res) => res.json()),
});

// Global store initialization (settings, metadata, tasker, utils) has been
// moved to React. See react/src/global-stores.ts.
// The stores are assigned to globalThis from there, so existing Lit code
// that references globalThis.backendaioptions, globalThis.backendaimetadata,
// globalThis.tasker, or globalThis.backendaiutils continues to work.

/**
 Backend.AI Web UI

 `backend-ai-webui` is a minimal Lit shell that provides:
 - Login view orchestration

 Logout and app-close handling has been migrated to React
 (see react/src/hooks/useLogout.ts).
 Global store initialization (settings, metadata, tasker, utils) is now
 handled by React (see react/src/global-stores.ts).
 Config loading from config.toml is handled entirely by React
 (see react/src/hooks/useWebUIConfig.ts).

 All routing, page rendering, and UI is handled by React.
 Notifications are dispatched directly via the 'add-bai-notification'
 CustomEvent handled by BAINotificationButton in React.

 @group Backend.AI Web UI
 @element backend-ai-webui
 */
@customElement('backend-ai-webui')
export default class BackendAIWebUI extends LitElement {
  @property({ type: Boolean }) hasLoadedStrings = false;
  @property({ type: Boolean }) is_connected = false;
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
    // Logout, app-close, and beforeunload handlers are now registered from
    // React (useLogoutEventListeners in react/src/hooks/useLogout.ts).

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

    // Keep lit-translate in sync when user changes language (for remaining Lit components)
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

  protected render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/fonts/font-awesome-all.min.css" />
      <link rel="stylesheet" href="resources/custom.css" />
      <backend-ai-react-login-view
        id="login-panel"
      ></backend-ai-react-login-view>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-webui': BackendAIWebUI;
  }
}
