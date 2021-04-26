/**
u@license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {get as _text, translate as _t, translateUnsafeHTML as _tr} from 'lit-translate';
import {css, CSSResultArray, CSSResultOrNative, customElement, html, property} from 'lit-element';
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

import {default as PainKiller} from './backend-ai-painkiller';
import './backend-ai-app-launcher';
import './lablup-activity-panel';
import './lablup-loading-spinner';

/**
 Backend.AI Education App Launcher

 Example:

 <backend-ai-edu-applauncher page="class" id="edu-applauncher" ?active="${0}">
 ... content ...
 </backend-ai-edu-applauncher>

@group Backend.AI Web UI
 @element backend-ai-edu-applauncher
 */

@customElement('backend-ai-edu-applauncher')
export default class BackendAiEduApplauncher extends BackendAIPage {
  @property({type: Object}) notification = Object();

  constructor() {
    super();
  }

  static get styles(): CSSResultOrNative | CSSResultArray {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css`
      `
    ];
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-app-launcher id="app-launcher"></backend-ai-app-launcher>
    `;
  }

  firstUpdated() {
    if (typeof globalThis.backendaiclient === 'undefined' || globalThis.backendaiclient === null) {
      document.addEventListener('backend-ai-connected', () => {
        this._createEduSession();
      }, true);
    } else { // already connected
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (!this.active) {
      return;
    }
  }

  /**
   * Randomly generate session ID
   *
   * @return {string} Generated session ID
   * */
  generateSessionId() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + '-session';
  }

  async _createEduSession() {
    // Check if there is existing compute session
    const fields = [
      'session_id', 'name', 'status', 'status_info', 'service_ports', 'mounts',
    ];
    const statuses = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'PREPARING', 'PULLING'].join(',');
    const accessKey = '';
    // const groupId = globalThis.backendaiclient.current_group_id();
    const sessions = await globalThis.backendaiclient.computeSession.list(
      fields, statuses, accessKey, 10 * 1000
    );

    let sessionId;
    let servicePorts;
    if (sessions.compute_session_list.total_count > 0) {
      console.log('reusing an existing session...');
      // TODO: different response depending on existing session's status
      //       how to deal with if there are multiple sessions?
      const sessionStatus = sessions.compute_session_list.items[0].status;
      if (sessionStatus !== 'RUNNING') {
        this.notification.text = `Your session is in status ${sessionStatus}. Please retry after some time by reloading`;
        this.notification.show(true);
      }
      sessionId = sessions.compute_session_list.items[0].session_id;
      servicePorts = JSON.parse(sessions.compute_session_list.items[0].service_ports || '{}');
    } else { // no existing compute session. create one.
      console.log('creating a new session...');
      // TODO: hard-coded parameters -> replace session-template API call
      const imageName = 'cr.backend.ai/testing/ngc-tensorflow:20.11-tf2-py3';
      const sessionName = this.generateSessionId();
      const config = {
        domain: 'default',
        group_name: 'default',
        scaling_group: 'default',
        maxWaitSeconds: 30,
        cpu: 1,
        mem: '2g',
        // mounts: [],
      };
      try {
        const response = await globalThis.backendaiclient.createIfNotExists(
          imageName, sessionName, config, 30000
        );
        sessionId = response.sessionId;
        servicePorts = response.servicePorts;
      } catch (err) {
        console.error(err);
        if (err && err.message) {
          if ('statusCode' in err && err.statusCode === 408) {
            this.notification.text = _text('session.launcher.sessionStillPreparing');
          } else {
            if (err.description) {
              this.notification.text = PainKiller.relieve(err.description);
            } else {
              this.notification.text = PainKiller.relieve(err.message);
            }
          }
          this.notification.detail = err.message;
          this.notification.show(true, err);
        } else if (err && err.title) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.show(true, err);
        }
      }
    }

    // Launch app.
    const availableServiceNames = servicePorts.map((s) => s.name);
    if (availableServiceNames.includes('rstudio')) {
      this._openServiceApp(sessionId, 'rstudio');
    } else if (availableServiceNames.includes('jupyter')) {
      this._openServiceApp(sessionId, 'jupyter');
    } else {
      // TODO: how to deal with else?
      console.log('how to deal?');
    }
  }

  async _openServiceApp(sessionId, appName) {
    const appLauncher = this.shadowRoot.querySelector('#app-launcher');
    appLauncher.indicator = await globalThis.lablupIndicator.start();
    appLauncher._open_wsproxy(sessionId, appName, null, null)
      .then(async (resp) => {
        console.log(resp);
        if (resp.url) {
          await appLauncher._connectToProxyWorker(resp.url, '');
          appLauncher.indicator.set(100, _text('session.applauncher.Prepared'));
          setTimeout(() => {
            // globalThis.open(resp.url, '_self');
            globalThis.open(resp.url);
          });
        } else {
        }
      });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-edu-applauncher': BackendAiEduApplauncher;
  }
}
