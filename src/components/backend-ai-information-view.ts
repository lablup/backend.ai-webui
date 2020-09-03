/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t, translateUnsafeHTML as _tr} from "lit-translate";
import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import 'weightless/button';
import 'weightless/icon';
import 'weightless/card';

import './lablup-loading-spinner';

/**
 Backend.AI Information View

 Example:

 <backend-ai-information-view page="class" id="information" ?active="${0}">
 ... content ...
 </backend-ai-information-view>

 @group Backend.AI Console
 @element backend-ai-information-view
 */

@customElement("backend-ai-information-view")
export default class BackendAiInformationView extends BackendAIPage {

  @property({type: Object}) notification = Object();
  @property({type: String}) manager_version = '';
  @property({type: String}) manager_version_latest = '';
  @property({type: String}) console_version = '';
  @property({type: String}) api_version = '';
  @property({type: String}) docker_version = '';
  @property({type: String}) pgsql_version = '';
  @property({type: String}) redis_version = '';
  @property({type: String}) etcd_version = '';
  @property({type: Boolean}) license_valid = false;
  @property({type: String}) license_type = '';
  @property({type: String}) license_licensee = '';
  @property({type: String}) license_key = '';
  @property({type: String}) license_expiration = '';
  @property({type: Boolean}) account_changed = true;
  @property({type: Boolean}) use_ssl = true;

  constructor() {
    super();
  }

  static get styles() {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
        div.indicator,
        span.indicator {
          font-size: 9px;
          margin-right: 5px;
        }

        div.description,
        span.description {
          font-size: 11px;
          margin-top: 5px;
          margin-right: 5px;
        }

        .setting-item {
          margin: 15px auto;
        }

        .setting-desc {
          width: 300px;
        }

        wl-card > div {
          padding: 15px;
        }

        wl-button {
          --button-bg: transparent;
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-100);
          --button-bg-disabled: #ccc;
          --button-color: var(--paper-red-100);
          --button-color-hover: var(--paper-red-100);
          --button-color-disabled: #ccc;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <wl-card elevation="1">
        <h3 class="horizontal center layout">
          <span>${_t("information.System")}</span>
          <span class="flex"></span>
        </h3>

        <h4>${_t("information.Core")}</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.ManagerVersion")}</div>
            </div>
            <div class="vertical center-justified layout">
              Backend.AI ${this.manager_version}
              <lablup-shields app="${_t("information.Installation")}" color="darkgreen" description="${this.manager_version}" ui="flat"></lablup-shields>
              <lablup-shields app="${_t("information.LatestRelease")}" color="darkgreen" description="${this.manager_version_latest}" ui="flat"></lablup-shields>
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.APIVersion")}</div>
            </div>
            <div class="vertical center-justified layout">
              ${this.api_version}
            </div>
          </div>
        </div>
        <h4>${_t("information.Component")}</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.DockerVersion")}</div>
              <div class="description">${_tr("information.DescDockerVersion")}
              </div>
            </div>
            <div class="vertical center-justified layout">
              ${this.docker_version}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.PostgreSQLVersion")}</div>
              <div class="description">${_tr("information.DescPostgreSQLVersion")}
              </div>
            </div>
            <div class="vertical center-justified layout">
              ${this.pgsql_version}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.ETCDVersion")}</div>
              <div class="description">${_tr("information.DescETCDVersion")}
              </div>
            </div>
            <div class="vertical center-justified layout">
              ${this.etcd_version}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.RedisVersion")}</div>
              <div class="description">${_tr("information.DescRedisVersion")}
              </div>
            </div>
            <div class="vertical center-justified layout">
              ${this.redis_version}
            </div>
          </div>
        </div>
        <h4>${_t("information.Security")}</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.DefaultAdministratorAccountChanged")}</div>
              <div class="description">${_t("information.DescDefaultAdministratorAccountChanged")}
              </div>
            </div>
            <div class="vertical center-justified layout">
            ${this.account_changed ? html`<wl-icon>done</wl-icon>` : html`<wl-icon>warning</wl-icon>`}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.UsesSSL")}</div>
              <div class="description">${_t("information.DescUsesSSL")}
              </div>
            </div>
            <div class="vertical center-justified layout">
            ${this.use_ssl ? html`<wl-icon>done</wl-icon>` : html`<wl-icon class="fg red">warning</wl-icon>`}
            </div>
          </div>
        </div>
        <h4>${_t("information.License")}</h4>
        <div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.IsLicenseValid")}</div>
              <div class="description">${_t("information.DescIsLicenseValid")}
              </div>
            </div>
            <div class="vertical center-justified layout">
            ${this.license_valid ? html`<wl-icon>done</wl-icon>` : html`<wl-icon class="fg red">warning</wl-icon>`}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.LicenseType")}</div>
              <div class="description">${_tr("information.DescLicenseType")}
              </div>
            </div>
            <div class="vertical center-justified layout">
            ${this.license_type === 'fixed' ? _t('information.FixedLicense') : _t('information.DynamicLicense')}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.Licensee")}</div>
              <div class="description">${_t("information.DescLicensee")}
              </div>
            </div>
            <div class="vertical center-justified layout">
            ${this.license_licensee}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-descw">
              <div>${_t("information.LicenseKey")}</div>
              <div class="description">${_t("information.DescLicenseKey")}
              </div>
            </div>
            <div class="vertical center-justified layout monospace indicator">
            ${this.license_key}
            </div>
          </div>
          <div class="horizontal flex layout wrap setting-item">
            <div class="vertical center-justified layout setting-desc">
              <div>${_t("information.Expiration")}</div>
              <div class="description">${_t("information.DescExpiration")}
              </div>
            </div>
            <div class="vertical center-justified layout">
            ${this.license_expiration}
            </div>
          </div>
        </div>

      </wl-card>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;

    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateInformation();
      }, true);
    } else { // already connected
      this.updateInformation();
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (!active) {
      return;
    }
  }

  _updateLicenseInfo() {
    globalThis.backendaiclient.enterprise.getLicense().then((response) => {
      this.license_valid = response.valid;
      this.license_type = response.type;
      this.license_licensee = response.licensee;
      this.license_key = response.licenseKey;
      this.license_expiration = response.expiration;
    }).catch((err) => {
      this.license_valid = false;
      this.license_type = _text('information.CannotRead');
      this.license_licensee = _text('information.CannotRead');
      this.license_key = _text('information.CannotRead');
      this.license_expiration = _text('information.CannotRead');
    });
  }

  /**
   * Update information of the client
   */
  updateInformation() {
    this.manager_version = globalThis.backendaiclient.managerVersion;
    this.console_version = globalThis.packageVersion;
    this.api_version = globalThis.backendaiclient.apiVersion;
    this.docker_version = _text('information.Compatible'); // It uses 20.03 API. So blocked now.
    this.pgsql_version = _text('information.Compatible');
    this.redis_version = _text('information.Compatible');
    this.etcd_version = _text('information.Compatible');
    if (typeof globalThis.backendaiclient === "undefined" || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._updateLicenseInfo();
      }, true);
    } else { // already connected
      this._updateLicenseInfo();
    }

    if (globalThis.backendaiclient._config.endpoint.startsWith('https:')) {
      this.use_ssl = true;
    } else {
      this.use_ssl = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-information-view": BackendAiInformationView;
  }
}
