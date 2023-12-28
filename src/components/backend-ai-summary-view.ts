/**
 @license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import '../plastics/lablup-piechart/lablup-piechart';
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './backend-ai-release-check';
import './backend-ai-resource-monitor';
import './backend-ai-resource-panel';
import './backend-ai-session-launcher';
import './lablup-activity-panel';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-select';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text, translate as _t } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIResourceMonitor =
  HTMLElementTagNameMap['backend-ai-resource-monitor'];

/**
 `<backend-ai-summary-view>` is a Summary panel of backend.ai web UI.

 Example:
 <backend-ai-summary-view active></backend-ai-summary-view>

 @group Lablup Elements
 @element backend-ai-summary-view
 */

@customElement('backend-ai-summary-view')
export default class BackendAISummary extends BackendAIPage {
  @property({ type: String }) condition = 'running';
  @property({ type: Number }) sessions = 0;
  @property({ type: Object }) jobs = Object();
  @property({ type: Number }) agents = 0;
  @property({ type: Boolean }) is_admin = false;
  @property({ type: Boolean }) is_superadmin = false;
  @property({ type: Object }) resources = Object();
  @property({ type: Object }) update_checker = Object();
  @property({ type: Boolean }) authenticated = false;
  @property({ type: String }) manager_version = '';
  @property({ type: String }) webui_version = '';
  @property({ type: Number }) cpu_total = 0;
  @property({ type: Number }) cpu_used = 0;
  @property({ type: String }) cpu_percent = '0';
  @property({ type: String }) cpu_total_percent = '0';
  @property({ type: Number }) cpu_total_usage_ratio = 0;
  @property({ type: Number }) cpu_current_usage_ratio = 0;
  @property({ type: String }) mem_total = '0';
  @property({ type: String }) mem_used = '0';
  @property({ type: String }) mem_allocated = '0';
  @property({ type: Number }) mem_total_usage_ratio = 0;
  @property({ type: Number }) mem_current_usage_ratio = 0;
  @property({ type: String }) mem_current_usage_percent = '0';
  @property({ type: Number }) cuda_gpu_total = 0;
  @property({ type: Number }) cuda_gpu_used = 0;
  @property({ type: Number }) cuda_fgpu_total = 0;
  @property({ type: Number }) cuda_fgpu_used = 0;
  @property({ type: Number }) rocm_gpu_total = 0;
  @property({ type: Number }) rocm_gpu_used = 0;
  @property({ type: Number }) tpu_total = 0;
  @property({ type: Number }) tpu_used = 0;
  @property({ type: Number }) ipu_total = 0;
  @property({ type: Number }) ipu_used = 0;
  @property({ type: Number }) atom_total = 0;
  @property({ type: Number }) atom_used = 0;
  @property({ type: Object }) notification = Object();
  @property({ type: Object }) resourcePolicy;
  @property({ type: Object }) invitations = Object();
  @property({ type: Object }) appDownloadMap;
  @property({ type: String }) appDownloadUrl;
  @property({ type: Boolean }) allowAppDownloadPanel = true;
  @property({ type: String }) downloadAppOS = '';
  @query('#resource-monitor') resourceMonitor!: BackendAIResourceMonitor;

  constructor() {
    super();
    this.invitations = [];
    this.appDownloadMap = {
      Linux: {
        os: 'linux',
        architecture: ['arm64', 'x64'],
        extension: 'zip',
      },
      MacOS: {
        os: 'macos',
        architecture: ['arm64', 'x64'],
        extension: 'dmg',
      },
      Windows: {
        os: 'win',
        architecture: ['arm64', 'x64'],
        extension: 'zip',
      },
    };
  }

  static get styles(): CSSResultGroup {
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
          transition: color ease-in 0.2s;
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

        mwc-button,
        mwc-button[unelevated],
        mwc-button[outlined] {
          background-image: none;
          --mdc-theme-primary: var(--general-button-background-color);
          --mdc-theme-on-primary: var(--general-button-color);
          --mdc-typography-font-family: var(--general-font-family);
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

        #download-app-os-select-box {
          height: 80px;
          padding-top: 20px;
          padding-left: 20px;
          background-color: #f6f6f6;
          margin-bottom: 15px;
        }

        #download-app-os-select-box mwc-select {
          width: 305px;
          height: 58px;
          border: 0.1em solid #ccc;
          font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-family: var(--general-font-family);
          --mdc-typography-subtitle1-font-size: 14px;
          --mdc-typography-subtitle1-font-color: rgb(24, 24, 24);
          --mdc-typography-subtitle1-font-weight: 400;
          --mdc-typography-subtitle1-line-height: 16px;
          --mdc-select-fill-color: rgba(255, 255, 255, 1);
          --mdc-select-label-ink-color: rgba(24, 24, 24, 1);
          --mdc-select-disabled-ink-color: rgba(24, 24, 24, 1);
          --mdc-select-dropdown-icon-color: rgba(24, 24, 24, 1);
          --mdc-select-focused-dropdown-icon-color: rgba(24, 24, 24, 0.87);
          --mdc-select-disabled-dropdown-icon-color: rgba(24, 24, 24, 0.87);
          --mdc-select-idle-line-color: transparent;
          --mdc-select-hover-line-color: transparent;
          --mdc-select-ink-color: rgb(24, 24, 24);
          --mdc-select-outlined-idle-border-color: rgba(24, 24, 24, 0.42);
          --mdc-select-outlined-hover-border-color: rgba(24, 24, 24, 0.87);
          --mdc-theme-surface: white;
          --mdc-list-vertical-padding: 5px;
          --mdc-list-side-padding: 10px;
          --mdc-menu-item-height: 28px;
          --mdc-list-item__primary-text: {
            height: 20px;
            color: #222222;
          };
          margin-bottom: 5px;
        }

        lablup-activity-panel.inner-panel:hover {
          --card-background-color: var(--general-sidepanel-color);
        }

        @media screen and (max-width: 750px) {
          lablup-activity-panel.footer-menu > div > a > div > span {
            text-align: left;
            width: 250px;
          }
        }
      `,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
    this.update_checker = this.shadowRoot?.querySelector('#update-checker');
    this._getUserOS();
  }

  _getUserOS() {
    this.downloadAppOS = 'MacOS';
    if (navigator.userAgent.indexOf('Mac') != -1) this.downloadAppOS = 'MacOS';
    if (navigator.userAgent.indexOf('Win') != -1) {
      this.downloadAppOS = 'Windows';
    }
    if (navigator.userAgent.indexOf('Linux') != -1) {
      this.downloadAppOS = 'Linux';
    }
  }

  _refreshConsoleUpdateInformation() {
    if (
      this.is_superadmin &&
      globalThis.backendaioptions.get('automatic_update_check', true)
    ) {
      this.update_checker.checkRelease();
    }
  }

  async _viewStateChanged(active: boolean) {
    await this.updateComplete;
    if (active === false) {
      this.resourceMonitor.removeAttribute('active');
      return;
    }
    this.resourceMonitor.setAttribute('active', 'true');
    if (
      typeof globalThis.backendaiclient === 'undefined' ||
      globalThis.backendaiclient === null ||
      globalThis.backendaiclient.ready === false
    ) {
      document.addEventListener(
        'backend-ai-connected',
        () => {
          this.is_superadmin = globalThis.backendaiclient.is_superadmin;
          this.is_admin = globalThis.backendaiclient.is_admin;
          this.authenticated = true;
          this.manager_version = globalThis.backendaiclient.managerVersion;
          this.webui_version = globalThis.packageVersion;
          this.appDownloadUrl =
            globalThis.backendaiclient._config.appDownloadUrl;
          this.allowAppDownloadPanel =
            globalThis.backendaiclient._config.allowAppDownloadPanel;

          if (this.activeConnected) {
            this._refreshConsoleUpdateInformation();
          }
          this._refreshInvitations();
        },
        true,
      );
    } else {
      this.is_superadmin = globalThis.backendaiclient.is_superadmin;
      this.is_admin = globalThis.backendaiclient.is_admin;
      this.authenticated = true;
      this.manager_version = globalThis.backendaiclient.managerVersion;
      this.webui_version = globalThis.packageVersion;
      this.appDownloadUrl = globalThis.backendaiclient._config.appDownloadUrl;
      this.allowAppDownloadPanel =
        globalThis.backendaiclient._config.allowAppDownloadPanel;
      this._refreshConsoleUpdateInformation();
      this._refreshInvitations();
      // let event = new CustomEvent("backend-ai-resource-refreshed", {"detail": {}});
      // document.dispatchEvent(event);
    }
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
      panel.querySelectorAll('mwc-button').forEach((btn) => {
        btn.setAttribute('disabled', 'true');
      });
      await globalThis.backendaiclient.vfolder.accept_invitation(invitation.id);
      this.notification.text =
        _text('summary.AcceptSharedVFolder') + `${invitation.vfolder_name}`;
      this.notification.show();
      this._refreshInvitations();
    } catch (err) {
      panel.setAttribute('disabled', 'false');
      panel.querySelectorAll('mwc-button').forEach((btn) => {
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
      panel.querySelectorAll('mwc-button').forEach((btn) => {
        btn.setAttribute('disabled', 'true');
      });
      await globalThis.backendaiclient.vfolder.delete_invitation(invitation.id);
      this.notification.text =
        _text('summary.DeclineSharedVFolder') + `${invitation.vfolder_name}`;
      this.notification.show();
      this._refreshInvitations();
    } catch (err) {
      panel.setAttribute('disabled', 'false');
      panel.querySelectorAll('mwc-button').forEach((btn) => {
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

  _updateSelectedDownloadAppOS(e) {
    this.downloadAppOS = e.target.value;
  }

  _downloadApplication(e) {
    let downloadLink = '';
    const architecture = e.target.innerText.toLowerCase();
    const pkgVersion = globalThis.packageVersion;
    const os = this.appDownloadMap[this.downloadAppOS]['os'];
    const extension = this.appDownloadMap[this.downloadAppOS]['extension'];
    downloadLink = `${this.appDownloadUrl}/v${pkgVersion}/backend.ai-desktop-${pkgVersion}-${os}-${architecture}.${extension}`;
    window.open(downloadLink, '_blank');
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="/resources/fonts/font-awesome-all.min.css" />
      <link rel="stylesheet" href="resources/custom.css" />
      <!-- <div style="margin:-14px;margin-bottom:0px;">
        <backend-ai-react-announcement-alert></backend-ai-react-announcement-alert>
      </div> -->
      <div class="item" elevation="1" class="vertical layout center wrap flex">
        <div class="horizontal wrap layout">
          <lablup-activity-panel
            title="${_t('summary.StartMenu')}"
            elevation="1"
            height="500"
          >
            <div slot="message">
              <img
                src="/resources/images/launcher-background.png"
                style="width:300px;margin-bottom:30px;"
              />
              <div class="horizontal center-justified layout wrap">
                <backend-ai-session-launcher
                  location="summary"
                  id="session-launcher"
                  ?active="${this.active === true}"
                ></backend-ai-session-launcher>
              </div>
              <div class="horizontal center-justified layout wrap">
                <a
                  href="/data"
                  class="vertical center center-justified layout start-menu-items"
                >
                  <i class="fas fa-upload fa-2x"></i>
                  <span>${_t('summary.UploadFiles')}</span>
                </a>
                ${this.is_admin
                  ? html`
                      <a
                        href="/credential?action=add"
                        class="vertical center center-justified layout start-menu-items"
                        style="border-left:1px solid #ccc;"
                      >
                        <i class="fas fa-key fa-2x"></i>
                        <span>${_t('summary.CreateANewKeypair')}</span>
                      </a>
                      <a
                        href="/credential"
                        class="vertical center center-justified layout start-menu-items"
                        style="border-left:1px solid #ccc;"
                      >
                        <i class="fas fa-cogs fa-2x"></i>
                        <span>${_t('summary.MaintainKeypairs')}</span>
                      </a>
                    `
                  : html``}
              </div>
            </div>
          </lablup-activity-panel>
          <lablup-activity-panel
            title="${_t('summary.ResourceStatistics')}"
            elevation="1"
            narrow
            height="500"
          >
            <div slot="message">
              <backend-ai-resource-monitor
                location="summary"
                id="resource-monitor"
                ?active="${this.active === true}"
                direction="vertical"
              ></backend-ai-resource-monitor>
            </div>
          </lablup-activity-panel>
          <backend-ai-resource-panel
            ?active="${this.active === true}"
            height="500"
          ></backend-ai-resource-panel>
          <div class="horizontal wrap layout">
            <lablup-activity-panel
              title="${_t('summary.Invitation')}"
              elevation="1"
              height="245"
              scrollableY
            >
              <div slot="message">
                ${this.invitations.length > 0
                  ? this.invitations.map(
                      (invitation, index) => html`
                        <lablup-activity-panel
                          class="inner-panel"
                          noheader
                          autowidth
                          elevation="0"
                          height="130"
                        >
                          <div slot="message">
                            <div class="wrap layout">
                              <h3 style="padding-top:10px;">
                                From ${invitation.inviter}
                              </h3>
                              <span class="invitation_folder_name">
                                ${_t('summary.FolderName')}:
                                ${invitation.vfolder_name}
                              </span>
                              <div class="horizontal center layout">
                                ${_t('summary.Permission')}:
                                ${[...invitation.perm].map(
                                  (c) => html`
                                    <lablup-shields
                                      app=""
                                      color="${['green', 'blue', 'red'][
                                        ['r', 'w', 'd'].indexOf(c)
                                      ]}"
                                      description="${c.toUpperCase()}"
                                      ui="flat"
                                    ></lablup-shields>
                                  `,
                                )}
                              </div>
                              <div
                                style="margin:15px auto;"
                                class="horizontal layout end-justified"
                              >
                                <mwc-button
                                  outlined
                                  label="${_t('summary.Decline')}"
                                  @click="${(e) =>
                                    this._deleteInvitation(e, invitation)}"
                                ></mwc-button>
                                <mwc-button
                                  unelevated
                                  label="${_t('summary.Accept')}"
                                  @click="${(e) =>
                                    this._acceptInvitation(e, invitation)}"
                                ></mwc-button>
                                <span class="flex"></span>
                              </div>
                            </div>
                          </div>
                        </lablup-activity-panel>
                      `,
                    )
                  : html`
                      <p>${_text('summary.NoInvitations')}</p>
                    `}
              </div>
            </lablup-activity-panel>
          </div>
          ${!globalThis.isElectron && this.allowAppDownloadPanel
            ? html`
                <lablup-activity-panel
                  title="${_t('summary.DownloadWebUIApp')}"
                  elevation="1"
                  narrow
                  height="245"
                >
                  <div slot="message">
                    <div
                      id="download-app-os-select-box"
                      class="horizontal layout start-justified"
                    >
                      <mwc-select
                        @selected="${(e) =>
                          this._updateSelectedDownloadAppOS(e)}"
                      >
                        ${Object.keys(this.appDownloadMap).map(
                          (item) => html`
                            <mwc-list-item
                              value="${item}"
                              ?selected="${item === this.downloadAppOS}"
                            >
                              ${item}
                            </mwc-list-item>
                          `,
                        )}
                      </mwc-select>
                    </div>
                    <div class="horizontal layout center center-justified">
                      ${this.downloadAppOS &&
                      this.appDownloadMap[this.downloadAppOS][
                        'architecture'
                      ].map(
                        (arch) => html`
                          <mwc-button
                            raised
                            style="margin:10px;flex-basis:50%;"
                            @click="${(e) => this._downloadApplication(e)}"
                          >
                            ${arch}
                          </mwc-button>
                        `,
                      )}
                    </div>
                  </div>
                </lablup-activity-panel>
              `
            : html``}
        </div>
        <div class="vertical layout">
          ${this.is_admin
            ? html`
              <div class="horizontal layout wrap">
                <div class="vertical layout">
                  <div class="line"></div>
                  <div class="horizontal layout flex wrap center-justified">
                    <lablup-activity-panel class="footer-menu" noheader autowidth style="display: none;">
                      <div slot="message" class="vertical layout center start-justified flex upper-lower-space">
                        <h3 style="margin-top:0px;">${_t(
                          'summary.CurrentVersion',
                        )}</h3>
                        ${
                          this.is_superadmin
                            ? html`
                                <div
                                  class="layout vertical center center-justified flex"
                                  style="margin-bottom:5px;"
                                >
                                  <lablup-shields
                                    app="Manager version"
                                    color="darkgreen"
                                    description="${this.manager_version}"
                                    ui="flat"
                                  ></lablup-shields>
                                  <div
                                    class="layout horizontal center flex"
                                    style="margin-top:4px;"
                                  >
                                    <lablup-shields
                                      app="Console version"
                                      color="${this.update_checker.updateNeeded
                                        ? 'red'
                                        : 'darkgreen'}"
                                      description="${this.webui_version}"
                                      ui="flat"
                                    ></lablup-shields>
                                    ${this.update_checker.updateNeeded
                                      ? html`
                                          <mwc-icon-button
                                            class="update-button"
                                            icon="new_releases"
                                            @click="${() => {
                                              window.open(
                                                this.update_checker.updateURL,
                                                '_blank',
                                              );
                                            }}"
                                          ></mwc-icon-button>
                                        `
                                      : html`
                                          <mwc-icon class="update-icon">
                                            done
                                          </mwc-icon>
                                        `}
                                  </div>
                                </div>
                              `
                            : html``
                        }
                      </div>
                    </lablup-activity-panel>
                    <lablup-activity-panel class="footer-menu" noheader autowidth>
                      <div slot="message" class="layout horizontal center center-justified flex upper-lower-space">
                          <a href="/environment">
                            <div class="layout horizontal center center-justified flex"  style="font-size:14px;">
                              <i class="fas fa-sync-alt larger left-end-icon"></i>
                              <span>${_t(
                                'summary.UpdateEnvironmentImages',
                              )}</span>
                              <i class="fas fa-chevron-right right-end-icon"></i>
                            </div>
                          </a>
                      </div>
                    </lablup-activity-panel>
                    ${
                      this.is_superadmin
                        ? html`
                            <lablup-activity-panel
                              class="footer-menu"
                              noheader
                              autowidth
                            >
                              <div
                                slot="message"
                                class="layout horizontal center center-justified flex upper-lower-space"
                              >
                                <a href="/agent">
                                  <div
                                    class="layout horizontal center center-justified flex"
                                    style="font-size:14px;"
                                  >
                                    <i
                                      class="fas fa-box larger left-end-icon"
                                    ></i>
                                    <span>${_t('summary.CheckResources')}</span>
                                    <i
                                      class="fas fa-chevron-right right-end-icon"
                                    ></i>
                                  </div>
                                </a>
                              </div>
                            </lablup-activity-panel>
                            <lablup-activity-panel
                              class="footer-menu"
                              noheader
                              autowidth
                            >
                              <div
                                slot="message"
                                class="layout horizontal center center-justified flex upper-lower-space"
                              >
                                <a href="/settings">
                                  <div
                                    class="layout horizontal center center-justified flex"
                                    style="font-size:14px;"
                                  >
                                    <i
                                      class="fas fa-desktop larger left-end-icon"
                                    ></i>
                                    <span>
                                      ${_t('summary.ChangeSystemSetting')}
                                    </span>
                                    <i
                                      class="fas fa-chevron-right right-end-icon"
                                    ></i>
                                  </div>
                                </a>
                              </div>
                            </lablup-activity-panel>
                          `
                        : html``
                    }

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
          </div>`
            : html``}
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
