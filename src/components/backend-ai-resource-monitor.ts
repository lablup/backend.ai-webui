/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, property} from "lit-element";
import {BackendAIPage} from './backend-ai-page';

import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';

import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-slider/paper-slider';
import '@polymer/paper-item/paper-item';

import './backend-ai-dropdown-menu';
import 'weightless/button';
import 'weightless/card';
import 'weightless/dialog';
import 'weightless/expansion';
import 'weightless/icon';
import 'weightless/label';
import 'weightless/radio';
import 'weightless/slider';

import {default as PainKiller} from "./backend-ai-painkiller";

import './lablup-notification';
import '../plastics/lablup-shields/lablup-shields';
import {BackendAiStyles} from './backend-ai-console-styles';
import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning
} from '../plastics/layout/iron-flex-layout-classes';

@customElement("backend-ai-resource-monitor")
export default class BackendAiResourceMonitor extends BackendAIPage {
  @property({type: String}) direction = "horizontal";
  @property({type: String}) location = '';
  @property({type: Object}) supports = Object();
  @property({type: Object}) resourceLimits = Object();
  @property({type: Object}) userResourceLimit = Object();
  @property({type: Object}) aliases = {
    'TensorFlow': 'python-tensorflow',
    'Lablup ResearchEnv.': 'python-ff',
    'Python': 'python',
    'Python (Intel)': 'python-intel',
    'PyTorch': 'python-pytorch',
    'Chainer': 'chainer',
    'R': 'r-base',
    'Julia': 'julia',
    'Lua': 'lua',
    'RAPID (NGC)': 'ngc-rapid',
    'DIGITS (NGC)': 'ngc-digits',
    'PyTorch (NGC)': 'ngc-pytorch',
    'TensorFlow (NGC)': 'ngc-tensorflow',
    'PyTorch (Cloudia)': 'lablup-pytorch',
    'H2O': 'h2o',
  };
  @property({type: Object}) tags = {
    'TensorFlow': [],
    'Lablup ResearchEnv.': [],
    'Python': [],
    'Python (MKL)': ['Intel MKL'],
    'PyTorch': [],
    'Chainer': [],
    'R': [],
    'Julia': [],
    'Lua': [],
    'RAPID (NGC)': ['NVidia GPU Cloud'],
    'DIGITS (NGC)': ['NVidia GPU Cloud'],
    'PyTorch (NGC)': ['NVidia GPU Cloud'],
    'TensorFlow (NGC)': ['NVidia GPU Cloud'],
    'PyTorch (Cloudia)': ['Cloudia'],
    'H2O': ['h2o.ai'],
  };
  @property({type: Array}) versions;
  @property({type: Array}) languages;
  @property({type: String}) gpu_mode;
  @property({type: Number}) gpu_step = 0.05;
  @property({type: Object}) cpu_metric = {
    'min': '1',
    'max': '1'
  };
  @property({type: Object}) mem_metric = {
    'min': '1',
    'max': '1'
  };
  @property({type: Object}) gpu_metric = {
    'min': 0,
    'max': 0
  };
  @property({type: Object}) fgpu_metric;
  @property({type: Object}) tpu_metric = {
    'min': '1',
    'max': '1'
  };
  @property({type: Object}) images;
  @property({type: String}) defaultResourcePolicy;
  @property({type: Object}) total_slot;
  @property({type: Object}) used_slot;
  @property({type: Object}) available_slot;
  @property({type: Number}) concurrency_used;
  @property({type: Number}) concurrency_max;
  @property({type: Number}) concurrency_limit;
  @property({type: Array}) vfolders;
  @property({type: Object}) resource_info;
  @property({type: Object}) used_slot_percent;
  @property({type: Array}) resource_templates;
  @property({type: String}) default_language;
  @property({type: Boolean}) launch_ready;
  @property({type: Number}) cpu_request;
  @property({type: Number}) mem_request;
  @property({type: Number}) gpu_request;
  @property({type: Number}) session_request;
  @property({type: Boolean}) _status;
  @property({type: Number}) num_sessions;
  @property({type: String}) scaling_group;
  @property({type: Array}) scaling_groups;
  @property({type: Boolean}) enable_scaling_group;
  @property({type: Array}) sessions_list;
  @property({type: Boolean}) metric_updating;
  @property({type: Boolean}) metadata_updating;

  constructor() {
    super();
    this.active = false;
    this.init_resource();
  }

  static get is() {
    return 'backend-ai-resource-monitor';
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
          wl-card h4 {
              padding: 5px 20px;
              border-bottom: 1px solid #ddd;
              font-weight: 100;
          }

          paper-slider {
              width: 285px;
              --paper-slider-input: {
                  width: 70px;
              };
              --paper-slider-height: 3px;
          }

          paper-slider.mem {
              --paper-slider-knob-color: var(--paper-orange-400);
              --paper-slider-active-color: var(--paper-orange-400);
          }

          paper-slider.cpu {
              --paper-slider-knob-color: var(--paper-light-green-400);
              --paper-slider-active-color: var(--paper-light-green-400);
          }

          paper-slider.gpu {
              --paper-slider-knob-color: var(--paper-cyan-400);
              --paper-slider-active-color: var(--paper-cyan-400);
          }

          paper-progress {
              width: 90px;
              border-radius: 3px;
              --paper-progress-height: 10px;
              --paper-progress-active-color: #3677EB;
              --paper-progress-secondary-color: #98BE5A;
              --paper-progress-transition-duration: 0.08s;
              --paper-progress-transition-timing-function: ease;
              --paper-progress-transition-delay: 0s;
          }

          .resources.horizontal .short-indicator paper-progress {
              width: 50px;
          }

          .resources.horizontal .short-indicator .gauge-label {
              width: 50px;
          }

          span.caption {
              width: 30px;
              font-size: 12px;
              padding-left: 10px;
          }

          div.caption {
              font-size: 12px;
              width: 100px;
          }

          span.resource-type {
              font-size: 14px;
          }

          .gauge-name {
              font-size: 10px;
          }

          .gauge-label {
              width: 100px;
              font-weight: 300;
              font-size: 12px;
          }

          .indicator {
              font-family: monospace;
          }

          .resource-button {
              height: 140px;
              width: 120px;
              margin: 5px;
              padding: 0;
              font-size: 14px;
          }

          #new-session-dialog {
              z-index: 100;
          }

          wl-button.resource-button.iron-selected {
              --button-color: var(--paper-red-600);
              --button-bg: var(--paper-red-600);
              --button-bg-active: var(--paper-red-600);
              --button-bg-hover: var(--paper-red-600);
              --button-bg-active-flat: var(--paper-orange-50);
              --button-bg-flat: var(--paper-orange-50);
          }

          .resource-button h4 {
              padding: 5px 0;
              margin: 0;
              font-weight: 400;
          }

          .resource-button ul {
              padding: 0;
              list-style-type: none;
          }

          backend-ai-dropdown-menu {
              width: 50%;
          }

          #launch-session {
              --button-bg: var(--paper-red-50);
              --button-bg-hover: var(--paper-red-100);
              --button-bg-active: var(--paper-red-600);
          }

          wl-button.launch-button {
              width: 335px;
              --button-bg: var(--paper-red-50);
              --button-bg-active: var(--paper-red-300);
              --button-bg-hover: var(--paper-red-300);
              --button-bg-active-flat: var(--paper-orange-50);
              --button-color: var(--paper-red-600);
              --button-color-active: red;
              --button-color-hover: red;
          }

          wl-button.resource-button {
              --button-bg: white;
              --button-bg-active: var(--paper-red-600);
              --button-bg-hover: var(--paper-red-600);
              --button-bg-active-flat: var(--paper-orange-50);
              --button-color: #89A;
              --button-color-active: red;
              --button-color-hover: red;
          }

          wl-expansion {
              --font-family-serif: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", AppleSDGothic, "Apple SD Gothic Neo", NanumGothic, "NanumGothicOTF", "Nanum Gothic", "Malgun Gothic", sans-serif;
              --expansion-elevation: 0;
              --expansion-elevation-open: 0;
              --expansion-elevation-hover: 0;
              --expansion-margin-open: 0;
          }

          wl-expansion span {
              font-size: 20px;
              font-weight: 200;
              display: block;
          }

          .resources .monitor {
              margin-right: 5px;
          }
          .resources.vertical .monitor {
              margin-bottom: 10px;
          }

          .resources.vertical .monitor div:first-child {
              width: 40px;
          }

          wl-button[fab] {
              --button-fab-size: 70px;
              border-radius: 6px;
          }

          wl-label {
              margin-right: 10px;
              outline: none;
          }
      `];
  }

  init_resource() {
    this.versions = ['3.6'];
    this.languages = [];
    this.gpu_mode = 'no';
    this.defaultResourcePolicy = 'UNLIMITED';
    this.total_slot = {};
    this.used_slot = {};
    this.available_slot = {};
    this.resource_info = {};
    this.used_slot_percent = {};
    this.resource_templates = [];
    this.vfolders = [];
    this.default_language = '';
    this.launch_ready = false;
    this.concurrency_used = 0;
    this.concurrency_max = 0;
    this.concurrency_limit = 0;
    this._status = 'inactive';
    this.cpu_request = 1;
    this.mem_request = 1;
    this.gpu_request = 0;
    this.session_request = 1;
    this.scaling_groups = [];
    this.scaling_group = '';
    this.enable_scaling_group = false;
    this.sessions_list = [];
    this.metric_updating = false;
    this.metadata_updating = false;
  }

  firstUpdated() {
    this.shadowRoot.querySelector('#environment').addEventListener('selected-item-label-changed', this.updateLanguage.bind(this));
    this.shadowRoot.querySelector('#version').addEventListener('selected-item-label-changed', this.updateMetric.bind(this));

    this.notification = window.lablupNotification;
    if (this.activeConnected && this.metadata_updating === false) {
      this._initSessions();
      this._initAliases();
      this.aggregateResource();
    }
    const gpu_resource = this.shadowRoot.querySelector('#gpu-resource');
    document.addEventListener('backend-ai-resource-refreshed', () => {
      if (this.activeConnected && this.metadata_updating === false) {
        this.metadata_updating = true;
        this.aggregateResource();
        this.metadata_updating = false;
      }
    });
    gpu_resource.addEventListener('value-change', () => {
      if (gpu_resource.value > 0) {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = true;
      } else {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = false;
      }
    });
    this.shadowRoot.querySelector('#use-gpu-checkbox').addEventListener('change', () => {
      if (this.shadowRoot.querySelector('#use-gpu-checkbox').checked === true) {
        if (this.gpu_metric.min === this.gpu_metric.max) {
          this.shadowRoot.querySelector('#gpu-resource').disabled = true
        } else {
          this.shadowRoot.querySelector('#gpu-resource').disabled = false;
        }
      } else {
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
      }
    });
  }

  _initSessions() {
    let fields = ["sess_id"];
    window.backendaiclient.computeSession.list(fields = fields, status = "RUNNING")
      .then(res => {
        this.sessions_list = res.compute_sessions.map(e => e.sess_id);
      })
  }

  _initAliases() {
    for (let item in this.aliases) {
      this.aliases[this.aliases[item]] = item;
    }
  }

  async _viewStateChanged(active) {
    await this.updateComplete;
    if (this.active === false) {
      return;
    }
    // If disconnected
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', async () => {
        if (this.activeConnected && this.metadata_updating === false) {
          this.metadata_updating = true;
          this.enable_scaling_group = window.backendaiclient.supports('scaling-group');
          if (this.enable_scaling_group === true) {
            let sgs = await window.backendaiclient.scalingGroup.list();
            this.scaling_groups = sgs.scaling_groups;
          }
          this._initSessions();
          this._initAliases();
          this._refreshResourcePolicy();
          this.aggregateResource();
          this.metadata_updating = false;
        }
      }, true);
    } else { // already connected
      if (this.activeConnected && this.metadata_updating === false) {
        this.metadata_updating = true;
        this.enable_scaling_group = window.backendaiclient.supports('scaling-group');
        if (this.enable_scaling_group === true) {
          let sgs = await window.backendaiclient.scalingGroup.list();
          this.scaling_groups = sgs.scaling_groups;
        }
        this._initSessions();
        this._initAliases();
        this._refreshResourcePolicy();
        this.aggregateResource();
        this.metadata_updating = false;
      }
    }
  }

  _refreshConcurrency() {
    return window.backendaiclient.keypair.info(window.backendaiclient._config.accessKey, ['concurrency_used']).then((response) => {
      this.concurrency_used = response.keypair.concurrency_used;
    });
  }

  _refreshResourcePolicy() {
    window.backendaiclient.keypair.info(window.backendaiclient._config.accessKey, ['resource_policy', 'concurrency_used']).then((response) => {
      let policyName = response.keypair.resource_policy;
      this.concurrency_used = response.keypair.concurrency_used;
      // Workaround: We need a new API for user mode resource policy access, and current resource usage.
      // TODO: Fix it to use API-based resource max.
      return window.backendaiclient.resourcePolicy.get(policyName, ['default_for_unspecified',
        'total_resource_slots',
        'max_concurrent_sessions',
        'max_containers_per_session',
      ]);
    }).then((response) => {
      let resource_policy = response.keypair_resource_policy;
      if (resource_policy.default_for_unspecified === 'UNLIMITED' ||
        resource_policy.default_for_unspecified === 'DefaultForUnspecified.UNLIMITED') {
        this.defaultResourcePolicy = 'UNLIMITED';
      } else {
        this.defaultResourcePolicy = 'LIMITED';
      }
      this.userResourceLimit = JSON.parse(response.keypair_resource_policy.total_resource_slots);
      this.concurrency_max = resource_policy.max_concurrent_sessions;
      this._refreshResourceTemplate();
      this._refreshResourceValues();
    }).catch((err) => {
      console.log(err);
      this.metadata_updating = false;
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        this.notification.show(true);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true);
      }
    });
  }

  _refreshResourceValues() {
    this._refreshImageList();
    this._updateGPUMode();
    this.updateMetric();
  }

  async _launchSessionDialog() {
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      this.notification.text = 'Please wait while initializing...';
      this.notification.show();
    } else {
      this.selectDefaultLanguage();
      // this.enable_scaling_group = false;
      if (this.enable_scaling_group === true) {
        let sgs = await window.backendaiclient.scalingGroup.list();
        this.scaling_groups = sgs.scaling_groups;
      }
      await this.updateMetric();
      const gpu_resource = this.shadowRoot.querySelector('#gpu-resource');
      //this.shadowRoot.querySelector('#gpu-value'].textContent = gpu_resource.value;
      if (gpu_resource.value > 0) {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = true;
      } else {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = false;
      }
      this.shadowRoot.querySelector('#new-session-dialog').show();
    }
  }

  _updateGPUMode() {
    window.backendaiclient.getResourceSlots().then((response) => {
      let results = response;
      if ('cuda.device' in results) {
        this.gpu_mode = 'gpu';
        this.gpu_step = 1;
      }
      if ('cuda.shares' in results) {
        this.gpu_mode = 'fgpu';
        this.gpu_step = 0.05;
      }
    });
  }

  _generateKernelIndex(kernel, version) {
    return kernel + ':' + version;
  }

  _newSession() {
    //let kernel = this.shadowRoot.querySelector('#environment').value;
    let selectedItem = this.shadowRoot.querySelector('#environment').selectedItem;
    let kernel = selectedItem.id;
    let version = this.shadowRoot.querySelector('#version').value;
    let sessionName = this.shadowRoot.querySelector('#session-name').value;
    let vfolder = this.shadowRoot.querySelector('#vfolder').selectedValues;
    this.cpu_request = this.shadowRoot.querySelector('#cpu-resource').value;
    this.mem_request = this.shadowRoot.querySelector('#mem-resource').value;
    this.gpu_request = this.shadowRoot.querySelector('#gpu-resource').value;
    this.session_request = this.shadowRoot.querySelector('#session-resource').value;
    this.num_sessions = this.session_request;
    if (this.sessions_list.includes(sessionName)) {
      this.notification.text = "Duplicate session name not allowed.";
      this.notification.show();
      return;
    }
    if (this.enable_scaling_group) {
      this.scaling_group = this.shadowRoot.querySelector('#scaling-groups').value;
    }
    let config = {};
    if (window.backendaiclient.isAPIVersionCompatibleWith('v4.20190601')) {
      config['group_name'] = window.backendaiclient.current_group;
      config['domain'] = window.backendaiclient._config.domainName;
      config['scaling_group'] = this.scaling_group;
    }
    config['cpu'] = this.cpu_request;
    if (this.gpu_mode == 'fgpu') {
      config['fgpu'] = this.gpu_request;
    } else {
      config['gpu'] = this.gpu_request;
    }

    if (String(this.shadowRoot.querySelector('#mem-resource').value) === "Infinity") {
      config['mem'] = String(this.shadowRoot.querySelector('#mem-resource').value);
    } else {
      config['mem'] = String(this.mem_request) + 'g';
    }

    if (this.shadowRoot.querySelector('#use-gpu-checkbox').checked !== true) {
      if (this.gpu_mode == 'fgpu') {
        config['fgpu'] = 0.0;
      } else {
        config['gpu'] = 0.0;
      }
    }
    if (sessionName.length == 0) { // No name is given
      sessionName = this.generateSessionId();
    }
    if (vfolder.length !== 0) {
      config['mounts'] = vfolder;
    }
    const kernelName = this._generateKernelIndex(kernel, version);
    this.shadowRoot.querySelector('#launch-button').disabled = true;
    this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Preparing...';
    this.notification.text = 'Preparing session...';
    this.notification.show();

    let sessions = [];
    const randStr = this._getRandomString();

    if (this.num_sessions > 1) {
      for (let i = 1; i <= this.num_sessions; i++) {
        sessions.push({kernelName, 'sessionName': `${sessionName}-${randStr}-${i}`, config});
      }
    } else {
      sessions.push({kernelName, sessionName, config});
    }

    const createSessionQueue = sessions.map(item => {
      return this._createKernel(item.kernelName, item.sessionName, item.config);
    });
    Promise.all(createSessionQueue).then((res) => {
      this.shadowRoot.querySelector('#new-session-dialog').hide();
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Launch';
      this.aggregateResource();
      let event = new CustomEvent("backend-ai-session-list-refreshed", {"detail": 'running'});
      document.dispatchEvent(event);
    }).catch((err) => {
      this.metadata_updating = false;
      console.log(err);
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        this.notification.show(true);
      } else if (err && err.title) {
        this.notification.text = PainKiller.relieve(err.title);
        this.notification.show(true);
      }
      let event = new CustomEvent("backend-ai-session-list-refreshed", {"detail": 'running'});
      document.dispatchEvent(event);
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Launch';
    });
  }

  _getRandomString() {
    let randnum = Math.floor(Math.random() * 52 * 52 * 52);

    const parseNum = (num) => {
      if (num < 26) return String.fromCharCode(65 + num);
      else return String.fromCharCode(97 + num - 26);
    };

    let randstr = "";

    for (let i = 0; i < 3; i++) {
      randstr += parseNum(randnum % 52);
      randnum = Math.floor(randnum / 52);
    }

    return randstr;
  }

  _createKernel(kernelName, sessionName, config) {
    return window.backendaiclient.createKernel(kernelName, sessionName, config);
  }

  _hideSessionDialog() {
    this.shadowRoot.querySelector('#new-session-dialog').hide();
  }

  _guessHumanizedNames(kernelName) {
    const candidate = {
      'cpp': 'C++',
      'gcc': 'C',
      'go': 'Go',
      'haskell': 'Haskell',
      'java': 'Java',
      'julia': 'Julia',
      'lua': 'Lua',
      'ngc-rapid': 'RAPID (NGC)',
      'ngc-digits': 'DIGITS (NGC)',
      'ngc-pytorch': 'PyTorch (NGC)',
      'ngc-tensorflow': 'TensorFlow (NGC)',
      'nodejs': 'Node.js',
      'octave': 'Octave',
      'php': 'PHP',
      'python': 'Python',
      'python-intel': 'Python (Intel)',
      'python-ff': 'Lablup ResearchEnv.',
      'python-cntk': 'CNTK',
      'python-pytorch': 'PyTorch',
      'python-tensorflow': 'TensorFlow',
      'r-base': 'R',
      'rust': 'Rust',
      'scala': 'Scala',
      'scheme': 'Scheme',
      'lablup-pytorch': 'PyTorch (Cloudia)',
      'h2o': 'H2O.ai',
    };
    let humanizedName = null;
    let matchedString = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()';
    Object.keys(candidate).forEach((item, index) => {
      if (kernelName.endsWith(item) && item.length < matchedString.length) {
        humanizedName = candidate[item];
        matchedString = item;
      }
    });
    return humanizedName;
  }

  _updateEnvironment() {
    // this.languages = Object.keys(this.supports);
    // this.languages.sort();
    const langs = Object.keys(this.supports);
    if (langs === undefined) return;
    langs.sort();
    this.languages = [];
    langs.forEach((item, index) => {
      if (!(Object.keys(this.aliases).includes(item))) {
        const humanizedName = this._guessHumanizedNames(item);
        if (humanizedName !== null) {
          this.aliases[item] = humanizedName;
        }
      }
      let specs = item.split('/');
      let registry = specs[0];
      let prefix, kernelName;
      if (specs.length == 2) {
        prefix = '';
        kernelName = specs[1];
      } else {
        prefix = specs[1];
        kernelName = specs[2];
      }
      const alias = this.aliases[item];
      let basename;
      if (alias !== undefined) {
        basename = alias.split(' (')[0];
      } else {
        basename = kernelName;
      }
      let tags = [];
      if (alias in this.tags) {
        tags = tags.concat(this.tags[alias]);
      }
      if (prefix != '') {
        tags.push(prefix);
      }
      this.languages.push({
        name: item,
        registry: registry,
        prefix: prefix,
        kernelname: kernelName,
        alias: alias,
        basename: basename,
        tags: tags
      });
    });
    this._initAliases();
  }

  _updateVersions(kernel) {
    if (kernel in this.supports) {
      this.versions = this.supports[kernel];
      this.versions.sort();
      this.versions.reverse(); // New version comes first.
    }
    if (this.versions !== undefined) {
      this.shadowRoot.querySelector('#version').value = this.versions[0];
      this.updateMetric();
    }
  }

  generateSessionId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text + "-console";
  }

  async _updateVirtualFolderList() {
    let l = window.backendaiclient.vfolder.list();
    l.then((value) => {
      this.vfolders = value;
    });
  }

  async _aggregateResourceUse() {
    let total_slot = {};
    return window.backendaiclient.keypair.info(window.backendaiclient._config.accessKey, ['concurrency_used']).then((response) => {
      this.concurrency_used = response.keypair.concurrency_used;
      let param = null;
      if (this.enable_scaling_group == true && this.scaling_groups.length > 0) {
        let scaling_group = 'default';
        if (this.scaling_group !== '') {
          scaling_group = this.scaling_group;
        } else {
          scaling_group = this.scaling_groups[0]['name'];
        }
        param = {
          'group': window.backendaiclient.current_group,
          'scaling_group': scaling_group
        };
      } else {
        param = {
          'group': window.backendaiclient.current_group
        };
      }
      return window.backendaiclient.resourcePreset.check(param);
    }).then((response) => {
      if (response.presets) { // Same as refreshResourceTemplate.
        let presets = response.presets;
        let available_presets = [];
        presets.forEach((item) => {
          if (item.allocatable === true) {
            if ('cuda.shares' in item.resource_slots) {
              item.gpu = item.resource_slots['cuda.shares'];
            } else if ('cuda.device' in item) {
              item.gpu = item.resource_slots['cuda.device'];
            } else {
              item.gpu = 0;
            }
            item.cpu = item.resource_slots.cpu;
            item.mem = window.backendaiclient.utils.changeBinaryUnit(item.resource_slots.mem, 'g');
            available_presets.push(item);
          }
        });
        this.resource_templates = available_presets;
      }

      let group_resource = response.scaling_group_remaining;

      ['cpu', 'mem', 'cuda.shares', 'cuda.device'].forEach((slot) => {
        if (slot in response.keypair_using && slot in group_resource) {
          group_resource[slot] = parseFloat(group_resource[slot]) + parseFloat(response.keypair_using[slot]);
        }
      });
      //this.resource_info = response.scaling_group_remaining;
      this.resource_info = group_resource;
      let resource_limit = response.keypair_limits;
      if ('cpu' in resource_limit) {
        if (resource_limit['cpu'] === 'Infinity') {
          total_slot['cpu_slot'] = this.resource_info.cpu;
        } else {
          total_slot['cpu_slot'] = resource_limit['cpu'];
        }
      }
      if ('mem' in resource_limit) {
        if (resource_limit['mem'] === 'Infinity') {
          total_slot['mem_slot'] = parseFloat(window.backendaiclient.utils.changeBinaryUnit(this.resource_info.mem, 'g'));
        } else {
          total_slot['mem_slot'] = parseFloat(window.backendaiclient.utils.changeBinaryUnit(resource_limit['mem'], 'g'));
        }
      }
      total_slot['mem_slot'] = total_slot['mem_slot'].toFixed(2);
      if ('cuda.device' in resource_limit) {
        if (resource_limit['cuda.device'] === 'Infinity') {
          total_slot['gpu_slot'] = this.resource_info['cuda.device'];
        } else {
          total_slot['gpu_slot'] = resource_limit['cuda.device'];
        }
      }
      if ('cuda.shares' in resource_limit) {
        if (resource_limit['cuda.shares'] === 'Infinity') {
          total_slot['fgpu_slot'] = this.resource_info['cuda.shares'];
        } else {
          total_slot['fgpu_slot'] = resource_limit['cuda.shares'];
        }
      }
      let remaining_slot: Object = Object();
      let used_slot: Object = Object();
      let resource_remaining = response.keypair_remaining;
      let resource_using = response.keypair_using;
      if ('cpu' in resource_remaining) { // Monkeypatch: manager reports Infinity to cpu.
        if ('cpu' in resource_using) {
          used_slot['cpu_slot'] = resource_using['cpu'];
        } else {
          used_slot['cpu_slot'] = 0;
        }
        if (resource_remaining['cpu'] === 'Infinity') {  // Monkeypatch: manager reports Infinity to mem.
          remaining_slot['cpu_slot'] = total_slot['cpu_slot'] - used_slot['cpu_slot'];
        } else {
          remaining_slot['cpu_slot'] = resource_remaining['cpu'];
        }
      }
      if ('mem' in resource_remaining) {
        if ('mem' in resource_using) {
          used_slot['mem_slot'] = parseFloat(window.backendaiclient.utils.changeBinaryUnit(resource_using['mem'], 'g'));
        } else {
          used_slot['mem_slot'] = 0.0;
        }
        if (resource_remaining['mem'] === 'Infinity') {  // Monkeypatch: manager reports Infinity to mem.
          remaining_slot['mem_slot'] = total_slot['mem_slot'] - used_slot['mem_slot'];
        } else {
          remaining_slot['mem_slot'] = parseFloat(window.backendaiclient.utils.changeBinaryUnit(resource_remaining['mem'], 'g'));
        }
      }
      used_slot['mem_slot'] = used_slot['mem_slot'].toFixed(2);
      if ('cuda.device' in resource_remaining) {
        remaining_slot['gpu_slot'] = resource_remaining['cuda.device'];
        if ('cuda.device' in resource_using) {
          used_slot['gpu_slot'] = resource_using['cuda.device'];
        } else {
          used_slot['gpu_slot'] = 0;
        }
      }
      if ('cuda.shares' in resource_remaining) {
        remaining_slot['fgpu_slot'] = resource_remaining['cuda.shares'];
        if ('cuda.shares' in resource_using) {
          used_slot['fgpu_slot'] = parseFloat(resource_using['cuda.shares']).toFixed(2);
        } else {
          used_slot['fgpu_slot'] = 0;
        }
      }

      if ('fgpu_slot' in used_slot) {
        total_slot['fgpu_slot'] = parseFloat(total_slot['fgpu_slot']).toFixed(2);
      }
      this.total_slot = total_slot;
      this.used_slot = used_slot;
      let used_slot_percent = {};
      ['cpu_slot', 'mem_slot', 'gpu_slot', 'fgpu_slot'].forEach((slot) => {
        if (slot in used_slot) {
          used_slot_percent[slot] = (used_slot[slot] / total_slot[slot]) * 100.0;
        } else {
        }
        if (slot in remaining_slot) {
          if (remaining_slot[slot] === 'Infinity') {
            remaining_slot[slot] = total_slot[slot];
          }
        }
      });
      if (this.concurrency_max === 0) {
        used_slot_percent['concurrency'] = 0;
        remaining_slot['concurrency'] = this.concurrency_max;
      } else {
        used_slot_percent['concurrency'] = (this.concurrency_used / this.concurrency_max) * 100.0;
        remaining_slot['concurrency'] = this.concurrency_max - this.concurrency_used;
      }
      this.concurrency_limit = Math.min(remaining_slot['concurrency'], 5);
      this.available_slot = remaining_slot;
      this.used_slot_percent = used_slot_percent;
      return this.available_slot;
    });
  }

  aggregateResource() {
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._aggregateResourceUse();
      }, true);
    } else {
      this._aggregateResourceUse();
    }
  }

  _refreshResourceTemplate() {
    let param = null;
    if (this.enable_scaling_group == true && this.scaling_groups.length > 0) {
      let scaling_group = 'default';
      if (this.scaling_group !== '') {
        scaling_group = this.scaling_group;
      } else {
        scaling_group = this.scaling_groups[0]['name'];
      }
      param = {
        'group': window.backendaiclient.current_group,
        'scaling_group': scaling_group
      };
    } else {
      param = {
        'group': window.backendaiclient.current_group
      };
    }
    window.backendaiclient.resourcePreset.check(param).then((response) => {
      if (response.presets) {
        let presets = response.presets;
        let available_presets = [];
        presets.forEach((item) => {
          if (item.allocatable === true) {
            if ('cuda.shares' in item.resource_slots) {
              item.gpu = item.resource_slots['cuda.shares'];
            } else if ('cuda.device' in item) {
              item.gpu = item.resource_slots['cuda.device'];
            } else {
              item.gpu = 0;
            }
            item.cpu = item.resource_slots.cpu;
            item.mem = window.backendaiclient.utils.changeBinaryUnit(item.resource_slots.mem, 'g');
            available_presets.push(item);
          }
        });
        this.resource_templates = available_presets;
      }
    });
  }

  async updateMetric() {
    if (this.metric_updating == true) return;
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateMetric();
      }, true);
    } else {
      this.metric_updating = true;
      let selectedItem = this.shadowRoot.querySelector('#environment').selectedItem;
      if (typeof selectedItem === 'undefined' || selectedItem === null) {
        this.metric_updating = false;
        return;
      }
      let kernel = selectedItem.id;
      let currentVersion = this.shadowRoot.querySelector('#version').value;
      let kernelName = kernel + ':' + currentVersion;
      let currentResource = this.resourceLimits[kernelName];
      await this._updateVirtualFolderList();
      let available_slot = await this._aggregateResourceUse();
      if (!currentResource) {
        this.metric_updating = false;
        return;
      }
      // Post-UI markup to disable unchangeable values
      this.shadowRoot.querySelector('#cpu-resource').disabled = false;
      this.shadowRoot.querySelector('#mem-resource').disabled = false;
      this.shadowRoot.querySelector('#gpu-resource').disabled = false;
      this.shadowRoot.querySelector('#session-resource').disabled = false;
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Launch';
      let disableLaunch = false;
      currentResource.forEach((item) => {
        if (item.key === 'cpu') {
          let cpu_metric = {...item};
          cpu_metric.min = parseInt(cpu_metric.min);
          if ('cpu' in this.userResourceLimit) {
            if (parseInt(cpu_metric.max) !== 0 && cpu_metric.max !== 'Infinity' && cpu_metric.max !== NaN) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), parseInt(this.userResourceLimit.cpu), available_slot['cpu_slot']);
            } else {
              cpu_metric.max = Math.min(parseInt(this.userResourceLimit.cpu), available_slot['cpu_slot']);
            }
          } else {
            if (parseInt(cpu_metric.max) !== 0 && cpu_metric.max !== 'Infinity' && cpu_metric.max !== NaN) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), available_slot['cpu_slot']);
            } else {
              cpu_metric.max = this.available_slot['cpu_slot'];
            }
          }
          if (cpu_metric.min >= cpu_metric.max) {
            if (cpu_metric.min > cpu_metric.max) {
              cpu_metric.min = cpu_metric.max;
              cpu_metric.max = cpu_metric.max + 1;
              disableLaunch = true;
              this.shadowRoot.querySelector('#cpu-resource').disabled = true;
            } else { // min == max
              cpu_metric.max = cpu_metric.max + 1;
              this.shadowRoot.querySelector('#cpu-resource').disabled = true;
            }
          }
          this.cpu_metric = cpu_metric;
        }

        if (item.key === 'cuda.device' && this.gpu_mode == 'gpu') {
          let gpu_metric = {...item};
          gpu_metric.min = parseInt(gpu_metric.min);
          if ('cuda.device' in this.userResourceLimit) {
            if (parseInt(gpu_metric.max) !== 0 && gpu_metric.max !== 'Infinity' && gpu_metric.max !== NaN) {
              gpu_metric.max = Math.min(parseInt(gpu_metric.max), parseInt(this.userResourceLimit['cuda.device']), available_slot['fgpu_slot']);
            } else {
              gpu_metric.max = Math.min(parseInt(this.userResourceLimit['cuda.device']), available_slot['gpu_slot']);
            }
          } else {
            if (parseInt(gpu_metric.max) !== 0) {
              gpu_metric.max = Math.min(parseInt(gpu_metric.max), available_slot['gpu_slot']);
            } else {
              gpu_metric.max = this.available_slot['gpu_slot'];
            }
          }
          if (gpu_metric.min >= gpu_metric.max) {
            if (gpu_metric.min > gpu_metric.max) {
              gpu_metric.min = gpu_metric.max;
              disableLaunch = true;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            } else {
              gpu_metric.max = gpu_metric.max + 1;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            }
          }
          this.gpu_metric = gpu_metric;
        }
        if (item.key === 'cuda.shares' && this.gpu_mode === 'fgpu') {
          let fgpu_metric = {...item};
          fgpu_metric.min = parseInt(fgpu_metric.min);
          if ('cuda.shares' in this.userResourceLimit) {
            if (parseFloat(fgpu_metric.max) !== 0 && fgpu_metric.max !== 'Infinity' && fgpu_metric.max !== NaN) {
              fgpu_metric.max = Math.min(parseFloat(fgpu_metric.max), parseFloat(this.userResourceLimit['cuda.shares']), available_slot['fgpu_slot']);
            } else {

              fgpu_metric.max = Math.min(parseFloat(this.userResourceLimit['cuda.shares']), available_slot['fgpu_slot']);
            }
          } else {
            if (parseFloat(fgpu_metric.max) !== 0) {
              fgpu_metric.max = Math.min(parseFloat(fgpu_metric.max), available_slot['fgpu_slot']);
            } else {
              fgpu_metric.max = 0;
            }
          }
          if (fgpu_metric.min >= fgpu_metric.max) {
            if (fgpu_metric.min > fgpu_metric.max) {
              fgpu_metric.min = fgpu_metric.max;
              disableLaunch = true;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            } else {
              fgpu_metric.max = fgpu_metric.max + 1;
              this.shadowRoot.querySelector('#gpu-resource').disabled = true
            }
          }
          this.fgpu_metric = fgpu_metric;
          if (fgpu_metric.max > 0) {
            this.gpu_metric = fgpu_metric;
          }
        }
        if (item.key === 'tpu') {
          let tpu_metric = {...item};
          tpu_metric.min = parseInt(tpu_metric.min);
          tpu_metric.max = parseInt(tpu_metric.max);
          if (tpu_metric.min > tpu_metric.max) {
            // TODO: dynamic maximum per user policy
          }
          this.tpu_metric = tpu_metric;
        }
        if (item.key === 'mem') {
          let mem_metric = {...item};
          mem_metric.min = window.backendaiclient.utils.changeBinaryUnit(mem_metric.min, 'g');
          if (mem_metric.min < 0.1) {
            mem_metric.min = 0.1;
          }
          let image_mem_max = window.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g');
          if ('mem' in this.userResourceLimit) {
            let user_mem_max = window.backendaiclient.utils.changeBinaryUnit(this.userResourceLimit['mem'], 'g');
            if (parseInt(image_mem_max) !== 0) {
              mem_metric.max = Math.min(parseFloat(image_mem_max), parseFloat(user_mem_max), available_slot['mem_slot']);
            } else {
              mem_metric.max = parseFloat(user_mem_max);
            }
          } else {
            if (parseInt(mem_metric.max) !== 0 && mem_metric.max !== 'Infinity' && isNaN(mem_metric.max) !== true) {
              mem_metric.max = Math.min(parseFloat(window.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g')), available_slot['mem_slot']);
            } else {
              mem_metric.max = available_slot['mem_slot']; // TODO: set to largest memory size
            }
          }
          if (mem_metric.min >= mem_metric.max) {
            if (mem_metric.min > mem_metric.max) {
              mem_metric.min = mem_metric.max;
              mem_metric.max = mem_metric.max + 1;
              disableLaunch = true;
              this.shadowRoot.querySelector('#mem-resource').disabled = true
            } else {
              mem_metric.max = mem_metric.max + 1;
              this.shadowRoot.querySelector('#mem-resource').disabled = true
            }
          }
          mem_metric.min = Number(mem_metric.min.toFixed(2));
          mem_metric.max = Number(mem_metric.max.toFixed(2));
          this.mem_metric = mem_metric;
        }
      });
      if (this.gpu_metric.min == 0 && this.gpu_metric.max == 0) {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = false;
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
        this.shadowRoot.querySelector('#gpu-resource').value = 0;
      } else {
        this.shadowRoot.querySelector('#use-gpu-checkbox').checked = true;
        this.shadowRoot.querySelector('#gpu-resource').disabled = false;
        this.shadowRoot.querySelector('#gpu-resource').value = this.gpu_metric.max;
      }
      // Refresh with resource template
      if (this.resource_templates !== [] && this.resource_templates.length > 0) {
        let resource = this.resource_templates[0];
        this._updateResourceIndicator(resource.cpu, resource.mem, resource.gpu);
        let default_template = this.shadowRoot.querySelector('#resource-templates').getElementsByTagName('wl-button')[0];
        this.shadowRoot.querySelector('#resource-templates').selected = "0";
        default_template.setAttribute('active', true);
        //this.shadowRoot.querySelector('#' + resource.title + '-button').raised = true;
      } else {
        this._updateResourceIndicator(this.cpu_metric.min, this.mem_metric.min, this.gpu_metric.min);
      }
      if (disableLaunch) {
        this.shadowRoot.querySelector('#cpu-resource').disabled = true; // Not enough CPU. so no session.
        this.shadowRoot.querySelector('#mem-resource').disabled = true;
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
        this.shadowRoot.querySelector('#session-resource').disabled = true;
        this.shadowRoot.querySelector('#launch-button').disabled = true;
        this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Not enough resource';
      }
      if (this.gpu_metric.min == this.gpu_metric.max) {
        this.shadowRoot.querySelector('#gpu-resource').max = this.gpu_metric.max + 1;
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
      }
      if (this.concurrency_limit == 1) {
        this.shadowRoot.querySelector('#session-resource').max = 2;
        this.shadowRoot.querySelector('#session-resource').value = 1;
        this.shadowRoot.querySelector('#session-resource').disabled = true;
      }
      this.metric_updating = false;
    }
  }

  updateLanguage() {
    let selectedItem = this.shadowRoot.querySelector('#environment').selectedItem;
    if (selectedItem === null) return;
    let kernel = selectedItem.id;
    this._updateVersions(kernel);
  }

  // Manager requests
  _refreshImageList() {
    const fields = [
      'name', 'humanized_name', 'tag', 'registry', 'digest', 'installed',
      'resource_limits { key min max }'
    ];
    window.backendaiclient.image.list(fields, true).then((response) => {
      const images = [];
      Object.keys(response.images).map((objectKey, index) => {
        const item = response.images[objectKey];
        if (item.installed === true) {
          images.push(item);
        }
      });
      if (images.length === 0) {
        return;
      }
      this.images = images;
      this.supports = {};
      Object.keys(this.images).map((objectKey, index) => {
        const item = this.images[objectKey];
        const supportsKey = `${item.registry}/${item.name}`;
        if (!(supportsKey in this.supports)) {
          this.supports[supportsKey] = [];
        }
        this.supports[supportsKey].push(item.tag);
        this.resourceLimits[`${supportsKey}:${item.tag}`] = item.resource_limits;
      });
      this._updateEnvironment();
    }).catch((err) => {
      this.metadata_updating = false;
      if (err && err.message) {
        this.notification.text = PainKiller.relieve(err.message);
        this.notification.show(true);
      }
    });
  }

  changed(e) {
    console.log(e);
  }

  isEmpty(item) {
    if (item.length === 0) {
      return true;
    }
    return false;
  }

  _toggleAdvancedSettings() {
    this.shadowRoot.querySelector('#advanced-resource-settings').toggle();
  }

  _chooseResourceTemplate(e) {
    const button = e.target.closest('wl-button');
    const cpu = button.cpu;
    const mem = button.mem;
    const gpu = button.gpu;
    this._updateResourceIndicator(cpu, mem, gpu);
    //button.raised = true;
  }

  _updateResourceIndicator(cpu, mem, gpu) {
    this.shadowRoot.querySelector('#gpu-resource').value = gpu;
    this.cpu_request = cpu;
    this.mem_request = mem;
    this.gpu_request = gpu;
  }

  selectDefaultLanguage() {
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._selectDefaultLanguage();
      }, true);
    } else {
      this._selectDefaultLanguage();
    }
  }

  _selectDefaultLanguage() {
    if (window.backendaiclient._config.default_session_environment !== undefined &&
      'default_session_environment' in window.backendaiclient._config &&
      window.backendaiclient._config.default_session_environment !== '') {
      this.default_language = window.backendaiclient._config.default_session_environment;
    } else if (this.languages.length !== 0) {
      this.default_language = this.languages[0].name;
    } else {
      this.default_language = 'index.docker.io/lablup/ngc-tensorflow';
    }
    return true;
  }

  _selectDefaultVersion(version) {
    return false;
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification" open></lablup-notification>
      <div class="layout horizontal">
        <div class="layout ${this.direction} resources wrap" style="align-items: flex-start">
          <div class="layout horizontal start-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <iron-icon class="fg blue" icon="hardware:developer-board"></iron-icon>
              <div class="gauge-name">CPU</div>
            </div>
            <div class="layout vertical start-justified wrap short-indicator">
              <span class="gauge-label">${this.used_slot.cpu_slot}/${this.total_slot.cpu_slot}</span>
              <paper-progress id="cpu-usage-bar" value="${this.used_slot_percent.cpu_slot}"></paper-progress>
            </div>
          </div>
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <iron-icon class="fg blue" icon="hardware:memory"></iron-icon>
              <span class="gauge-name">RAM</span>
            </div>
            <div class="layout vertical start-justified wrap">
              <span class="gauge-label">${this.used_slot.mem_slot}/${this.total_slot.mem_slot}GB</span>
              <paper-progress id="mem-usage-bar" value="${this.used_slot_percent.mem_slot}"></paper-progress>
            </div>
          </div>
          ${this.total_slot.gpu_slot ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <iron-icon class="fg blue" icon="icons:view-module"></iron-icon>
              <span class="gauge-name">GPU</span>
            </div>
            <div class="layout vertical center-justified wrap short-indicator">
              <span class="gauge-label">${this.used_slot.gpu_slot}/${this.total_slot.gpu_slot}</span>
              <paper-progress id="gpu-usage-bar" value="${this.used_slot_percent.gpu_slot}"></paper-progress>
            </div>
          </div>` :
      html``}
          ${this.total_slot.fgpu_slot ?
      html`
          <div class="layout horizontal center-justified monitor">
            <div class="layout vertical center center-justified" style="margin-right:5px;">
              <iron-icon class="fg blue" icon="icons:view-module"></iron-icon>
              <span class="gauge-name">GPU</span>
            </div>
            <div class="layout vertical start-justified wrap short-indicator">
              <span class="gauge-label">${this.used_slot.fgpu_slot}/${this.total_slot.fgpu_slot}</span>
              <paper-progress id="gpu-usage-bar" value="${this.used_slot_percent.fgpu_slot}"></paper-progress>
            </div>
          </div>` :
      html``}
          <div class="layout horizontal start-justified monitor">
            <div class="layout vertical center center-justified wrap" style="margin-right:5px;">
              <iron-icon class="fg blue" icon="icons:assignment"></iron-icon>
              <span class="gauge-name">Session</span>
            </div>
            <div class="layout vertical start-justified wrap short-indicator" style="margin-left: 0; margin-right: auto">
              <span class="gauge-label">${this.concurrency_used}/${this.concurrency_max}</span>
              <paper-progress class="short" id="concurrency-usage-bar" value="${this.used_slot_percent.concurrency}"></paper-progress>
            </div>
          </div>
          <div class="flex"></div>
        </div>
        <div class="layout vertical" style="align-self: center;">
          <wl-button class="fg red" id="launch-session" ?fab=${this.direction === 'vertical'} outlined @click="${() => this._launchSessionDialog()}">
            <wl-icon>add</wl-icon>
            Start
          </wl-button>
        </div>
      </div>
      <wl-dialog id="new-session-dialog"
                    fixed backdrop blockscrolling persistent
                    style="padding:0;">
        <wl-card class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Start new session</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button"
              @click="${() => this._hideSessionDialog()}">
              Close
            </paper-icon-button>
          </h3>
          <form id="launch-session-form">
            <fieldset>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="environment" label="Environments" horizontal-align="left">
                  <paper-listbox slot="dropdown-content" attr-for-selected="id"
                                 selected="${this.default_language}">
                ${this.languages.map(item => html`
                    <paper-item id="${item.name}" label="${item.alias}">${item.basename}
                    ${item.tags ? item.tags.map(item => html`
                      <lablup-shields style="margin-left:5px;" description="${item}"></lablup-shields>
                    `) : ''}
                    </paper-item>
                `)}
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="version" label="Version">
                  <paper-listbox slot="dropdown-content" selected="0">
              ${this.versions.map(item => html`
                    <paper-item id="${item}" label="${item}">${item}</paper-item>
              `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
              <div style="display:none;">
                <paper-checkbox id="use-gpu-checkbox">Use GPU</paper-checkbox>
              </div>
              <div class="horizontal center layout">
                <backend-ai-dropdown-menu id="vfolder" multi attr-for-selected="value" label="Folders">
                ${this.vfolders.map(item => html`
                  <paper-item value="${item.name}">${item.name}</paper-item>
                `)}
                </backend-ai-dropdown-menu>
                <paper-input id="session-name" label="Session name (optional)"
                             value="" pattern="[a-zA-Z0-9_-]{4,}" auto-validate
                             error-message="4 or more characters / no whitespace">
                </paper-input>
              </div>
            </fieldset>
            <wl-expansion name="resource-group" open>
              <span slot="title">Resource allocation</span>
              <span slot="description"></span>
              <div class="horizontal center layout">
                ${this.enable_scaling_group ? html`
                <paper-dropdown-menu id="scaling-groups" label="Scaling Group" horizontal-align="left">
                  <paper-listbox selected="0" slot="dropdown-content">
${this.scaling_groups.map(item =>
      html`
                      <paper-item id="${item.name}" label="${item.name}">${item.name}</paper-item>
      `
    )
    }
                  </paper-listbox>
                </paper-dropdown-menu>
                ` : html``}
              </div>
              <paper-listbox id="resource-templates" selected="0" class="horizontal center layout"
                             style="width:350px; overflow:scroll;">
${this.resource_templates.map(item => html`
                <wl-button class="resource-button vertical center start layout" role="option"
                            style="height:140px;min-width:120px;" type="button"
                            flat outlined
                            @click="${this._chooseResourceTemplate}"
                            id="${item.name}-button"
                            .cpu="${item.cpu}"
                            .mem="${item.mem}"
                            .gpu="${item.gpu}">
                  <div>
                    <h4>${item.name}</h4>
                    <ul>
                      <li>${item.cpu} CPU</li>
                      <li>${item.mem}GB RAM</li>
                      ${!item.gpu ? html`<li>NO GPU</li>` : html`<li>${item.gpu} fGPU</li>`}
                      </ul>
                  </div>
                </wl-button>
              `)}
              ${this.isEmpty(this.resource_templates) ?
      html`
                <wl-button class="resource-button vertical center start layout" role="option"
                            style="height:140px;width:350px;" type="button"
                            flat inverted outlined disabled>
                  <div>
                    <h4>No suitable preset</h4>
                    <div style="font-size:12px;">Use advanced settings to <br>start custom session</div>
                  </div>
                </wl-button>
` : html``}
              </paper-listbox>
            </wl-expansion>
            <wl-expansion name="resource-group">
              <span slot="title">Advanced</span>
              <span slot="description">Custom allocation</span>
              <div class="vertical layout">
                <div class="horizontal center layout">
                  <span class="resource-type" style="width:30px;">CPU</span>
                  <paper-slider id="cpu-resource" class="cpu"
                                pin snaps expand editable
                                min="${this.cpu_metric.min}" max="${this.cpu_metric.max}"
                                value="${this.cpu_request}"></paper-slider>
                  <span class="caption">Core</span>
                </div>
                <div class="horizontal center layout">
                  <span class="resource-type" style="width:30px;">RAM</span>
                  <paper-slider id="mem-resource" class="mem"
                                pin snaps step=0.05 editable
                                min="${this.mem_metric.min}" max="${this.mem_metric.max}"
                                value="${this.mem_request}"></paper-slider>
                  <span class="caption">GB</span>
                </div>
                <div class="horizontal center layout">
                  <span class="resource-type" style="width:30px;">GPU</span>
                  <paper-slider id="gpu-resource" class="gpu"
                                pin snaps editable step="${this.gpu_step}"
                                min="0.0" max="${this.gpu_metric.max}" value="${this.gpu_request}"></paper-slider>
                  <span class="caption">GPU</span>
                </div>
                <div class="horizontal center layout">
                  <span class="resource-type" style="width:50px;">Sessions</span>
                  <paper-slider id="session-resource" class="session"
                                pin snaps editable step=1
                                min="1" max="${this.concurrency_limit}" value="${this.session_request}"></paper-slider>
                  <span class="caption">#</span>
                </div>
              </div>
            </wl-expansion>

            <fieldset style="padding-top:0;">
              <wl-button class="launch-button" type="button" id="launch-button"
                                           outlined @click="${() => this._newSession()}">
                                          <wl-icon>rowing</wl-icon>
                <span id="launch-button-msg">Launch</span>
              </wl-button>
            </fieldset>
          </form>
        </wl-card>
      </wl-dialog>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-resource-monitor": BackendAiResourceMonitor;
  }
}
