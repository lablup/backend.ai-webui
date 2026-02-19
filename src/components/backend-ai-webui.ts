/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { default as TabCount } from '../lib/TabCounter';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-common-utils';
import BackendAICommonUtils from './backend-ai-common-utils';
import './backend-ai-indicator-pool';
// backend-ai-login is now a React component registered as 'backend-ai-react-login-view'
import BackendAIMetadataStore from './backend-ai-metadata-store';
import './backend-ai-project-switcher';
import BackendAISettingsStore from './backend-ai-settings-store';
import BackendAITasker from './backend-ai-tasker';
import { BackendAIWebUIStyles } from './backend-ai-webui-styles';
import './lablup-notification';
import '@material/mwc-button';
import '@material/mwc-circular-progress';
import '@material/mwc-icon';
import { IconButton } from '@material/mwc-icon-button';
import '@material/mwc-icon-button-toggle';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-select';
import '@material/mwc-textarea';
import '@material/mwc-top-app-bar-fixed';
import '@vaadin/tooltip';
import DOMPurify from 'dompurify';
import { LitElement, html, CSSResultGroup } from 'lit';
import {
  get as _text,
  registerTranslateConfig,
  translate as _t,
  use as setLanguage,
} from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';
import toml from 'markty-toml';

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

 `backend-ai-webui` is a shell of Backend.AI Web UI (web / app).

 Example:

 <backend-ai-webui>
 ... content ...
 </backend-ai-webui>

 @group Backend.AI Web UI
 @element backend-ai-webui
 */
@customElement('backend-ai-webui')
export default class BackendAIWebUI extends LitElement {
  @property({ type: Boolean }) hasLoadedStrings = false;
  @property({ type: String }) menuTitle = 'LOGIN REQUIRED';
  @property({ type: String }) user_id = 'DISCONNECTED';
  @property({ type: String }) full_name = 'DISCONNECTED';
  @property({ type: String }) domain = 'CLICK TO CONNECT';
  @property({ type: Boolean }) is_connected = false;
  @property({ type: Boolean }) is_admin = false;
  @property({ type: Boolean }) is_superadmin = false;
  @property({ type: Boolean }) allow_signout = false;
  @property({ type: Boolean }) needPasswordChange = false;
  @property({ type: String }) proxy_url = '';
  @property({ type: String }) connection_mode = 'API';
  @property({ type: String }) connection_server = '';
  @property({ type: String }) edition = 'Open Source';
  @property({ type: String }) validUntil = '';
  @property({ type: Array }) groups = [];
  @property({ type: Object }) plugins = Object();
  @property({ type: String }) fasttrackEndpoint = '';
  @property({ type: String }) _page = '';
  @property({ type: String }) _lazyPage = '';
  @property({ type: Object }) _pageParams = {};
  @property({ type: String }) _sidepanel:
    | ''
    | 'feedback'
    | 'notification'
    | 'task' = '';
  @property({ type: Boolean }) _offline = false;
  @property({ type: Object }) config = Object();
  @property({ type: Object }) notification;
  @property({ type: Boolean }) mini_ui = false;
  @property({ type: Boolean }) auto_logout = false;
  @property({ type: Boolean }) isUserInfoMaskEnabled;
  @property({ type: Boolean }) isHideAgents = true;
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
  @property({ type: Array }) blockedMenuItem;
  @property({ type: Array }) inactiveMenuItem;
  @property({ type: Number }) minibarWidth = 88;
  @property({ type: Number }) sidebarWidth = 250;
  @property({ type: Number }) sidepanelWidth = 250;
  @property({ type: Object }) supports = Object();
  @property({ type: Array }) availablePages = [
    'start',
    'dashboard',
    'admin-session',
    'admin-dashboard',
    'summary',
    'verify-email',
    'change-password',
    'job',
    'data',
    'my-environment',
    'agent-summary',
    'statistics',
    'usersettings',
    'credential',
    'environment',
    'agent',
    'resource-policy',
    'storage-settings',
    'settings',
    'maintenance',
    'serving',
    'service',
    'service/start',
    'service/update',
    'information',
    'github',
    'import',
    'session',
    'session/start',
    'interactive-login',
    'chat',
    'ai-agent',
    'model-store',
    'scheduler',
    'reservoir',
    'project',
    'branding',
  ];
  @property({ type: Array }) adminOnlyPages = [
    'experiment',
    'credential',
    'environment',
    'scheduler',
    'resource-policy',
  ];
  @property({ type: Array }) superAdminOnlyPages = [
    'admin-session',
    'admin-dashboard',
    'agent',
    'storage-settings',
    'settings',
    'maintenance',
    'information',
    'project',
    'branding',
  ];
  @property({ type: Array }) optionalPages;
  @property({ type: Number }) timeoutSec = 5;
  @property({ type: Object }) loggedAccount = Object();
  @property({ type: Object }) roleInfo = Object();
  @property({ type: Object }) keyPairInfo = Object();
  @property({ type: Boolean }) isOpenUserProfileDialog = false;
  @property({ type: Boolean }) isOpenSignoutDialog = false;
  @property({ type: Boolean }) isOpenSplashDialog = false;
  @query('#app-page') appPage!: HTMLDivElement;
  @property({ type: Object }) _refreshPage = this.refreshPage.bind(this);
  // TODO need investigation about class method undefined issue
  // This issue occurred when importing exported class
  @query('#login-panel') loginPanel: any;
  @query('#main-toolbar') mainToolbar: any;
  @property({ type: Boolean }) isOpenTOSDialog = false;
  @property({ type: String }) tosDialogEntry = 'terms-of-service';
  @query('#dropdown-button') _dropdownMenuIcon!: IconButton;

  constructor() {
    super();
    this.blockedMenuItem = [];
    this.inactiveMenuItem = [];
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAIWebUIStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
    ];
  }

  firstUpdated() {
    globalThis.lablupNotification =
      this.shadowRoot?.querySelector('#notification');
    globalThis.lablupIndicator = this.shadowRoot?.querySelector('#indicator');
    globalThis.currentPage = this._page;
    globalThis.currentPageParams = this._pageParams;
    this.notification = globalThis.lablupNotification;
    // React Router is the source of truth for routing.
    // Derive _page from the current URL path on initial load.
    this._updatePageFromPath(window.location.pathname);

    // Listen for location changes from React Router to keep _page in sync.
    document.addEventListener('locationPath:changed', () => {
      this._updatePageFromPath(window.location.pathname);
    });
    let configPath;
    if (globalThis.isElectron) {
      configPath = './config.toml';
      document.addEventListener('backend-ai-logout', ((
        e: CustomEvent<{ callbackURL: string }>,
      ) => {
        this.logout(false, e.detail?.callbackURL);
      }) as EventListener);
      document.addEventListener('backend-ai-app-close', () =>
        this.close_app_window(),
      );
      document.addEventListener('backend-ai-show-splash', () =>
        this._showSplash(),
      );
    } else {
      configPath = '../../config.toml';
      document.addEventListener('backend-ai-logout', ((
        e: CustomEvent<{ callbackURL: string }>,
      ) => {
        this.logout(false, e.detail?.callbackURL);
      }) as EventListener);
      document.addEventListener('backend-ai-show-splash', () =>
        this._showSplash(),
      );
    }
    globalThis.addEventListener('beforeunload', function () {
      globalThis.backendaioptions.set(
        'last_window_close_time',
        new Date().getTime() / 1000,
      );
    });
    this._parseConfig(configPath)
      .then(() => {
        this.loadConfig(this.config);
        // If disconnected
        if (
          typeof globalThis.backendaiclient === 'undefined' ||
          globalThis.backendaiclient === null ||
          globalThis.backendaiclient.ready === false
        ) {
          if (
            this._page === 'edu-applauncher' ||
            this._page === 'applauncher'
          ) {
            // React component backend-ai-react-edu-applauncher handles launch automatically
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
          this.loginPanel.block('Configuration is not loaded.', 'Error');
        }
      });
    this.mini_ui = globalThis.backendaioptions.get('compact_sidebar');
    globalThis.mini_ui = this.mini_ui;

    // apply update name when user info changed via users page
    document.addEventListener('current-user-info-changed', (e: any) => {
      const input = e.detail;
      this.full_name = input;
    });
    document.addEventListener('move-to-from-react', (e) => {
      const path = (e as CustomEvent).detail.path;
      // React Router already handles the actual navigation.
      // We only need to update _page for Lit-side state.
      this._updatePageFromPath(path);
    });
    document.addEventListener('show-TOS-agreement', () => {
      this.showTOSAgreement();
    });
    document.addEventListener('show-PP-agreement', () => {
      this.showPPAgreement();
    });
    document.addEventListener('show-about-backendai', () => {
      this._showSplash();
    });
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
    // this._initClient();
  }

  disconnectedCallback() {
    document.removeEventListener('backend-ai-connected', this._refreshPage);
    super.disconnectedCallback();
  }

  shouldUpdate(changedProperties) {
    return this.hasLoadedStrings && super.shouldUpdate(changedProperties);
  }

  loadConfig(config): void {
    if (
      typeof config.general !== 'undefined' &&
      'connectionMode' in config.general
    ) {
      this.connection_mode = config.general.connectionMode;
      // console.log(this.connection_mode);
    }
    if (
      typeof config.general !== 'undefined' &&
      'connectionServer' in config.general
    ) {
      this.connection_server = config.general.connectionServer;
      // console.log(this.connection_server);
    }
    if (
      typeof config.general !== 'undefined' &&
      'autoLogout' in config.general &&
      globalThis.backendaioptions.get('auto_logout') === null
    ) {
      this.auto_logout = config.general.autoLogout;
    } else {
      this.auto_logout = globalThis.backendaioptions.get('auto_logout', false);
    }
    if (typeof config.license !== 'undefined' && 'edition' in config.license) {
      this.edition = config.license.edition;
    }
    if (typeof config.menu !== 'undefined' && 'blocklist' in config.menu) {
      this.blockedMenuItem = config.menu.blocklist
        .split(',')
        .map((x: string) => x.trim());
    }
    if (typeof config.menu !== 'undefined' && 'inactivelist' in config.menu) {
      this.inactiveMenuItem = config.menu.inactivelist
        .split(',')
        .map((x: string) => x.trim());
    }
    if (
      typeof config.general !== 'undefined' &&
      'maskUserInfo' in config.general
    ) {
      this.isUserInfoMaskEnabled = config.general.maskUserInfo;
    }
    if (
      typeof config.general !== 'undefined' &&
      'hideAgents' in config.general
    ) {
      this.isHideAgents = config.general.hideAgents;
    }

    globalThis.packageEdition = this.edition;
    if (
      typeof config.license !== 'undefined' &&
      'validUntil' in config.license
    ) {
      this.validUntil = config.license.validUntil;
      // console.log(this.validUntil);
    }
    globalThis.packageValidUntil = this.validUntil;
    if (
      typeof config.general === 'undefined' ||
      typeof config.general.allowSignout === 'undefined' ||
      config.general.allowSignout === '' ||
      config.general.allowSignout == false
    ) {
      this.allow_signout = false;
    } else {
      this.allow_signout = true;
    }
    if (
      typeof config.pipeline !== 'undefined' &&
      'frontendEndpoint' in config.pipeline
    ) {
      this.fasttrackEndpoint = config.pipeline.frontendEndpoint;
    }
    // Dispatch plugin configuration to React for loading.
    // Plugin loading is now handled by the React PluginLoader component.
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
    this.loginPanel.refreshWithConfig(config);
    const event = new CustomEvent('backend-ai-config-loaded');
    document.dispatchEvent(event);
  }

  refreshPage(): void {
    // TODO need more clear type for mwc-list-item
    this.loggedAccount.access_key =
      globalThis.backendaiclient._config.accessKey;
    this.isUserInfoMaskEnabled =
      globalThis.backendaiclient._config.maskUserInfo;
    this.needPasswordChange = globalThis.backendaiclient.need_password_change;
    globalThis.backendaiclient.proxyURL = this.proxy_url;
    if (
      typeof globalThis.backendaiclient !== 'undefined' &&
      globalThis.backendaiclient != null &&
      typeof globalThis.backendaiclient.is_admin !== 'undefined' &&
      globalThis.backendaiclient.is_admin === true
    ) {
      this.is_admin = true;
    } else {
      this.is_admin = false;
    }
    if (
      typeof globalThis.backendaiclient !== 'undefined' &&
      globalThis.backendaiclient != null &&
      typeof globalThis.backendaiclient.is_superadmin !== 'undefined' &&
      globalThis.backendaiclient.is_superadmin === true
    ) {
      this.is_superadmin = true;
    } else {
      this.is_superadmin = false;
    }
    this._refreshUserInfoPanel();
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
    // Note: Unauthorized page redirect logic is handled in React (MainLayout/PageAccessGuard)
    this.optionalPages = [
      {
        page: 'agent-summary',
        available: !this.isHideAgents,
      },
    ];
    // Note: Redirect logic for blocked pages is handled in React (MainLayout/BlockedPageRedirector)
  }

  showUpdateNotifier(): void {
    const indicator = <any>(
      this.shadowRoot?.getElementById('backend-ai-indicator')
    );
    indicator.innerHTML = DOMPurify.sanitize(
      'New Web UI is available. Please <a onclick="globalThis.location.reload()">reload</a> to update.',
    );
    indicator.show();
  }

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
   * Refresh the user information panel.
   */
  _refreshUserInfoPanel(): void {
    this.user_id = globalThis.backendaiclient.email;
    this.full_name = globalThis.backendaiclient.full_name;
    this.domain = globalThis.backendaiclient._config.domainName;
  }

  /**
   * Load the page element.
   */
  _loadPageElement() {
    if (this._page === 'index.html' || this._page === '') {
      this._page = 'start';
      globalThis.currentPage = this._page;
    }
  }

  updated(changedProps: any) {
    if (changedProps.has('_page')) {
      let view: string = this._page;
      // load data for view
      if (this.availablePages.includes(view) !== true) {
        // Fallback for Windows OS
        const modified_view: string | undefined = view.split(/[/]+/).pop();
        if (typeof modified_view != 'undefined') {
          view = modified_view;
        }
      }
      this._page = view;
    }
  }

  /**
   * When user close the app window, delete login information.
   */
  async close_app_window() {
    if (globalThis.backendaioptions.get('preserve_login') === false) {
      // Delete login information.
      this.notification.text = _text('webui.CleanUpLoginSession');
      this.notification.show();
      const keys = Object.keys(localStorage);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (/^(BackendAIWebUI\.login\.)/.test(key)) {
          localStorage.removeItem(key);
        }
      }
      // remove data in sessionStorage
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
   *
   * @param {Boolean} performClose
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
      this.is_admin = false;
      this.is_superadmin = false;
      globalThis.backendaiclient = null;
      const keys = Object.keys(localStorage);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (/^(BackendAIWebUI\.login\.)/.test(key)) {
          localStorage.removeItem(key);
        }
      }
      // remove data in sessionStorage
      sessionStorage.clear();
      if (performClose === true) {
        // Do nothing. this window will be closed.
      } else if (globalThis.isElectron) {
        globalThis.location.href = globalThis.electronInitialHref;
      } else {
        this._moveTo(callbackURL);
        globalThis.location.reload();
      }
    }
  }

  /**
   * Display the ToS(terms of service) agreement.
   */
  showTOSAgreement() {
    this.tosDialogEntry = 'terms-of-service';
    this.isOpenTOSDialog = true;
  }

  /**
   * Display the PP(privacy policy) agreement.
   */
  showPPAgreement() {
    this.tosDialogEntry = 'privacy-policy';
    this.isOpenTOSDialog = true;
  }

  /**
   * Extract page name from a URL path and update _page state.
   * @param {string} path - The URL path to extract page from.
   */
  _updatePageFromPath(path: string) {
    const decodedPath = decodeURIComponent(path);
    let page: string;
    if (['/', '/build', '/app', '', 'build', 'app'].includes(decodedPath)) {
      page = 'start';
    } else if (decodedPath.startsWith('/')) {
      page = decodedPath.slice(1);
    } else {
      page = decodedPath;
    }
    // Handle paths with sub-routes (e.g., 'session/start' -> 'session')
    // but keep known multi-segment pages
    if (
      page.includes('/') &&
      !['service/start', 'service/update'].some((p) => page.startsWith(p))
    ) {
      page = page.split('/')[0];
    }
    this._page = page;
    this._pageParams = {};
    globalThis.currentPage = this._page;
    globalThis.currentPageParams = this._pageParams;
  }

  /**
   * Moves to the specified URL.
   * For Lit->React navigation, pushes to history and dispatches react-navigate.
   * For React->Lit navigation (fromReact=true), only updates internal state.
   * @param {string} url - The URL to navigate to.
   * @param {object} params - Optional parameters for the URL.
   * @param {boolean} fromReact - Indicates whether the navigation is triggered from React.
   */
  _moveTo(url, _params = undefined, fromReact = false) {
    if (!fromReact) {
      globalThis.history.pushState({}, '', url);
    }
    this._updatePageFromPath(url);

    if (!fromReact) {
      document.dispatchEvent(
        new CustomEvent('react-navigate', {
          detail: url,
        }),
      );
    }
  }

  // stateChanged() has been removed. Page state is now derived from
  // the URL path via _updatePageFromPath(), called when React Router
  // dispatches 'locationPath:changed' events.

  _showSplash() {
    this.isOpenSplashDialog = true;
  }

  protected render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/fonts/font-awesome-all.min.css" />
      <link rel="stylesheet" href="resources/custom.css" />
      <div id="loading-curtain" class="loading-background">
        <div id="loading-drag-area" class="loading-background-drag-area"></div>
      </div>
      <div id="app-page">
        <backend-ai-react-email-verification-view
          class="page"
          name="email-verification"
          value="${JSON.stringify({
            apiEndpoint: this.loginPanel?.api_endpoint || '',
            active: this._page === 'verify-email',
          })}"
        ></backend-ai-react-email-verification-view>
        <backend-ai-react-change-password-view
          class="page"
          name="change-password"
          value="${JSON.stringify({
            apiEndpoint: this.loginPanel?.api_endpoint || '',
            active: this._page === 'change-password',
          })}"
        ></backend-ai-react-change-password-view>
        <backend-ai-react-edu-applauncher
          class="page"
          name="edu-applauncher"
          value="${JSON.stringify({
            apiEndpoint: this.loginPanel?.api_endpoint || '',
            active:
              this._page === 'edu-applauncher' || this._page === 'applauncher',
          })}"
        ></backend-ai-react-edu-applauncher>
      </div>

      <backend-ai-react-login-view
        id="login-panel"
      ></backend-ai-react-login-view>
      <backend-ai-react-splash-modal
        value="${JSON.stringify({ open: this.isOpenSplashDialog })}"
        @close="${() => {
          this.isOpenSplashDialog = false;
        }}"
      ></backend-ai-react-splash-modal>
      <lablup-notification id="notification"></lablup-notification>
      <backend-ai-indicator-pool id="indicator"></backend-ai-indicator-pool>
      <backend-ai-react-tos-modal
        value="${JSON.stringify({
          open: this.isOpenTOSDialog,
          entry: this.tosDialogEntry,
        })}"
        @close="${() => {
          this.isOpenTOSDialog = false;
        }}"
      ></backend-ai-react-tos-modal>
      <backend-ai-react-signout-modal
        value="${this.isOpenSignoutDialog ? 'true' : 'false'}"
        @close="${() => {
          this.isOpenSignoutDialog = false;
        }}"
      ></backend-ai-react-signout-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-webui': BackendAIWebUI;
  }
}
