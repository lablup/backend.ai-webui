/**
 * Backend.AI-job-view
 */

import {html, PolymerElement} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
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
import './backend-ai-job-list.js';
import {OverlayPatchMixin} from './overlay-patch-mixin.js';
import './components/backend-ai-dropdown-menu';
import '@material/mwc-button';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

class BackendAIJobView extends OverlayPatchMixin(PolymerElement) {
  static get is() {
    return 'backend-ai-job-view';
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
        value: 'gpu'
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
      }
    }
  }

  ready() {
    super.ready();
    this.$['launch-session'].addEventListener('tap', this._launchSessionDialog.bind(this));
    this.$['launch-button'].addEventListener('tap', this._newSession.bind(this));
    this.$['environment'].addEventListener('selected-item-label-changed', this.updateLanguage.bind(this));
    this.$['version'].addEventListener('selected-item-label-changed', this.updateMetric.bind(this));
    this._initAliases();
    var gpu_resource = this.$['gpu-resource'];
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
      if (policyName === 'student') {
        return new Promise(function (resolve, reject) {
          var resource = {
            "cpu": 4,
            "mem": '8g',
            "cuda.shares": 0.25
          };
          var result = {
            keypair_resource_policy: {
              'default_for_unspecified': 'LIMITED',
              'total_resource_slots': JSON.stringify(resource),
              'max_concurrent_sessions': 3,
              'max_containers_per_session': 1
            }
          };
          resolve(result);
        });
      } else {
        return window.backendaiclient.resourcePolicy.get(policyName, ['default_for_unspecified',
          'total_resource_slots',
          'max_concurrent_sessions',
          'max_containers_per_session',
        ]);
      }
    }).then((response) => {
      let resource_policy = response.keypair_resource_policy;
      console.log(resource_policy.default_for_unspecified);
      if (resource_policy.default_for_unspecified === 'UNLIMITED' ||
        resource_policy.default_for_unspecified === 'DefaultForUnspecified.UNLIMITED') {
        this.defaultResourcePolicy = 'UNLIMITED';
      } else {
        this.defaultResourcePolicy = 'LIMITED';
      }
      this.userResourceLimit = JSON.parse(response.keypair_resource_policy.total_resource_slots);
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
    /*
    this.$['cpu-value'].textContent = cpu_resource.value;
    cpu_resource.addEventListener('value-change', () => {
      this.$['cpu-value'].textContent = cpu_resource.value;
    });
    this.$['ram-value'].textContent = ram_resource.value;
    ram_resource.addEventListener('value-change', () => {
      this.$['ram-value'].textContent = ram_resource.value;
    });
    this.$['gpu-value'].textContent = gpu_resource.value;
    */
  }

  _launchSessionDialog() {
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

  _aggregateResourceUse(compute_sessions) {
    let total_slot = {};
    if ('cpu' in this.userResourceLimit) {
      total_slot['cpu_slot'] = this.userResourceLimit['cpu'];
    }
    if ('mem' in this.userResourceLimit) {
      total_slot['mem_slot'] = parseFloat(window.backendaiclient.utils.changeBinaryUnit(this.userResourceLimit['mem'], 'g'));
    }
    if ('cuda.device' in this.userResourceLimit) {
      total_slot['gpu_slot'] = this.userResourceLimit['cuda.device'];
    }
    if ('cuda.shares' in this.userResourceLimit) {
      total_slot['vgpu_slot'] = this.userResourceLimit['cuda.shares'];
    }
    let used_slot = {};
    compute_sessions.forEach((item) => {
      if ('cpu_slot' in item) {
        if ('cpu_slot' in used_slot) {
          used_slot['cpu_slot'] = used_slot['cpu_slot'] + item['cpu_slot'];
        } else {
          used_slot['cpu_slot'] = item['cpu_slot'];
        }
      }
      if ('mem_slot' in item) {
        if ('mem_slot' in used_slot) {
          used_slot['mem_slot'] = used_slot['mem_slot'] + item['mem_slot'];
        } else {
          used_slot['mem_slot'] = item['mem_slot'];
        }
      }
      if ('gpu_slot' in item) {
        if ('gpu_slot' in used_slot) {
          used_slot['gpu_slot'] = used_slot['gpu_slot'] + item['gpu_slot'];
        } else {
          used_slot['gpu_slot'] = item['gpu_slot'];
        }
      }
      if ('vgpu_slot' in item) {
        if ('vgpu_slot' in used_slot) {
          used_slot['vgpu_slot'] = used_slot['vgpu_slot'] + item['vgpu_slot'];
        } else {
          used_slot['vgpu_slot'] = item['vgpu_slot'];
        }
      }
      // Resource minus
    });
    let available_slot = {};
    ['cpu_slot', 'mem_slot', 'gpu_slot', 'vgpu_slot'].forEach((slot) => {
      if (slot in total_slot) {
        if (slot in used_slot) {
          available_slot[slot] = total_slot[slot] - used_slot[slot];
        } else {
          available_slot[slot] = total_slot[slot];
        }
      } else {// TODO: unlimited vs limited.
        console.log(this.defaultResourcePolicy);
        if (this.defaultResourcePolicy === 'UNLIMITED') {
          available_slot[slot] = 100000;
        } else {
          available_slot[slot] = 0;
        }
      }
    });
    console.log(total_slot);
    console.log(available_slot);
    return available_slot;
  }

  updateMetric() {
    if (this.$['environment'].value in this.aliases) {
      let currentLang = this.aliases[this.$['environment'].value];
      let currentVersion = this.$['version'].value;
      let kernelName = currentLang + ':' + currentVersion;
      let currentResource = this.resourceLimits[kernelName];
      let compute_sessions = this.shadowRoot.querySelector('#running-jobs').compute_sessions;
      let available_slot = this._aggregateResourceUse(compute_sessions);
      if (!currentResource) return;
      currentResource.forEach((item) => {
        if (item.key === 'cpu') {
          let cpu_metric = item;
          cpu_metric.min = parseInt(cpu_metric.min);
          if ('cpu' in this.userResourceLimit) {
            if (parseInt(cpu_metric.max) !== 0) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), parseInt(this.userResourceLimit.cpu), available_slot['cpu_slot']);
            } else {
              cpu_metric.max = Math.min(parseInt(this.userResourceLimit.cpu), available_slot['cpu_slot']);
            }
          } else {
            if (parseInt(cpu_metric.max) !== 0) {
              cpu_metric.max = Math.min(parseInt(cpu_metric.max), available_slot['cpu_slot']);
            } else {
              cpu_metric.max = 4;
            }
          }
          if (cpu_metric.min > cpu_metric.max) {
            // TODO: dynamic maximum per user policy
          }
          this.cpu_metric = cpu_metric;
        }

        if (item.key === 'cuda.device') {
          let gpu_metric = item;
          gpu_metric.min = parseInt(gpu_metric.min);
          if ('cuda.device' in this.userResourceLimit) {
            if (parseInt(gpu_metric.max) !== 0) {
              gpu_metric.max = Math.min(parseInt(gpu_metric.max), parseInt(this.userResourceLimit['cuda.device']), available_slot['vgpu_slot']);
            } else {
              gpu_metric.max = Math.min(parseInt(this.userResourceLimit['cuda.device']), available_slot['gpu_slot']);
            }
          } else {
            if (parseInt(gpu_metric.max) !== 0) {
              gpu_metric.max = Math.min(parseInt(gpu_metric.max), available_slot['gpu_slot']);
            } else {
              gpu_metric.max = 0;
            }
          }
          if (gpu_metric.min > gpu_metric.max) {
            // TODO: dynamic maximum per user policy
          }
          this.gpu_metric = gpu_metric;
        }
        if (item.key === 'cuda.shares') {
          let vgpu_metric = item;
          vgpu_metric.min = parseInt(vgpu_metric.min);
          if ('cuda.shares' in this.userResourceLimit) {
            if (parseInt(vgpu_metric.max) !== 0) {
              vgpu_metric.max = Math.min(parseFloat(vgpu_metric.max), parseFloat(this.userResourceLimit['cuda.shares']), available_slot['vgpu_slot']);
            } else {
              vgpu_metric.max = Math.min(parseInt(this.userResourceLimit['cuda.shares']), available_slot['vgpu_slot']);
            }
          } else {
            if (parseInt(vgpu_metric.max) !== 0) {
              vgpu_metric.max = Math.min(parseInt(vgpu_metric.max), available_slot['vgpu_slot']);
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
          mem_metric.min = window.window.backendaiclient.utils.changeBinaryUnit(mem_metric.min, 'g', 'g');
          if (mem_metric.min < 0.1) {
            mem_metric.min = 0.1;
          }
          let image_mem_max = window.window.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g');
          if ('mem' in this.userResourceLimit) {
            let user_mem_max = window.window.backendaiclient.utils.changeBinaryUnit(this.userResourceLimit['mem'], 'g', 'g');
            if (parseInt(image_mem_max) !== 0) {
              mem_metric.max = Math.min(parseFloat(image_mem_max), parseFloat(user_mem_max), available_slot['mem_slot']);
            } else {
              mem_metric.max = parseFloat(user_mem_max);
            }
          } else {
            if (parseInt(mem_metric.max) !== 0) {
              mem_metric.max = Math.min(parseFloat(window.window.backendaiclient.utils.changeBinaryUnit(mem_metric.max, 'g', 'g')), available_slot['mem_slot']);
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

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        paper-button.launch-button {
          width: 100%;
        }

        paper-material h4 {
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

        span.caption {
          width: 30px;
          padding-left: 10px;
        }

        div.caption {
          width: 100px;
        }

        .indicator {
          font-family: monospace;
        }

        backend-ai-dropdown-menu {
          width: 100%;
        }
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <paper-material class="item" elevation="1">
        <h4 class="horizontal center layout">
          <span>Running</span>
          <mwc-button class="fg red" id="launch-session" outlined label="Launch" icon="add"></mwc-button>
        </h4>
        <div>
          <backend-ai-job-list id="running-jobs" condition="running"></backend-ai-job-list>
        </div>
        <h4>Finished</h4>
        <div>
          <backend-ai-job-list id="finished-jobs" condition="finished"></backend-ai-job-list>
        </div>
      </paper-material>
      <paper-dialog id="new-session-dialog" with-backdrop
                    entry-animation="scale-up-animation" exit-animation="fade-out-animation"
                    style="padding:0;">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
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
                  <paper-listbox slot="dropdown-content" selected="0">
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
              <div>
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
            <fieldset>
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
              <br/>
              <paper-button class="blue launch-button" type="submit" id="launch-button">
                <iron-icon icon="rowing"></iron-icon>
                <span id="launch-button-msg">Launch</span>
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
    `;
  }
}

customElements.define(BackendAIJobView.is, BackendAIJobView);
