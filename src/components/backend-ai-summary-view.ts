/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {translate as _t} from "lit-translate";
import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import './lablup-loading-spinner';

import 'weightless/card';
import 'weightless/icon';

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
import marked from "marked/lib/marked.esm.js";

import {default as PainKiller} from "./backend-ai-painkiller";
import {BackendAiStyles} from "./backend-ai-general-styles";
import {IronFlex, IronFlexAlignment, IronPositioning} from "../plastics/layout/iron-flex-layout-classes";

/**
 `<backend-ai-summary-view>` is a Summary panel of backend.ai console.

 Example:
 <backend-ai-summary-view active></backend-ai-summary-view>

 @group Lablup Elements
 @element backend-ai-summary-view
 */

@customElement("backend-ai-summary-view")
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
  @property({type: String}) console_version = '';
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

  public invitations: any;

  constructor() {
    super();
    this.invitations = [];
  }

  static get styles() {
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
          font-size:13px;
          font-weight: 400;
          max-height: 20px;
          overflow: scroll;
        }

        .notice-ticker lablup-shields {
          margin-right: 15px;
        }

        #session-launcher {
          --component-width: 284px;
          --component-height: 57px;
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
      `
    ];
  }

  firstUpdated() {
    this.spinner = this.shadowRoot.querySelector('#loading-spinner');
    this.notification = globalThis.lablupNotification;
    this.update_checker = this.shadowRoot.querySelector('#update-checker');
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._readAnnouncement();
      }, true);
    } else {
      this._readAnnouncement();
    }
  }

  _refreshConsoleUpdateInformation() {
    if (this.is_superadmin && globalThis.backendaioptions.get("automatic_update_check", true)) {
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
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.is_superadmin = globalThis.backendaiclient.is_superadmin;
        this.is_admin = globalThis.backendaiclient.is_admin;
        this.authenticated = true;
        this.manager_version = globalThis.backendaiclient.managerVersion;
        this.console_version = globalThis.packageVersion;
        if (this.activeConnected) {
          this._refreshConsoleUpdateInformation();
          this._refreshInvitations();
          this.requestUpdate();
          //let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
          //document.dispatchEvent(event);
        }
      }, true);
    } else {
      this.is_superadmin = globalThis.backendaiclient.is_superadmin;
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.authenticated = true;
      this.manager_version = globalThis.backendaiclient.managerVersion;
      this.console_version = globalThis.packageVersion;
      this._refreshConsoleUpdateInformation();
      this._refreshInvitations();
      this.requestUpdate();
      //let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
      //document.dispatchEvent(event);
    }
  }

  _readAnnouncement() {
    if (!this.activeConnected) {
      return;
    }
    globalThis.backendaiclient.service.get_announcement()
      .then(res => {
        if ('message' in res) {
          this.announcement = marked(res.message);
        }
      }).catch(err=>{

    });
  }

  _toInt(value: number) {
    return Math.ceil(value);
  }

  _countObject(obj: object) {
    return Object.keys(obj).length;
  }

  _addComma(num: any) {
    if (num === undefined) {
      return '';
    }
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
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
    globalThis.backendaiclient.vfolder.invitations().then(res => {
      this.invitations = res.invitations;
      if (this.active && !refreshOnly) {
        setTimeout(() => {
          this._refreshInvitations()
        }, 15000);
      }
    });
  }

  /**
   * Accept invitation and make you can access vfloder.
   *
   * @param {Event} e - Click the accept button
   * @param {any} invitation
   * */
  _acceptInvitation(e, invitation: any) {
    if (!this.activeConnected) {
      return;
    }
    let panel = e.target.closest('lablup-activity-panel');
    globalThis.backendaiclient.vfolder.accept_invitation(invitation.id)
      .then(response => {
        panel.setAttribute('disabled', 'true');
        panel.querySelectorAll('wl-button').forEach((btn) => {
          btn.setAttribute('disabled', 'true');
        });
        this.notification.text = `You can now access folder: ${invitation.vfolder_name}`;
        this.notification.show();
        this._refreshInvitations(true);
      })
      .catch(err => {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.detail = err.message;
        this.notification.show(true, err);
      });
  }

  /**
   * Delete invitation folder.
   *
   * @param {Event} e - Click the decline button
   * @param {any} invitation
   * */
  _deleteInvitation(e, invitation: any) {
    if (!this.activeConnected) {
      return;
    }
    let panel = e.target.closest('lablup-activity-panel');
    globalThis.backendaiclient.vfolder.delete_invitation(invitation.id)
      .then(res => {
        panel.setAttribute('disabled', 'true');
        panel.querySelectorAll('wl-button').forEach((btn) => {
          btn.setAttribute('disabled', 'true');
        });
        this.notification.text = `Folder invitation is deleted: ${invitation.vfolder_name}`;
        this.notification.show();
        this._refreshInvitations(true);
      });
  }

  _stripHTMLTags(str) {
    return str.replace(/(<([^>]+)>)/gi, "");
  }

  render() {
    // language=HTML
    return html`
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css">
      <lablup-loading-spinner id="loading-spinner"></lablup-loading-spinner>
      <div class="item" elevation="1" style="padding-bottom:20px;">
        ${this.announcement != '' ? html`
          <h3 class="notice-ticker plastic-material-title horizontal center layout">
            <lablup-shields app="" color="red" description="Notice" ui="round"></lablup-shields>
            <span>${this._stripHTMLTags(this.announcement)}</span>
          </h3>
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
              ${this.is_admin
      ? html`
                <a href="/credential" class="vertical center center-justified layout start-menu-items" style="border-left:1px solid #ccc;">
                  <i class="fas fa-key fa-2x"></i>
                  <span>${_t('summary.CreateANewKeypair')}</span>
                </a>
                <a href="/credential" class="vertical center center-justified layout start-menu-items" style="border-left:1px solid #ccc;">
                  <i class="fas fa-cogs fa-2x"></i>
                  <span>${_t('summary.MaintainKeypairs')}</span>
                </a>`
      : html``}
              </div>
            </div>
          </lablup-activity-panel>
          <lablup-activity-panel title="${_t('summary.ResourceStatistics')}" elevation="1" narrow height="500">
            <div slot="message">
                <backend-ai-resource-monitor location="summary" id="resource-monitor" ?active="${this.active === true}" direction="vertical"></backend-ai-resource-monitor>
            </div>
          </lablup-activity-panel>

          <backend-ai-resource-panel ?active="${this.active === true}" height="500"></backend-ai-resource-panel>

          ${this.announcement != '' ? html`
          <lablup-activity-panel title="${_t('summary.Announcement')}" elevation="1">
            <div slot="message">
              ${unsafeHTML(this.announcement)}
            </div>
          </lablup-activity-panel>
          ` : html``}
      ${this.invitations ? this.invitations.map(invitation =>
      html`
            <lablup-activity-panel title="${_t('summary.Invitation')}">
              <div slot="message">
                <h3>From ${invitation.inviter}</h3>
                <span class="invitation_folder_name">${_t("summary.FolderName")}>: ${invitation.vfolder_name}</span>
                <div class="horizontal center layout">
                ${_t("summary.Permission")}>:
                ${[...invitation.perm].map(c => {
        return html`
                  <lablup-shields app="" color="${['green', 'blue', 'red'][['r', 'w', 'd'].indexOf(c)]}"
                            description="${c.toUpperCase()}" ui="flat"></lablup-shields>`;
      })}
                </div>
                <div style="margin-top:25px;" class="horizontal layout justified">
                  <wl-button
                    class="fg green"
                    outlined
                    @click=${e => this._acceptInvitation(e, invitation)}
                  >
                    <wl-icon>add</wl-icon>
                    ${_t('summary.Accept')}
                  </wl-button>
                  <span class="flex"></span>
                  <wl-button
                    class="fg red"
                    outlined
                    @click=${e => this._deleteInvitation(e, invitation)}
                  >
                    <wl-icon>remove</wl-icon>
                    ${_t('summary.Decline')}
                  </wl-button>
                </div>
              </div>
            </lablup-activity-panel>
            `
    ) : ''}
    ${this.is_admin
      ? html`
          <lablup-activity-panel title="${_t('summary.Administration')}" elevation="1">
            <div slot="message">
      ${this.is_superadmin ? html`
              <div class="layout vertical center start flex" style="margin-bottom:5px;">
                <lablup-shields app="Manager version" color="darkgreen" description="${this.manager_version}" ui="flat"></lablup-shields>
                <div class="layout horizontal center flex" style="margin-top:4px;">
                  <lablup-shields app="Console version" color="${this.update_checker.updateNeeded ? 'red' : 'darkgreen'}" description="${this.console_version}" ui="flat"></lablup-shields>
                  ${this.update_checker.updateNeeded ? html`
                    <mwc-icon-button class="update-button" icon="new_releases" @click="${() => {
        window.open(this.update_checker.updateURL, '_blank')
      }}"></mwc-icon-button>
                  ` : html`
                    <mwc-icon class="update-icon">done</mwc-icon>
                  `}
                </div>
              </div>` : html``}
              <ul>
                <li><a href="/environment">${_t('summary.UpdateEnvironmentImages')}</a></li>
                <li><a href="/agent">${_t('summary.CheckResources')}</a></li>
      ${this.is_superadmin ? html`
                <li><a href="/settings">${_t('summary.ChangeSystemSetting')}</a></li>
                <li><a href="/environment">${_t('summary.SystemMaintenance')}</a></li>` : html``}
              </ul>
            </div>
          </lablup-activity-panel>`
      : html``}
        </div>
      </div>
      <backend-ai-release-check id="update-checker"></backend-ai-release-check>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-summary-view": BackendAISummary;
  }
}
