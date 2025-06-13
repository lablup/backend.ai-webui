/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { navigate } from '../backend-ai-app';
import '../plastics/lablup-piechart/lablup-piechart';
import '../plastics/lablup-shields/lablup-shields';
import {
  IronFlex,
  IronFlexAlignment,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import { store } from '../store';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import './backend-ai-release-check';
import './backend-ai-resource-monitor';
import './backend-ai-resource-panel';
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

type BackendAIResourcePanel =
  HTMLElementTagNameMap['backend-ai-resource-panel'];

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
  @query('#resource-panel') resourcePanel!: BackendAIResourcePanel;

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
        os: 'win32',
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
          background-color: var(--token-colorBgContainer, #f6f6f6);
          margin-bottom: var(--token-marginSM);
        }

        #download-app-os-select-box mwc-select {
          width: 100%;
          height: 58px;
        }

        lablup-activity-panel.inner-panel:hover {
          --card-background-color: var(--general-background-color);
        }

        @media screen and (max-width: 750px) {
          lablup-activity-panel.footer-menu > div > a > div > span {
            text-align: left;
            width: 250px;
          }
        }

        button.link-button {
          background: none;
          color: var(--token-colorTextSecondary);
          border: none;
          padding: 0;
          font: inherit;
          cursor: pointer;
          outline: inherit;
        }
        button.link-button > i {
          color: var(--token-colorTextSecondary, #5b5b5b);
          margin: 10px;
        }
        button.link-button > span {
          max-width: 70px;
          color: var(--token-colorTextSecondary, #838383);
        }
        button.link-button:hover {
          color: var(--token-colorPrimary, #3e872d);
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
      this.resourcePanel.removeAttribute('active');
      return;
    }
    this.resourceMonitor.setAttribute('active', 'true');
    this.resourcePanel.setAttribute('active', '');
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
          if (globalThis.backendaiclient.supports('use-win-instead-of-win32')) {
            this.appDownloadMap['Windows']['os'] = 'win';
          }

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
      if (globalThis.backendaiclient.supports('use-win-instead-of-win32')) {
        this.appDownloadMap['Windows']['os'] = 'win';
      }
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
   * Returns tab according to vfolder information
   *
   * @param vfolderInfo
   * @return {string} - tab name of vfolder (model, general, data, automount)
   */
  static getVFolderTabByVFolderInfo(vfolderInfo) {
    if (
      !vfolderInfo.name.startsWith('.') &&
      vfolderInfo.usage_mode == 'model'
    ) {
      return 'model';
    } else if (
      !vfolderInfo.name.startsWith('.') &&
      vfolderInfo.usage_mode == 'general'
    ) {
      return 'general';
    } else if (
      !vfolderInfo.name.startsWith('.') &&
      vfolderInfo.usage_mode == 'data'
    ) {
      return 'data';
    } else if (vfolderInfo.name.startsWith('.')) {
      return 'automount';
    } else {
      return 'general';
    }
  }

  /**
   * Accept invitation and make you can access vfolder.
   *
   * @param {Event} e - Click the accept button
   * @param {any} invitation
   * */
  async _acceptInvitation(e, invitation: any) {
    if (!this.activeConnected) {
      return;
    }
    try {
      await globalThis.backendaiclient.vfolder.accept_invitation(invitation.id);
      const folder = globalThis.backendaiclient.supports('vfolder-id-based')
        ? invitation.vfolder_id
        : invitation.vfolder_name;
      const vfolderInfo = await globalThis.backendaiclient.vfolder.info(folder);
      const tabName = BackendAISummary.getVFolderTabByVFolderInfo(vfolderInfo);
      const searchParam = new URLSearchParams();
      searchParam.set('tab', tabName);
      searchParam.set('folder', invitation.vfolder_id.replace('-', ''));
      this.notification.url = `/data?${searchParam.toString()}`;
      this.notification.text =
        _text('summary.AcceptSharedVFolder') + `${invitation.vfolder_name}`;
      this.notification.show(true);
    } catch (err) {
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true, err);
    }
    this._refreshInvitations();
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

    try {
      await globalThis.backendaiclient.vfolder.delete_invitation(invitation.id);
      this.notification.text =
        _text('summary.DeclineSharedVFolder') + `${invitation.vfolder_name}`;
      this.notification.show();
    } catch (err) {
      this.notification.text = PainKiller.relieve(err.title);
      this.notification.detail = err.message;
      this.notification.show(true, err);
    }
    this._refreshInvitations();
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

  /**
   *
   * @param {string} url - page to redirect from the current page.
   * @param {string} search
   */
  _moveTo(url = '', search: string | undefined = undefined) {
    const page = url !== '' ? url : 'start';
    // globalThis.history.pushState({}, '', page);
    store.dispatch(navigate(decodeURIComponent(page), {}));

    document.dispatchEvent(
      new CustomEvent('react-navigate', {
        detail: {
          pathname: url,
          search: search,
        },
      }),
    );
  }

  render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="/resources/fonts/font-awesome-all.min.css" />
      <link rel="stylesheet" href="resources/custom.css" />
      <div class="item" elevation="1" class="vertical layout center flex">
        <div class="horizontal wrap layout" style="gap:24px;">
          <lablup-activity-panel
            title="${_t('summary.ResourceStatistics')}"
            elevation="1"
            narrow
            height="500"
            scrollableY="true"
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
            id="resource-panel"
            ?active="${this.active === true}"
            height="500"
          ></backend-ai-resource-panel>

          <!-- Vertical container for the two 245px panels -->
          <div class="vertical layout" style="gap:10px;">
            <lablup-activity-panel
              title="${_t('summary.Invitation')}"
              elevation="1"
              narrow
              height="245"
              scrollableY="true"
            >
              <div
                class="layout vertical"
                slot="message"
                style="padding: 10px; gap: 10px;"
              >
                ${this.invitations.length > 0
                  ? this.invitations.map(
                      (invitation, index) => html`
                        <lablup-activity-panel
                          class="inner-panel"
                          noheader
                          autowidth
                          elevation="1"
                          height="130"
                        >
                          <div slot="message">
                            <div class="wrap layout">
                              <h3 style="padding-top:10px;">
                                From ${invitation.inviter}
                              </h3>
                              <div class="invitation_folder_name">
                                ${_t('summary.FolderName')}:
                                ${invitation.vfolder_name}
                              </div>
                              <div class="horizontal center layout">
                                ${_t('summary.Permission')}:
                                ${[...invitation.perm].map(
                                  (c) => html`
                                    <lablup-shields
                                      app=""
                                      color="${[
                                        'green',
                                        'blue',
                                        'red',
                                        'yellow',
                                      ][['r', 'w', 'd', 'o'].indexOf(c)]}"
                                      description="${c.toUpperCase()}"
                                      ui="flat"
                                    ></lablup-shields>
                                  `,
                                )}
                              </div>
                              <div
                                style="margin:15px auto; gap: 8px;"
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

            ${!globalThis.isElectron && this.allowAppDownloadPanel
              ? html`
                  <lablup-activity-panel
                    title="${_t('summary.DownloadWebUIApp')}"
                    elevation=""
                    height="245"
                  >
                    <div slot="message">
                      <div
                        id="download-app-os-select-box"
                        class="horizontal layout center-justified"
                      >
                        <mwc-select
                          outlined
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
                      <div
                        class="horizontal layout center-justified"
                        style="gap:20px"
                      >
                        ${this.downloadAppOS &&
                        this.appDownloadMap[this.downloadAppOS][
                          'architecture'
                        ].map(
                          (arch) => html`
                            <mwc-button
                              icon="cloud_download"
                              outlined
                              style="margin:10px 0 10px 0;flex-basis:50%;"
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
        </div>
        <div class="vertical layout">
          ${this.is_admin
            ? html`
              <div class="horizontal layout wrap">
                <div class="vertical layout">
                  <div class="line"></div>
                  <div class="horizontal layout flex wrap center-justified" style="gap:24px;">
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
                          <button class="link-button" @click="${() => {
                            this._moveTo('/environment');
                          }}" >
                            <div class="layout horizontal center center-justified flex"  style="font-size:14px;">
                              <i class="fas fa-sync-alt larger left-end-icon"></i>
                              <span>${_t(
                                'summary.UpdateEnvironmentImages',
                              )}</span>
                              <i class="fas fa-chevron-right right-end-icon"></i>
                            </div>
                          </button>
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
                                <button
                                  class="link-button"
                                  @click="${() => this._moveTo('/agent')}"
                                >
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
                                </button>
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
                                <button
                                  class="link-button"
                                  @click="${() => this._moveTo('settings')}"
                                >
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
                                </button>
                              </div>
                            </lablup-activity-panel>
                          `
                        : html``
                    }
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
                                <button
                                  class="link-button"
                                  @click="${() => this._moveTo('/maintenance')}"
                                >
                                  <div
                                    class="layout horizontal center center-justified flex"
                                    style="font-size:14px;"
                                  >
                                    <i
                                      class="fas fa-tools larger left-end-icon"
                                    ></i>
                                    <span>
                                      ${_t('summary.SystemMaintenance')}
                                    </span>
                                    <i
                                      class="fas fa-chevron-right right-end-icon"
                                    ></i>
                                  </div>
                                </button>
                              </div>
                            </lablup-activity-panel>
                          `
                        : html``
                    }
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
