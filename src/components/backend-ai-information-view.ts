/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t, translateUnsafeHTML as _tr} from 'lit-translate';
import {css, CSSResultGroup, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

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

import '@material/mwc-icon/mwc-icon';

import './lablup-activity-panel';
import './lablup-loading-spinner';

/**
 Backend.AI Information View

 Example:

 <backend-ai-information-view page="class" id="information" ?active="${0}">
 ... content ...
 </backend-ai-information-view>

@group Backend.AI Web UI
 @element backend-ai-information-view
 */

@customElement('backend-ai-information-view')
export default class BackendAiInformationView extends BackendAIPage {
  @property({type: Object}) notification = Object();
  @property({type: String}) manager_version = '';
  @property({type: String}) manager_version_latest = '';
  @property({type: String}) webui_version = '';
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

  static get styles(): CSSResultGroup {
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

        div.title {
          font-size: 14px;
          font-weight: bold;
        }

        div.description,
        span.description {
          font-size: 13px;
          margin-top: 5px;
          margin-right: 5px;
        }

        p.label {
          display: inline-block;
          width: auto;
          margin: 0px;
          padding: 0px 3px;
          background-clip: padding-box;
          background-color: #f9f9f9;
          border: 1px solid #ccc;
          border-radius: 3px;
        }

        .setting-item {
          margin: 15px auto;
        }

        .setting-item-bottom-expand {
          margin: 15px auto 49px auto;
        }

        .setting-desc {
          width: 65%;
          margin: 5px;
        }

        .setting-desc-shrink {
          width: 100px;
          margin: 5px 35px 5px 5px;
          margin-right: 35px;
        }

        .setting-label {
          width: 30%;
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

        lablup-activity-panel {
          color: #000;
        }

        @media screen and (max-width: 805px) {
          .setting-desc {
            width: 60%;
          }

          .setting-label {
            width: 35%;
          }
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <div class="horizontal layout flex wrap">
        <div class="vertical layout">
          <lablup-activity-panel title="${_t('information.Core')}" horizontalsize="1x">
            <div slot="message">
              <div class="horizontal flex layout wrap setting-item">
                <div class="vertical center-justified layout setting-desc-shrink" style="margin-right: 65px;">
                  <div class="title">${_t('information.ManagerVersion')}</div>
                </div>
                <div class="vertical center-justified layout">
                  Backend.AI ${this.manager_version}
                  <lablup-shields app="${_t('information.Installation')}" color="darkgreen" description="${this.manager_version}" ui="flat"></lablup-shields>
                  <lablup-shields app="${_t('information.LatestRelease')}" color="darkgreen" description="${this.manager_version_latest}" ui="flat"></lablup-shields>
                </div>
              </div>
              <div class="horizontal flex layout wrap setting-item">
                <div class="vertical center-justified layout setting-desc">
                  <div class="title">${_t('information.APIVersion')}</div>
                </div>
                <div class="horizontal center end-justified layout setting-label">
                  ${this.api_version}
                </div>
              </div>
            </div>
          </lablup-activity-panel>
          <lablup-activity-panel title="${_t('information.Security')}">
            <div slot="message">
              <div class="horizontal flex layout wrap setting-item">
                <div class="vertical center-justified layout setting-desc">
                  <div class="title">${_t('information.DefaultAdministratorAccountChanged')}</div>
                  <div class="description">${_t('information.DescDefaultAdministratorAccountChanged')}
                  </div>
                </div>
                <div class="horizontal center end-justified layout" style="width:30%;">
                ${this.account_changed ? html`<mwc-icon>done</mwc-icon>` : html`<mwc-icon>warning</mwc-icon>`}
                </div>
              </div>
              <div class="horizontal flex layout wrap setting-item">
                <div class="vertical center-justified layout setting-desc">
                  <div class="title">${_t('information.UsesSSL')}</div>
                  <div class="description">${_t('information.DescUsesSSL')}
                  </div>
                </div>
                <div class="horizontal center end-justified layout" style="width:30%;">
                ${this.use_ssl ? html`<mwc-icon>done</mwc-icon>` : html`<mwc-icon class="fg red">warning</mwc-icon>`}
                </div>
              </div>
            </div>
          </lablup-activity-panel>
        </div>
        <lablup-activity-panel title="${_t('information.Component')}">
          <div slot="message">
            <div class="horizontal flex layout wrap setting-item-bottom-expand">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('information.DockerVersion')}</div>
                <div class="description">${_tr('information.DescDockerVersion')}
                </div>
              </div>
              <div class="horizontal center end-justified layout setting-label">
                <p class="label">${this.docker_version}</p>
              </div>
            </div>
            <div class="horizontal flex layout wrap setting-item-bottom-expand">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('information.PostgreSQLVersion')}</div>
                <div class="description">${_tr('information.DescPostgreSQLVersion')}
                </div>
              </div>
              <div class="horizontal center end-justified layout setting-label">
                <p class="label">${this.pgsql_version}</p>
              </div>
            </div>
            <div class="horizontal flex layout wrap setting-item-bottom-expand">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('information.ETCDVersion')}</div>
                <div class="description">${_tr('information.DescETCDVersion')}
                </div>
              </div>
              <div class="horizontal center end-justified layout setting-label">
                <p class="label">${this.etcd_version}</p>
              </div>
            </div>
            <div class="horizontal flex layout wrap setting-item-bottom-expand">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('information.RedisVersion')}</div>
                <div class="description">${_tr('information.DescRedisVersion')}
                </div>
              </div>
              <div class="horizontal center end-justified layout setting-label">
                <p class="label">${this.redis_version}</p>
              </div>
            </div>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel title="${_t('information.License')}" horizontalsize="2x">
          <div slot="message">
            <div class="horizontal flex layout wrap setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('information.IsLicenseValid')}</div>
                <div class="description">${_t('information.DescIsLicenseValid')}
                </div>
              </div>
              <div class="horizontal center end-justified layout" style="width:30%;">
              ${this.license_valid ? html`<mwc-icon>done</mwc-icon>` : html`<mwc-icon class="fg red">warning</mwc-icon>`}
              </div>
            </div>
            <div class="horizontal flex layout wrap setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('information.LicenseType')}</div>
                <div class="description">${_tr('information.DescLicenseType')}
                </div>
              </div>
              <div class="horizontal center end-justified layout setting-label">
                <p class="label">
                  ${this.license_type === 'fixed' ? _t('information.FixedLicense') : _t('information.DynamicLicense')}
                </p>
              </div>
            </div>
            <div class="horizontal flex layout wrap setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('information.Licensee')}</div>
                <div class="description">${_t('information.DescLicensee')}
                </div>
              </div>
              <div class="horizontal center end-justified layout setting-label">
                <p class="label">${this.license_licensee}</p>
              </div>
            </div>
            <div class="horizontal flex layout wrap setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('information.LicenseKey')}</div>
                <div class="description">${_t('information.DescLicenseKey')}
                </div>
              </div>
              <div class="horizontal center end-justified layout setting-label monospace indicator">
                <p class="label">${this.license_key}</p>
              </div>
            </div>
            <div class="horizontal flex layout wrap setting-item">
              <div class="vertical center-justified layout setting-desc">
                <div class="title">${_t('information.Expiration')}</div>
                <div class="description">${_t('information.DescExpiration')}
                </div>
              </div>
              <div class="horizontal center end-justified layout setting-label">
                <p class="label">${this.license_expiration}</p>
              </div>
            </div>
          </div>
        </div>
      </lablup-activity-panel>
    `;
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;

    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null) {
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
    this.webui_version = globalThis.packageVersion;
    this.api_version = globalThis.backendaiclient.apiVersion;
    this.docker_version = _text('information.Compatible'); // It uses 20.03 API. So blocked now.
    this.pgsql_version = _text('information.Compatible');
    this.redis_version = _text('information.Compatible');
    this.etcd_version = _text('information.Compatible');
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null || globalThis.backendaiclient.ready === false) {
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
    'backend-ai-information-view': BackendAiInformationView;
  }
}
