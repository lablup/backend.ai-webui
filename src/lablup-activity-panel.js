import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-material/paper-material';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-styles/color';
import '@polymer/iron-flex-layout/iron-flex-layout';

import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';

class LablupActivityPanel extends PolymerElement {
    static get template() {
        return html`
        <style is="custom-style" include="iron-flex iron-flex-alignment">
            paper-material {
                display: block;
                background: white;
                box-sizing: border-box;
                margin: 16px;
                padding: 0;
                border-radius: 2px;
            }

            paper-material > h4 {
                border-left: 3px solid var(--paper-yellow-400);
                font-size: 14px;
                height: 32px;
                padding: 5px 15px 5px 20px;
                margin: 0 0 10px 0;
                border-bottom: 1px solid #DDD;
                @apply --layout-justified;
                display: flex;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }

            paper-material > div {
                margin: 20px;
                padding-bottom: 20px;
            }

            paper-material > h4 > paper-icon-button {
                display: flex;
            }

            paper-material > h4 > paper-icon-button,
            paper-material > h4 > paper-icon-button #icon {
                width: 15px;
                height: 15px;
                padding:0;
            }
            ul {
                padding-inline-start: 0;
            }
            
        </style>
        <paper-material id="activity" elevation="{{ elevation }}">
            <h4 class="layout flex justified center">{{ title }}<paper-icon-button id="button" icon="close"></paper-icon-button></h4>
            <div>
                <slot name="message"></slot>
            </div>
        </paper-material>
        `;
    }

    static get is() { return 'lablup-activity-panel'; }

    static get properties() {
        return {
            title: {
                type: String
            },
            elevation: {
                type: Number
            },
            message: {
                type: String
            },
            panelId: {
                type: String
            },
            pinned: {
                type: Boolean
            },
            minwidth: {
                type: Number
            },
            maxwidth: {
                type: Number
            },
            width: {
                type: Number,
                value: 280
            },
            horizontalsize: {
                type: String
            },
            marginWidth: {
                type: Number,
                value: 16
            }
        }
    }
    constructor() {
        super();
    }

    ready() {
        super.ready();
        if (this.pinned || this.panelId == undefined) {
            this.shadowRoot.querySelector('h4').removeChild(this.$.button);
        } else {
            this.shadowRoot.querySelector('#button').addEventListener('tap', this._removePanel.bind(this));
        }
        this.shadowRoot.querySelector('paper-material').style.width = this.width+"px";
        if (this.minwidth) {
            this.shadowRoot.querySelector('paper-material').style.minWidth = this.minwidth+"px";
        }
        if (this.maxwidth) {
            this.shadowRoot.querySelector('paper-material').style.minWidth = this.maxwidth+"px";
        }
        if (this.horizontalsize) {
            if (this.horizontalsize == '2x') {
                this.shadowRoot.querySelector('paper-material').style.width = (this.width*2+32)+"px";
            }
            if (this.horizontalsize == '3x') {
                this.shadowRoot.querySelector('paper-material').style.width = (this.width*3+32)+"px";
            }
        }
        this.shadowRoot.querySelector('paper-material').style.margin = this.marginWidth+"px";
    }

    connectedCallback() {
        super.connectedCallback();
    }

    _removePanel() {
        /*  TODO: Generalized this part. New type mixin with Polymer 3.
        this._requestBot.url = "/activity/panel_state/";
        this._requestBot.body = JSON.stringify({"panel_id": this.panelId, "state": "closed"});
        var self = this;

        var req = this._requestBot.generateRequest();
        req.completes.then(function(resp) {
            self.remove();
        }).catch(function(err) {
            console.log(err);
            setNotification(req.response.error_msg);
        });*/
    }
}
customElements.define(LablupActivityPanel.is, LablupActivityPanel);
