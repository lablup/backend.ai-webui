/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */

import {get as _text, translate as _t} from 'lit-translate';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {BackendAIPage} from './backend-ai-page';

import './lablup-loading-spinner';

import 'weightless/card';
import 'weightless/icon';

import '@material/mwc-button';
import '@material/mwc-linear-progress/mwc-linear-progress';
import '@material/mwc-icon';
import '@material/mwc-icon-button';

import './lablup-activity-panel';
import './backend-ai-resource-monitor';
import './backend-ai-resource-panel';
import './backend-ai-session-launcher';
import './backend-ai-release-check';
import '../plastics/lablup-shields/lablup-shields';
import '../plastics/lablup-piechart/lablup-piechart';
import {marked} from 'marked';

import {default as PainKiller} from './backend-ai-painkiller';
import {BackendAiStyles} from './backend-ai-general-styles';
import {IronFlex, IronFlexAlignment, IronPositioning} from '../plastics/layout/iron-flex-layout-classes';

/**
 `<backend-ai-summary-view>` is a Summary panel of backend.ai web UI.

 Example:
 <backend-ai-summary-view active></backend-ai-summary-view>

 @group Lablup Elements
 @element backend-ai-summary-view
 */

@customElement('backend-ai-summary-view')
export default class BackendAISummary extends BackendAIPage {
  @property({type: String}) condition = 'running';
  @property({type: Number}) sessions = 0;
  @property({type: Object}) jobs = Object();
  @property({type: Number}) agents = 0;
  @property({type: Boolean}) is_admin = false;
  @property({type: Boolean}) is_superadmin = false;
  @property({type: Object}) resources = Object();
  @property({type: Object}) update_checker = Object();
  @property({type: Boolean}) authenticated = false;
  @property({type: String}) manager_version = '';
  @property({type: String}) webui_version = '';
  @property({type: Number}) cpu_total = 0;
  @property({type: Number}) cpu_used = 0;
  @property({type: String}) cpu_percent = '0';
  @property({type: String}) cpu_total_percent = '0';
  @property({type: Number}) cpu_total_usage_ratio = 0;
  @property({type: Number}) cpu_current_usage_ratio = 0;
  @property({type: String}) mem_total = '0';
  @property({type: String}) mem_used = '0';
  @property({type: String}) mem_allocated = '0';
  @property({type: Number}) mem_total_usage_ratio = 0;
  @property({type: Number}) mem_current_usage_ratio = 0;
  @property({type: String}) mem_current_usage_percent = '0';
  @property({type: Number}) cuda_gpu_total = 0;
  @property({type: Number}) cuda_gpu_used = 0;
  @property({type: Number}) cuda_fgpu_total = 0;
  @property({type: Number}) cuda_fgpu_used = 0;
  @property({type: Number}) rocm_gpu_total = 0;
  @property({type: Number}) rocm_gpu_used = 0;
  @property({type: Number}) tpu_total = 0;
  @property({type: Number}) tpu_used = 0;
  @property({type: Object}) spinner = Object();
  @property({type: Object}) notification = Object();
  @property({type: Object}) resourcePolicy;
  @property({type: String}) announcement = '';
  @property({type: Object}) invitations = Object();

  constructor() {
    super();
    this.invitations = [];
  }

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronPositioning,
      // language=CSS
      css`
        ul {
          padding-left: 0;
        }

        ul li {
          list-style: none;
          font-size: 14px;
        }

        li:before {
          padding: 3px;
          transform: rotate(-45deg) translateY(-2px);
          transition: color ease-in .2s;
          border: solid;
          border-width: 0 2px 2px 0;
          border-color: #242424;
          margin-right: 10px;
          content: '';
          display: inline-block;
        }

        span.indicator {
          width: 100px;
        }

        div.big.indicator {
          font-size: 48px;
        }

        a,
        a:visited {
          color: #222222;
        }

        a:hover {
          color: #3e872d;
        }

        mwc-linear-progress {
          width: 190px;
          height: 5px;
          border-radius: 0;
          --mdc-theme-primary: #3677eb;
        }

        mwc-linear-progress.start-bar {
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
          --mdc-theme-primary: #3677eb;
        }

        mwc-linear-progress.end-bar {
          border-bottom-left-radius: 3px;
          border-bottom-right-radius: 3px;
          --mdc-theme-primary: #98be5a;
        }

        mwc-button, mwc-button[unelevated], mwc-button[outlined] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-on-theme-primary: var(--general-button-background-color);
          --mdc-typography-font-family: var(--general-font-family);
        }

        wl-button[class*="green"] {
          --button-bg: var(--paper-light-green-50);
          --button-bg-hover: var(--paper-green-100);
          --button-bg-active: var(--paper-green-600);
        }

        wl-button[class*="red"] {
          --button-bg: var(--paper-red-50);
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
        }

        .notice-ticker {
          margin-left: 15px;
          margin-top: 10px;
          font-size: 13px;
          font-weight: 400;
          height: 35px;
          overflow-y: scroll;
        }

        .notice-ticker lablup-shields {
          margin-right: 15px;
        }

        #session-launcher {
          --component-width: 284px;
        }

        .start-menu-items {
          margin-top: 20px;
          width: 100px;
        }

        .start-menu-items span {
          padding-left: 10px;
          padding-right: 10px;
          text-align: center;
        }

        wl-icon {
          --icon-size: 24px;
        }

        .invitation_folder_name {
          font-size: 13px;
        }

        mwc-icon-button.update-button {
          --mdc-icon-size: 16px;
          --mdc-icon-button-size: 24px;
          color: red;
        }

        a > i {
          color: #5b5b5b;
          margin: 10px;
        }

        a > span {
          max-width: 70px;
          color: #838383;
        }

        mwc-icon.update-icon {
          --mdc-icon-size: 16px;
          --mdc-icon-button-size: 24px;
          color: black;
        }

        img.resource-type-icon {
          width: 16px;
          height: 16px;
          margin-right: 5px;
        }

        .system-health-indicator {
          width: 90px;
        }

        .upper-lower-space {
          padding-top: 20px;
          padding-bottom: 10px;
        }

        i.larger {
          font-size: 1.2rem;
        }

        .left-end-icon {
          margin-left: 11px;
          margin-right: 12px;
        }

        .right-end-icon {
          margin-left: 12px;
          margin-right: 11px;
        }

        lablup-activity-panel.inner-panel:hover {
          --card-background-color: var(--general-sidepanel-color);
        }

        @media screen and (max-width: 850px) {
          .notice-ticker {
            margin-left: 0px;
          }

          .notice-ticker > span {
            max-width: 250px;
            line-height: 1em;
          }
        }

        @media screen and (max-width: 750px) {
          lablup-activity-panel.footer-menu > div > a > div > span {
            text-align: left;
            width: 250px;
          }
        }
      `
    ];
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.update_checker = this.shadowRoot.querySelector('#update-checker');
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._readAnnouncement();
      }, true);
    } else {
      this._readAnnouncement();
    }
  }

  _refreshConsoleUpdateInformation() {
    if (this.is_superadmin && globalThis.backendaioptions.get('automatic_update_check', true)) {
      this.update_checker.checkRelease();
    }
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#resource-monitor').removeAttribute('active');
      return;
    }
    this.shadowRoot.querySelector('#resource-monitor').setAttribute('active', 'true');
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_superadmin = globalThis.backendaiclient.is_superadmin;
        this.is_admin = globalThis.backendaiclient.is_admin;
        this.authenticated = true;
        this.manager_version = globalThis.backendaiclient.managerVersion;
        this.webui_version = globalThis.packageVersion;

        if (this.activeConnected) {
          this._refreshConsoleUpdateInformation();
        }
        this._refreshInvitations();
      }, true);
    } else {
      this.is_superadmin = globalThis.backendaiclient.is_superadmin;
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.authenticated = true;
      this.manager_version = globalThis.backendaiclient.managerVersion;
      this.webui_version = globalThis.packageVersion;
      this._refreshConsoleUpdateInformation();
      this._refreshInvitations();
      // let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
      // document.dispatchEvent(event);
    }
  }

  _readAnnouncement() {
    if (!this.activeConnected) {
      return;
    }
    globalThis.backendaiclient.service.get_announcement()
      .then((res) => {
        if ('message' in res) {
          this.announcement = marked(res.message);
        }
      }).catch((err)=>{
        return;
      });
  }

  _toInt(value: number) {
    return Math.ceil(value);
  }

  _countObject(obj: Record<string, unknown>) {
    return Object.keys(obj).length;
  }

  _addComma(num: any) {
    if (num === undefined) {
      return '';
    }
    const regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
  }

  /**
   * If both refreshOnly and activeConnected are true, refresh invitations.
   *
   * @param {boolean} refreshOnly
   * */
  _refreshInvitations(refreshOnly = false) {
    if (!this.activeConnected) {
      return;
    }
    globalThis.backendaiclient.vfolder.invitations().then((res) => {
      this.invitations = res.invitations;

      // refresh invitation lists every 10sec
      if (this.active && !refreshOnly) {
        setTimeout(() => {
          this._refreshInvitations();
        }, 60000);
      }
    });
  }

  /**
   * Accept invitation and make you can access vfloder.
   *
   * @param {Event} e - Click the accept button
   * @param {any} invitation
   * */
  async _acceptInvitation(e, invitation: any) {
    if (!this.activeConnected) {
      return;
    }
    const panel = e.target.closest('lablup-activity-panel');
    try {
      panel.setAttribute('disabled', 'true');
      panel.querySelectorAll('wl-button').forEach((btn) => {
        btn.setAttribute('disabled', 'true');
      });
      await globalThis.backendaiclient.vfolder.accept_invitation(invitation.id);
      this.notification.text = _text('summary.AcceptSharedVFolder') + `${invitation.vfolder_name}`;
      this.notification.show();
      this._refreshInvitations();
    } catch (err) {
      panel.setAttribute('disabled', 'false');
      panel.querySelectorAll('wl-button').forEach((btn) => {
        btn.setAttribute('disabled', 'false');
      });
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true, err);
    }
  }

  /**
   * Delete invitation folder.
   *
   * @param {Event} e - Click the decline button
   * @param {any} invitation
   * */
  async _deleteInvitation(e, invitation: any) {
    if (!this.activeConnected) {
      return;
    }
    const panel = e.target.closest('lablup-activity-panel');

    try {
      panel.setAttribute('disabled', 'true');
      panel.querySelectorAll('wl-button').forEach((btn) => {
        btn.setAttribute('disabled', 'true');
      });
      await globalThis.backendaiclient.vfolder.delete_invitation(invitation.id);
      this.notification.text = _text('summary.DeclineSharedVFolder') + `${invitation.vfolder_name}`;
      this.notification.show();
      this._refreshInvitations();
    } catch (err) {
      panel.setAttribute('disabled', 'false');
      panel.querySelectorAll('wl-button').forEach((btn) => {
        btn.setAttribute('disabled', 'false');
      });
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true, err);
    }
  }

  _stripHTMLTags(str) {
    return str.replace(/(<([^>]+)>)/gi, '');
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="/resources/fonts/font-awesome-all.min.css">
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <div class="item" elevation="1">
        ${this.announcement != '' ? html`
          <div class="notice-ticker horizontal center layout wrap flex">
            <lablup-shields app="" color="red" description="Notice" ui="round"></lablup-shields>
            <span>${this._stripHTMLTags(this.announcement)}</span>
          </div>
        ` : html``}
        <div class="horizontal wrap layout">
          <lablup-activity-panel title="${_t('summary.StartMenu')}" elevation="1" height="500">
            <div slot="message">
              <img src="/resources/images/launcher-background.png" style="width:300px;margin-bottom:30px;"/>
              <div class="horizontal center-justified layout wrap">
                <backend-ai-session-launcher location="summary" id="session-launcher" ?active="${this.active === true}"></backend-ai-session-launcher>
              </div>
              <div class="horizontal center-justified layout wrap">
                <a href="/data" class="vertical center center-justified layout start-menu-items">
                  <i class="fas fa-upload fa-2x"></i>
                  <span>${_t('summary.UploadFiles')}</span>
                </a>
                ${this.is_admin ? html`
                  <a href="/credential" class="vertical center center-justified layout start-menu-items" style="border-left:1px solid #ccc;">
                    <i class="fas fa-key fa-2x"></i>
                    <span>${_t('summary.CreateANewKeypair')}</span>
                  </a>
                  <a href="/credential" class="vertical center center-justified layout start-menu-items" style="border-left:1px solid #ccc;">
                    <i class="fas fa-cogs fa-2x"></i>
                    <span>${_t('summary.MaintainKeypairs')}</span>
                  </a>
                ` : html``}
              </div>
            </div>
          </lablup-activity-panel>
          <lablup-activity-panel title="${_t('summary.ResourceStatistics')}" elevation="1" narrow height="500">
            <div slot="message">
                <backend-ai-resource-monitor location="summary" id="resource-monitor" ?active="${this.active === true}" direction="vertical"></backend-ai-resource-monitor>
            </div>
          </lablup-activity-panel>
          <backend-ai-resource-panel ?active="${this.active === true}" height="500"></backend-ai-resource-panel>
          <div class="horizontal wrap layout">
            <lablup-activity-panel title="${_t('summary.Announcement')}" elevation="1" horizontalsize="2x" height="220">
                <div slot="message">
                  ${this.announcement !== '' ? unsafeHTML(this.announcement) : _t('summary.NoAnnouncement')}
                </div>
              </lablup-activity-panel>
              <lablup-activity-panel title="${_t('summary.Invitation')}" elevation="1" height="220" scrollableY>
                  <div slot="message">
                    ${this.invitations.length > 0 ? this.invitations.map((invitation, index) => html`
                      <lablup-activity-panel class="inner-panel" noheader autowidth elevation="0" height="130">
                        <div slot="message">
                          <div class="wrap layout">
                          <h3 style="padding-top:10px;">From ${invitation.inviter}</h3>
                          <span class="invitation_folder_name">${_t('summary.FolderName')}: ${invitation.vfolder_name}</span>
                          <div class="horizontal center layout">
                            ${_t('summary.Permission')}:
                            ${[...invitation.perm].map((c) => {
    return html`
                                <lablup-shields app="" color="${['green', 'blue', 'red'][['r', 'w', 'd'].indexOf(c)]}"
                                        description="${c.toUpperCase()}" ui="flat"></lablup-shields>`;
  })}
                          </div>
                          <div style="margin:15px auto;" class="horizontal layout end-justified">
                            <mwc-button
                                outlined
                                label="${_t('summary.Decline')}"
                                @click="${(e) => this._deleteInvitation(e, invitation)}"></mwc-button>
                            <mwc-button
                                unelevated
                                label="${_t('summary.Accept')}"
                                @click="${(e) => this._acceptInvitation(e, invitation)}"></mwc-button>
                            <span class="flex"></span>
                          </div>
                        </div>
                      </lablup-activity-panel>`) : html`
                      <p>${_text('summary.NoInvitations')}</p>`
}
                  </div>
                </div>
              </lablup-activity-panel>
            </div>
          </div>
          <div class="vertical layout">
            ${this.is_admin ? html`
              <div class="horizontal layout wrap">
                <div class="vertical layout">
                  <div class="line"></div>
                  <div class="horizontal layout flex wrap center-justified">
                    <lablup-activity-panel class="footer-menu" noheader autowidth style="display: none;">
                      <div slot="message" class="vertical layout center start-justified flex upper-lower-space">
                        <h3 style="margin-top:0px;">${_t('summary.CurrentVersion')}</h3>
                        ${this.is_superadmin ? html`
                          <div class="layout vertical center center-justified flex" style="margin-bottom:5px;">
                            <lablup-shields app="Manager version" color="darkgreen" description="${this.manager_version}" ui="flat"></lablup-shields>
                            <div class="layout horizontal center flex" style="margin-top:4px;">
                              <lablup-shields app="Console version" color="${this.update_checker.updateNeeded ? 'red' : 'darkgreen'}" description="${this.webui_version}" ui="flat"></lablup-shields>
                              ${this.update_checker.updateNeeded ? html`
                                <mwc-icon-button class="update-button" icon="new_releases"
                                  @click="${() => {
    window.open(this.update_checker.updateURL, '_blank');
  }}"></mwc-icon-button>` :
    html`
                                    <mwc-icon class="update-icon">done</mwc-icon>
                                  `}
                            </div>
                          </div>
                        ` : html``}
                      </div>
                    </lablup-activity-panel>
                    <lablup-activity-panel class="footer-menu" noheader autowidth>
                      <div slot="message" class="layout horizontal center center-justified flex upper-lower-space">
                          <a href="/environment">
                            <div class="layout horizontal center center-justified flex"  style="font-size:14px;">
                              <i class="fas fa-sync-alt larger left-end-icon"></i>
                              <span>${_t('summary.UpdateEnvironmentImages')}</span>
                              <i class="fas fa-chevron-right right-end-icon"></i>
                            </div>
                          </a>
                      </div>
                    </lablup-activity-panel>
                    ${this.is_superadmin ? html`
                    <lablup-activity-panel class="footer-menu" noheader autowidth>
                    <div slot="message" class="layout horizontal center center-justified flex upper-lower-space">
                      <a href="/agent">
                        <div class="layout horizontal center center-justified flex" style="font-size:14px;">
                          <i class="fas fa-box larger left-end-icon"></i>
                          <span>${_t('summary.CheckResources')}</span>
                          <i class="fas fa-chevron-right right-end-icon"></i>
                        </div>
                      </a>
                    </div>
                  </lablup-activity-panel>
                  <lablup-activity-panel class="footer-menu" noheader autowidth>
                    <div slot="message" class="layout horizontal center center-justified flex upper-lower-space">
                        <a href="/settings">
                          <div class="layout horizontal center center-justified flex"  style="font-size:14px;">
                            <i class="fas fa-desktop larger left-end-icon"></i>
                            <span>${_t('summary.ChangeSystemSetting')}</span>
                            <i class="fas fa-chevron-right right-end-icon"></i>
                          </div>
                        </a>
                    </div>
                  </lablup-activity-panel>` : html``}

                    <lablup-activity-panel class="footer-menu" noheader autowidth>
                      <div slot="message" class="layout horizontal center center-justified flex upper-lower-space">
                          <a href="/maintenance">
                            <div class="layout horizontal center center-justified flex"  style="font-size:14px;">
                              <i class="fas fa-tools larger left-end-icon"></i>
                              <span>${_t('summary.SystemMaintenance')}</span>
                              <i class="fas fa-chevron-right right-end-icon"></i>
                            </div>
                          </a>
                      </div>
                    </lablup-activity-panel>
                  </div>
                </div>
              </div>
          </div>` : html``}
        </div>
      </div>
    <backend-ai-release-check id="update-checker"></backend-ai-release-check>
  `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-summary-view': BackendAISummary;
  }
}
