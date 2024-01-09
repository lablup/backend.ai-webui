/**
@license
 Copyright (c) 2015-2023 Lablup Inc. All rights reserved.
 */
import { Client, ClientConfig } from '../lib/backend.ai-client-esm';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import './backend-ai-app-launcher';
import { BackendAiStyles } from './backend-ai-general-styles';
import { BackendAIPage } from './backend-ai-page';
import { default as PainKiller } from './backend-ai-painkiller';
import { css, CSSResultGroup, html } from 'lit';
import { get as _text } from 'lit-translate';
import { customElement, property, query } from 'lit/decorators.js';

/* FIXME:
 * This type definition is a workaround for resolving both Type error and Importing error.
 */
type BackendAIAppLauncher = HTMLElementTagNameMap['backend-ai-app-launcher'];

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
  @property({ type: Object }) webUIShell = Object();
  @property({ type: Object }) clientConfig = Object();
  @property({ type: Object }) client = Object();
  @property({ type: Object }) notification = Object();
  @property({ type: String }) resources = Object();
  @property({ type: String }) _eduAppNamePrefix = '';
  @query('#app-launcher') appLauncher!: BackendAIAppLauncher;

  static get styles(): CSSResultGroup | undefined {
    return [
      BackendAiStyles,
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      // language=CSS
      css``,
    ];
  }

  firstUpdated() {
    this.notification = globalThis.lablupNotification;
  }

  detectIE() {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const isIE = /* @cc_on!@*/ false || !!document.documentMode;
      if (!isIE) {
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

  async prepareProjectInformation() {
    const fields = ['email', 'groups {name, id}'];
    const query = `query { user{ ${fields.join(' ')} } }`;
    const response = await globalThis.backendaiclient.query(query, {});

    globalThis.backendaiclient.groups = response.user.groups
      .map((item) => item.name)
      .sort();
    globalThis.backendaiclient.groupIds = response.user.groups.reduce(
      (acc, group) => {
        acc[group.name] = group.id;
        return acc;
      },
      {},
    );
    const currentProject = globalThis.backendaiutils._readRecentProjectGroup();
    globalThis.backendaiclient.current_group = currentProject
      ? currentProject
      : globalThis.backendaiclient.groups[0];
    globalThis.backendaiclient.current_group_id = () => {
      return globalThis.backendaiclient.groupIds[
        globalThis.backendaiclient.current_group
      ];
    };

    console.log('current project:', currentProject);
  }

  async launch(apiEndpoint: string) {
    await this._initClient(apiEndpoint);
    const queryParams = new URLSearchParams(window.location.search);
    this.resources = {
      cpu: queryParams.get('cpu'),
      mem: queryParams.get('mem'),
      shmem: queryParams.get('shmem'),
      'cuda.shares': queryParams.get('cuda-shares'),
      'cuda.device': queryParams.get('cuda-device'),
    };
    const loginSuccess = await this._token_login();
    if (loginSuccess) {
      // Launching app requires to get the AppProxy mode, which requires to fill
      // the project information.
      // TODO: Better way to handle this?
      await this.prepareProjectInformation();

      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const sessionId = urlParams.get('session_id') || null;
      if (sessionId) {
        // Launch app with the sepcified session ID.
        const requestedApp = urlParams.get('app') || 'jupyter';
        this._openServiceApp(sessionId, requestedApp);
      } else {
        // Try to create a new session and launch app.
        await this._createEduSession();
      }
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
    if (apiEndpoint === '') {
      const api_endpoint: any = localStorage.getItem(
        'backendaiwebui.api_endpoint',
      );
      if (api_endpoint != null) {
        apiEndpoint = api_endpoint.replace(/^"+|"+$/g, '');
      }
    }
    apiEndpoint = apiEndpoint.trim();
    this.clientConfig = new ClientConfig('', '', apiEndpoint, 'SESSION');
    globalThis.backendaiclient = new Client(
      this.clientConfig,
      'Backend.AI Web UI.',
    );
    const configPath = '../../config.toml';
    await webUIShell._parseConfig(configPath);
    globalThis.backendaiclient._config._proxyURL =
      webUIShell.config.wsproxy.proxyURL;
    await globalThis.backendaiclient.get_manager_version();
    globalThis.backendaiclient.ready = true;
  }

  async _token_login() {
    // If token is delivered as a querystring, just save it as cookie.
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sToken = urlParams.get('sToken') || urlParams.get('stoken') || null;
    if (sToken !== null) {
      document.cookie = `sToken=${sToken}; expires=Session; path=/`;
    }
    const extraParams = {};
    for (const [key, value] of urlParams.entries()) {
      if (key !== 'sToken' && key !== 'stoken') {
        extraParams[key] = value;
      }
    }

    try {
      const alreadyLoggedIn = await globalThis.backendaiclient.check_login();
      if (!alreadyLoggedIn) {
        console.log('logging with (cookie) token...');
        const loginSuccess = await globalThis.backendaiclient.token_login(
          sToken,
          extraParams,
        );
        if (!loginSuccess) {
          this.notification.text = _text(
            'eduapi.CannotAuthorizeSessionByToken',
          );
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
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + '-session';
  }

  async _createEduSession() {
    this.appLauncher.indicator = await globalThis.lablupIndicator.start();
    this._eduAppNamePrefix =
      globalThis.backendaiclient._config.eduAppNamePrefix;

    // Query current user's compute session in the current group.
    const fields = [
      'session_id',
      'name',
      'access_key',
      'status',
      'status_info',
      'service_ports',
      'mounts',
    ];
    let statuses: string;
    if (globalThis.backendaiclient.supports('avoid-hol-blocking')) {
      statuses = [
        'RUNNING',
        'RESTARTING',
        'TERMINATING',
        'PENDING',
        'SCHEDULED',
        'PREPARING',
        'PULLING',
      ].join(',');
    } else {
      statuses = [
        'RUNNING',
        'RESTARTING',
        'TERMINATING',
        'PENDING',
        'PREPARING',
        'PULLING',
      ].join(',');
    }

    const accessKey = globalThis.backendaiclient._config.accessKey;
    // NOTE: There is no way to change the default group.
    //       This API should be used when there is only one group, 'default'.
    let sessions;
    try {
      this.appLauncher.indicator.set(
        20,
        _text('eduapi.QueryingExisitingComputeSession'),
      );
      sessions = await globalThis.backendaiclient.computeSession.list(
        fields,
        statuses,
        accessKey,
        30,
        0,
      );
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
        this.notification.text =
          _text('eduapi.sessionStatusIs') +
          ` ${sessionStatus}. ` +
          _text('eduapi.PleaseReload');
        this.notification.show(true);
        return;
      }
      let sess: Record<string, unknown> | null = null;
      for (let i = 0; i < sessions.compute_session_list.items.length; i++) {
        const _sess = sessions.compute_session_list.items[i];
        const servicePorts = JSON.parse(_sess.service_ports || '{}');
        const services = servicePorts.map((s) => s.name);
        let requestedService = requestedApp;
        if (
          this._eduAppNamePrefix !== '' &&
          requestedApp.startsWith(this._eduAppNamePrefix)
        ) {
          requestedService = requestedApp.split('-')[1];
        }
        if (services.includes(requestedService)) {
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
        this.appLauncher.indicator.set(
          50,
          _text('eduapi.FoundExistingComputeSession'),
        );
      } else {
        // this.notification.text = `You have existing session can launch ${requestedApp}`;
        // this.notification.show(true);
        // return;
        launchNewSession = true; // no existing session can launch the requested app
      }
      if (sess !== null && 'session_id' in sess) {
        sessionId = sess.session_id;
      } else {
        sessionId = null;
      }
    } else {
      // no existing compute session. create one.
    }

    if (launchNewSession) {
      // no existing compute session. create one.
      console.log('Creating a new session ...');
      this.appLauncher.indicator.set(
        40,
        _text('eduapi.FindingSessionTemplate'),
      );
      let sessionTemplates;
      try {
        sessionTemplates =
          await globalThis.backendaiclient.sessionTemplate.list(false);
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
      sessionTemplates = sessionTemplates.filter(
        (t) => t.name === requestedApp,
      );
      if (sessionTemplates.length < 1) {
        this.notification.text = _text('eduapi.NoSessionTemplate');
        this.notification.show(true);
        return;
      }
      const templateId = sessionTemplates[0].id; // NOTE: use the first template. will it be okay?
      try {
        const mounts =
          await globalThis.backendaiclient.eduApp.get_mount_folders();
        const projects =
          await globalThis.backendaiclient.eduApp.get_user_projects();
        if (!projects) {
          this.notification.text = _text('eduapi.EmptyProject');
          this.notification.show();
          return;
        }
        const sToken = urlParams.get('sToken') || urlParams.get('stoken');
        const credentialScript = sToken
          ? (
              await globalThis.backendaiclient.eduApp.get_user_credential(
                sToken,
              )
            )['script']
          : undefined;
        const resources = {
          ...this.resources,
          group_name: projects[0]['name'],
          ...(mounts && Object.keys(mounts).length > 0 ? { mounts } : {}),
          ...(credentialScript ? { bootstrap_script: credentialScript } : {}),
        };
        let response;
        try {
          this.appLauncher.indicator.set(
            60,
            _text('eduapi.CreatingComputeSession'),
          );
          response = await globalThis.backendaiclient.createSessionFromTemplate(
            templateId,
            null,
            null,
            resources,
            20000,
          );
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
    this.appLauncher.indicator.set(100, _text('eduapi.ComputeSessionPrepared'));

    // Launch app.
    if (sessionId) {
      this._openServiceApp(sessionId, requestedApp);
    }
  }

  async _openServiceApp(sessionId, appName) {
    this.appLauncher.indicator = await globalThis.lablupIndicator.start();
    let requestedApp = appName;
    if (!this.detectIE()) {
      if (
        this._eduAppNamePrefix !== '' &&
        appName.startsWith(this._eduAppNamePrefix)
      ) {
        requestedApp = appName.split('-')[1];
      }
      if (appName.startsWith('jupyter')) {
        requestedApp = 'jupyterlab';
      }
    }
    console.log(`launching ${requestedApp} from session ${sessionId} ...`);
    this.appLauncher
      ._open_wsproxy(sessionId, requestedApp, null, null)
      .then(async (resp) => {
        if (resp.url) {
          if (appName.endsWith('rstudio')) {
            await this.appLauncher._sleep(10000);
          }
          const appConnectUrl = await this.appLauncher._connectToProxyWorker(
            resp.url,
            '',
          );
          this.appLauncher.indicator.set(
            100,
            _text('session.applauncher.Prepared'),
          );
          setTimeout(() => {
            globalThis.open(appConnectUrl || resp.url, '_self');
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
