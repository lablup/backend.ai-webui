/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {LitElement, html, CSSResultGroup} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {get as _text, registerTranslateConfig, translate as _t, use as setLanguage} from 'lit-translate';

// PWA components
import {connect} from 'pwa-helpers/connect-mixin';
import {installOfflineWatcher} from 'pwa-helpers/network';
import {installRouter} from 'pwa-helpers/router';
import {store} from '../store';

import {navigate, updateOffline} from '../backend-ai-app';

import '../plastics/mwc/mwc-drawer';
import '../plastics/mwc/mwc-top-app-bar-fixed';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-icon-button-toggle';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-menu';
import '@material/mwc-select';
import '@material/mwc-circular-progress';

import toml from 'markty-toml';

import 'weightless/popover';
import 'weightless/popover-card';

import './backend-ai-app-launcher';
import './backend-ai-common-utils';
import './backend-ai-dialog';
import './backend-ai-help-button';
import './backend-ai-indicator-pool';
import './backend-ai-login';
import './backend-ai-offline-indicator';
import './backend-ai-resource-broker';
import BackendAiSettingsStore from './backend-ai-settings-store';
import BackendAiCommonUtils from './backend-ai-common-utils';
import './backend-ai-sidepanel-notification';
import './backend-ai-sidepanel-task';
import BackendAiTasker from './backend-ai-tasker';
import {BackendAIWebUIStyles} from './backend-ai-webui-styles';
import './backend-ai-splash';
import './lablup-notification';
import './lablup-terms-of-service';

import '../lib/backend.ai-client-es6';
import {default as TabCount} from '../lib/TabCounter';

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';
import '../plastics/mwc/mwc-multi-select';

registerTranslateConfig({
  loader: (lang) => fetch(`/resources/i18n/${lang}.json`).then((res) => res.json())
});
globalThis.backendaioptions = new BackendAiSettingsStore;
globalThis.tasker = new BackendAiTasker;
globalThis.backendaiutils = new BackendAiCommonUtils;

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
  public shadowRoot: any; // ShadowRoot
  @property({type: Boolean}) hasLoadedStrings = false;
  @property({type: String}) menuTitle = 'LOGIN REQUIRED';
  @property({type: String}) siteDescription = '';
  @property({type: String}) user_id = 'DISCONNECTED';
  @property({type: String}) full_name = 'DISCONNECTED';
  @property({type: String}) domain = 'CLICK TO CONNECT';
  @property({type: Boolean}) is_connected = false;
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) is_superadmin = false;
  @property({type: Boolean}) allow_signout = false;
  @property({type: Boolean}) needPasswordChange = false;
  @property({type: String}) proxy_url = '';
  @property({type: String}) connection_mode = 'API';
  @property({type: String}) connection_server = '';
  @property({type: String}) edition = 'Open Source';
  @property({type: String}) validUntil = '';
  @property({type: Array}) groups = [];
  @property({type: String}) current_group = '';
  @property({type: Object}) plugins = Object();
  @property({type: Object}) splash = Object();
  @property({type: Object}) loginPanel = Object();
  @property({type: String}) _page = '';
  @property({type: String}) _lazyPage = '';
  @property({type: Object}) _pageParams = {};
  @property({type: String}) _sidepanel = '';
  @property({type: Boolean}) _drawerOpened = false;
  @property({type: Boolean}) _offlineIndicatorOpened = false;
  @property({type: Boolean}) _offline = false;
  @property({type: Object}) _dropdownMenuIcon = Object();
  @property({type: Object}) config = Object();
  @property({type: Object}) notification;
  @property({type: Object}) appBody;
  @property({type: Object}) appPage;
  @property({type: Object}) contentBody;
  @property({type: Object}) mainToolbar;
  @property({type: Object}) drawerToggleButton;
  @property({type: Object}) sidebarMenu;
  @property({type: Object}) TOSdialog = Object();
  @property({type: Boolean}) mini_ui = false;
  @property({type: Boolean}) auto_logout = false;
  @property({type: Boolean}) isUserInfoMaskEnabled;
  @property({type: String}) lang = 'default';
  @property({type: Array}) supportLanguageCodes = ['en', 'ko', 'ru', 'fr', 'mn', 'id'];
  @property({type: Array}) blockedMenuitem;
  @property({type: Number}) minibarWidth = 88;
  @property({type: Number}) sidebarWidth = 250;
  @property({type: Number}) sidepanelWidth = 250;
  @property({type: Object}) supports = Object();
  @property({type: Array}) availablePages = ['summary', 'verify-email', 'change-password', 'job',
    'data', 'pipeline', 'statistics', 'usersettings', 'credential',
    'environment', 'agent', 'settings', 'maintenance',
    'information', 'github', 'import', 'unauthorized'];
  @property({type: Array}) adminOnlyPages = ['experiment', 'credential', 'environment', 'agent',
    'settings', 'maintenance', 'information'];
  @property({type: Array}) superAdminOnlyPages = ['agent', 'settings', 'maintenance', 'information'];
  @property({type: Number}) timeoutSec = 5;
  @property({type: Boolean}) use_experiment = false;
  @property({type: Object}) loggedAccount = Object();
  @property({type: Object}) roleInfo = Object();
  @property({type: Object}) keyPairInfo = Object();

  constructor() {
    super();
    this.blockedMenuitem = [];
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAIWebUIStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning
    ];
  }

  firstUpdated() {
    globalThis.lablupNotification = this.shadowRoot.querySelector('#notification');
    globalThis.lablupIndicator = this.shadowRoot.querySelector('#indicator');
    globalThis.appLauncher = this.shadowRoot.querySelector('#app-launcher');
    globalThis.resourceBroker = this.shadowRoot.querySelector('#resource-broker');
    globalThis.currentPage = this._page;
    globalThis.currentPageParams = this._pageParams;
    this.notification = globalThis.lablupNotification;
    this.appBody = this.shadowRoot.querySelector('#app-body');
    this.appPage = this.shadowRoot.querySelector('#app-page');
    this.contentBody = this.shadowRoot.querySelector('#content-body');
    this.contentBody.type = 'dismissible';
    this.mainToolbar = this.shadowRoot.querySelector('#main-toolbar');
    this.drawerToggleButton = this.shadowRoot.querySelector('#drawer-toggle-button');
    this.sidebarMenu = this.shadowRoot.getElementById('sidebar-menu');
    this.splash = this.shadowRoot.querySelector('#about-backendai-panel');
    this.loginPanel = this.shadowRoot.querySelector('#login-panel');
    this.TOSdialog = this.shadowRoot.querySelector('#terms-of-service');
    this._dropdownMenuIcon = this.shadowRoot.querySelector('#dropdown-button');
    if (globalThis.isElectron && navigator.platform.indexOf('Mac') >= 0) { // For macOS
      (this.shadowRoot.querySelector('.portrait-canvas') as HTMLElement).style.visibility = 'hidden';
    }
    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    let configPath;
    if (globalThis.isElectron) {
      configPath = './config.toml';
      document.addEventListener('backend-ai-logout', () => this.logout(true));
      document.addEventListener('backend-ai-app-close', () => this.close_app_window(true));
      document.addEventListener('backend-ai-show-splash', () => this.splash.show());
    } else {
      configPath = '../../config.toml';
      document.addEventListener('backend-ai-logout', () => this.logout(false));
    }
    globalThis.addEventListener('beforeunload', function(event) {
      globalThis.backendaioptions.set('last_window_close_time', new Date().getTime() / 1000);
    });
    this._parseConfig(configPath).then(() => {
      this.loadConfig(this.config);
      // If disconnected
      if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
        if (this._page === 'verify-email') {
          const emailVerifyView = this.shadowRoot.querySelector('backend-ai-email-verification-view');
          window.setTimeout(() => {
            emailVerifyView.verify(this.loginPanel.api_endpoint);
          }, 1000);
        } else if (this._page === 'change-password') {
          const changePasswordView = this.shadowRoot.querySelector('backend-ai-change-forgot-password-view');
          window.setTimeout(() => {
            changePasswordView.open(this.loginPanel.api_endpoint);
          }, 1000);
        } else if (this._page === 'edu-applauncher') {
          const eduApplauncherView = this.shadowRoot.querySelector('backend-ai-edu-applauncher');
          window.setTimeout(() => {
            eduApplauncherView.launch(this.loginPanel.api_endpoint);
          }, 1000);
        } else {
          const tabcount = new TabCount();
          const isPageReloaded = (
            (window.performance.navigation && window.performance.navigation.type === 1) ||
              window.performance
                .getEntriesByType('navigation')
                .map((nav: any) => nav.type)
                .includes('reload')
          );
          tabcount.tabsCount(true);
          if (this.auto_logout === true && tabcount.tabsCounter === 1 && !isPageReloaded) {
            this.loginPanel.check_login().then((result) => {
              const current_time: number = new Date().getTime() / 1000;
              if (result === true && (current_time - globalThis.backendaioptions.get('last_window_close_time', current_time) > 3.0)) { // currently login.
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
    }).catch((err) => {
      console.log('Initialization failed.');
      if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
        this.loginPanel.block('Configuration is not loaded.', 'Error');
      }
    });
    this.mini_ui = globalThis.backendaioptions.get('compact_sidebar');
    globalThis.mini_ui = this.mini_ui;

    this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
    globalThis.addEventListener('resize', (event) => {
      this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
      // Tricks to close expansion if window size changes
      document.body.dispatchEvent(new Event('click'));
    });
    // apply update name when user info changed via users page
    document.addEventListener('current-user-info-changed', (e: any) => {
      if (globalThis.backendaiclient.supports('change-user-name')) {
        const input = e.detail;
        this._updateFullname(input.full_name);
      }
    });
  }

  async connectedCallback() {
    super.connectedCallback();
    document.addEventListener('backend-ai-connected', () => this.refreshPage());
    const defaultLang = globalThis.navigator.language.split('-')[0];
    if (globalThis.backendaioptions.get('language') === 'default' && this.supportLanguageCodes.includes(defaultLang)) {
      this.lang = defaultLang;
    } else if (this.supportLanguageCodes.includes(globalThis.backendaioptions.get('language'))) {
      this.lang = globalThis.backendaioptions.get('language');
    } else {
      this.lang = 'en';
    }
    globalThis.backendaioptions.set('current_language', this.lang);
    await setLanguage(this.lang);
    this.hasLoadedStrings = true;
    // this._initClient();
  }

  disconnectedCallback() {
    document.removeEventListener('backend-ai-connected', () => this.refreshPage());
    super.disconnectedCallback();
  }

  shouldUpdate(changedProperties) {
    return this.hasLoadedStrings && super.shouldUpdate(changedProperties);
  }

  loadConfig(config): void {
    if (typeof config.general !== 'undefined' && 'siteDescription' in config.general) {
      this.siteDescription = config.general.siteDescription;
    }
    if (typeof config.general !== 'undefined' && 'connectionMode' in config.general) {
      this.connection_mode = config.general.connectionMode;
      // console.log(this.connection_mode);
    }
    if (typeof config.general !== 'undefined' && 'connectionServer' in config.general) {
      this.connection_server = config.general.connectionServer;
      // console.log(this.connection_server);
    }
    if ((typeof config.general !== 'undefined' && 'autoLogout' in config.general) && globalThis.backendaioptions.get('auto_logout') === null) {
      this.auto_logout = config.general.autoLogout;
    } else {
      this.auto_logout = globalThis.backendaioptions.get('auto_logout', false);
    }
    if (typeof config.license !== 'undefined' && 'edition' in config.license) {
      this.edition = config.license.edition;
    }
    if (typeof config.menu !== 'undefined' && 'blocklist' in config.menu) {
      this.blockedMenuitem = config.menu.blocklist.split(',');
    }
    if ((typeof config.general !== 'undefined' && 'maskUserInfo' in config.general)) {
      this.isUserInfoMaskEnabled = config.general.maskUserInfo;
    }

    globalThis.packageEdition = this.edition;
    if (typeof config.license !== 'undefined' && 'validUntil' in config.license) {
      this.validUntil = config.license.validUntil;
      // console.log(this.validUntil);
    }
    globalThis.packageValidUntil = this.validUntil;
    if (typeof config.general === 'undefined' || typeof config.general.allowSignout === 'undefined' || config.general.allowSignout === '' || config.general.allowSignout == false) {
      this.allow_signout = false;
    } else {
      this.allow_signout = true;
    }
    if (typeof config.plugin !== 'undefined') { // Store plugin informations
      if ('login' in config.plugin) {
        this.plugins['login'] = config.plugin.login;
      }
      if ('page' in config.plugin) {
        this.plugins['page'] = [];
        this.plugins['menuitem'] = [];
        this.plugins['menuitem-user'] = [];
        this.plugins['menuitem-admin'] = [];
        this.plugins['menuitem-superadmin'] = [];
        const pluginLoaderQueue = [] as any;
        for (const page of config.plugin.page.split(',')) {
          pluginLoaderQueue.push(import('../plugins/' + page + '.js').then((module) => {
            const pageItem = document.createElement(page) as any;
            pageItem.classList.add('page');
            pageItem.setAttribute('name', page);
            this.appPage.appendChild(pageItem);
            this.plugins['menuitem'].push(page);
            this.availablePages.push(page);
            switch (pageItem.permission) {
            case 'superadmin':
              this.plugins['menuitem-superadmin'].push(page);
              this.adminOnlyPages.push(page);
              break;
            case 'admin':
              this.plugins['menuitem-admin'].push(page);
              this.adminOnlyPages.push(page);
              break;
            default:
              this.plugins['menuitem-user'].push(page);
            }
            this.plugins['page'].push({
              'name': page,
              'url': page,
              'menuitem': pageItem.menuitem
            });
            return Promise.resolve(true);
          }));
        }
        Promise.all(pluginLoaderQueue).then((v)=>{
          globalThis.backendaiPages = this.plugins['page'];
          const event: CustomEvent = new CustomEvent('backend-ai-plugin-loaded', {'detail': true});
          document.dispatchEvent(event);
          this.requestUpdate();
        });
      }
    }
    this.loginPanel.refreshWithConfig(config);
  }

  refreshPage(): void {
    (this.shadowRoot.getElementById('sign-button') as any).icon = 'exit_to_app';
    this.loggedAccount.access_key = globalThis.backendaiclient._config.accessKey;
    this.isUserInfoMaskEnabled = globalThis.backendaiclient._config.maskUserInfo;
    this.needPasswordChange = globalThis.backendaiclient.need_password_change;
    globalThis.backendaiclient.proxyURL = this.proxy_url;
    if (typeof globalThis.backendaiclient !== 'undefined' && globalThis.backendaiclient != null &&
      typeof globalThis.backendaiclient.is_admin !== 'undefined' && globalThis.backendaiclient.is_admin === true) {
      this.is_admin = true;
    } else {
      this.is_admin = false;
    }
    if (typeof globalThis.backendaiclient !== 'undefined' && globalThis.backendaiclient != null &&
      typeof globalThis.backendaiclient.is_superadmin !== 'undefined' && globalThis.backendaiclient.is_superadmin === true) {
      this.is_superadmin = true;
    } else {
      this.is_superadmin = false;
    }
    this._refreshUserInfoPanel();
    globalThis.backendaiutils._writeRecentProjectGroup(this.current_group);
    document.body.style.backgroundImage = 'none';
    this.appBody.style.visibility = 'visible';

    const curtain: HTMLElement = this.shadowRoot.getElementById('loading-curtain');
    curtain.classList.add('visuallyhidden');
    curtain.addEventListener('transitionend', () => {
      curtain.classList.add('hidden');
      this.is_connected = true;
    }, {
      capture: false,
      once: true,
      passive: false
    });
    this.addTooltips();
    this.sidebarMenu.style.minHeight = (this.is_admin || this.is_superadmin) ? '600px' : '250px';
    // redirect to unauthorized page when user's role is neither admin nor superadmin
    if (!this.is_admin && !this.is_superadmin) {
      if (this.adminOnlyPages.includes(this._page) || this._page === 'unauthorized') {
        this._page = 'unauthorized';
        globalThis.history.pushState({}, '', '/unauthorized');
        store.dispatch(navigate(decodeURIComponent(this._page)));
      }
    }

    // redirect to unauthorize page when admin user tries to access superadmin only page
    if (!this.is_superadmin && this.superAdminOnlyPages.includes(this._page)) {
      this._page = 'unauthorized';
      globalThis.history.pushState({}, '', '/unauthorized');
      store.dispatch(navigate(decodeURIComponent(this._page)));
    }
  }

  showUpdateNotifier(): void {
    const indicator = <any> this.shadowRoot.getElementById('backend-ai-indicator');
    indicator.innerHTML = 'New Web UI is available. Please <a onclick="globalThis.location.reload()">reload</a> to update.';
    indicator.show();
  }

  _parseConfig(fileName): Promise<void> {
    return fetch(fileName)
      .then((res) => {
        if (res.status == 200) {
          return res.text();
        }
        return '';
      })
      .then((res) => {
        this.config = toml(res);
      }).catch((err) => {
        console.log('Configuration file missing.');
      });
  }

  /**
   * Display the toggle sidebar when this.mini_ui is true.
   */
  toggleSidebarUI(): void {
    if (this.contentBody.open === true) {
      this._sidepanel = '';
      this.toggleSidePanelUI();
    }
    if (!this.mini_ui) {
      this.mini_ui = true;
    } else {
      this.mini_ui = false;
    }
    globalThis.mini_ui = this.mini_ui;
    const event: CustomEvent = new CustomEvent('backend-ai-ui-changed', {'detail': {'mini-ui': this.mini_ui}});
    document.dispatchEvent(event);
    this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight);
  }

  /**
   * Set the drawer width by browser size.
   */
  toggleSidePanelUI(): void {
    if (this.contentBody.open) {
      this.contentBody.open = false;
      if (this.mini_ui) {
        this.mainToolbar.style.setProperty('--mdc-drawer-width', this.minibarWidth + 'px');// 54
      } else {
        this.mainToolbar.style.setProperty('--mdc-drawer-width', this.sidebarWidth + 'px');// 250
      }
    } else {
      this.contentBody.open = true;
      this.contentBody.style.setProperty('--mdc-drawer-width', this.sidepanelWidth + 'px');
      if (this.mini_ui) {
        this.mainToolbar.style.setProperty('--mdc-drawer-width', this.minibarWidth + this.sidepanelWidth + 'px');// 54+250
      } else {
        this.mainToolbar.style.setProperty('--mdc-drawer-width', this.sidebarWidth + this.sidepanelWidth + 'px');// 250+250
      }
    }
  }

  /**
   * Set the toggle side panel type.
   */
  toggleSidePanelType() {
    if (this.contentBody.type === 'dismissible') {
      this.contentBody.type === 'modal';
    } else {
      this.contentBody.type === 'dismissible';
    }
  }

  /**
   * Control the side panel by panel's state.
   *
   * @param {string} panel
   */
  _openSidePanel(panel): void {
    if (document.body.clientWidth < 750) {
      this.mini_ui = true;
      this._changeDrawerLayout(document.body.clientWidth, document.body.clientHeight, true);
    }

    if (this.contentBody.open === true) {
      if (panel != this._sidepanel) { // change panel only.
        this._sidepanel = panel;
      } else { // just close panel. (disable icon amp.)
        this._sidepanel = '';
        this.toggleSidePanelUI();
      }
    } else { // open new panel.
      this._sidepanel = panel;
      this.toggleSidePanelUI();
    }
  }

  /**
   * Change the drawer layout according to browser size.
   *
   * @param {number} width
   * @param {number} height
   * @param {boolean} applyMiniui
   */
  _changeDrawerLayout(width, height, applyMiniui = false): void {
    this.mainToolbar.style.setProperty('--mdc-drawer-width', '0px');
    if (width < 700 && !applyMiniui) { // Close drawer
      this.appBody.style.setProperty('--mdc-drawer-width', this.sidebarWidth + 'px');
      this.appBody.type = 'modal';
      this.appBody.open = false;
      // this.contentBody.style.width = 'calc('+width+'px - 190px)';
      this.contentBody.style.width = width + 'px';
      this.mainToolbar.style.setProperty('--mdc-drawer-width', '0px');
      this.drawerToggleButton.style.display = 'block';
      if (this.mini_ui) {
        this.mini_ui = false;
        globalThis.mini_ui = this.mini_ui;
      }
      /* close opened sidepanel immediately */
      if (this.contentBody.open) {
        this.contentBody.open = false;
      }
    } else { // Open drawer
      if (this.mini_ui) {
        this.appBody.style.setProperty('--mdc-drawer-width', this.minibarWidth + 'px');
        this.mainToolbar.style.setProperty('--mdc-drawer-width', this.minibarWidth + 'px');
        this.contentBody.style.width = (width - this.minibarWidth) + 'px';
        if (this.contentBody.open) {
          this.mainToolbar.style.setProperty('--mdc-drawer-width', this.minibarWidth + this.sidebarWidth + 'px');// 54+250
        }
      } else {
        this.appBody.style.setProperty('--mdc-drawer-width', this.sidebarWidth + 'px');
        this.mainToolbar.style.setProperty('--mdc-drawer-width', this.sidebarWidth + 'px');
        this.contentBody.style.width = (width - this.sidebarWidth) + 'px';
        if (this.contentBody.open) {
          this.mainToolbar.style.setProperty('--mdc-drawer-width', this.sidebarWidth + this.sidepanelWidth + 'px'); // 250+250
        }
      }
      this.appBody.type = 'dismissible';
      this.appBody.open = true;
      this.drawerToggleButton.style.display = 'none';
    }
    if (this.contentBody.open) {
      this.contentBody.style.setProperty('--mdc-drawer-width', this.sidepanelWidth + 'px');
    }
  }

  /**
   * Refresh the user information panel.
   */
  _refreshUserInfoPanel(): void {
    this.user_id = globalThis.backendaiclient.email;
    this.full_name = globalThis.backendaiclient.full_name;
    this.domain = globalThis.backendaiclient._config.domainName;
    this.current_group = globalThis.backendaiutils._readRecentProjectGroup();
    this._showRole();
    globalThis.backendaiclient.current_group = this.current_group;
    this.groups = globalThis.backendaiclient.groups;
    const groupSelectionBox: HTMLElement = this.shadowRoot.getElementById('group-select-box');
    // Detached from template to support live-update after creating new group (will need it)
    if (groupSelectionBox.hasChildNodes()) {
      groupSelectionBox.removeChild(groupSelectionBox.firstChild as ChildNode);
    }
    const div = document.createElement('div') as any;
    div.className = 'horizontal center center-justified layout';
    const select = document.createElement('mwc-select') as any;
    select.id = 'group-select';
    select.value = this.current_group;
    select.style = 'width: auto;max-width: 200px;';
    select.addEventListener('selected', (e) => this.changeGroup(e));
    let opt = document.createElement('mwc-list-item');
    opt.setAttribute('disabled', 'true');
    opt.innerHTML = _text('webui.menu.SelectProject');
    opt.style.borderBottom = '1px solid #ccc';
    select.appendChild(opt);
    this.groups.map((group) => {
      opt = document.createElement('mwc-list-item');
      opt.value = group;
      if (this.current_group === group) {
        opt.selected = true;
      } else {
        opt.selected = false;
      }
      opt.innerHTML = group;
      select.appendChild(opt);
    });
    // select.updateOptions();
    div.appendChild(select);
    groupSelectionBox.appendChild(div);
  }

  /**
   * Load the page element.
   */
  _loadPageElement() {
    if (this._page === 'index.html' || this._page === '') {
      this._page = 'summary';
      navigate(decodeURIComponent('/'));
    }
  }

  /**
   * Open the user preference dialog.
   */
  async _openUserPrefDialog() {
    this._showKeypairInfo();
    const dialog = this.shadowRoot.querySelector('#user-preference-dialog');
    dialog.show();
  }

  /**
   * Hide the user preference dialog.
   */
  _hideUserPrefDialog() {
    this.shadowRoot.querySelector('#user-preference-dialog').hide();
  }

  _togglePasswordVisibility(element) {
    const isVisible = element.__on;
    const password = element.closest('div').querySelector('mwc-textfield');
    isVisible ? password.setAttribute('type', 'text') : password.setAttribute('type', 'password');
  }

  _validatePassword1() {
    const passwordInput = this.shadowRoot.querySelector('#pref-new-password');
    const password2Input = this.shadowRoot.querySelector('#pref-new-password2');
    password2Input.reportValidity();
    passwordInput.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          passwordInput.validationMessage = _text('signup.PasswordInputRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          passwordInput.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        return {
          valid: nativeValidity.valid,
          customError: !nativeValidity.valid
        };
      }
    };
  }

  _validatePassword2() {
    const password2Input = this.shadowRoot.querySelector('#pref-new-password2');
    password2Input.validityTransform = (newValue, nativeValidity) => {
      if (!nativeValidity.valid) {
        if (nativeValidity.valueMissing) {
          password2Input.validationMessage = _text('signup.PasswordInputRequired');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        } else {
          password2Input.validationMessage = _text('signup.PasswordInvalid');
          return {
            valid: nativeValidity.valid,
            customError: !nativeValidity.valid
          };
        }
      } else {
        // custom validation for password input match
        const passwordInput = this.shadowRoot.querySelector('#pref-new-password');
        const isMatched = (passwordInput.value === password2Input.value);
        if (!isMatched) {
          password2Input.validationMessage = _text('signup.PasswordNotMatched');
        }
        return {
          valid: isMatched,
          customError: !isMatched
        };
      }
    };
  }

  /**
   * Validate User input in password automatically, and show error message if any input error occurs.
   */
  _validatePassword() {
    this._validatePassword1();
    this._validatePassword2();
  }

  /**
   * Update the user information including full_name of user and password
   */
  _updateUserInformation() {
    if (globalThis.backendaiclient.supports('change-user-name')) {
      this._updateFullname();
    }
    this._updateUserPassword();
  }

  /**
   * Update the full_name of user information
   *
   * @param {string} newFullname - Name to be modified
   */
  async _updateFullname(newFullname = '') {
    newFullname = newFullname === '' ? this.shadowRoot.querySelector('#pref-original-name').value : newFullname;
    if (newFullname.length > 64) {
      this.notification.text = _text('webui.menu.FullNameInvalid');
      this.notification.show();
      return;
    }
    // if user input in full name is not null and not same as the original full name, then it updates.
    if (globalThis.backendaiclient.supports('change-user-name')) {
      if (newFullname && (newFullname !== this.full_name)) {
        globalThis.backendaiclient.update_full_name(this.user_id, newFullname).then((resp) => {
          this.notification.text = _text('webui.menu.FullnameUpdated');
          this.notification.show();
          this.full_name = globalThis.backendaiclient.full_name = newFullname;
          this.shadowRoot.querySelector('#pref-original-name').value = this.full_name;
        }).catch((err) => {
          if (err && err.message) {
            this.notification.text = err.message;
            this.notification.detail = err.message;
            this.notification.show(true, err);
            return;
          } else if (err && err.title) {
            this.notification.text = err.title;
            this.notification.detail = err.message;
            this.notification.show(true, err);
            return;
          }
        });
      }
    } else {
      this.notification.text = _text('error.APINotSupported');
      this.notification.show();
    }
  }

  /**
   * Update the user password.
   */
  async _updateUserPassword() {
    const dialog = this.shadowRoot.querySelector('#user-preference-dialog');
    const oldPassword = dialog.querySelector('#pref-original-password').value;
    const newPassword1El = dialog.querySelector('#pref-new-password');
    const newPassword2El = dialog.querySelector('#pref-new-password2');

    // no update in user's password
    if (!oldPassword && !newPassword1El.value && !newPassword2El.value) {
      this._hideUserPrefDialog();
      return;
    }

    if (!oldPassword) {
      this.notification.text = _text('webui.menu.InputOriginalPassword');
      this.notification.show();
      return;
    }
    if (!newPassword1El.value || !newPassword1El.validity.valid) {
      this.notification.text = _text('webui.menu.InvalidPasswordMessage');
      this.notification.show();
      return;
    }
    if (newPassword1El.value !== newPassword2El.value) {
      this.notification.text = _text('webui.menu.NewPasswordMismatch');
      this.notification.show();
      return;
    }
    const p = globalThis.backendaiclient.update_password(oldPassword, newPassword1El.value, newPassword2El.value);
    p.then((resp) => {
      this.notification.text = _text('webui.menu.PasswordUpdated');
      this.notification.show();
      this._hideUserPrefDialog();
    }).catch((err) => {
      if (err && err.message) {
        this.notification.text = err.message;
        this.notification.detail = err.message;
        this.notification.show(true, err);
        return;
      } else if (err && err.title) {
        this.notification.text = err.title;
        this.notification.detail = err.message;
        this.notification.show(true, err);
        return;
      }
    }).finally(() => { // remove input value again
      this.shadowRoot.querySelector('#pref-original-password').value = '';
      this.shadowRoot.querySelector('#pref-new-password').value = '';
      this.shadowRoot.querySelector('#pref-new-password2').value = '';
    });
  }

  _menuSelected(e) {
    // Reserved for future use.
  }

  updated(changedProps: any) {
    if (changedProps.has('_page')) {
      let view: string = this._page;
      // load data for view
      if (this.availablePages.includes(view) !== true) { // Fallback for Windows OS
        const modified_view: (string | undefined) = view.split(/[/]+/).pop();
        if (typeof modified_view != 'undefined') {
          view = modified_view;
        }
      }
      this._page = view;
      this._updateSidebar(view);
    }
  }

  /**
   * Update the sidebar menu title according to view.
   *
   * @param {string} view - Sidebar menu title string.
   */
  _updateSidebar(view) {
    switch (view) {
    case 'summary':
    case 'verify-email':
      this.menuTitle = _text('webui.menu.Summary');
      break;
    case 'change-password':
      this.menuTitle = _text('webui.menu.Summary') + this.user_id;
      break;
    case 'job':
      this.menuTitle = _text('webui.menu.Sessions');
      break;
    case 'experiment':
      this.menuTitle = _text('webui.menu.Experiments');
      break;
    case 'data':
      this.menuTitle = _text('webui.menu.Data&Storage');
      break;
    case 'pipeline':
      this.menuTitle = _text('webui.menu.Pipeline');
      break;
    case 'statistics':
      this.menuTitle = _text('webui.menu.Statistics');
      break;
    case 'usersettings':
      this.menuTitle = _text('webui.menu.Settings&Logs');
      break;
    case 'credential':
      this.menuTitle = _text('webui.menu.UserCredentials&Policies');
      break;
    case 'environment':
      this.menuTitle = _text('webui.menu.Environments&Presets');
      break;
    case 'agent':
      this.menuTitle = _text('webui.menu.ComputationResources');
      break;
    case 'settings':
      this.menuTitle = _text('webui.menu.Configurations');
      break;
    case 'maintenance':
      this.menuTitle = _text('webui.menu.Maintenance');
      break;
    case 'information':
      this.menuTitle = _text('webui.menu.Information');
      break;
    case 'logs':
      this.menuTitle = _text('webui.menu.Logs');
      break;
    case 'github':
    case 'import':
      this.menuTitle = _text('webui.menu.Import&Run');
      break;
    default:
      if ('menuitem' in this.plugins && this.plugins['menuitem'].includes(view)) {
        this.menuTitle = view;
        break;
      } else {
        if (this._page !== 'error') {
          this._lazyPage = this._page;
        }
        document.addEventListener('backend-ai-plugin-loaded', () => {
          this._page = this._lazyPage;
          if (this.availablePages.includes(this._page) !== true) {
            this._page = 'error';
          }
          if ('menuitem' in this.plugins && this.plugins['menuitem'].includes(this._page)) {
            const component = this.shadowRoot.querySelector(this._page);
            component.active = true;
            component.setAttribute('active', true);
            component.render();
          }
        });
        break;
      }
      console.log('set to error');
      this._page = 'error';
      this.menuTitle = _text('webui.NOTFOUND');
    }
  }

  /**
   * When user close the app window, delete login information.
   *
   * @param {Boolean} performClose
   */
  async close_app_window(performClose = false) {
    if (globalThis.backendaioptions.get('preserve_login') === false) { // Delete login information.
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
    }
    if (typeof globalThis.backendaiclient != 'undefined' && globalThis.backendaiclient !== null) {
      if (globalThis.backendaiclient._config.connectionMode === 'SESSION') {
        await globalThis.backendaiclient.logout();
      }
      globalThis.backendaiclient = null;
    }
  }

  /**
   * Logout from the backend.ai client.
   *
   * @param {Boolean} performClose
   */
  async logout(performClose = false) {
    console.log('also close the app:', performClose);
    globalThis.backendaiutils._deleteRecentProjectGroupInfo();
    if (typeof globalThis.backendaiclient != 'undefined' && globalThis.backendaiclient !== null) {
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
        this.user_id = '';
        this.domain = '';
        this._page = 'summary';
        globalThis.history.pushState({}, '', '/summary');
        store.dispatch(navigate(decodeURIComponent('/')));
        // globalThis.location.reload();
        document.body.style.backgroundImage = 'url("/resources/images/loading-background-large.jpg")';
        this.appBody.style.visibility = 'hidden';
        const curtain: HTMLElement = this.shadowRoot.getElementById('loading-curtain');
        curtain.classList.remove('visuallyhidden');
        curtain.addEventListener('transitionend', () => {
          curtain.classList.remove('hidden');
        }, {
          capture: false,
          once: true,
          passive: false
        });
        this.loginPanel.open();
      } else {
        globalThis.location.reload();
      }
    }
  }

  /**
   * Update the title color.
   *
   * @param {string} backgroundColorVal
   * @param {string} colorVal
   */
  updateTitleColor(backgroundColorVal: string, colorVal: string) {
    (this.shadowRoot.querySelector('#main-toolbar') as HTMLElement).style.setProperty('--mdc-theme-primary', backgroundColorVal);
    (this.shadowRoot.querySelector('#main-toolbar') as HTMLElement).style.color = colorVal;
  }

  /**
   * Change the backend.ai client's current group.
   *
   * @param {Event} e - Dispatches from the native input event each time the input changes.
   */
  changeGroup(e) {
    globalThis.backendaiclient.current_group = e.target.value;
    this.current_group = globalThis.backendaiclient.current_group;
    globalThis.backendaiutils._writeRecentProjectGroup(globalThis.backendaiclient.current_group);
    const event: CustomEvent = new CustomEvent('backend-ai-group-changed', {'detail': globalThis.backendaiclient.current_group});
    document.dispatchEvent(event);
  }

  /**
   * Control the mwc-drawer.
   */
  toggleDrawer() {
    const drawer = this.shadowRoot.querySelector('mwc-drawer');
    if (drawer.open === true) {
      drawer.open = false;
    } else {
      drawer.open = true;
    }
  }

  /**
   * Control the dropdown menu.
   */
  _toggleDropdown() {
    const menu = this.shadowRoot.querySelector('#dropdown-menu');
    const menu_icon = this._dropdownMenuIcon;
    menu.anchor = menu_icon;
    menu.open = !menu.open;
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
   * Move to input url.
   *
   * @param {string} url
   */
  _moveTo(url) {
    const page = url.split('/')[1];
    if (!this.availablePages.includes(page) && (this.is_admin && !this.adminOnlyPages.includes(page))) {
      store.dispatch(navigate(decodeURIComponent('/error')));
      this._page = 'error';
      return;
    }
    globalThis.history.pushState({}, '', url);
    store.dispatch(navigate(decodeURIComponent(url), {}));
    if ('menuitem' in this.plugins) {
      for (const item of this.plugins.menuitem) {
        if (item !== this._page) {
          const component = this.shadowRoot.querySelector(item);
          component.active = false;
          component.removeAttribute('active');
        }
      }
      if (this.plugins['menuitem'].includes(this._page)) {
        const component = this.shadowRoot.querySelector(this._page);
        component.active = true;
        component.setAttribute('active', true);
        component.render();
      }
    }
  }

  /**
   * Move to user's log page.
   */
  _moveToLogPage() {
    const currentPage = globalThis.location.toString().split(/[/]+/).pop();
    globalThis.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'logs'}));
    if (currentPage && currentPage === 'usersettings') {
      const event = new CustomEvent('backend-ai-usersettings-logs', {});
      document.dispatchEvent(event);
    }
  }

  /**
   * Move to user settings page.
   */
  _moveToUserSettingsPage() {
    const currentPage = globalThis.location.toString().split(/[/]+/).pop();
    globalThis.history.pushState({}, '', '/usersettings');
    store.dispatch(navigate(decodeURIComponent('/usersettings'), {tab: 'general'}));
    if (currentPage && currentPage === 'usersettings') {
      const event = new CustomEvent('backend-ai-usersettings', {});
      document.dispatchEvent(event);
    }
  }

  /**
   * Add tool tips by create popovers.
   */
  async addTooltips() {
    this._createPopover('#summary-menu-icon', _text('webui.menu.Summary'));
    this._createPopover('#sessions-menu-icon', _text('webui.menu.Sessions'));
    this._createPopover('#data-menu-icon', _text('webui.menu.Data&Storage'));
    this._createPopover('#import-menu-icon', _text('webui.menu.Import&Run'));
    this._createPopover('#pipeline-menu-icon', _text('webui.menu.Pipeline'));
    this._createPopover('#statistics-menu-icon', _text('webui.menu.Statistics'));
    this._createPopover('#usersettings-menu-icon', _text('webui.menu.Settings'));
    this._createPopover('backend-ai-help-button', _text('webui.menu.Help'));
    if (this.is_admin) {
      this._createPopover('#user-menu-icon', _text('webui.menu.Users'));
    }
    if (this.is_superadmin) {
      this._createPopover('#resources-menu-icon', _text('webui.menu.Resources'));
      this._createPopover('#environments-menu-icon', _text('webui.menu.Environments'));
      this._createPopover('#configurations-menu-icon', _text('webui.menu.Configurations'));
      this._createPopover('#maintenance-menu-icon', _text('webui.menu.Maintenance'));
      this._createPopover('#information-menu-icon', _text('webui.menu.Information'));
      // this._createPopover("#admin-menu-icon", _text("webui.menu.Administration"));
    }
  }

  /**
   * Create a popover.
   *
   * @param {string} anchor
   * @param {string} title
   */
  _createPopover(anchor: string, title: string) {
    const popover = document.createElement('wl-popover');
    popover.anchor = anchor;
    popover.setAttribute('fixed', '');
    popover.setAttribute('disablefocustrap', '');
    popover.setAttribute('anchororiginx', 'right');
    popover.setAttribute('anchororiginy', 'center');
    popover.setAttribute('transformoriginx', 'left');
    popover.setAttribute('transformoriginy', 'center');
    popover.anchorOpenEvents = ['mouseover'];
    popover.anchorCloseEvents = ['mouseout'];
    const card = document.createElement('wl-popover-card');
    const carddiv = document.createElement('div');
    carddiv.style.padding = '5px';
    carddiv.innerText = title;
    card.appendChild(carddiv);
    popover.appendChild(card);
    const tooltipBox = this.shadowRoot.querySelector('#mini-tooltips');
    tooltipBox.appendChild(popover);
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
    this._offlineIndicatorOpened = state.app.offlineIndicatorOpened;
    this._drawerOpened = state.app.drawerOpened;
    globalThis.currentPage = this._page;
    globalThis.currentPageParams = this._pageParams;
  }

  /**
   * Check Fullname exists, and if not then use user_id instead.
   *
   * @return {string} Name from full name or user ID
   */
  _getUsername() {
    let name = this.full_name ? this.full_name : this.user_id;
    // mask username only when the configuration is enabled
    if (this.isUserInfoMaskEnabled) {
      const maskStartIdx = 2;
      const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      const isEmail: boolean = emailPattern.test(name);
      const maskLength = isEmail ? name.split('@')[0].length - maskStartIdx : name.length - maskStartIdx;
      name = globalThis.backendaiutils._maskString(name, '*', maskStartIdx, maskLength);
    }
    return name;
  }

  /**
   *  Get user id according to configuration
   *
   *  @return {string} userId
   */
  _getUserId() {
    let userId = this.user_id;
    // mask user id(email) only when the configuration is enabled
    if (this.isUserInfoMaskEnabled) {
      const maskStartIdx = 2;
      const maskLength = userId.split('@')[0].length - maskStartIdx;
      userId = globalThis.backendaiutils._maskString(userId, '*', maskStartIdx, maskLength);
    }
    return userId;
  }

  _getRole(user_id) {
    const fields = ['role'];
    return globalThis.backendaiclient.user.get(user_id, fields);
  }

  async _showRole() {
    const data = await this._getRole(this.user_id);
    this.roleInfo = data.user;
  }

  _getKeypairInfo(user_id) {
    const fields = ['access_key', 'secret_key'];
    const is_active = true;
    return globalThis.backendaiclient.keypair.list(user_id, fields, is_active);
  }

  async _showKeypairInfo() {
    const data = await this._getKeypairInfo(this.user_id);
    this.keyPairInfo = data;
    this.keyPairInfo.keypairs.reverse();
  }

  async _showSecretKey(e) {
    const secret_key = this.shadowRoot.querySelector('#secretkey');
    for (let i = 0; i < this.keyPairInfo.keypairs.length; i++) {
      if (e.target.selected.value == this.keyPairInfo.keypairs[i].access_key) {
        secret_key.value = this.keyPairInfo.keypairs[i].secret_key;
        break;
      }
    }
  }

  _hidePasswordChangeRequest() {
    const passwordChangeRequest = this.shadowRoot.querySelector('#password-change-request');
    passwordChangeRequest.style.display = 'none';
  }

  protected render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/fonts/font-awesome-all.min.css">
      <link rel="stylesheet" href="resources/custom.css">
      <div id="loading-curtain" class="loading-background"></div>
      <mwc-drawer id="app-body" class="${this.mini_ui ? 'mini-ui' : ''}" style="visibility:hidden;">
        <div class="drawer-menu" style="height:100vh;">
          <div id="portrait-bar" class="draggable">
            <div class="horizontal center layout flex bar draggable" style="cursor:pointer;" @click="${() => this._moveTo('/summary')}">
              <div class="portrait-canvas"></div>
              <div class="vertical start-justified layout full-menu" style="margin-left:10px;margin-right:10px;">
                <div class="site-name"><span class="bold">Backend</span>.AI</div>
                ${this.siteDescription ? html`
                  <div class="site-name" style="font-size:13px;text-align:left;">
                    ${this.siteDescription}
                  </div>` : html``}
              </div>
              <span class="flex"></span>
            </div>
          </div>
          <div class="horizontal center-justified center layout flex" style="max-height:40px;">
            <mwc-icon-button id="mini-ui-toggle-button" style="color:#fff;" icon="menu" slot="navigationIcon" @click="${() => this.toggleSidebarUI()}"></mwc-icon-button>
            <mwc-icon-button disabled class="temporarily-hide full-menu side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'feedback' ? 'yellow' : 'white'}" id="feedback-icon" icon="question_answer"></mwc-icon-button>
            <mwc-icon-button class="full-menu side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'notification' ? 'yellow' : 'white'}" id="notification-icon" icon="notification_important" @click="${() => this._openSidePanel('notification')}"></mwc-icon-button>
            <mwc-icon-button class="full-menu side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'task' ? 'yellow' : 'white'}" id="task-icon" icon="ballot" @click="${() => this._openSidePanel('task')}"></mwc-icon-button>
          </div>
          <mwc-list id="sidebar-menu" class="sidebar list" @selected="${(e) => this._menuSelected(e)}">
            <mwc-list-item graphic="icon" ?selected="${this._page === 'summary'}" @click="${() => this._moveTo('/summary')}" ?disabled="${this.blockedMenuitem.includes('summary')}">
              <i class="fas fa-th-large" slot="graphic" id="summary-menu-icon"></i>
              <span class="full-menu">${_t('webui.menu.Summary')}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'job'}" @click="${() => this._moveTo('/job')}" ?disabled="${this.blockedMenuitem.includes('job')}">
              <i class="fas fa-list-alt" slot="graphic" id="sessions-menu-icon"></i>
              <span class="full-menu">${_t('webui.menu.Sessions')}</span>
            </mwc-list-item>
            ${this.use_experiment ? html`
            <mwc-list-item graphic="icon" ?selected="${this._page === 'experiment'}" @click="${() => this._moveTo('/experiment')}" ?disabled="${this.blockedMenuitem.includes('experiment')}">
              <i class="fas fa-flask" slot="graphic"></i>
              <span class="full-menu">${_t('webui.menu.Experiments')}</span>
            </mwc-list-item>` : html``}
            <mwc-list-item graphic="icon" ?selected="${this._page === 'github' || this._page === 'import'}" @click="${() => this._moveTo('/import')}" ?disabled="${this.blockedMenuitem.includes('import')}">
              <i class="fas fa-play" slot="graphic" id="import-menu-icon"></i>
              <span class="full-menu">${_t('webui.menu.Import&Run')}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'data'}" @click="${() => this._moveTo('/data')}" ?disabled="${this.blockedMenuitem.includes('data')}">
              <i class="fas fa-cloud-upload-alt" slot="graphic" id="data-menu-icon"></i>
              <span class="full-menu">${_t('webui.menu.Data&Storage')}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'pipeline'}" @click="${() => this._moveTo('/pipeline')}" ?disabled="${this.blockedMenuitem.includes('pipeline')}" style="display:none">
              <i class="fas fa-stream" slot="graphic" id="pipeline-menu-icon"></i>
              <span class="full-menu">${_t('webui.menu.Pipeline')}</span>
            </mwc-list-item>
            <mwc-list-item graphic="icon" ?selected="${this._page === 'statistics'}" @click="${() => this._moveTo('/statistics')}" ?disabled="${this.blockedMenuitem.includes('statistics')}">
              <i class="fas fa-chart-bar" slot="graphic" id="statistics-menu-icon"></i>
              <span class="full-menu">${_t('webui.menu.Statistics')}</span>
            </mwc-list-item>
            ${'page' in this.plugins ? this.plugins['page'].filter((item) => (this.plugins['menuitem-user'].includes(item.url))).map((item) => html`
            <mwc-list-item graphic="icon" ?selected="${this._page === item.url}" @click="${() => this._moveTo('/'+ item.url)}" ?disabled="${!this.is_admin}">
              <i class="fas fa-puzzle-piece" slot="graphic" id="${item}-menu-icon"></i>
              <span class="full-menu">${item.menuitem}</span>
            </mwc-list-item>
            `) : html``}
            ${this.is_admin ?
    html`
                <h3 class="full-menu">${_t('webui.menu.Administration')}</h3>
                <mwc-list-item graphic="icon" ?selected="${this._page === 'credential'}" @click="${() => this._moveTo('/credential')}" ?disabled="${!this.is_admin}">
                  <i class="fas fa-address-card" slot="graphic" id="user-menu-icon"></i>
                  <span class="full-menu">${_t('webui.menu.Users')}</span>
                </mwc-list-item>
                <mwc-list-item graphic="icon" ?selected="${this._page === 'environment'}" @click="${() => this._moveTo('/environment')}" ?disabled="${!this.is_admin}">
                  <i class="fas fa-microchip" slot="graphic" id="environments-menu-icon"></i>
                  <span class="full-menu">${_t('webui.menu.Environments')}</span>
                </mwc-list-item>` : html``}
                ${'page' in this.plugins ? this.plugins['page'].filter((item) => (this.plugins['menuitem-admin'].includes(item.url))).map((item) => html`
                <mwc-list-item graphic="icon" ?selected="${this._page === item.url}" @click="${() => this._moveTo('/'+ item.url)}" ?disabled="${!this.is_admin}">
                  <i class="fas fa-puzzle-piece" slot="graphic" id="${item}-menu-icon"></i>
                  <span class="full-menu">${item.menuitem}</span>
                </mwc-list-item>
                `) : html``}
            ${this.is_superadmin ?
    html`
                <mwc-list-item graphic="icon" ?selected="${this._page === 'agent'}" @click="${() => this._moveTo('/agent')}" ?disabled="${!this.is_superadmin}">
                  <i class="fas fa-server" slot="graphic" id="resources-menu-icon"></i>
                  <span class="full-menu">${_t('webui.menu.Resources')}</span>
                </mwc-list-item>
                <mwc-list-item graphic="icon" ?selected="${this._page === 'settings'}" @click="${() => this._moveTo('/settings')}" ?disabled="${!this.is_superadmin}">
                  <i class="fas fa-cog" slot="graphic" id="configurations-menu-icon"></i>
                  <span class="full-menu">${_t('webui.menu.Configurations')}</span>
                </mwc-list-item>
                <mwc-list-item graphic="icon" ?selected="${this._page === 'maintenance'}" @click="${() => this._moveTo('/maintenance')}" ?disabled="${!this.is_superadmin}">
                  <i class="fas fa-wrench" slot="graphic" id="maintenance-menu-icon"></i>
                  <span class="full-menu">${_t('webui.menu.Maintenance')}</span>
                </mwc-list-item>
                <mwc-list-item graphic="icon" ?selected="${this._page === 'information'}" @click="${() => this._moveTo('/information')}" ?disabled="${!this.is_superadmin}">
                  <i class="fas fa-info-circle" slot="graphic" id="information-menu-icon"></i>
                  <span class="full-menu">${_t('webui.menu.Information')}</span>
                </mwc-list-item>
                ${'page' in this.plugins ? this.plugins['page'].filter((item) => (this.plugins['menuitem-superadmin'].includes(item.url))).map((item) => html`
                <mwc-list-item graphic="icon" ?selected="${this._page === item.url}" @click="${() => this._moveTo('/'+ item.url)}" ?disabled="${!this.is_admin}">
                  <i class="fas fa-puzzle-piece" slot="graphic" id="${item}-menu-icon"></i>
                  <span class="full-menu">${item.menuitem}</span>
                </mwc-list-item>
                `) : html``}
            ` : html``}
            <footer id="short-height">
              <div class="terms-of-use full-menu">
                <small style="font-size:11px;">
                  <a @click="${() => this.showTOSAgreement()}">${_t('webui.menu.TermsOfService')}</a>
                  ·
                  <a style="color:forestgreen;" @click="${() => this.showPPAgreement()}">${_t('webui.menu.PrivacyPolicy')}</a>
                  ·
                  <a @click="${() => this.splash.show()}">${_t('webui.menu.AboutBackendAI')}</a>
                  ${this.allow_signout === true ? html`
                  ·
                  <a @click="${() => this.loginPanel.signout()}">${_t('webui.menu.LeaveService')}</a>
                  ` : html``}
                </small>
              </div>
              <address class="full-menu">
                <small class="sidebar-footer">Lablup Inc.</small>
                <small class="sidebar-footer" style="font-size:9px;">22.03.0.220501</small>
              </address>
              <div id="sidebar-navbar-footer" class="vertical start end-justified layout" style="margin-left:16px;">
                <backend-ai-help-button active style="margin-left:4px;"></backend-ai-help-button>
                <mwc-icon-button id="usersettings-menu-icon" icon="settings" slot="graphic" class="fg ${this._page === 'usersettings' ? 'yellow' : 'white'}" style="margin-left:4px;" @click="${() => this._moveTo('/usersettings')}"></mwc-icon-button>
              </div>
            </footer>
          </mwc-list>
          <footer>
            <div class="terms-of-use full-menu">
              <small style="font-size:11px;">
                <a @click="${() => this.showTOSAgreement()}">${_t('webui.menu.TermsOfService')}</a>
                ·
                <a style="color:forestgreen;" @click="${() => this.showPPAgreement()}">${_t('webui.menu.PrivacyPolicy')}</a>
                ·
                <a @click="${() => this.splash.show()}">${_t('webui.menu.AboutBackendAI')}</a>
                ${this.allow_signout === true ? html`
                ·
                <a @click="${() => this.loginPanel.signout()}">${_t('webui.menu.LeaveService')}</a>
                ` : html``}
              </small>
            </div>
            <address class="full-menu">
              <small class="sidebar-footer">Lablup Inc.</small>
              <small class="sidebar-footer" style="font-size:9px;">22.03.0.220501</small>
            </address>
            <div id="sidebar-navbar-footer" class="vertical start end-justified layout" style="margin-left:16px;">
              <backend-ai-help-button active style="margin-left:4px;"></backend-ai-help-button>
              <mwc-icon-button id="usersettings-menu-icon" icon="settings" slot="graphic" class="fg ${this._page === 'usersettings' ? 'yellow' : 'white'}" style="margin-left:4px;" @click="${() => this._moveTo('/usersettings')}"></mwc-icon-button>
            </div>
          </footer>
        </div>
        <div id="app-content" slot="appContent">
          <mwc-drawer id="content-body">
            <div class="sidepanel-drawer">
              <backend-ai-sidepanel-notification class="sidepanel" ?active="${this._sidepanel === 'notification'}"></backend-ai-sidepanel-notification>
              <backend-ai-sidepanel-task class="sidepanel" ?active="${this._sidepanel === 'task'}"></backend-ai-sidepanel-task>
            </div>
            <div slot="appContent">
              <mwc-top-app-bar-fixed id="main-toolbar" class="draggable">
                <div class="horizontal layout center" id="drawer-toggle-button" slot="navigationIcon" style="margin:auto 20px;" @click="${() => this.toggleDrawer()}">
                  <i class="fas fa-bars fa-lg" style="color:#747474;"></i>
                </div>
                <div slot="navigationIcon" class="vertical-line" style="height:35px;"></div>
                <div class="horizontal layout" slot="title" id="welcome-message" style="font-size:12px;margin-left:10px;padding-top:10px;">
                  <p>${_t('webui.menu.WelcomeMessage')}</p>
                  <p class="user-name">${this._getUsername()}</p>
                  <p>${_t('webui.menu.WelcomeMessage_2')}</p>
                </div>
                <div slot="actionItems" style="margin:0;">
                  <div class="horizontal flex center layout">
                    <div style="height:48px;">
                      <div class="horizontal center center-justified layout">
                        <p id="project">${_t('webui.menu.Project')}</p>
                        <div id="group-select-box"></div>
                      </div>
                    </div>
                    <div class="vertical-line" style="height:35px;"></div>
                    <div class="horizontal center layout">
                      <div class="vertical layout center" style="position:relative;padding-top:10px;">
                        <span class="email" style="color:#8c8484;font-size:12px;line-height:22px;text-align:left;-webkit-font-smoothing:antialiased;margin:auto 10px;">
                          ${_t('webui.menu.UserName')}
                        </span>
                        <mwc-menu id="dropdown-menu" class="user-menu">
                          ${this.domain !== 'default' && this.domain !== '' ? html`
                          <mwc-list-item class="horizontal layout start center" disabled style="border-bottom:1px solid #ccc;">
                              ${this.domain}
                          </mwc-list-item>
                          ` : html``}
                          <mwc-list-item class="horizontal layout start center" style="border-bottom:1px solid #ccc;">
                              <mwc-icon class="dropdown-menu">perm_identity</mwc-icon>
                              <span class="dropdown-menu-name">${this._getUserId()}</span>
                          </mwc-list-item>
                          <mwc-list-item class="horizontal layout start center" disabled style="border-bottom:1px solid #ccc;">
                              <mwc-icon class="dropdown-menu">admin_panel_settings</mwc-icon>
                              <span class="dropdown-menu-name">${this.roleInfo.role}</span>
                          </mwc-list-item>
                          <mwc-list-item class="horizontal layout start center" @click="${() => this.splash.show()}">
                              <mwc-icon class="dropdown-menu">info</mwc-icon>
                              <span class="dropdown-menu-name">${_t('webui.menu.AboutBackendAI')}</span>
                          </mwc-list-item>
                          <mwc-list-item class="horizontal layout start center" @click="${() => this._openUserPrefDialog()}">
                              <mwc-icon class="dropdown-menu">lock</mwc-icon>
                              <span class="dropdown-menu-name">${_t('webui.menu.MyAccount')}</span>
                          </mwc-list-item>
                          <mwc-list-item class="horizontal layout start center" @click="${() => this._moveToUserSettingsPage()}">
                              <mwc-icon class="dropdown-menu">drag_indicator</mwc-icon>
                              <span class="dropdown-menu-name">${_t('webui.menu.Preferences')}</span>
                          </mwc-list-item>
                          <mwc-list-item class="horizontal layout start center" @click="${() => this._moveToLogPage()}">
                              <mwc-icon class="dropdown-menu">assignment</mwc-icon>
                              <span class="dropdown-menu-name">${_t('webui.menu.LogsErrors')}</span>
                          </mwc-list-item>
                          <mwc-list-item class="horizontal layout start center" id="sign-button" @click="${() => this.logout()}">
                              <mwc-icon class="dropdown-menu">logout</mwc-icon>
                              <span class="dropdown-menu-name">${_t('webui.menu.LogOut')}</span>
                          </mwc-list-item>
                        </mwc-menu>
                      </div>
                      <span class="full_name user-name" style="font-size:14px;text-align:right;-webkit-font-smoothing:antialiased;margin:auto 0px auto 10px; padding-top:10px;">
                        ${this._getUsername()}
                      </span>
                      <mwc-icon-button id="dropdown-button" @click="${() => this._toggleDropdown()}" style="font-size: 0.5rem;">
                        <i class="fas fa-user-alt fa-xs" style="color:#8c8484;"></i>
                      </mwc-icon-button>
                      <div class="vertical-line" style="height:35px;"></div>
                      <div class="horizontal layout center" style="margin:auto 10px;padding-top:10px;">
                        <span class="log_out" style="font-size:12px;margin:auto 0px;color:#8c8484;">
                          ${_t('webui.menu.LogOut')}
                        </span>
                        <mwc-icon-button @click="${() => this.logout()}" style="padding-bottom:5px;">
                          <i class="fas fa-sign-out-alt fa-xs" style="color:#8c8484;"></i>
                        </mwc-icon-button>
                      </div>
                    </div>
                  </div>
                  <div id="password-change-request" class="horizontal layout center end-justified" style="display:${this.needPasswordChange ? 'flex' : 'none'};">
                    <span>${_t('webui.menu.PleaseChangeYourPassword')}</span>
                    <mwc-icon-button @click="${() => this._hidePasswordChangeRequest()}">
                      <i class="fa fa-times"></i>
                    </mwc-icon-button>
                  </div>
                </div>
              </mwc-top-app-bar-fixed>

              <div class="content" style="box-sizing:border-box; padding:14px;">
                <div id="navbar-top" class="navbar-top horizontal flex layout wrap"></div>
                <section role="main" id="content" class="container layout vertical center">
                  <div id="app-page">
                    <backend-ai-summary-view class="page" name="summary" ?active="${this._page === 'summary'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-summary-view>
                    <backend-ai-import-view class="page" name="import" ?active="${this._page === 'github' || this._page === 'import'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-import-view>
                    <backend-ai-session-view class="page" name="job" ?active="${this._page === 'job'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-session-view>
                    <!--<backend-ai-experiment-view class="page" name="experiment" ?active="${this._page === 'experiment'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-experiment-view>-->
                    <backend-ai-usersettings-view class="page" name="usersettings" ?active="${this._page === 'usersettings'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-usersettings-view>
                    <backend-ai-credential-view class="page" name="credential" ?active="${this._page === 'credential'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-credential-view>
                    <backend-ai-agent-view class="page" name="agent" ?active="${this._page === 'agent'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-agent-view>
                    <backend-ai-data-view class="page" name="data" ?active="${this._page === 'data'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-data-view>
                    <backend-ai-pipeline-view class="page" name="pipeline" ?active="${this._page === 'pipeline'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-pipeline-view>
                    <backend-ai-environment-view class="page" name="environment" ?active="${this._page === 'environment'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-environment-view>
                    <backend-ai-settings-view class="page" name="settings" ?active="${this._page === 'settings'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-settings-view>
                    <backend-ai-maintenance-view class="page" name="maintenance" ?active="${this._page === 'maintenance'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-maintenance-view>
                    <backend-ai-information-view class="page" name="information" ?active="${this._page === 'information'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-information-view>
                    <backend-ai-statistics-view class="page" name="statistics" ?active="${this._page === 'statistics'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-statistics-view>
                    <backend-ai-email-verification-view class="page" name="email-verification" ?active="${this._page === 'verify-email'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-email-verification-view>
                    <backend-ai-change-forgot-password-view class="page" name="change-forgot-password" ?active="${this._page === 'change-password'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-change-forgot-password-view>
                    <backend-ai-edu-applauncher class="page" name="edu-applauncher" ?active="${this._page === 'edu-applauncher'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-edu-applauncher>
                    <backend-ai-error-view class="page" name="error" ?active="${this._page === 'error'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-error-view>
                    <backend-ai-permission-denied-view class="page" name="unauthorized" ?active="${this._page === 'unauthorized'}"><mwc-circular-progress indeterminate></mwc-circular-progress></backend-ai-permission-denied-view>
                  </div>
                </section>
              </div>
            </div>
          </mwc-drawer>
        </div>
      </mwc-drawer>
      <div id="mini-tooltips" style="display:${this.mini_ui ? 'block' : 'none'};">
        <wl-popover anchor="#mini-ui-toggle-button" .anchorOpenEvents="${['mouseover']}" fixed disablefocustrap
           anchororiginx="right" anchororiginy="center" transformoriginx="left" transformOriginY="center">
          <wl-popover-card>
            <div style="padding:5px">
              <mwc-icon-button disabled class="temporarily-hide side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'feedback' ? 'red' : 'black'}" id="feedback-icon-popover" icon="question_answer"></mwc-icon-button>
              <mwc-icon-button class="side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'notification' ? 'red' : 'black'}" id="notification-icon-popover" icon="notification_important" @click="${() => this._openSidePanel('notification')}"></mwc-icon-button>
              <mwc-icon-button class="side-menu fg ${this.contentBody && this.contentBody.open === true && this._sidepanel === 'task' ? 'red' : 'black'}" id="task-icon-popover" icon="ballot" @click="${() => this._openSidePanel('task')}"></mwc-icon-button>
            </div>
          </wl-popover-card>
        </wl-popover>
      </div>
      <backend-ai-offline-indicator ?active="${this._offlineIndicatorOpened}">
        ${this._offline ? _t('webui.YouAreOffline') : _t('webui.YouAreOnline')}.
      </backend-ai-offline-indicator>
      <backend-ai-login active id="login-panel"></backend-ai-login>
      <backend-ai-splash id="about-backendai-panel"></backend-ai-splash>
      <lablup-notification id="notification"></lablup-notification>
      <backend-ai-indicator-pool id="indicator"></backend-ai-indicator-pool>
      <lablup-terms-of-service id="terms-of-service" block></lablup-terms-of-service>
      <backend-ai-dialog id="user-preference-dialog" fixed backdrop>
        <span slot="title">${_t('webui.menu.MyAccountInformation')}</span>
        <div slot="content" class="layout vertical" style="width:300px;">
          <mwc-textfield id="pref-original-name" type="text"
              label="${_t('webui.menu.FullName')}" maxLength="64" autofocus
              value="${this.full_name}"
              helper="${_t('maxLength.64chars')}">
          </mwc-textfield>
        </div>
        <div slot="content" class="layout vertical" style="width:300px">
          <mwc-select id="access-key-select" class="fixed-position" fixedMenuPosition required
                      label="${_t('general.AccessKey')}"
                      @selected="${(e) => this._showSecretKey(e)}">
            ${this.keyPairInfo.keypairs?.map((item) => html`
              <mwc-list-item value="${item.access_key}" ?selected=${this.loggedAccount.access_key === item.access_key}>
                ${item.access_key}
              </mwc-list-item>`)}
          </mwc-select>
          <mwc-textfield id="secretkey" disabled type="text"
              label="${_t('general.SecretKey')}"
              style="margin-bottom:20px; margin-top:20px;" value="" readonly>
          </mwc-textfield>
        </div>
        <div slot="content" class="layout vertical" style="width:300px;">
          <mwc-textfield id="pref-original-password" type="password"
              label="${_t('webui.menu.OriginalPassword')}" maxLength="64"
              style="margin-bottom:20px;">
          </mwc-textfield>
          <div class="horizontal flex layout">
            <mwc-textfield id="pref-new-password" label="${_t('webui.menu.NewPassword')}"
                type="password" maxLength="64"
                auto-validate validationMessage="${_t('webui.menu.InvalidPasswordMessage')}"
                pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$"
                @change="${this._validatePassword}">
            </mwc-textfield>
            <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                                      @click="${(e) => this._togglePasswordVisibility(e.target)}">
            </mwc-icon-button-toggle>
          </div>
          <div class="horizontal flex layout">
            <mwc-textfield id="pref-new-password2" label="${_t('webui.menu.NewPasswordAgain')}"
                type="password" maxLength="64"
                @change="${this._validatePassword}">
            </mwc-textfield>
            <mwc-icon-button-toggle off onIcon="visibility" offIcon="visibility_off"
                                      @click="${(e) => this._togglePasswordVisibility(e.target)}">
              </mwc-icon-button-toggle>
          </div>
        </div>
        <div slot="footer" class="horizontal end-justified flex layout">
          <div class="flex"></div>
          <mwc-button
              label="${_t('webui.menu.Cancel')}"
              @click="${this._hideUserPrefDialog}"></mwc-button>
          <mwc-button
              unelevated
              label="${_t('webui.menu.Update')}"
              @click="${this._updateUserInformation}"></mwc-button>
        </div>
      </backend-ai-dialog>
      <backend-ai-app-launcher id="app-launcher"></backend-ai-app-launcher>
      <backend-ai-resource-broker id="resource-broker" ?active="${this.is_connected}"></backend-ai-resource-broker>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-webui': BackendAIWebUI;
  }
}
