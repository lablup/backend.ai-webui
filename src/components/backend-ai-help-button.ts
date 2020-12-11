/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
//import {get as _text, registerTranslateConfig, translate as _t, use as setLanguage} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import '@material/mwc-icon-button';
import {BackendAIPage} from './backend-ai-page';

/**
 Backend.AI Help page link button

 `backend-ai-help` is a button to link to online help page.

 Example:

 <backend-ai-help></backend-ai-help>

 @group Backend.AI Console
 @element backend-ai-help
 */
@customElement("backend-ai-help-button")
export default class BackendAiHelpButton extends BackendAIPage {
  @property({type: String}) lang = 'default';
  @property({type: String}) manualURL = '';
  @property({type: String}) page;
  @property({type: Boolean}) disabled = false;
  @property({type: Object}) URLmatchingTable = {
    '': 'summary/summary.html',
    'summary': 'summary/summary.html',
    'data': 'vfolder/vfolder.html',
    'job': 'session_use/session_use.html',
    'credential': 'admin_user_keypair_management/admin_user_keypair_management.html',
    'environment': 'admin_user_keypair_management/admin_user_keypair_management.html#manage-images',
    'agent': 'admin_user_keypair_management/admin_user_keypair_management.html#query-agent-nodes',
    'settings': 'admin_user_keypair_management/admin_user_keypair_management.html#system-settings',
    'usersettings': 'user_settings/user_settings.html'
  };

  constructor() {
    super();
  }

  static get styles() {
    return [css`
    mwc-icon-button {
      color: white;
    }
    `];
  }

  firstUpdated() {
    this.currentPage;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  get currentPage() {
    let page: string | undefined = globalThis.location.toString().split(/[\/]+/).pop();
    if (typeof this.page == 'undefined') {
      this.page = 'error';
    } else {
      this.page = page;
    }
    return this.page;
  }

  /**
   * Show help page with current language(Korean or English).
   */
  showHelpPage() {
    let postfix: string = '';
    if (this.manualURL !== '') {
      postfix = this.manualURL;
    } else {
      if (this.currentPage in this.URLmatchingTable) {
        postfix = this.URLmatchingTable[this.currentPage];
        let lang = globalThis.backendaioptions.get('current_language');
        if (["ko", 'en'].includes(lang)) {
          this.lang = lang;
        } else {
          this.lang = 'en';
        }
      }
    }
    this.showOnlineHelpPage(postfix);
  }

  /**
   * Open the online help page.
   *
   * @param {string} postfix
   */
  showOnlineHelpPage(postfix: string) {
    // window.open(`https://console.docs.backend.ai/${this.lang}/latest/` + postfix, '_blank');
    let lang;
    if (this.lang === 'ko') {
      lang = 'ko';
    } else if (this.lang === 'en') {
      lang = 'en';
    } else {
      lang = 'ko';
    }
    window.open(`https://console.docs.backend.ai/${lang}/docs-essential-guide-r2/`, '_blank');
  }

  render() {
    // language=HTML
    return html`
      <mwc-icon-button id="help-page-button" icon="help_outline" @click="${() => this.showHelpPage()}"></mwc-icon-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-help-button": BackendAiHelpButton;
  }
}
