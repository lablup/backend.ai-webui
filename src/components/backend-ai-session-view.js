/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {css, html, LitElement} from "lit-element";
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-tabs/paper-tab';

import '@polymer/paper-button/paper-button';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-slider/paper-slider';
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';

import '@vaadin/vaadin-dialog/vaadin-dialog.js';
import './backend-ai-session-list.js';
import './backend-ai-dropdown-menu';
import 'weightless/button';
import 'weightless/icon';
import 'weightless/dialog';
import 'weightless/expansion';
import 'weightless/card';
import 'weightless/tab';
import 'weightless/tab-group';
import 'weightless/slider';

import './lablup-notification.js';
import {BackendAiStyles} from './backend-ai-console-styles';
import {IronFlex, IronFlexAlignment, IronFlexFactors, IronPositioning} from '../layout/iron-flex-layout-classes';

class BackendAiSessionView extends LitElement {
  static get is() {
    return 'backend-ai-session-view';
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
    this.active = false;
    this.supports = {};
    this.resourceLimits = {};
    this.userResourceLimit = {};
    this.aliases = {
      'TensorFlow': 'python-tensorflow',
      'Lablup ResearchEnv.': 'python-ff',
      'Python': 'python',
      'PyTorch': 'python-pytorch',
      'Chainer': 'chainer',
      'R': 'r',
      'Julia': 'julia',
      'Lua': 'lua',
    };
    this.versions = ['3.6'];
    this.languages = [];
    this.gpu_mode = 'no';
    this.gpu_step = 0.05;
    this.cpu_metric = {
      'min': '1',
      'max': '1'
    };
    this.mem_metric = {
      'min': '1',
      'max': '1'
    };
    this.gpu_metric = {
      'min': '0',
      'max': '0'
    };
    this.tpu_metric = {
      'min': '1',
      'max': '1'
    };
    this.images = {};
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
    this._status = 'inactive';
    this.cpu_request = 1;
    this.mem_request = 1;
    this.gpu_request = 0;
  }

  static get properties() {
    return {
      active: {
        type: Boolean
      },
      supports: {
        type: Object
      },
      resourceLimits: {
        type: Object
      },
      userResourceLimit: {
        type: Object
      },
      aliases: {
        type: Object
      },
      versions: {
        type: Array
      },
      languages: {
        type: Array
      },
      gpu_mode: {
        type: String
      },
      gpu_step: {
        type: Number
      },
      cpu_metric: {
        type: Object
      },
      mem_metric: {
        type: Object
      },
      gpu_metric: {
        type: Object
      },
      tpu_metric: {
        type: Object
      },
      images: {
        type: Object
      },
      defaultResourcePolicy: {
        type: String
      },
      total_slot: {
        type: Object
      },
      used_slot: {
        type: Object
      },
      available_slot: {
        type: Object
      },
      concurrency_used: {
        type: Number
      },
      concurrency_max: {
        type: Number
      },
      vfolders: {
        type: Array
      },
      resource_info: {
        type: Object
      },
      used_slot_percent: {
        type: Object
      },
      resource_templates: {
        type: Array
      },
      default_language: {
        type: String
      },
      launch_ready: {
        type: Boolean
      },
      cpu_request: {
        type: Number
      },
      mem_request: {
        type: Number
      },
      gpu_request: {
        type: Number
      },
      _status: {
        type: Boolean
      }
    }
  }

  firstUpdated() {
    this.shadowRoot.querySelector('#launch-session').addEventListener('tap', this._launchSessionDialog.bind(this));
    this.shadowRoot.querySelector('#launch-button').addEventListener('tap', this._newSession.bind(this));
    this.shadowRoot.querySelector('#environment').addEventListener('selected-item-label-changed', this.updateLanguage.bind(this));
    this.shadowRoot.querySelector('#version').addEventListener('selected-item-label-changed', this.updateMetric.bind(this));
    //this.shadowRoot.querySelector('#advanced-resource-settings-button').addEventListener('tap', this._toggleAdvancedSettings.bind(this));
    this._initAliases();
    this.updateResourceIndicator();
    var gpu_resource = this.shadowRoot.querySelector('#gpu-resource');
    document.addEventListener('backend-ai-resource-refreshed', () => {
      this.updateResourceIndicator();
      this._refreshResourceTemplate();
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
        if (this.gpu_metric.min == this.gpu_metric.max) {
          this.shadowRoot.querySelector('#gpu-resource').disabled = true
        } else {
          this.shadowRoot.querySelector('#gpu-resource').disabled = false;
        }
      } else {
        this.shadowRoot.querySelector('#gpu-resource').disabled = true;
      }
    });
    //this._initTabBar();
  }

  _initTabBar() {
    /* Test code */
    let b = document.body.querySelector('#console-shell');
    let c = b.shadowRoot.querySelector('#top-tab-menu');
    let d = this.shadowRoot.querySelector('#topbar-tabs');
    c.appendChild(d);
  }

  _initAliases() {
    for (let item in this.aliases) {
      this.aliases[this.aliases[item]] = item;
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  shouldUpdate() {
    return this.active;
  }

  attributeChangedCallback(name, oldval, newval) {
    if (name == 'active' && newval !== null) {
      this._menuChanged(true);
    } else {
      this._menuChanged(false);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  async _menuChanged(active) {
    await this.updateComplete;
    if (active === false) {
      this.shadowRoot.querySelector('#running-jobs').active = false;
      this.shadowRoot.querySelector('#finished-jobs').active = false;
      this._status = 'inactive';
      return;
    }
    this.shadowRoot.querySelector('#running-jobs').active = true;
    this.shadowRoot.querySelector('#finished-jobs').active = true;
    this._status = 'active';
    // If disconnected
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshResourcePolicy();
      }, true);
    } else { // already connected
      this._refreshResourcePolicy();
    }
  }

  _refreshResourcePolicy() {
    window.backendaiclient.keypair.info(window.backendaiclient._config.accessKey, ['resource_policy', 'concurrency_used']).then((response) => {
      let policyName = response.keypair.resource_policy;
      this.concurrency_used = response.keypair.concurrency_used;
      // Workaround: We need a new API for user mode resourcepolicy access, and current resource usage.
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
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
      } else if (err && err.title) {
        this.shadowRoot.querySelector('#notification').text = err.title;
        this.shadowRoot.querySelector('#notification').show();
      }
    });
  }

  _refreshResourceValues() {
    this._refreshImageList();
    this._updateGPUMode();
    this._updateVirtualFolderList();
    this.updateMetric();
  }

  _launchSessionDialog() {
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      this.shadowRoot.querySelector('#notification').text = 'Please wait while initializing...';
      this.shadowRoot.querySelector('#notification').show();
    } else {
      this.selectDefaultLanguage();
      this.updateMetric();
      var gpu_resource = this.shadowRoot.querySelector('#gpu-resource');
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
        this.gpu_mode = 'vgpu';
        this.gpu_step = 0.05;
      }
    });
  }

  _generateKernelIndex(kernel, version) {
    if (kernel in this.aliases) {
      return this.aliases[kernel] + ':' + version;
    }
    return kernel + ':' + version;
  }

  _newSession() {
    let kernel = this.shadowRoot.querySelector('#environment').value;
    let version = this.shadowRoot.querySelector('#version').value;
    let sessionName = this.shadowRoot.querySelector('#session-name').value;
    let vfolder = this.shadowRoot.querySelector('#vfolder').selectedValues;
    this.cpu_request = this.shadowRoot.querySelector('#cpu-resource').value;
    this.mem_request = this.shadowRoot.querySelector('#ram-resource').value;
    this.gpu_request = this.shadowRoot.querySelector('#gpu-resource').value;

    let config = {};
    if (window.backendaiclient.isManagerVersionCompatibleWith('19.05')) {
      config['group_name'] = window.backendaiclient.current_group;
    }
    if (window.backendaiclient.isManagerVersionCompatibleWith('19.05')) {
      config['domain'] = window.backendaiclient._config.domainName;
    }
    config['cpu'] = this.cpu_request;
    if (this.gpu_mode == 'vgpu') {
      config['vgpu'] = this.gpu_request;
    } else {
      config['gpu'] = this.gpu_request;
    }

    if (String(this.shadowRoot.querySelector('#ram-resource').value) === "Infinity") {
      config['mem'] = String(this.shadowRoot.querySelector('#ram-resource').value);
    } else {
      config['mem'] = String(this.mem_request) + 'g';
    }

    if (this.shadowRoot.querySelector('#use-gpu-checkbox').checked !== true) {
      if (this.gpu_mode == 'vgpu') {
        config['vgpu'] = 0.0;
      } else {
        config['gpu'] = 0.0;
      }
    }
    if (sessionName.length < 4) {
      sessionName = undefined;
    }
    if (vfolder.length !== 0) {
      config['mounts'] = vfolder;
    }
    const kernelName = this._generateKernelIndex(kernel, version);
    this.shadowRoot.querySelector('#launch-button').disabled = true;
    this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Preparing...';
    this.shadowRoot.querySelector('#notification').text = 'Preparing session...';
    this.shadowRoot.querySelector('#notification').show();
    window.backendaiclient.createKernel(kernelName, sessionName, config).then((req) => {
      this.shadowRoot.querySelector('#running-jobs').refreshList();
      this.shadowRoot.querySelector('#new-session-dialog').hide();
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Launch';
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.shadowRoot.querySelector('#notification').text = err.message;
        this.shadowRoot.querySelector('#notification').show();
      } else if (err && err.title) {
        this.shadowRoot.querySelector('#notification').text = err.title;
        this.shadowRoot.querySelector('#notification').show();
      }
      this.shadowRoot.querySelector('#launch-button').disabled = false;
      this.shadowRoot.querySelector('#launch-button-msg').textContent = 'Launch';
    });
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
      'python-ff': 'Lablup ResearchEnv.',
      'python-cntk': 'CNTK',
      'python-pytorch': 'PyTorch',
      'python-tensorflow': 'TensorFlow',
      'r-base': 'R',
      'rust': 'Rust',
      'scala': 'Scala',
      'scheme': 'Scheme',
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
      const alias = this.aliases[item];
      if (alias !== undefined) {
        this.languages.push({name: item, alias: alias});
      }
    });
    this._initAliases();
  }

  _updateVersions(lang) {
    if (this.aliases[lang] in this.supports) {
      this.versions = this.supports[this.aliases[lang]];
      this.versions = this.versions.sort();
    }
    if (this.versions !== undefined) {
      this.shadowRoot.querySelector('#version').value = this.versions[0];
      this.updateMetric();
    }
  }

  _updateVirtualFolderList() {
    let l = window.backendaiclient.vfolder.list();
    l.then((value) => {
      this.vfolders = value;
    });
  }

  _supportLanguages() {
    return Object.keys(this.supports);
  }

  _supportVersions() {
    let lang = this.shadowRoot.querySelector('#environment').value;
    return this.supports[lang];
  }

  async _aggregateResourceUse() {
    let total_slot = {};
    return window.backendaiclient.resourcePreset.check().then((response) => {
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
          total_slot['vgpu_slot'] = this.resource_info['cuda.shares'];
        } else {
          total_slot['vgpu_slot'] = resource_limit['cuda.shares'];
        }
      }
      let remaining_slot = {};
      let used_slot = {};
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
        remaining_slot['vgpu_slot'] = resource_remaining['cuda.shares'];
        if ('cuda.shares' in resource_using) {
          used_slot['vgpu_slot'] = resource_using['cuda.shares'];
        } else {
          used_slot['vgpu_slot'] = 0;
        }
      }

      if ('vgpu_slot' in used_slot) {
        used_slot['vgpu_slot'] = parseFloat(used_slot['vgpu_slot']).toFixed(2);
        total_slot['vgpu_slot'] = parseFloat(total_slot['vgpu_slot']).toFixed(2);
      }
      this.total_slot = total_slot;
      this.used_slot = used_slot;
      let used_slot_percent = {};
      ['cpu_slot', 'mem_slot', 'gpu_slot', 'vgpu_slot'].forEach((slot) => {
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
      used_slot_percent['concurrency'] = (this.concurrency_used / this.concurrency_max) * 100.0;
      this.available_slot = remaining_slot;
      this.used_slot_percent = used_slot_percent;
      return this.available_slot;
    });
  }

  updateResourceIndicator() {
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this._aggregateResourceUse();
      }, true);
    } else {
      this._aggregateResourceUse();
    }
  }

  _refreshResourceTemplate() {
    window.backendaiclient.resourcePreset.check().then((response) => {
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
    if (window.backendaiclient === undefined || window.backendaiclient === null || window.backendaiclient.ready === false) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateMetric();
      }, true);
    } else {
      if (this.shadowRoot.querySelector('#environment').value in this.aliases) {
        let currentLang = this.aliases[this.shadowRoot.querySelector('#environment').value];
        let currentVersion = this.shadowRoot.querySelector('#version').value;
        let kernelName = currentLang + ':' + currentVersion;
        let currentResource = this.resourceLimits[kernelName];
        let available_slot = await this._aggregateResourceUse();
        if (!currentResource) return;
        currentResource.forEach((item) => {
          if (item.key === 'cpu') {
            let cpu_metric = item;
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
            if (cpu_metric.min > cpu_metric.max) {
              // TODO: dynamic maximum per user policy
            }
            this.cpu_metric = cpu_metric;
          }

          if (item.key === 'cuda.device' && this.gpu_mode == 'gpu') {
            let gpu_metric = item;
            gpu_metric.min = parseInt(gpu_metric.min);
            if ('cuda.device' in this.userResourceLimit) {
              if (parseInt(gpu_metric.max) !== 0 && gpu_metric.max !== 'Infinity' && gpu_metric.max !== NaN) {
                gpu_metric.max = Math.min(parseInt(gpu_metric.max), parseInt(this.userResourceLimit['cuda.device']), available_slot['vgpu_slot']);
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
            if (gpu_metric.min > gpu_metric.max) {
              // TODO: dynamic maximum per user policy
            }
            this.gpu_metric = gpu_metric;
          }
          if (item.key === 'cuda.shares' && this.gpu_mode === 'vgpu') {
            let vgpu_metric = item;
            vgpu_metric.min = parseInt(vgpu_metric.min);
            if ('cuda.shares' in this.userResourceLimit) {
              if (parseFloat(vgpu_metric.max) !== 0 && vgpu_metric.max !== 'Infinity' && vgpu_metric.max !== NaN) {
                vgpu_metric.max = Math.min(parseFloat(vgpu_metric.max), parseFloat(this.userResourceLimit['cuda.shares']), available_slot['vgpu_slot']);
              } else {

                vgpu_metric.max = Math.min(parseFloat(this.userResourceLimit['cuda.shares']), available_slot['vgpu_slot']);
              }
            } else {
              if (parseFloat(vgpu_metric.max) !== 0) {
                vgpu_metric.max = Math.min(parseFloat(vgpu_metric.max), available_slot['vgpu_slot']);
              } else {
                vgpu_metric.max = 0;
              }
            }
            if (vgpu_metric.min > vgpu_metric.max) {
              // TODO: dynamic maximum per user policy
            }
            this.vgpu_metric = vgpu_metric;
            if (vgpu_metric.max > 0) {
              this.gpu_metric = vgpu_metric;
            }
          }
          if (item.key === 'tpu') {
            let tpu_metric = item;
            tpu_metric.min = parseInt(tpu_metric.min);
            tpu_metric.max = parseInt(tpu_metric.max);
            if (tpu_metric.min > tpu_metric.max) {
              // TODO: dynamic maximum per user policy
            }
            this.tpu_metric = tpu_metric;
          }
          if (item.key === 'mem') {
            let mem_metric = item;
            mem_metric.min = window.backendaiclient.utils.changeBinaryUnit(mem_metric.min, 'g', 'g');
            if (mem_metric.min < 0.1) {
              mem_metric.min = 0.1;
            }
            let image_mem_max = window.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g');
            if ('mem' in this.userResourceLimit) {
              let user_mem_max = window.backendaiclient.utils.changeBinaryUnit(this.userResourceLimit['mem'], 'g', 'g');
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
            if (mem_metric.min > mem_metric.max) {
              // TODO: dynamic maximum per user policy
            }
            this.mem_metric = mem_metric;
          }
        });
        if (this.gpu_metric === {}) {
          this.gpu_metric = {
            min: 0,
            max: 0
          };
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
          default_template.setAttribute('active', true);
          //this.shadowRoot.querySelector('#' + resource.title + '-button').raised = true;
        }

        // Post-UI markup to disable unchangeable values
        if (this.cpu_metric.min == this.cpu_metric.max) {
          this.shadowRoot.querySelector('#cpu-resource').max = this.cpu_metric.max + 1;
          this.shadowRoot.querySelector('#cpu-resource').disabled = true
        } else {
          this.shadowRoot.querySelector('#cpu-resource').disabled = false;
        }
        if (this.mem_metric.min == this.mem_metric.max) {
          this.shadowRoot.querySelector('#ram-resource').max = this.mem_metric.max + 1;
          this.shadowRoot.querySelector('#ram-resource').disabled = true
        } else {
          this.shadowRoot.querySelector('#ram-resource').disabled = false;
        }
        if (this.gpu_metric.min == this.gpu_metric.max) {
          this.shadowRoot.querySelector('#gpu-resource').max = this.gpu_metric.max + 1;
          this.shadowRoot.querySelector('#gpu-resource').disabled = true
        } else {
          this.shadowRoot.querySelector('#gpu-resource').disabled = false;
        }
      }
    }
  }

  updateLanguage() {
    this._updateVersions(this.shadowRoot.querySelector('#environment').selectedItemLabel);
  }

  // Manager requests
  _refreshImageList() {
    const fields = [
      'name', 'humanized_name', 'tag', 'registry', 'digest', 'installed',
      'resource_limits { key min max }'
    ];
    window.backendaiclient.image.list(fields).then((response) => {
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
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
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
    const termButton = e.target;
    const button = e.target.closest('wl-button');
    const cpu = button.cpu;
    const mem = button.mem;
    const gpu = button.gpu;
    this._updateResourceIndicator(cpu, mem, gpu);
    //button.raised = true;
  }

  _updateResourceIndicator(cpu, mem, gpu) {
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
  _showTab(tab) {
    var els = this.shadowRoot.querySelectorAll(".tab-content");
    for (var x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    this.shadowRoot.querySelector('#' + tab.value).style.display = 'block';
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
          width: 100px;
          border-radius: 3px;
          --paper-progress-height: 10px;
          --paper-progress-active-color: #3677EB;
          --paper-progress-secondary-color: #98BE5A;
          --paper-progress-transition-duration: 0.08s;
          --paper-progress-transition-timing-function: ease;
          --paper-progress-transition-delay: 0s;
        }

        .short-indicator paper-progress {
          width: 50px;
        }

        .short-indicator .gauge-label {
          width: 80px;
        }

        .custom {
          color: var(--paper-red-800);
        }

        span.caption {
          width: 30px;
          padding-left: 10px;
        }

        div.caption {
          width: 100px;
        }

        .gauge-name {
          font-size: 10px;
        }

        .gauge-label {
          width: 120px;
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
          width: 100%;
        }

        #launch-session {
          --button-bg: var(--paper-red-50);
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
        }

        wl-button.launch-button {
          width: 335px;
          --button-bg: var(--paper-red-50);
          --button-bg-hover: var(--paper-red-100);
          --button-bg-active: var(--paper-red-600);
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

        wl-card h3.tab {
          padding-top:0;
          padding-bottom:0;
          padding-left:0;
        }

        wl-tab-group {
          --tab-group-indicator-bg: var(--paper-red-500);
        }

        wl-tab {
          --tab-color: #666;
          --tab-color-hover: #222;
          --tab-color-hover-filled: #222;
          --tab-color-active: #222;
          --tab-color-active-hover: #222;
          --tab-color-active-filled: #ccc;
          --tab-bg-active: var(--paper-red-50);
          --tab-bg-filled: var(--paper-red-50);
          --tab-bg-active-hover: var(--paper-red-100);
        }
        
        wl-expansion {
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-margin-open: 0;
        }
      `];
  }

  render() {
    // language=HTML
    return html`
      <lablup-notification id="notification"></lablup-notification>
      <paper-tabs id="topbar-tabs" style="display:none;">
        <paper-tab>Running</paper-tab>
        <paper-tab>Finished</paper-tab>
      </paper-tabs>
      <wl-card class="item" elevation="1">
        <h3 class="tab horizontal center layout">
          <wl-tab-group>
            <wl-tab value="running-lists" checked @click="${(e) => this._showTab(e.target)}">Running</wl-tab>  
            <wl-tab value="finished-lists" @click="${(e) => this._showTab(e.target)}">Finished</wl-tab>
          </wl-tab-group>
          <div class="layout horizontal center resources wrap" style="margin-left:20px;">
            <div class="layout vertical center center-justified wrap" style="margin-right:5px;">
              <iron-icon class="fg blue" icon="hardware:developer-board"></iron-icon>
              <div class="gauge-name">CPU</div>
            </div>
            <div class="layout vertical start-justified wrap">
              <span class="gauge-label">${this.used_slot.cpu_slot}/${this.total_slot.cpu_slot}</span>
              <paper-progress id="cpu-usage-bar" value="${this.used_slot_percent.cpu_slot}"></paper-progress>
            </div>
            <div class="layout vertical center center-justified wrap" style="margin-right:5px;">
              <iron-icon class="fg blue" icon="hardware:memory"></iron-icon>
              <span class="gauge-name">RAM</span>
            </div>
            <div class="layout vertical start-justified wrap">
              <span class="gauge-label">${this.used_slot.mem_slot}GB/${this.total_slot.mem_slot}GB</span>
              <paper-progress id="mem-usage-bar" value="${this.used_slot_percent.mem_slot}"></paper-progress>
            </div>
            ${this.total_slot.gpu_slot ?
      html`
              <div class="layout vertical center center-justified wrap" style="margin-right:5px;">
                <iron-icon class="fg blue" icon="icons:view-module"></iron-icon>
                <span class="gauge-name">GPU</span>
              </div>
              <div class="layout vertical start-justified wrap short-indicator">
                <span class="gauge-label">${this.used_slot.gpu_slot}/${this.total_slot.gpu_slot}</span>
                <paper-progress id="gpu-usage-bar" value="${this.used_slot_percent.gpu_slot}"></paper-progress>
              </div>` :
      html``}
            ${this.total_slot.vgpu_slot ?
      html`
                <div class="layout vertical center center-justified wrap" style="margin-right:5px;">
                  <iron-icon class="fg blue" icon="icons:view-module"></iron-icon>
                  <span class="gauge-name">GPU</span>
                </div>
                <div class="layout vertical start-justified wrap short-indicator">
                  <span class="gauge-label">${this.used_slot.vgpu_slot}/${this.total_slot.vgpu_slot}</span>
                  <paper-progress id="gpu-usage-bar" value="${this.used_slot_percent.vgpu_slot}"></paper-progress>
                </div>` :
      html``}
            <div class="layout vertical center center-justified wrap" style="margin-right:5px;">
              <iron-icon class="fg blue" icon="icons:assignment"></iron-icon>
              <span class="gauge-name">Session</span>
            </div>
            <div class="layout vertical start-justified wrap short-indicator">
              <span class="gauge-label">${this.concurrency_used}/${this.concurrency_max}</span>
              <paper-progress class="short" id="concurrency-usage-bar" value="${this.used_slot_percent.concurrency}"></paper-progress>
            </div>

            </div>
            <span class="flex"></span>
            <wl-button class="fg red" id="launch-session" outlined>
              <wl-icon>add</wl-icon>
              Start
            </wl-button>
          </h3>
          <div id="running-lists" class="tab-content">
            <backend-ai-session-list id="running-jobs" condition="running" ?active="${this._status === 'active'}"></backend-ai-session-list>
          </div>
          <div id="finished-lists" class="tab-content" style="display:none;">
            <backend-ai-session-list id="finished-jobs" condition="finished" ?active="${this._status === 'active'}"></backend-ai-session-list>
          </div>
        </wl-card>
        <wl-dialog id="new-session-dialog"
                      fixed backdrop blockscrolling persistent
                      style="padding:0;">
          <wl-card elevation="1" class="login-panel intro centered" style="margin: 0;">
            <h3 class="horizontal center layout">
              <span>Start a new session</span>
              <div class="flex"></div>
              <paper-icon-button icon="close" class="blue close-button" 
                @click="${() => this._hideSessionDialog()}">
                Close
              </paper-icon-button>
            </h3>
            <form id="launch-session-form" onSubmit="this._launchSession()">
              <fieldset>
                <div class="horizontal center layout">
                  <paper-dropdown-menu id="environment" label="Environments">
                    <paper-listbox slot="dropdown-content" attr-for-selected="id"
                                   selected="${this.default_language}">
                  ${this.languages.map(item => html`
                          <paper-item id="${item.name}" label="${item.alias}">${item.alias}</paper-item>
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
                    <div class="layout vertical">
                      <paper-input id="session-name" label="Session name (optional)"
                                   value="" pattern="[a-zA-Z0-9_-]{4,}" auto-validate
                                   error-message="4 or more characters">
                      </paper-input>
                      <backend-ai-dropdown-menu id="vfolder" multi attr-for-selected="value" label="Virtual folders">
                      ${this.vfolders.map(item => html`
                        <paper-item value="${item.name}">${item.name}</paper-item>
                      `)}    
                      </backend-ai-dropdown-menu>
                  </div>
                </fieldset>
                <wl-expansion name="resource-group" open>
                  <span slot="title">Resource allocation</span>
                  <span slot="description"></span>
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
                          ${!item.gpu ? html`<li>NO GPU</li>` : html`<li>${item.gpu} vGPU</li>`}
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
                  <span slot="description">Free resource allocation</span>
                  <div class="horizontal center layout">
                    <span style="width:30px;">CPU</span>
                    <paper-slider id="cpu-resource" class="cpu"
                                  pin snaps expand editable
                                  .min="${this.cpu_metric.min}" .max="${this.cpu_metric.max}"
                                  value="${this.cpu_request}"></paper-slider>
                    <span class="caption">Core</span>
                  </div>
                  <div class="horizontal center layout">
                    <span style="width:30px;">RAM</span>
                    <paper-slider id="ram-resource" class="mem"
                                  pin snaps step=0.1 editable
                                  .min="${this.mem_metric.min}" .max="${this.mem_metric.max}"
                                  value="${this.mem_request}"></paper-slider>
                    <span class="caption">GB</span>
                  </div>
                  <div class="horizontal center layout">
                    <span style="width:30px;">GPU</span>
                    <paper-slider id="gpu-resource" class="gpu"
                                  pin snaps editable .step="${this.gpu_step}"
                                  .min="0.0" .max="${this.gpu_metric.max}" value="${this.gpu_request}"></paper-slider>
                    <span class="caption">GPU</span>
                  </div>
                </wl-expansion>
                
                <fieldset style="padding-top:0;">
                  <wl-button class="launch-button fg red" type="button" id="launch-button"
                                               outlined>
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

customElements.define(BackendAiSessionView.is, BackendAiSessionView);
