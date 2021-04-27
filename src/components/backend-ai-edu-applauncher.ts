/**
u@license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
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

import {default as PainKiller} from './backend-ai-painkiller';
import './backend-ai-app-launcher';
import './lablup-activity-panel';
import './lablup-loading-spinner';

/**
 Backend.AI Education App Launcher.

 Available url parameters:
 - app: str = 'jupyter' (app name to launch)
 - scaling_group: str = 'default' (scaling group to create a new session)

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

  static get styles(): CSSResultGroup | undefined {
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
    this.notification = globalThis.lablupNotification;
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
    // Query current user's compute session in the current group.
    const fields = [
      'session_id', 'name', 'access_key', 'status', 'status_info', 'service_ports', 'mounts',
    ];
    const statuses = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'PREPARING', 'PULLING'].join(',');
    const accessKey = globalThis.backendaiclient._config.accessKey;
    // NOTE: There is no way to change the default group.
    //       This API should be used when there is only one group, 'default'.
    const groupId = globalThis.backendaiclient.current_group_id();
    const sessions = await globalThis.backendaiclient.computeSession.list(
      fields, statuses, accessKey, 30, 0, groupId
    );

    // URL Parameter parsing.
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const requestedApp = urlParams.get('app') || 'jupyter';
    const scalingGroup = urlParams.get('scaling_group') || 'default';

    // Create or select an existing compute session before lauching app.
    let sessionId: string | null | unknown;
    if (sessions.compute_session_list.total_count > 0) {
      console.log('Reusing an existing session ...');
      const sessionStatus = sessions.compute_session_list.items[0].status;
      if (sessionStatus !== 'RUNNING') {
        this.notification.text = `Your session is ${sessionStatus}. Please reload after some time.`;
        this.notification.show(true);
        return;
      }
      let sess: Record<string, unknown> = {};
      for (let i = 0; i < sessions.compute_session_list.items.length; i++) {
        const _sess = sessions.compute_session_list.items[i];
        const servicePorts = JSON.parse(_sess.service_ports || '{}');
        const services = servicePorts.map((s) => s.name);
        if (services.includes(requestedApp)) {
          sess = _sess;
          break;
        }
      }
      if (!sess) {
        this.notification.text = `No existing session can launch ${requestedApp}`;
        this.notification.show(true);
        return;
      }
      if ('session_id' in sess) {
        sessionId = sess.session_id;
      } else {
        sessionId = null;
      }
    } else { // no existing compute session. create one.
      console.log('Creating a new session ...');
      let sessionTemplates = await globalThis.backendaiclient.sessionTemplate.list(false, groupId);
      // Assume that session templates' name match requsetedApp name.
      sessionTemplates = sessionTemplates.filter((t) => t.name === requestedApp);
      if (sessionTemplates.length < 1) {
        this.notification.text = 'No appropriate session templates';
        this.notification.show(true);
        return;
      }
      const templateId = sessionTemplates[0].id; // NOTE: use the first template. will it be okay?
      try {
        const resources = {
          scaling_group: scalingGroup,
          mounts: [],
        };
        const response = await globalThis.backendaiclient.createSessionFromTemplate(templateId, null, null, resources);
        sessionId = response.sessionId;
      } catch (err) {
        console.error(err);
        if (err && err.message) {
          if ('statusCode' in err && err.statusCode === 408) {
            this.notification.text = 'Session is still in preparing. Reload after a while.';
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
    // TODO: launch 'jupyterlab' if the browser is not IE.
    if (sessionId) {
      this._openServiceApp(sessionId, requestedApp);
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
