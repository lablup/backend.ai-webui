/**
 * Backend.AI-job-view 
 */

import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { setPassiveTouchGestures } from '@polymer/polymer/lib/utils/settings';
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
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/animations/scale-up-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';

import './backend-ai-styles.js';
import './backend-ai-job-list.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

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
            value: {
                'TensorFlow': ['1.12', '1.11'],
                'Python': ['3.6']
            }
        },
        aliases: {
            type: Object,
            value: {
                'TensorFlow': 'kernel-python-tensorflow',
                'Python': 'kernel-python',
                'PyTorch': 'kernel-python-pytorch',
                'Chainer': 'kernel-chainer',
                'R': 'kernel-r',
                'Julia': 'kernel-julia',
            }
        },
        versions: {
            type: Array,
            value: ['1.12']
        },
        languages: {
            type: Array,
            /*value: ['TensorFlow','Python', 'PyTorch', 'Chainer', 'R', 'Julia']*/
            value: ['TensorFlow','Python']
        }
    }
  }

  ready() {
    super.ready();
    this.$['launch-session'].addEventListener('tap', this._launchSessionDialog.bind(this));
    this.$['launch-button'].addEventListener('tap', this._newSession.bind(this));
    this.$['environment'].addEventListener('selected-item-label-changed', this.updateLanguage.bind(this));
  }

  updateLanguage() {
      this._updateVersions(this.$['environment'].selectedItemLabel);
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
      console.log(visible);
      if(!visible) { return; }
      // refresh job view
      var event = new CustomEvent("backend-ai-job-refresh", { "detail": this });
      document.dispatchEvent(event);
  }

  _launchSessionDialog() {
    this.$['new-session-dialog'].open();
  }

  _generateKernelIndex(kernel, version) {
    let postfix;
    switch (kernel) {
        case 'TensorFlow':
            postfix = '-py36';
            if (this.$['enable-gpu'].checked) {
                postfix = postfix + '-gpu';
            }
            break;
        case 'Python':
        default:
            postfix = '-ubuntu';
    }
    return this.aliases[kernel] + ':' + version + postfix;
  }

  _newSession() {
    let kernel = this.$['environment'].value;
    let version = this.$['version'].value;
    console.log(kernel);
    console.log(version);
    let kernelName = this._generateKernelIndex(kernel, version);
    console.log(kernelName);
    window.backendaiclient.createKernel(kernelName).then((req) => {
        this.$['running-jobs'].refreshList();
        this.$['new-session-dialog'].close();
    });
  }
  _updateEnvironment() {
      this.languages = Object.keys(this.supports);
      this.versions = this.supports[lang];
  }

  _updateVersions(lang) {
    this.versions = this.supports[lang];
    this.$.version.value = this.versions[0];
  }

  _supportLanguages() {
      return Object.keys(this.supports);
  }
  _supportVersions() {
    let lang = this.$['environment'].value;
    return this.supports[lang];
}

  static get template() {
    return html`
    <style is="custom-style" include="backend-ai-styles iron-flex iron-flex-alignment iron-positioning">
      paper-button.launch-button {
        width: 100%;
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
            <backend-ai-job-list condition="finished"></backend-ai-job-list>
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
                            <template is="dom-repeat" items="{{ languages }}">
                                <paper-item id="{{ item }}" label="{{item}}">{{ item }}</paper-item>
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
                        <paper-checkbox id="enable-gpu">Use GPU</paper-checkbox>
                    </div>
                    <br />
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
