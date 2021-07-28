/**
@license
 Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
 */
import {get as _text} from 'lit-translate';
import {css, CSSResultArray, CSSResultOrNative, customElement, html, property} from 'lit-element';
import {BackendAIPage} from './backend-ai-page';

import {BackendAiStyles} from './backend-ai-general-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

import {default as PainKiller} from './backend-ai-painkiller';
import './backend-ai-app-launcher';

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
  @property({type: Object}) webUIShell = Object();
  @property({type: Object}) clientConfig = Object();
  @property({type: Object}) client = Object();
  @property({type: Object}) notification = Object();

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

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
  }

  async launch(apiEndpoint: string) {
    await this._initClient(apiEndpoint);
    const loginSuccess = await this._token_login();
    if (loginSuccess) {
      await this._createEduSession();
    }
  }

  detectIE() {
    try {
      // @ts-ignore
      const isIE = /* @cc_on!@*/false || !!document.documentMode;
      if (! isIE) {
        // Fallback to UserAgent detection for IE
        if (
          navigator.userAgent.indexOf('MSIE') > 0 ||
          navigator.userAgent.indexOf('WOW') > 0 ||
          navigator.userAgent.indexOf('.NET') > 0
        ) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    } catch (e) {
      const error = e.toString();
      console.log(error);
      return false;
    }
  }

  /**
   * Initialize the client.
   *
   * @param {string} apiEndpoint - Endpoint api of Backend.AI manager.
   */
  async _initClient(apiEndpoint: string) {
    this.notification = globalThis.lablupNotification;
    const webUIShell: any = document.querySelector('#webui-shell');
    // webUIShell.appBody.style.visibility = 'visible';
    this.clientConfig = new ai.backend.ClientConfig('', '', apiEndpoint, 'SESSION');
    globalThis.backendaiclient = new ai.backend.Client(
      this.clientConfig,
      'Backend.AI Web UI.'
    );
    const configPath = '../../config.toml';
    await webUIShell._parseConfig(configPath);
    globalThis.backendaiclient._config._proxyURL = webUIShell.config.wsproxy.proxyURL;
    await globalThis.backendaiclient.get_manager_version();
    globalThis.backendaiclient.ready = true;
  }

  async _token_login() {
    // If token is delivered as a querystring, just save it as cookie.
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sToken = urlParams.get('sToken') || null;
    if (sToken !== null) {
      document.cookie = `sToken=${sToken}; expires=Session; path=/`;
    }

    try {
      const alreadyLoggedIn = await globalThis.backendaiclient.check_login();
      if (!alreadyLoggedIn) {
        console.log('logging with (cookie) token...');
        const loginSuccess = await globalThis.backendaiclient.token_login();
        if (!loginSuccess) {
          this.notification.text = _text('eduapi.CannotAuthorizeSessionByToken');
          this.notification.show(true);
          return false;
        }
      } else {
        console.log('already logged-in session');
      }
      return true;
    } catch (err) {
      this.notification.text = _text('eduapi.CannotAuthorizeSessionByToken');
      this.notification.show(true, err);
      return false;
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
    const appLauncher = this.shadowRoot.querySelector('#app-launcher');
    appLauncher.indicator = await globalThis.lablupIndicator.start();

    // Query current user's compute session in the current group.
    const fields = [
      'session_id', 'name', 'access_key', 'status', 'status_info', 'service_ports', 'mounts',
    ];
    let statuses: string;
    if (globalThis.backendaiclient.supports('avoid-hol-blocking')) {
      statuses = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'SCHEDULED', 'PREPARING', 'PULLING'].join(',');
    } else {
      statuses = ['RUNNING', 'RESTARTING', 'TERMINATING', 'PENDING', 'PREPARING', 'PULLING'].join(',');
    }

    const accessKey = globalThis.backendaiclient._config.accessKey;
    // NOTE: There is no way to change the default group.
    //       This API should be used when there is only one group, 'default'.
    let sessions;
    try {
      appLauncher.indicator.set(20, _text('eduapi.QueryingExisitingComputeSession'));
      sessions = await globalThis.backendaiclient.computeSession.list(fields, statuses, accessKey, 30, 0);
    } catch (err) {
      console.error(err);
      if (err && err.message) {
        if (err.description) {
          this.notification.text = PainKiller.relieve(err.description);
        } else {
          this.notification.text = PainKiller.relieve(err.message);
        }
        this.notification.detail = err.message;
        this.notification.show(true, err);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true, err);
      }
      return;
    }

    // URL Parameter parsing.
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let requestedApp = urlParams.get('app') || 'jupyter';

    let launchNewSession = true;

    // Create or select an existing compute session before lauching app.
    let sessionId: string | null | unknown;
    if (sessions.compute_session_list.total_count > 0) {
      console.log('Reusing an existing session ...');
      const sessionStatus = sessions.compute_session_list.items[0].status;
      if (sessionStatus !== 'RUNNING') {
        this.notification.text = _text('eduapi.sessionStatusIs') + `${sessionStatus}. ` + _text('eduapi.PleaseReload');
        this.notification.show(true);
        return;
      }
      let sess: Record<string, unknown> | null = null;
      for (let i = 0; i < sessions.compute_session_list.items.length; i++) {
        const _sess = sessions.compute_session_list.items[i];
        const servicePorts = JSON.parse(_sess.service_ports || '{}');
        const services = servicePorts.map((s) => s.name);
        if (services.includes(requestedApp)) {
          sess = _sess;
          break;
        }
      }
      if (sess) {
        launchNewSession = false;
        if ('session_id' in sess) {
          sessionId = sess.session_id;
        } else {
          sessionId = null;
        }
        appLauncher.indicator.set(50, _text('eduapi.FoundExistingComputeSession'));
      } else {
        // this.notification.text = `You have existing session can launch ${requestedApp}`;
        // this.notification.show(true);
        // return;
        launchNewSession = true; // no existing session can launch the requested app
      }
    }

    if (launchNewSession) { // no existing compute session. create one.
      console.log('Creating a new session ...');
      appLauncher.indicator.set(40, _text('eduapi.FindingSessionTemplate'));
      let sessionTemplates;
      try {
        sessionTemplates = await globalThis.backendaiclient.sessionTemplate.list(false);
      } catch (err) {
        console.error(err);
        if (err && err.message) {
          if (err.description) {
            this.notification.text = PainKiller.relieve(err.description);
          } else {
            this.notification.text = PainKiller.relieve(err.message);
          }
          this.notification.detail = err.message;
          this.notification.show(true, err);
        } else if (err && err.title) {
          this.notification.text = PainKiller.relieve(err.title);
          this.notification.show(true, err);
        }
        return;
      }
      // Assume that session templates' name match requsetedApp name.
      sessionTemplates = sessionTemplates.filter((t) => t.name === requestedApp);
      if (sessionTemplates.length < 1) {
        this.notification.text = _text('eduapi.NoSessionTemplate');
        this.notification.show(true);
        return;
      }
      const templateId = sessionTemplates[0].id; // NOTE: use the first template. will it be okay?
      try {
        const mounts = await globalThis.backendaiclient.eduApp.get_mount_folders();
        const resources = mounts ? {mounts} : {};
        let response;
        try {
          appLauncher.indicator.set(60, _text('eduapi.CreatingComputeSession'));
          response = await globalThis.backendaiclient.createSessionFromTemplate(templateId, null, null, resources);
        } catch (err) {
          console.error(err);
          if (err && err.message) {
            if (err.description) {
              this.notification.text = PainKiller.relieve(err.description);
            } else {
              this.notification.text = PainKiller.relieve(err.message);
            }
            this.notification.detail = err.message;
            this.notification.show(true, err);
          } else if (err && err.title) {
            this.notification.text = PainKiller.relieve(err.title);
            this.notification.show(true, err);
          }
          return;
        }
        sessionId = response.sessionId;
      } catch (err) {
        console.error(err);
        if (err && err.message) {
          if ('statusCode' in err && err.statusCode === 408) {
            this.notification.text = _text('eduapi.SessionStillPreparing');
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
    appLauncher.indicator.set(100, _text('eduapi.ComputeSessionPrepared'));

    // Launch app.
    if (sessionId) {
      if (requestedApp.startsWith('jupyter') && !this.detectIE()) {
        requestedApp = 'jupyterlab';
      }
      this._openServiceApp(sessionId, requestedApp);
    }
  }

  async _openServiceApp(sessionId, appName) {
    const appLauncher = this.shadowRoot.querySelector('#app-launcher');
    appLauncher.indicator = await globalThis.lablupIndicator.start();
    console.log(`launching ${appName} from session ${sessionId} ...`);
    appLauncher._open_wsproxy(sessionId, appName, null, null)
      .then(async (resp) => {
        if (resp.url) {
          await appLauncher._connectToProxyWorker(resp.url, '');
          appLauncher.indicator.set(100, _text('session.applauncher.Prepared'));
          setTimeout(() => {
            globalThis.open(resp.url, '_self');
            // globalThis.open(resp.url);
          });
        } else {
        }
      });
  }

  render() {
    // language=HTML
    return html`
      <backend-ai-app-launcher id="app-launcher"></backend-ai-app-launcher>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-edu-applauncher': BackendAiEduApplauncher;
  }
}
