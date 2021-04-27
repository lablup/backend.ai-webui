/**
 @license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
// import {get as _text, registerTranslateConfig, translate as _t, use as setLanguage} from "lit-translate";
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@material/mwc-icon-button';
import {BackendAIPage} from './backend-ai-page';

/**
 Backend.AI Help page link button

 `backend-ai-help` is a button to link to online help page.

 Example:

 <backend-ai-help></backend-ai-help>

@group Backend.AI Web UI
 @element backend-ai-help
 */
@customElement('backend-ai-help-button')
export default class BackendAiHelpButton extends BackendAIPage {
  @property({type: String}) lang = 'default';
  @property({type: String}) manualURL = '';
  @property({type: String}) page;
  @property({type: Boolean}) disabled = false;
  @property({type: Object}) URLmatchingTable = {
    '': 'summary/summary.html',
    'summary': 'summary/summary.html',
    'job': 'sessions_all/sessions_all.html',
    'import': 'import_run/import_run.html',
    'data': 'vfolder/vfolder.html',
    'statistics': 'statistics/statistics.html',
    'credential': 'admin_menu/admin_menu.html',
    'environment': 'admin_menu/admin_menu.html#manage-images',
    'agent': 'admin_menu/admin_menu.html#query-agent-nodes',
    'settings': 'admin_menu/admin_menu.html#system-settings',
    'mainetenance': 'admin_menu/admin_menu.html#server-management',
    'information': 'admin_menu/admin_menu.html#detailed-information',
    'usersettings': 'user_settings/user_settings.html'
  };

  constructor() {
    super();
  }

  static get styles(): CSSResultGroup | undefined {
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
    const page: string | undefined = globalThis.location.toString().split(/[/]+/).pop();
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
    let postfix = '';
    if (this.manualURL !== '') {
      postfix = this.manualURL;
    } else {
      if (this.currentPage in this.URLmatchingTable) {
        postfix = this.URLmatchingTable[this.currentPage];
        const lang = globalThis.backendaioptions.get('current_language');
        if (['ko', 'en'].includes(lang)) {
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
    window.open(`https://console.docs.backend.ai/${this.lang}/latest/` + postfix, '_blank');
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
    'backend-ai-help-button': BackendAiHelpButton;
  }
}
