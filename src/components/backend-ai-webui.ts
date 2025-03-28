/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { navigate } from '../backend-ai-app';
// import '../lib/backend.ai-client-esm';
import { default as TabCount } from '../lib/TabCounter';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import './backend-ai-app-launcher';
import './backend-ai-common-utils';
import BackendAICommonUtils from './backend-ai-common-utils';
import './backend-ai-folder-explorer';
import './backend-ai-indicator-pool';
import './backend-ai-login';
import BackendAIMetadataStore from './backend-ai-metadata-store';
import { BackendAIPage } from './backend-ai-page';
import './backend-ai-project-switcher';
import './backend-ai-resource-broker';
import BackendAISettingsStore from './backend-ai-settings-store';
import './backend-ai-sidepanel-notification';
import './backend-ai-sidepanel-task';
import './backend-ai-splash';
import BackendAITasker from './backend-ai-tasker';
import { BackendAIWebUIStyles } from './backend-ai-webui-styles';
import './lablup-notification';
import LablupTermsOfService from './lablup-terms-of-service';
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
import { LitElement, html, CSSResultGroup } from 'lit';
import {
  get as _text,
  registerTranslateConfig,
  translate as _t,
  use as setLanguage,
} from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';
import toml from 'markty-toml';
// PWA components
import { connect } from 'pwa-helpers/connect-mixin';
import { installRouter } from 'pwa-helpers/router';

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
 </backend-ai-webui>lablup-terms-of-service

 @group Backend.AI Web UI
 @element backend-ai-webui
 */
@customElement('backend-ai-webui')
export default class BackendAIWebUI extends connect(store)(LitElement) {
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
  @property({ type: Boolean }) supportServing = false;
  @property({ type: Boolean }) supportUserCommittedImage = false;
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
    'unauthorized',
    'session',
    'session/start',
    'interactive-login',
    'chat',
    'ai-agent',
    'model-store',
  ]; // temporally block pipeline from available pages 'pipeline', 'pipeline-job'
  @property({ type: Array }) adminOnlyPages = [
    'experiment',
    'credential',
    'environment',
    'resource-policy',
  ];
  @property({ type: Array }) superAdminOnlyPages = [
    'agent',
    'storage-settings',
    'settings',
    'maintenance',
    'information',
  ];
  @property({ type: Array }) optionalPages;
  @property({ type: Number }) timeoutSec = 5;
  @property({ type: Object }) loggedAccount = Object();
  @property({ type: Object }) roleInfo = Object();
  @property({ type: Object }) keyPairInfo = Object();
  @property({ type: Boolean }) isOpenUserProfileDialog = false;
  @property({ type: Boolean }) isOpenSignoutDialog = false;
  @query('#app-page') appPage!: HTMLDivElement;
  @property({ type: Object }) _refreshPage = this.refreshPage.bind(this);
  // TODO need investigation about class method undefined issue
  // This issue occurred when importing exported class
  @query('#login-panel') loginPanel: any;
  @query('#main-toolbar') mainToolbar: any;
  @query('#terms-of-service') TOSdialog!: LablupTermsOfService;
  @query('backend-ai-splash') splash: any;
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
    globalThis.appLauncher = this.shadowRoot?.querySelector('#app-launcher');
    globalThis.resourceBroker =
      this.shadowRoot?.querySelector('#resource-broker');
    globalThis.currentPage = this._page;
    globalThis.currentPageParams = this._pageParams;
    this.notification = globalThis.lablupNotification;
    // if (globalThis.isElectron && navigator.platform.indexOf('Mac') >= 0) {
    //   // For macOS
    //   (
    //     this.shadowRoot?.querySelector('.portrait-canvas') as HTMLElement
    //   ).style.visibility = 'hidden';
    // }
    installRouter((location) =>
      store.dispatch(navigate(decodeURIComponent(location.pathname))),
    );
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
          if (this._page === 'verify-email') {
            const emailVerifyView = this.shadowRoot?.querySelector(
              'backend-ai-email-verification-view',
            );
            window.setTimeout(() => {
              emailVerifyView?.verify(this.loginPanel.api_endpoint);
            }, 1000);
          } else if (this._page === 'change-password') {
            const changePasswordView = this.shadowRoot?.querySelector(
              'backend-ai-change-forgot-password-view',
            );
            window.setTimeout(() => {
              changePasswordView?.open(this.loginPanel.api_endpoint);
            }, 1000);
          } else if (
            this._page === 'edu-applauncher' ||
            this._page === 'applauncher'
          ) {
            const eduApplauncherView = this.shadowRoot?.querySelector(
              'backend-ai-edu-applauncher',
            );
            window.setTimeout(() => {
              eduApplauncherView?.launch(this.loginPanel.api_endpoint);
            }, 1000);
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
        console.log('Initialization failed.');
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
      if (globalThis.backendaiclient.supports('change-user-name')) {
        const input = e.detail;
        this.full_name = input;
      }
    });
    document.addEventListener('move-to-from-react', (e) => {
      const params = (e as CustomEvent).detail.params;
      const path = (e as CustomEvent).detail.path;
      this._moveTo(path, params, true);
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
    if (typeof config.plugin !== 'undefined') {
      // Store plugin information
      if ('login' in config.plugin) {
        this.plugins['login'] = config.plugin.login;
      }
      if ('page' in config.plugin) {
        this.plugins['page'] = [];
        this.plugins['menuitem'] = [];
        this.plugins['menuitem-user'] = [];
        this.plugins['menuitem-admin'] = [];
        this.plugins['menuitem-superadmin'] = [];
        const pluginLoaderQueue: object[] = [];
        for (const page of config.plugin.page.split(',')) {
          const pluginUrl =
            globalThis.isElectron && this.loginPanel.api_endpoint
              ? `${this.loginPanel.api_endpoint}/dist/plugins/${page}.js`
              : `../plugins/${page}.js`;

          pluginLoaderQueue.push(
            import(pluginUrl).then(() => {
              const pageItem = document.createElement(page) as BackendAIPage;
              pageItem.classList.add('page');
              pageItem.setAttribute('name', page);
              this.appPage.appendChild(pageItem);
              this.plugins['menuitem'].push(page);
              this.availablePages.push(page);
              switch (pageItem.permission) {
                case 'superadmin':
                  this.plugins['menuitem-superadmin'].push(page);
                  this.superAdminOnlyPages.push(page);
                  break;
                case 'admin':
                  this.plugins['menuitem-admin'].push(page);
                  this.adminOnlyPages.push(page);
                  break;
                default:
                  this.plugins['menuitem-user'].push(page);
              }
              this.plugins['page'].push({
                name: page,
                url: page,
                menuitem: pageItem.menuitem,
                icon: pageItem.icon,
                group: pageItem.group,
              });
              return Promise.resolve(true);
            }),
          );
        }
        Promise.all(pluginLoaderQueue).then(() => {
          globalThis.backendaiPages = this.plugins['page'];
          const event: CustomEvent = new CustomEvent(
            'backend-ai-plugin-loaded',
            { detail: true },
          );
          document.dispatchEvent(event);
          this.requestUpdate();
        });
      }
    }
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
    // redirect to unauthorized page when user's role is neither admin nor superadmin
    if (!this.is_admin && !this.is_superadmin) {
      if (
        this.adminOnlyPages.includes(this._page) ||
        this.superAdminOnlyPages.includes(this._page) ||
        this._page === 'unauthorized'
      ) {
        this._page = 'unauthorized';
        this._moveTo('/unauthorized');
      }
    }

    // redirect to unauthorize page when admin user tries to access superadmin only page
    if (!this.is_superadmin && this.superAdminOnlyPages.includes(this._page)) {
      this._page = 'unauthorized';
      this._moveTo('/unauthorized');
    }

    this.supportServing = globalThis.backendaiclient.supports('model-serving');
    this.supportUserCommittedImage = globalThis.backendaiclient.supports(
      'user-committed-image',
    );
    this.optionalPages = [
      {
        page: 'agent-summary',
        available: !this.isHideAgents,
      },
      {
        page: 'serving',
        available: this.supportServing,
      },
      {
        page: 'my-environment',
        available: this.supportUserCommittedImage,
      },
    ];

    if (this._page === 'start') {
      this._moveTo('/start');
    }

    // redirect to error page when blocked by config option or the page is not available page.
    if (
      this.optionalPages
        .filter((item) => !item.available)
        .map((item) => item.page)
        .includes(this._page) ||
      this.blockedMenuItem.includes(this._page) ||
      this.inactiveMenuItem.includes(this._page) ||
      (!this.availablePages.includes(this._page) &&
        !this.plugins?.['menuitem']?.includes(this._page))
    ) {
      this._page = 'error';
      this._moveTo('/error');
    }
  }

  showUpdateNotifier(): void {
    const indicator = <any>(
      this.shadowRoot?.getElementById('backend-ai-indicator')
    );
    indicator.innerHTML =
      'New Web UI is available. Please <a onclick="globalThis.location.reload()">reload</a> to update.';
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
      .catch((err) => {
        console.log('Configuration file missing.');
        console.error(err);
      });
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
      navigate(decodeURIComponent('/'));
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
    console.log('also close the app:', performClose);
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
    this.TOSdialog.tosContent = '';
    this.TOSdialog.tosLanguage = this.lang;
    this.TOSdialog.title = _text('webui.menu.TermsOfService');
    this.TOSdialog.tosEntry = 'terms-of-service';
    this.TOSdialog.open();
  }

  /**
   * Display the PP(privacy policy) agreement.
   */
  showPPAgreement() {
    this.TOSdialog.tosContent = '';
    this.TOSdialog.tosLanguage = this.lang;
    this.TOSdialog.title = _text('webui.menu.PrivacyPolicy');
    this.TOSdialog.tosEntry = 'privacy-policy';
    this.TOSdialog.open();
  }

  /**
   * Moves to the specified URL and updates the state of the web component.
   * @param {string} url - The URL to navigate to.
   * @param {object} params - Optional parameters for the URL.
   * @param {boolean} fromReact - Indicates whether the navigation is triggered from React.
   */
  _moveTo(url, params = undefined, fromReact = false) {
    !fromReact && globalThis.history.pushState({}, '', url);
    store.dispatch(navigate(decodeURIComponent(url), params ?? {}));
    if ('menuitem' in this.plugins) {
      for (const item of this.plugins.menuitem) {
        if (item !== this._page) {
          // TODO specify type for web components from variable
          const component = this.shadowRoot?.querySelector(
            item,
          ) as BackendAIPage;
          component.active = false;
          component.removeAttribute('active');
        }
      }
      if (this.plugins['menuitem']?.includes(this._page)) {
        // TODO specify type for web components from variable
        const component = this.shadowRoot?.querySelector(
          this._page,
        ) as BackendAIPage;
        component.active = true;
        // component.setAttribute('active', true);
        component.requestUpdate();
      }
    }

    !fromReact &&
      document.dispatchEvent(
        new CustomEvent('react-navigate', {
          detail: url,
        }),
      );
  }

  /**
   * Change the state.
   *
   * @param {object} state
   */
  stateChanged(state) {
    this._page = state.app.page;
    this._pageParams = state.app.params;
    this._offline = state.app.offline;
    // this._drawerOpened = state.app.drawerOpened;
    globalThis.currentPage = this._page;
    globalThis.currentPageParams = this._pageParams;
  }

  _showSplash() {
    this.splash.show();
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
        <backend-ai-summary-view
          class="page"
          name="summary"
          ?active="${this._page === 'summary'}"
        >
          <mwc-circular-progress indeterminate></mwc-circular-progress>
        </backend-ai-summary-view>
        <backend-ai-import-view
          class="page"
          name="import"
          ?active="${this._page === 'github'}"
        >
          <mwc-circular-progress indeterminate></mwc-circular-progress>
        </backend-ai-import-view>
        <backend-ai-session-view
          class="page"
          name="job"
          ?active="${this._page === 'job'}"
        >
          <mwc-circular-progress indeterminate></mwc-circular-progress>
        </backend-ai-session-view>
        <backend-ai-email-verification-view
          class="page"
          name="email-verification"
          ?active="${this._page === 'verify-email'}"
        >
          <mwc-circular-progress indeterminate></mwc-circular-progress>
        </backend-ai-email-verification-view>
        <backend-ai-change-forgot-password-view
          class="page"
          name="change-forgot-password"
          ?active="${this._page === 'change-password'}"
        >
          <mwc-circular-progress indeterminate></mwc-circular-progress>
        </backend-ai-change-forgot-password-view>
        <backend-ai-edu-applauncher
          class="page"
          name="edu-applauncher"
          ?active="${this._page === 'edu-applauncher' ||
          this._page === 'applauncher'}"
        >
          <mwc-circular-progress indeterminate></mwc-circular-progress>
        </backend-ai-edu-applauncher>
      </div>

      <backend-ai-login active id="login-panel"></backend-ai-login>
      <backend-ai-splash id="about-backendai-panel"></backend-ai-splash>
      <lablup-notification id="notification"></lablup-notification>
      <backend-ai-indicator-pool id="indicator"></backend-ai-indicator-pool>
      <lablup-terms-of-service
        id="terms-of-service"
        block
      ></lablup-terms-of-service>
      <backend-ai-app-launcher id="app-launcher"></backend-ai-app-launcher>
      <backend-ai-resource-broker
        id="resource-broker"
        ?active="${this.is_connected}"
      ></backend-ai-resource-broker>
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
