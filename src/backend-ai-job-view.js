/**
 * Backend.AI-job-view
 */

import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/typography';
import '@polymer/paper-styles/color';
import '@polymer/paper-material/paper-material';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-image/iron-image';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';

import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-toast/paper-toast';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-slider/paper-slider';
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';

import './backend-ai-styles.js';
import './backend-ai-job-list.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

class BackendAIJobView extends PolymerElement {
  static get is() {
    return 'backend-ai-job-view';
  }

  constructor() {
    super();
    setPassiveTouchGestures(true);
  }

  static get properties() {
    return {
      visible: {
        type: Boolean,
        value: false
      },
      supports: {
        type: Object,
        /*            value: {
                        'TensorFlow': ['1.10', '1.11', '1.12', '2.0'],
                        'Python': ['3.6', '3.7'],
                        'PyTorch': ['0.2', '0.3', '0.4', '1.0'],
                        'Chainer': ['3.2', '4.0'],
                        'R': ['3'],
                        'Julia': ['1.0']
                    }*/
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
          'DIGITS': 'ngc-digits',
          'TensorFlow (NGC)': 'ngc-tensorflow',
          'PyTorch (NGC)': 'ngc-pytorch',
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
      cpu_metric: {
        type: Array,
        value: [1, 2, 3, 4, 8, 16]
      },
      ram_metric: {
        type: Array,
        value: [1, 2, 4, 8, 16]
      },
      gpu_metric: {
        type: Array,
        value: [0, 0.3, 0.6, 1, 1.5, 2]
      },
      images: {
        type: Object,
        value: {}
      }
    }
  }

  ready() {
    super.ready();
    this.$['launch-session'].addEventListener('tap', this._launchSessionDialog.bind(this));
    this.$['launch-button'].addEventListener('tap', this._newSession.bind(this));
    this.$['environment'].addEventListener('selected-item-label-changed', this.updateLanguage.bind(this));
    this._initAliases();
    document.addEventListener('backend-ai-connected', () => {
      this._refreshImageList();
    }, true);

    var cpu_resource = this.$['cpu-resource'];
    this.$['cpu-value'].textContent = cpu_resource.value;
    cpu_resource.addEventListener('value-change', () => {
      this.$['cpu-value'].textContent = cpu_resource.value;
    });
    var ram_resource = this.$['ram-resource'];
    this.$['ram-value'].textContent = ram_resource.value;
    ram_resource.addEventListener('value-change', () => {
      this.$['ram-value'].textContent = ram_resource.value;
    });
    var gpu_resource = this.$['gpu-resource'];
    this.$['gpu-value'].textContent = gpu_resource.value;
    gpu_resource.addEventListener('value-change', () => {
      this.$['gpu-value'].textContent = gpu_resource.value;
      if (gpu_resource.value > 0) {
        this.$['use-gpu-checkbox'].checked = true;
      } else {
        this.$['use-gpu-checkbox'].checked = false;
      }
    });
  }

  updateLanguage() {
    this._updateVersions(this.$['environment'].selectedItemLabel);
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

  static get observers() {
    return [
      '_routeChanged(route.*)',
      '_viewChanged(routeData.view)',
      '_menuChanged(visible)'
    ]
  }

  _routeChanged(changeRecord) {
    if (changeRecord.path === 'path') {
      console.log('Path changed!');
    }
  }

  _viewChanged(view) {
    console.log('View changed!');
    // load data for view
  }

  _menuChanged(visible) {
    if (!visible) {
      this.$['running-jobs'].visible = false;
      this.$['finished-jobs'].visible = false;
      return;
    }
    this.$['running-jobs'].visible = true;
    this.$['finished-jobs'].visible = true;
  }

  _launchSessionDialog() {
    this.$['new-session-dialog'].open();
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
    let config = {};
    config['cpu'] = this.$['cpu-resource'].value;
    config['gpu'] = this.$['gpu-resource'].value;
    config['mem'] = this.$['ram-resource'].value;
    let kernelName = this._generateKernelIndex(kernel, version);
    console.log(kernelName);

    window.backendaiclient.createKernel(kernelName, undefined, config).then((req) => {
      this.$['running-jobs'].refreshList();
      this.$['new-session-dialog'].close();
    });
  }

  _updateEnvironment() {
    //this.languages = Object.keys(this.supports);
    //this.languages.sort();
    let lang = Object.keys(this.supports);
    lang.sort();
    this.languages = [];
    lang.forEach((item, index) => {
      this.languages.push({
        name: item,
        alias: this.aliases[item]
      });
    });
  }

  _updateVersions(lang) {
    this.versions = this.supports[this.aliases[lang]];
    this.versions = this.versions.sort();
    if (this.versions != undefined) {
      this.$.version.value = this.versions[0];
    }
  }

  _supportLanguages() {
    return Object.keys(this.supports);
  }

  _supportVersions() {
    let lang = this.$['environment'].value;
    return this.supports[lang];
  }

  _refreshImageList() {
    let fields = ["name", "tag", "hash"];
    let q, v;
    q = `query {` +
      `  images { ${fields.join(" ")} }` +
      '}';
    v = {};
    window.backendaiclient.gql(q, v).then((response) => {
      this.images = response.images;
      Object.keys(this.images).map((objectKey, index) => {
        var item = this.images[objectKey];
        if (!(item.name in this.supports)) {
          this.supports[item.name] = [item.tag];
          if (item.name in this.aliases) {
            this.languages.push(this.aliases[item.name]);
          } else {
            this.languages.push(item.name);
          }
          console.log(this.languages);
        } else {
          this.supports[item.name].push(item.tag);
        }
      });
      this._updateEnvironment();
    }).catch(err => {
      console.log(err);
      if (err && err.message) {
        this.$.notification.text = err.message;
        this.$.notification.show();
      }
    });
  }

  static get template() {
    // language=HTML
    return html`
      <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
        paper-button.launch-button {
          width: 100%;
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
      </style>
      <paper-toast id="notification" text="" horizontal-align="right"></paper-toast>
      <paper-material class="item" elevation="1">
        <h3 class="paper-material-title">Jobs</h3>
        <h4 class="horizontal center layout">
          <span>Running</span>
          <paper-button id="launch-session" class="fg red">
            <iron-icon icon="add"></iron-icon>
            Launch
          </paper-button>
        </h4>
        <div>
          <backend-ai-job-list id="running-jobs" condition="running"></backend-ai-job-list>
        </div>
        <h4>Finished</h4>
        <div>
          <backend-ai-job-list id="finished-jobs" condition="finished"></backend-ai-job-list>
        </div>
      </paper-material>
      <paper-dialog id="new-session-dialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
        <paper-material elevation="1" class="login-panel intro centered" style="margin: 0;">
          <h3>Start a new session</h3>
          <form id="login-form" onSubmit="this._launchSession()">
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
              <h4>Resource allocation (Working in progress UI)</h4>
              <div class="horizontal center layout">
                <span>CPU</span>
                <div class="horizontal end-justified layout caption">
                  <span class="indicator" id="cpu-value"></span>
                  <span class="caption">Core</span>
                </div>
                <paper-slider id="cpu-resource" pin snaps expand
                              min="1" max="8" value="1" markers="[[ cpu_metric ]]"></paper-slider>
              </div>
              <div class="horizontal center layout">
                <span>RAM</span>
                <div class="horizontal end-justified layout caption">
                  <span class="indicator" id="ram-value"></span>
                  <span class="caption">GB</span>
                </div>
                <paper-slider id="ram-resource" pin snaps
                              min="1" max="32" value="4" markers="[[ ram_metric ]]"></paper-slider>
              </div>
              <div class="horizontal center layout">
                <span>GPU</span>
                <div class="horizontal end-justified layout caption">
                  <span class="indicator" id="gpu-value"></span>
                  <span class="caption">vGPU</span>
                </div>
                <paper-slider id="gpu-resource" pin snaps step=0.1
                              min="0" max="2" markers="{{ gpu_metric }}"></paper-slider>
              </div>
              <br/>
              <paper-button class="blue launch-button" type="submit" id="launch-button">
                <iron-icon icon="rowing"></iron-icon>
                Launch
              </paper-button>
            </fieldset>
          </form>
        </paper-material>
      </paper-dialog>
    `;
  }
}

customElements.define(BackendAIJobView.is, BackendAIJobView);
