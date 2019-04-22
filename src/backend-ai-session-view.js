/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import './plastics/plastic-material/plastic-material';
import '@polymer/iron-collapse/iron-collapse';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-toast/paper-toast';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-slider/paper-slider';
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';

import '@vaadin/vaadin-dialog/vaadin-dialog.js';
import './backend-ai-styles.js';
import './backend-ai-session-list.js';
import {OverlayPatchMixin} from './overlay-patch-mixin.js';
import './components/backend-ai-dropdown-menu';
import '@material/mwc-button';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

class BackendAiSessionView extends OverlayPatchMixin(PolymerElement) {
  static get is() {
    return 'backend-ai-session-view';
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  static get properties() {
    return {
      active: {
        type: Boolean,
        value: false
      },
      supports: {
        type: Object,
        value: {}
      },
      resourceLimits: {
        type: Object,
        value: {}
      },
      userResourceLimit: {
        type: Object,
        value: {}
      },
      aliases: {
        type: Object,
        value: {
          'TensorFlow': 'python-tensorflow',
          'Python': 'python',
          'PyTorch': 'python-pytorch',
          'Chainer': 'chainer',
          'R': 'r',
          'Julia': 'julia',
          'Lua': 'lua',
        }
      },
      versions: {
        type: Array,
        value: ['3.6']
      },
      languages: {
        type: Array,
        value: []
      },
      gpu_mode: {
        type: String,
        value: 'no'
      },
      gpu_step: {
        type: Number,
        value: 0.05
      },
      cpu_metric: {
        type: Object,
        value: {
          'min': '1',
          'max': '1'
        }
      },
      mem_metric: {
        type: Object,
        value: {
          'min': '1',
          'max': '1'
        }
      },
      gpu_metric: {
        type: Object,
        value: {
          'min': '0',
          'max': '0'
        }
      },
      tpu_metric: {
        type: Object,
        value: {
          'min': '1',
          'max': '1'
        }
      },
      images: {
        type: Object,
        value: {}
      },
      defaultResourcePolicy: {
        type: String,
        value: 'UNLIMITED'
      },
      total_slot: {
        type: Object,
        value: {}
      },
      used_slot: {
        type: Object,
        value: {}
      },
      available_slot: {
        type: Object,
        value: {}
      },
      resource_info: {
        type: Object,
        value: {}
      },
      used_slot_percent: {
        type: Object,
        value: {}
      },
      resource_templates: {
        type: Array,
        value: []
      },
      default_language: {
        type: String,
        value: ''
      }
    }
  }

  ready() {
    super.ready();
    this.$['launch-session'].addEventListener('tap', this._launchSessionDialog.bind(this));
    this.$['launch-button'].addEventListener('tap', this._newSession.bind(this));
    this.$['environment'].addEventListener('selected-item-label-changed', this.updateLanguage.bind(this));
    this.$['version'].addEventListener('selected-item-label-changed', this.updateMetric.bind(this));
    this.shadowRoot.querySelector('#advanced-resource-settings-button').addEventListener('tap', this._toggleAdvancedSettings.bind(this));
    this._initAliases();
    this.updateResourceIndicator();
    var gpu_resource = this.$['gpu-resource'];
    document.addEventListener('backend-ai-resource-refreshed', () => {
      this.updateResourceIndicator();
      this._refreshResourceTemplate();
    });
    gpu_resource.addEventListener('value-change', () => {
      if (gpu_resource.value > 0) {
        this.$['use-gpu-checkbox'].checked = true;
      } else {
        this.$['use-gpu-checkbox'].checked = false;
      }
    });
    this.$['use-gpu-checkbox'].addEventListener('change', () => {
      if (this.$['use-gpu-checkbox'].checked === true) {
        if (this.gpu_metric.min == this.gpu_metric.max) {
          this.shadowRoot.querySelector('#gpu-resource').disabled = true
        } else {
          this.$['gpu-resource'].disabled = false;
        }
      } else {
        this.$['gpu-resource'].disabled = true;
      }
    });
  }

  _initAliases() {
    for (let item in this.aliases) {
      this.aliases[this.aliases[item]] = item;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    afterNextRender(this, function () {
    });
  }

  shouldUpdate() {
    return this.active;
  }

  static get observers() {
    return [
      '_menuChanged(active)'
    ]
  }

  _menuChanged(active) {
    if (!active) {
      this.$['running-jobs'].active = false;
      this.$['finished-jobs'].active = false;
      return;
    }
    this.$['running-jobs'].active = true;
    this.$['finished-jobs'].active = true;
    // If disconnected
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      document.addEventListener('backend-ai-connected', () => {
        this._refreshResourcePolicy();
      }, true);
    } else { // already connected
      this._refreshResourcePolicy();
    }
  }

  _refreshResourcePolicy() {
    window.backendaiclient.keypair.info(window.backendaiclient._config.accessKey, ['resource_policy']).then((response) => {
      let policyName = response.keypair.resource_policy;
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
      this._refreshResourceTemplate();
      this._refreshResourceValues();
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      } else if (err && err.title) {
        this.$.notification.text = err.title;
        this.$.notification.show();
      }
    });
  }

  _refreshResourceValues() {
    this._refreshImageList();
    this._updateGPUMode();
    this._updateVirtualFolderList();
    this.updateMetric();
    var cpu_resource = this.$['cpu-resource'];
    var ram_resource = this.$['ram-resource'];
    var gpu_resource = this.$['gpu-resource'];
  }

  _launchSessionDialog() {
    this._selectDefaultLanguage();
    this.updateMetric();
    var gpu_resource = this.$['gpu-resource'];
    //this.$['gpu-value'].textContent = gpu_resource.value;
    if (gpu_resource.value > 0) {
      this.$['use-gpu-checkbox'].checked = true;
    } else {
      this.$['use-gpu-checkbox'].checked = false;
    }
    this.$['new-session-dialog'].open();
  }

  _updateGPUMode() {
    window.backendaiclient.getResourceSlots().then((response) => {
      let results = response;
      if ('cuda.device' in results) {
        this.gpu_mode = 'gpu';
        this.gpu_step = 1;
        console.log('gpu');
      }
      if ('cuda.shares' in results) {
        this.gpu_mode = 'vgpu';
        this.gpu_step = 0.05;
        console.log('vgpu');
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
    let kernel = this.$['environment'].value;
    let version = this.$['version'].value;
    let sessionName = this.$['session-name'].value;
    let vfolder = this.$['vfolder'].selectedValues;

    let config = {};
    config['cpu'] = this.$['cpu-resource'].value;
    if (this.gpu_mode == 'vgpu') {
      config['vgpu'] = this.$['gpu-resource'].value;
    } else {
      config['gpu'] = this.$['gpu-resource'].value;
    }
    config['mem'] = String(this.$['ram-resource'].value) + 'g';
    if (this.$['use-gpu-checkbox'].checked !== true) {
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
    this.$['launch-button'].disabled = true;
    this.$['launch-button-msg'].textContent = 'Preparing...';
    this.$.notification.text = 'Preparing session...';
    this.$.notification.show();
    window.backendaiclient.createKernel(kernelName, sessionName, config).then((req) => {
      this.$['running-jobs'].refreshList();
      this.$['new-session-dialog'].close();
      this.$['launch-button'].disabled = false;
      this.$['launch-button-msg'].textContent = 'Launch';
    }).catch((err) => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      } else if (err && err.title) {
        this.$.notification.text = err.title;
        this.$.notification.show();
      }
      this.$['launch-button'].disabled = false;
      this.$['launch-button-msg'].textContent = 'Launch';
    });
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
      this.$.version.value = this.versions[0];
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
    let lang = this.$['environment'].value;
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
        if (resource_limit['cpu'] == 'Infinity') {
          total_slot['cpu_slot'] = this.resource_info.cpu;
        } else {
          total_slot['cpu_slot'] = resource_limit['cpu'];
        }
      }
      if ('mem' in resource_limit) {
        if (resource_limit['mem'] == 'Infinity') {
          total_slot['mem_slot'] = parseFloat(window.backendaiclient.utils.changeBinaryUnit(this.resource_info.mem, 'g'));
        } else {
          total_slot['mem_slot'] = parseFloat(window.backendaiclient.utils.changeBinaryUnit(resource_limit['mem'], 'g'));
        }
      }
      if ('cuda.device' in resource_limit) {
        if (resource_limit['cuda.device'] == 'Infinity') {
          total_slot['gpu_slot'] = this.resource_info['cuda.device'];
        } else {
          total_slot['gpu_slot'] = resource_limit['cuda.device'];
        }
      }
      if ('cuda.shares' in resource_limit) {
        if (resource_limit['cuda.shares'] == 'Infinity') {
          total_slot['vgpu_slot'] = this.resource_info['cuda.shares'];
        } else {
          total_slot['vgpu_slot'] = resource_limit['cuda.shares'];
        }
      }
      let remaining_slot = {};
      let used_slot = {};
      let resource_remaining = response.keypair_remaining;
      let resource_using = response.keypair_using;
      if ('cpu' in resource_remaining) {
        remaining_slot['cpu_slot'] = resource_remaining['cpu'];
        if ('cpu' in resource_using) {
          used_slot['cpu_slot'] = resource_using['cpu'];
        } else {
          used_slot['cpu_slot'] = 0;
        }
      }
      if ('mem' in resource_remaining) {
        remaining_slot['mem_slot'] = parseFloat(window.backendaiclient.utils.changeBinaryUnit(resource_remaining['mem'], 'g'));
        if ('mem' in resource_using) {
          used_slot['mem_slot'] = parseFloat(window.backendaiclient.utils.changeBinaryUnit(resource_using['mem'], 'g'));
        } else {
          used_slot['mem_slot'] = 0.0;
        }
      }
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
      this.available_slot = remaining_slot;
      this.used_slot_percent = used_slot_percent;
      return this.available_slot;
    });
  }

  updateResourceIndicator() {
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
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
        console.log(this.resource_templates);
      }
    });
  }

  async updateMetric() {
    if (window.backendaiclient == undefined || window.backendaiclient == null) {
      document.addEventListener('backend-ai-connected', () => {
        this.updateMetric();
      }, true);
    } else {
      if (this.$['environment'].value in this.aliases) {
        let currentLang = this.aliases[this.$['environment'].value];
        let currentVersion = this.$['version'].value;
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
          if (item.key === 'cuda.shares' && this.gpu_mode == 'vgpu') {
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
              if (parseInt(mem_metric.max) !== 0 && mem_metric.max !== 'Infinity' && mem_metric.max !== NaN) {
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
          this.$['use-gpu-checkbox'].checked = false;
          this.$['gpu-resource'].disabled = true;
          this.$['gpu-resource'].value = 0;
        } else {
          this.$['use-gpu-checkbox'].checked = true;
          this.$['gpu-resource'].disabled = false;
          this.$['gpu-resource'].value = this.gpu_metric.max;
        }
        // Refresh with resource template
        if (this.resource_templates !== [] && this.resource_templates.length > 0) {
          let resource = this.resource_templates[0];
          this._updateResourceIndicator(resource.cpu, resource.mem, resource.gpu);
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
    this._updateVersions(this.$['environment'].selectedItemLabel);
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
    const button = e.target.closest('mwc-button');
    const cpu = button.cpu;
    const mem = button.mem;
    const gpu = button.gpu;
    this._updateResourceIndicator(cpu, mem, gpu);
    //button.raised = true;
  }

  _updateResourceIndicator(cpu, mem, gpu) {
    this.shadowRoot.querySelector('#cpu-resource').value = cpu;
    this.shadowRoot.querySelector('#ram-resource').value = mem;
    this.shadowRoot.querySelector('#gpu-resource').value = gpu;
  }

  _selectDefaultLanguage() {
    if (window.backendaiclient._config.default_session_environment !== undefined &&
      'default_session_environment' in window.backendaiclient._config &&
      window.backendaiclient._config.default_session_environment != '') {
      this.default_language = window.backendaiclient._config.default_session_environment;
    } else if (this.languages.length != 0) {
      this.default_language = this.languages[0].name;
    } else {
      this.default_language = 'index.docker.io/lablup/ngc-tensorflow';
    }
    return true;
  }

  _selectDefaultVersion(version) {
    return false;
  }

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        paper-button.launch-button {
          width: 100%;
        }

        plastic-material h4 {
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

        span.caption {
          width: 30px;
          padding-left: 10px;
        }

        div.caption {
          width: 100px;
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
          padding: 0;
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

        mwc-button.resource-button {
          --mdc-theme-on-primary: white;
          --mdc-theme-primary: #89A;
          --mdc-theme-on-secondary: white;
          --mdc-theme-secondary: white;
        }

        mwc-button.iron-selected {
          --mdc-theme-on-primary: white;
          --mdc-theme-primary: #e9437a;
          --mdc-theme-on-secondary: white;
          --mdc-theme-secondary: #e9437a;
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <plastic-material class="item" elevation="1">
        <h4 class="horizontal center layout">
          <span>Running</span>
          <div class="layout horizontal center resources wrap">
            <div class="layout vertical start-justified wrap" style="padding-left:15px;">
              <span class="gauge-label">CPUs: [[used_slot.cpu_slot]]/[[total_slot.cpu_slot]]</span>
              <paper-progress id="cpu-usage-bar" value="[[used_slot_percent.cpu_slot]]"></paper-progress>
            </div>
            <div class="layout vertical start-justified wrap" style="padding-left:15px;">
              <span class="gauge-label">RAM: [[used_slot.mem_slot]]GB/[[total_slot.mem_slot]]GB</span>
              <paper-progress id="mem-usage-bar" value="[[used_slot_percent.mem_slot]]"></paper-progress>
            </div>
            <template is="dom-if" if="[[total_slot.gpu_slot]]">
              <div class="layout vertical start-justified wrap" style="padding-left:15px;">
                <span class="gauge-label">GPUs: [[used_slot.gpu_slot]]/[[total_slot.gpu_slot]]</span>
                <paper-progress id="gpu-usage-bar" value="[[used_slot_percent.gpu_slot]]"></paper-progress>
              </div>
            </template>
            <template is="dom-if" if="[[total_slot.vgpu_slot]]">
              <div class="layout vertical start-justified wrap" style="padding-left:15px;">
                <span class="gauge-label">vGPUs: [[used_slot.vgpu_slot]]/[[total_slot.vgpu_slot]]</span>
                <paper-progress id="gpu-usage-bar" value="[[used_slot_percent.vgpu_slot]]"></paper-progress>
              </div>
            </template>
          </div>
          <span class="flex"></span>
          <mwc-button class="fg red" id="launch-session" outlined label="Launch" icon="add"></mwc-button>
        </h4>
        <div>
          <backend-ai-session-list id="running-jobs" condition="running"></backend-ai-session-list>
        </div>
        <h4>Finished</h4>
        <div>
          <backend-ai-session-list id="finished-jobs" condition="finished"></backend-ai-session-list>
        </div>
      </plastic-material>
      <paper-dialog id="new-session-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation"
                    style="padding:0;">
        <plastic-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3 class="horizontal center layout">
            <span>Start a new session</span>
            <div class="flex"></div>
            <paper-icon-button icon="close" class="blue close-button" dialog-dismiss>
              Close
            </paper-icon-button>
          </h3>
          <form id="launch-session-form" onSubmit="this._launchSession()">
            <fieldset>
              <div class="horizontal center layout">
                <paper-dropdown-menu id="environment" label="Environments">
                  <paper-listbox slot="dropdown-content" attr-for-selected="id"
                                 selected="[[default_language]]">
                    <template is="dom-repeat" items="[[ languages ]]">
                      <paper-item id="[[ item.name ]]" label="[[ item.alias ]]">[[ item.alias ]]</paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>
                <paper-dropdown-menu id="version" label="Version">
                  <paper-listbox slot="dropdown-content" selected="0">
                    <template is="dom-repeat" items="[[ versions ]]">
                      <paper-item id="[[ item ]]" label="[[ item ]]">[[ item ]]</paper-item>
                    </template>
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
                  <template is="dom-repeat" items="[[ vfolders ]]">
                    <paper-item value$="[[ item.name ]]">[[ item.name ]]</paper-item>
                  </template>
                </backend-ai-dropdown-menu>
              </div>
            </fieldset>
            <h4>Resource allocation</h4>
            <fieldset style="padding-top:0;">
              <paper-listbox selected="0" class="horizontal center layout"
                             style="width:350px; overflow:scroll;">
                <template is="dom-repeat" items="[[ resource_templates ]]">
                  <mwc-button class="fg red resource-button vertical center start layout" role="option"
                              style="height:140px;min-width:120px;"
                              on-tap="_chooseResourceTemplate"
                              id="[[ item.title ]]-button"
                              cpu="[[ item.cpu ]]"
                              mem="[[ item.mem ]]"
                              gpu="[[ item.gpu ]]"
                              outlined>
                    <div>
                      <h4>[[ item.name ]]</h4>
                      <ul>
                        <li>[[ item.cpu ]] CPU</li>
                        <li>[[ item.mem ]]GB RAM</li>
                        <template is="dom-if" if="[[ !item.gpu ]]">
                          <li>NO GPU</li>
                        </template>
                        <template is="dom-if" if="[[ item.gpu ]]">
                          <li>[[ item.gpu ]] vGPU</li>
                        </template>

                      </ul>
                    </div>
                  </mwc-button>
                </template>
                <template is="dom-if" if="[[isEmpty(resource_templates)]]">
                  <mwc-button class="fg red resource-button vertical center start layout" role="option"
                              style="height:140px;width:250px;"
                              disabled
                              outlined>
                    <div>
                      <h4>No suitable preset</h4>
                      <div>Not enough resource.</div>
                      <div>Use advanced settings to start custom session</div>
                    </div>
                  </mwc-button>
                </template>
              </paper-listbox>
              <div class="horizontal end-justified layout">
                <paper-button class="tiny" id="advanced-resource-settings-button">Advanced settings</paper-button>
              </div>
              <iron-collapse id="advanced-resource-settings">
                <div class="horizontal center layout">
                  <span style="width:30px;">CPU</span>
                  <paper-slider id="cpu-resource" class="cpu"
                                pin snaps expand editable
                                min="[[ cpu_metric.min ]]" max="[[ cpu_metric.max ]]"
                                value="[[ cpu_metric.max ]]"></paper-slider>
                  <span class="caption">Core</span>
                </div>
                <div class="horizontal center layout">
                  <span style="width:30px;">RAM</span>
                  <paper-slider id="ram-resource" class="mem"
                                pin snaps step=0.1 editable
                                min="[[ mem_metric.min ]]" max="[[ mem_metric.max ]]"
                                value="[[ mem_metric.max ]]"></paper-slider>
                  <span class="caption">GB</span>
                </div>
                <div class="horizontal center layout">
                  <span style="width:30px;">GPU</span>
                  <paper-slider id="gpu-resource" class="gpu"
                                pin snaps editable step="[[ gpu_step ]]"
                                min="0.0" max="[[gpu_metric.max]]" value="1.0"></paper-slider>
                  <span class="caption">GPU</span>
                </div>
              </iron-collapse>
              <br/>
              <paper-button class="blue launch-button" type="submit" id="launch-button">
                <iron-icon icon="rowing"></iron-icon>
                <span id="launch-button-msg">Launch</span>
              </paper-button>
            </fieldset>
          </form>
        </plastic-material>
      </paper-dialog>
    `;
  }
}

customElements.define(BackendAiSessionView.is, BackendAiSessionView);
