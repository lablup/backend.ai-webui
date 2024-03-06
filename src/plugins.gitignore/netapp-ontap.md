/\*_
@license
Copyright (c) 2015-2021 Lablup Inc. All rights reserved.
_/
import '../components/backend-ai-dialog';
import { BackendAiStyles } from '../components/backend-ai-general-styles';
import { BackendAIPage } from '../components/backend-ai-page';
import '../components/backend-ai-storage-proxy-list';
import '../components/lablup-activity-panel';
import '../components/lablup-progress-bar';
import '../plastics/lablup-piechart/lablup-piechart';
import {
IronFlex,
IronFlexAlignment,
IronFlexFactors,
IronPositioning,
} from '../plastics/layout/iron-flex-layout-classes';
import '@material/mwc-button/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-icon-button/mwc-icon-button';
import '@material/mwc-icon/mwc-icon';
import '@material/mwc-list/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-switch/mwc-switch';
import '@material/mwc-textfield/mwc-textfield';
import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column';
import '@vaadin/vaadin-template-renderer';
import { css, CSSResultGroup, html, render } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import 'weightless/expansion';

@customElement('netapp-ontap')
export default class NetAppOnTap extends BackendAIPage {
static readonly msg = {
refresh: 'Refresh',
noQoSApplied: 'No QoS Applied',
noQoSToDisplay: "There's no QoS policy applied to this volume.",
notSelectedYet: 'Not Selected Yet',
clickIconFirst:
"Please click the blue icon <mwc-icon style='color:#29B6F6;'>assignment</mwc-icon> in Controls panel of node list.",
sharedCapacity: 'Share performance limits',
endpoint: 'Endpoint',
backendType: 'Backend Type',
resources: 'Resources',
capabilities: 'Capabilities',
control: 'Control',
usage: 'Usage',
updateNow: 'Update Now',
};

@property({ type: Object }) notification = Object();
@property({ type: String }) menuitem = 'NetApp ONTAP';
@property({ type: String }) is = 'netapp-ontap';
@property({ type: String }) permission = 'admin'; // Can be 'user', 'admin' or 'superadmin'.
@property({ type: Boolean }) \_status;
@property({ type: String }) volumeID;
@property({ type: String }) volumeName;
@property({ type: String }) local_tier;
@property({ type: String }) created_at;
@property({ type: String }) volumeStyle;
@property({ type: String }) hostID;
@property({ type: String }) mountPoint;
@property({ type: String }) state;
@property({ type: String }) snapshotPolicyName;
@property({ type: String }) isSnapMirroring;
@property({ type: String }) svmName;
@property({ type: String }) svmID;
@property({ type: Object }) qos;
@property({ type: Object }) currentQoS;
@property({ type: Array }) qosPolicies = Array();
@property({ type: String }) totalCapacity = '0';
@property({ type: String }) totalCapacityUnit = 'GiB';
@property({ type: String }) usingCapacity = '0';
@property({ type: String }) usingCapacityUnit = 'GiB';
@property({ type: Number }) iopsRead = 0;
@property({ type: Number }) iopsWrite = 0;
@property({ type: Number }) readMBPerSec = 0;
@property({ type: Number }) writeMBPerSec = 0;
@property({ type: Number }) ioUsecRead = 0;
@property({ type: Number }) ioUsecWrite = 0;
@property({ type: Array }) securityStyles = ['unix', 'ntfs', 'mixed'];
@property({ type: String }) securityStyle;
@property({ type: String }) exportPolicy;
@property({ type: Object }) \_boundQoSGuaranteeRenderer =
this.qoSGuaranteeRenderer.bind(this);
@property({ type: Object }) \_boundQosLimitGuaranteeRenderer =
this.qoSLimitRenderer.bind(this);
@property({ type: Object }) \_boundQoSPolicyGroupSharingRenderer =
this.qoSPolicyGroupSharingRenderer.bind(this);
@property({ type: Object }) qosPoliciesGrid = Object();
@property({ type: Array }) \_selectedQoSPolicies;
@property({ type: Array }) \_selectedQoSPolicyNames;
@property({ type: Number }) selectedQosPolicyIdx = 0;
@property({ type: Object }) limitUnit = {
space: {
KiB: Math.pow(2, 10),
MiB: Math.pow(2, 20),
GiB: Math.pow(2, 30),
TiB: Math.pow(2, 40),
PiB: Math.pow(2, 50),
},
files: {
Hundred: Math.pow(10, 2),
Thousand: Math.pow(10, 3),
Million: Math.pow(10, 6),
},
};
@property({ type: Object }) spaceLimit = Object();
@property({ type: Object }) fileLimit = Object();
@property({ type: Object }) currentQoSInput = Object();
@query('#ontap-agents') ontapAgents;

constructor() {
super();
this.\_selectedQoSPolicies = [];
}

static get styles(): CSSResultGroup {
return [
BackendAiStyles,
IronFlex,
IronFlexAlignment,
IronFlexFactors,
IronPositioning,
// language=CSS
css`
backend-ai-storage-proxy-list {
--list-height: 290px;
}

        backend-ai-dialog {
          --component-width: 375px;
        }

        backend-ai-dialog#qos-detail-dialog {
          --component-padding: 0;
        }

        .border-bottom-enabled {
          border-bottom: 0.1px solid rgb(220, 220, 220);
        }

        .small-padding {
          padding: 10px;
        }

        h4.limit {
          width: 50%;
        }

        h4.config {
          min-width: 150px;
        }

        h4.description {
          margin: 0 0 0 14px;
        }

        mwc-icon.active {
          color: var(--paper-green-400);
        }

        mwc-list {
          --mdc-list-vertical-padding: 0px;
          --mdc-list-side-padding: 10px;
        }

        mwc-list-item {
          --mdc-typography-body2-font-size: 0.7rem;
        }

        mwc-textfield {
          width: 100%;
          --mdc-theme-primary: #242424;
          --mdc-text-field-fill-color: transparent;
        }

        mwc-textfield.space,
        mwc-textfield.files {
          width: 50%;
        }

        mwc-textfield.two-col {
          width: 45%;
        }

        mwc-button#update-now-btn {
          margin-right: 7px;
        }

        .no-margin {
          margin: 0px;
        }

        span.unit {
          color: #646464;
          font-size: 0.6rem;
        }

        span.unit.value {
          font-size: 0.85rem;
          margin-right: 0.5rem;
        }

        vaadin-grid {
          border: 0 !important;
        }

        vaadin-grid#qos-policy-groups {
          max-height: 220px;
        }

        wl-expansion {
          --font-family-serif: var(--general-font-family);
          --expansion-elevation: 0;
          --expansion-elevation-open: 0;
          --expansion-elevation-hover: 0;
          --expansion-header-padding: 16px;
          --expansion-content-padding: 0;
          --expansion-margin-open: 0;
        }

        wl-expansion span[slot='title'] {
          font-size: 1.2rem;
          color: rgb(64, 64, 64);
        }

        @media screen and (max-width: 899px) {
          .end-justified-area {
            -ms-flex-pack: flex-end !important;
            -webkit-justify-content: flex-end !important;
            justify-content: flex-end !important;
          }
        }
      `,
    ];

}

firstUpdated() {
console.log('ontap plugin loaded.');
this.notification = globalThis.lablupNotification;
this.\_viewStateChanged(this.active);
this.qosPoliciesGrid = this.shadowRoot.querySelector(
'vaadin-grid#qos-policy-groups',
);
document.addEventListener(
'backend-ai-selected-storage-proxy',
(e: any) => {
this.hostID = e.detail;
this.\_readStorageProxyInformation(this.hostID);
this.\_readStorageProxyUsageInformation(this.hostID);
},
true,
);
this.ontapAgents.addEventListener(
'backend-ai-storage-proxy-updated',
() => {
// path adjustment (volume + qtree)
this.ontapAgents?.storages.forEach((storage) => {
const hardware_metadata = JSON.parse(storage.hardware_metadata);
const metadata = hardware_metadata.metadata;
if (metadata) {
const qtreePath = metadata.path.split('/').pop();
storage.path = storage.path + '/' + qtreePath;
}
});
if (this.hostID) {
this.\_readStorageProxyInformation(this.hostID);
this.\_readStorageProxyUsageInformation(this.hostID);
}
},
);
// Tricks to close expansion if window size changes
globalThis.addEventListener('resize', () => {
document.body.dispatchEvent(new Event('click'));
});
}

connectedCallback() {
super.connectedCallback();
}

attributeChangedCallback(name, oldval, newval) {}

/\*\*

- Change agent's backend.ai running state.
-
- @param {Boolean} active
  \*/
  async \_viewStateChanged(active: Boolean) {
  await this.updateComplete;
  if (active === false) {
  this.ontapAgents.active = false;
  this.\_status = 'inactive';
  this.\_disableEnterKey();
  return;
  }
  this.ontapAgents.active = true;
  this.\_status = 'active';
  this.\_disableEnterKey();
  }

\_getQosPolicyLists(host) {
globalThis.backendaiclient.storageproxy
.detail(host, ['hardware_metadata'])
.then((response) => {
let info = response.storage_volume;
//let performance_metric = JSON.parse(info.performance_metric);
let hardware_metadata = JSON.parse(info.hardware_metadata);
this.qosPolicies = hardware_metadata.metadata?.qos_policies
? JSON.parse(hardware_metadata.metadata?.qos_policies)
: null;
this.qos = hardware_metadata.metadata?.qos
? JSON.parse(hardware_metadata.metadata.qos)
: null;
});
this.qosPoliciesGrid.clearCache();
}

\_readStorageProxyInformation(host) {
globalThis.backendaiclient.storageproxy
.detail(host, [
'id',
'backend',
'capabilities',
'path',
'fsprefix',
'hardware_metadata',
'performance_metric',
])
.then((response) => {
// TODO: we need to implement hardware_metric part on storage proxy agent, read the information and match to UI
let info = response.storage_volume;
//let performance_metric = JSON.parse(info.performance_metric);
let hardware_metadata = JSON.parse(info.hardware_metadata);
const qtreePath = hardware_metadata.metadata.path.split('/').pop();
this.\_getQuotaSetting(hardware_metadata.metadata.quota);
this.mountPoint = info.path + '/' + qtreePath; // mixin with volume path and qtree path
this.hostID = info.id;
this.volumeID = hardware_metadata.metadata.id;
this.volumeName = hardware_metadata.metadata.name;
this.volumeStyle = hardware_metadata.metadata.style;
this.local_tier = hardware_metadata.metadata.local_tier;
this.created_at = this.\_humanReadableDate(
hardware_metadata.metadata.create_time,
);
this.state = hardware_metadata.metadata.state;
this.securityStyle = hardware_metadata.metadata.security_style;
this.snapshotPolicyName = hardware_metadata.metadata.snapshot_policy;
this.isSnapMirroring =
hardware_metadata.metadata.snapmirroring?.toString() ?? 'False';
this.exportPolicy = hardware_metadata.metadata.export_policy;
this.svmName = hardware_metadata.metadata.svm_name;
this.svmID = hardware_metadata.metadata.svm_id;
this.qos = hardware_metadata.metadata?.qos
? JSON.parse(hardware_metadata.metadata.qos)
: null;
this.qosPolicies = hardware_metadata.metadata?.qos_policies
? JSON.parse(hardware_metadata.metadata?.qos_policies)
: null;
/_this.iopsRead = performance_metric.iops_read;
this.iopsWrite = performance_metric.iops_write;
this.readMBPerSec = this.\_bytesToMiB(performance_metric.io_bytes_read);
this.writeMBPerSec = this.\_bytesToMiB(performance_metric.io_bytes_write);
this.ioUsecRead = performance_metric.io_usec_read;
this.ioUsecWrite = performance_metric.io_usec_write;_/
});
}

\_readPerformanceInformation(host, refreshUsageInformation = false) {
if (host) {
globalThis.backendaiclient.storageproxy
.detail(host, ['id', 'performance_metric'])
.then((response) => {
let info = response.storage_volume;
let performance_metric = JSON.parse(info.performance_metric);
this.iopsRead = performance_metric.iops_read;
this.iopsWrite = performance_metric.iops_write;
this.readMBPerSec = parseFloat(
this.\_bytesToMiB(performance_metric.io_bytes_read),
);
this.writeMBPerSec = parseFloat(
this.\_bytesToMiB(performance_metric.io_bytes_write),
);
this.ioUsecRead = performance_metric.io_usec_read;
this.ioUsecWrite = performance_metric.io_usec_write;
})
.then(() => {
this.notification.text = 'Performance information read.';
this.notification.show(true);
});
if (refreshUsageInformation && this.hostID) {
this.\_readStorageProxyUsageInformation(this.hostID);
}
} else {
this.\_showClickControlsPanelMsg();
}
}

/\*\*

- Convert the value byte to MB.
-
- @param {number} value
- @return {number} converted value from byte to MB.
  _/
  \_bytesToMiB(value) {
  return Number(value / (1024 _ 1024)).toFixed(1);
  }

/\*\*

- Returns bytes with human readable unit and value
-
- @param {number} bytes
- @param {number} decimals
- @returns {string} converted value with unit
  \*/
  \_humanReadableFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = Math.pow(2, 10);
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  i = i < 0 ? 0 : i; // avoid negative value
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

\_showClickControlsPanelMsg() {
this.notification.text = NetAppOnTap.msg.clickIconFirst;
this.notification.show(true);
}

\_readStorageProxyUsageInformation(host) {
globalThis.backendaiclient.storageproxy
.detail(host, ['id', 'usage'])
.then((response) => {
let info = response.storage_volume;
let usage = JSON.parse(info.usage);
let totalCapacityBytes = parseInt(usage.capacity_bytes);
let usingCapacityBytes = parseInt(usage.used_bytes);

        [this.totalCapacity, this.totalCapacityUnit] =
          this._humanReadableFileSize(totalCapacityBytes).split(' ');
        [this.usingCapacity, this.usingCapacityUnit] =
          this._humanReadableFileSize(usingCapacityBytes).split(' ');

        //this.shadowRoot.querySelector('#statistics-usage-chart').requestUpdate();
      });

}

/\*\*

- Convert start date to human readable date.
-
- @param {Date} start date
- @return {string} Human-readable date
  \*/
  \_humanReadableDate(start) {
  const d = new Date(start);
  return d.toLocaleString();
  }

/\*\*

-
- @param url - page to redirect from the current page.
  \*/
  \_openConsole(url) {
  // window.location.href = url;
  window.open(url);
  }

openDialog(id) {
this.shadowRoot.querySelector('#' + id).show();
}

closeDialog(id) {
this.shadowRoot.querySelector('#' + id).hide();
}

\_disableEnterKey() {
this.shadowRoot.querySelectorAll('wl-expansion').forEach((element) => {
element.onKeyDown = (e) => {
const enterKey = 13;
if (e.keyCode === enterKey) {
e.preventDefault();
}
};
});
}

/\*\*

- If value includes unlimited contents, mark as unlimited.
-
- @param {string} value - string value
- @return {string} ∞ when value contains -, 0, 'Unlimited', Infinity, 'Infinity'
  \*/
  \_markIfUnlimited(value) {
  if (['-', 0, 'Unlimited', Infinity, 'Infinity'].includes(value)) {
  return '∞';
  } else {
  return value;
  }
  }

/\*\*

- Render an index.
-
-
-
- @param {DOMelement} root
- @param {object} column (<vaadin-grid-column> element)
- @param {object} rowData
  \*/
  \_indexRenderer(root, column, rowData) {
  const idx = rowData.index + 1;
  render(
  html`       <div>${idx}</div>
    `,
  root,
  );
  }

/\*\*

- Render minimum throughput about - iops, mbps.
-
- @param {Element} root - the row details content DOM element
- @param {Element} column - the column element that controls the state of the host element
- @param {Object} rowData - the object with the properties related with the rendered item
- \*/
  qoSGuaranteeRenderer(root, column?, rowData?) {
  render(
  // language=HTML
  html`       <div class="vertical center-justified wrap layout">
        <div class="horizontal layout wrap center">
          <span class="unit value">
            ${this._markIfUnlimited(rowData.item?.fixed?.min_throughput_mbps)}
          </span>
          <span class="unit">MB/s</span>
        </div>
        <div class="horizontal layout wrap center">
          <span class="unit value">
            ${this._markIfUnlimited(rowData.item?.fixed?.min_throughput_iops)}
          </span>
          <span class="unit">IOPS</span>
        </div>
      </div>
    `,
  root,
  );
  }

/\*\*

- Render maximum throughput about - iops, mbps.
-
- @param {Element} root - the row details content DOM element
- @param {Element} column - the column element that controls the state of the host element
- @param {Object} rowData - the object with the properties related with the rendered item
  \*/
  qoSLimitRenderer(root, column?, rowData?) {
  render(
  // language=HTML
  html`       <div class="vertical center-justified wrap layout">
        <div class="horizontal layout wrap center">
          <span class="unit value">
            ${this._markIfUnlimited(rowData.item?.fixed?.max_throughput_mbps)}
          </span>
          <span class="unit">MB/s</span>
        </div>
        <div class="horizontal layout wrap center">
          <span class="unit value">
            ${this._markIfUnlimited(rowData.item?.fixed?.max_throughput_iops)}
          </span>
          <span class="unit">IOPS</span>
        </div>
      </div>
    `,
  root,
  );
  }

/\*\*

- Render whether the qos policy group sharing enabled or not
-
- @param {Element} root - the row details content DOM element
- @param {Element} column - the column element that controls the state of the host element
- @param {Object} rowData - the object with the properties related with the rendered item
  \*/
  qoSPolicyGroupSharingRenderer(root, column?, rowData?) {
  render(
  // language=HTML
  html`
      <div class="horizontal layout wrap center">
        <span>
          ${rowData.item?.fixed?.capacity_shared
            ? html`
  <mwc-icon class="fg green">check_circle</mwc-icon>
  `
            : html`
  <mwc-icon class="fg red">block</mwc-icon>
  `}
        </span>
      </div>
    `,
  root,
  );
  }

\_humanReadableSpaceSize(size) {
if (size <= 0) {
// return default value
return {
rawValue: 0,
value: 0,
unit: 'KiB',
};
}
let i = Math.floor(Math.log(size) / Math.log(1024));
return {
rawValue: size,
value: (size / Math.pow(1024, i)) \* 1,
unit: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'][i],
};
}

\_humanReadableFileCount(numFiles) {
let divider;
let unit = '';
if (numFiles >= this.limitUnit.files.Million) {
divider = this.limitUnit.files.Million;
unit = 'Million';
} else if (numFiles >= this.limitUnit.files.Thousand) {
divider = this.limitUnit.files.Thousand;
unit = 'Thousand';
} else {
divider = this.limitUnit.files.Hundred;
unit = 'Hundred';
}
return {
rawValue: numFiles,
value: parseInt((numFiles / divider).toFixed(1).replace(/\.0$/, '')),
unit: unit,
};
}

/\*\*

- Get Quota configuration according to current configured quota in qtree
  \*/
  \_getQuotaSetting(rawQuota) {
  const quota = rawQuota ? JSON.parse(rawQuota) : {};
  const spaceHardLimit = quota?.space?.hard_limit ?? 0;
  const spaceSoftLimit = quota?.space?.soft_limit ?? 0;
  const filesHardLimit = quota?.files?.hard_limit ?? 0;
  const filesSoftLimit = quota?.files?.soft_limit ?? 0;
  this.spaceLimit = {
  hard: this.\_humanReadableSpaceSize(spaceHardLimit),
  soft: this.\_humanReadableSpaceSize(spaceSoftLimit),
  };
  this.fileLimit = {
  hard: this.\_humanReadableFileCount(filesHardLimit),
  soft: this.\_humanReadableFileCount(filesSoftLimit),
  };
  }

\_checkQoSPoliciesVisibility() {
if (this.hostID) {
this.\_getQosPolicyLists(this.hostID);
} else {
this.\_showClickControlsPanelMsg();
}
}

/\*\*

- Open the Qtree and Quota configuration dialog
  \*/
  \_openQtreeQuotaConfigurationDialog() {
  // show current qtree name whether it has been erased or not
  const qtreeNameEl = this.shadowRoot.querySelector('#qtree-name');
  qtreeNameEl.value = this.volumeName;
  if (this.hostID) {
  this.openDialog('qtree-quota-description');
  } else {
  this.\_showClickControlsPanelMsg();
  }
  }

/\*\*

- Open the selectQosDialog of current qos policy
  \*/
  \_openQoSDetailDialog() {
  this.currentQoS = this.qosPolicies?.filter(
  (qos) => this.qos.name === qos.name,
  );
  if (this.currentQoS.length > 0) {
  this.openDialog('qos-detail-dialog');
  this.\_displayCurrentQoSPolicy();
  } else {
  this.notification.text = NetAppOnTap.msg.noQoSToDisplay;
  this.notification.show();
  }
  }

/\*\*

- Display Current QoS of the selected volume
  \*/
  \_displayCurrentQoSPolicy() {
  const rawQos = this.qosPolicies.filter(
  (item) => this.qos.uuid === item.uuid,
  );
  this.shadowRoot.querySelector('#detail-guarantee-iops').value =
  rawQos[0].fixed.min_throughput_iops ?? 0;
  this.shadowRoot.querySelector('#detail-guarantee-mbps').value =
  rawQos[0].fixed.min_throughput_mbps ?? 0;
  this.shadowRoot.querySelector('#detail-limit-iops').value =
  rawQos[0].fixed.max_throughput_iops ?? 0;
  this.shadowRoot.querySelector('#detail-limit-mbps').value =
  rawQos[0].fixed.max_throughput_mbps ?? 0;
  this.shadowRoot.querySelector('#sharing-switch').selected =
  rawQos[0].fixed.capacity_shared ?? false;
  }

async \_refreshOntapAgents() {
await this.ontapAgents.\_loadStorageProxyList();
}

render() {
// language=HTML
return html`
<div class="horizontal wrap layout item">
<lablup-activity-panel
          title="NetApp OnTap Nodes"
          elevation="1"
          height="350"
          narrow
          horizontalsize="2x"
        >
<div slot="message">
<backend-ai-storage-proxy-list
filter="backend:netapp"
id="ontap-agents"
condition="running"
defaultDescription=${JSON.stringify(NetAppOnTap.msg)}
              ?active="${this.\_status === 'active'}" ></backend-ai-storage-proxy-list>
</div>
</lablup-activity-panel>

        <lablup-activity-panel
          title="Overview"
          elevation="1"
          height="350"
          narrow
        >
          <div slot="message">
            <mwc-list>
              <mwc-list-item twoline graphic="avatar" hasMeta>
                <mwc-icon slot="graphic">label</mwc-icon>
                <span>
                  ${this.volumeName ?? NetAppOnTap.msg.notSelectedYet}
                </span>
                <mwc-icon
                  slot="meta"
                  @click="${() => this._openQtreeQuotaConfigurationDialog()}}"
                >
                  more_horiz
                </mwc-icon>
                <span slot="secondary">Qtree Name</span>
              </mwc-list-item>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">loyalty</mwc-icon>
                <span class="netapp-id">
                  ${this.volumeID ?? NetAppOnTap.msg.notSelectedYet}
                </span>
                <span slot="secondary">Volume ID</span>
              </mwc-list-item>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">storage</mwc-icon>
                <span>
                  ${this.local_tier ?? NetAppOnTap.msg.notSelectedYet}
                </span>
                <span slot="secondary">LOCAL TIER</span>
              </mwc-list-item>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">schedule</mwc-icon>
                <span>
                  ${this.created_at ?? NetAppOnTap.msg.notSelectedYet}
                </span>
                <span slot="secondary">Created time</span>
              </mwc-list-item>
            </mwc-list>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel
          title="Configuration"
          elevation="1"
          height="350"
          narrow
        >
          <div slot="message">
            <mwc-list>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">loyalty</mwc-icon>
                <span>${this.hostID ?? NetAppOnTap.msg.notSelectedYet}</span>
                <span slot="secondary">Storage Proxy ID</span>
              </mwc-list-item>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">settings_input_component</mwc-icon>
                <span>
                  ${this.mountPoint ?? NetAppOnTap.msg.notSelectedYet}
                </span>
                <span slot="secondary">Mount point</span>
              </mwc-list-item>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">info</mwc-icon>
                <span>
                  ${this.volumeStyle ?? NetAppOnTap.msg.notSelectedYet}
                </span>
                <span slot="secondary">Style</span>
              </mwc-list-item>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon
                  slot="graphic"
                  class="${this.state === 'online' ? 'active' : ''}"
                >
                  ${this.state === 'online'
                    ? html`
                        check_circle_outline
                      `
                    : html`
                        pending
                      `}
                </mwc-icon>
                <span>${this.state ?? NetAppOnTap.msg.notSelectedYet}</span>
                <span slot="secondary">Current State</span>
              </mwc-list-item>
            </mwc-list>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel title="Statistics" elevation="1" height="350">
          <div slot="message">
            <div class="horizontal center wrap layout">
              <div class="vertical center center-justified layout">
                <h3>Usage</h3>
                <lablup-piechart
                  id="statistics-usage-chart"
                  size="150"
                  currentNumber="${this.usingCapacity ?? 0}"
                  chartFontSize="0.2"
                  maxNumber="${this.totalCapacity}"
                  unit="${this.usingCapacityUnit}"
                ></lablup-piechart>
              </div>
              <mwc-list>
                <mwc-list-item twoline graphic="avatar">
                  <mwc-icon slot="graphic">storage</mwc-icon>
                  <span>
                    ${this.totalCapacity + ' ' + this.totalCapacityUnit}
                  </span>
                  <span slot="secondary">Total capacity</span>
                </mwc-list-item>
                <mwc-list-item twoline graphic="avatar">
                  <mwc-icon slot="graphic">insert_drive_file</mwc-icon>
                  <span>
                    ${this.usingCapacity + ' ' + this.usingCapacityUnit}
                  </span>
                  <span slot="secondary">is being used</span>
                </mwc-list-item>
              </mwc-list>
            </div>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel
          title="Performance (Current)"
          elevation="1"
          height="350"
          narrow
        >
          <div slot="message">
            <mwc-list>
              <mwc-list-item class="has-meta" twoline graphic="avatar" hasMeta>
                <mwc-icon slot="graphic">label</mwc-icon>
                <span>${this.qos?.name ?? NetAppOnTap.msg.noQoSApplied}</span>
                <span slot="secondary">QoS Policy Group Name</span>
                <mwc-icon
                  slot="meta"
                  @click="${() => this._openQoSDetailDialog()}"
                >
                  more_horiz
                </mwc-icon>
              </mwc-list-item>
            </mwc-list>
            <div style="margin:20px;">
              <div class="horizontal center center-justified layout">
                <div style="width: 60px;font-size:14px;">IOPS</div>
                <div class="vertical start center-justified layout">
                  <div class="horizontal start layout">
                    <span style="width:50px;">READ</span>
                    <lablup-progress-bar
                      class="start"
                      progress="${this.qos?.max_throughput_iops
                        ? (this.iopsRead / this.qos.max_throughput_iops) * 100
                        : this.iopsRead > 0
                          ? 100
                          : 0}"
                      description="${this.iopsRead}/s"
                    ></lablup-progress-bar>
                  </div>
                  <div class="horizontal start layout">
                    <span style="width:50px;">WRITE</span>
                    <lablup-progress-bar
                      class="end"
                      progress="${this.qos?.max_throughput_iops
                        ? (this.iopsRead / this.qos.max_throughput_iops) * 100
                        : this.iopsRead > 0
                          ? 100
                          : 0}"
                      description="${this.iopsWrite}/s"
                    ></lablup-progress-bar>
                  </div>
                </div>
              </div>
              <div class="horizontal center center-justified layout">
                <div style="width: 60px;font-size:14px;">Traffic</div>
                <div class="vertical start center-justified layout">
                  <div class="horizontal start layout">
                    <span style="width:50px;">READ</span>
                    <lablup-progress-bar
                      class="start"
                      progress="${this.qos?.max_throughput_mbps
                        ? (this.readMBPerSec / this.qos.max_throughput_mbps) *
                          100
                        : this.readMBPerSec > 0
                          ? 100
                          : 0}"
                      description="${this.readMBPerSec}MB/s"
                    ></lablup-progress-bar>
                  </div>
                  <div class="horizontal start layout">
                    <span style="width:50px;">WRITE</span>
                    <lablup-progress-bar
                      class="end"
                      progress="${this.qos?.max_throughput_mbps
                        ? (this.writeMBPerSec / this.qos.max_throughput_mbps) *
                          100
                        : this.writeMBPerSec > 0
                          ? 100
                          : 0}"
                      description="${this.writeMBPerSec}MB/s"
                    ></lablup-progress-bar>
                  </div>
                </div>
              </div>
              <div class="horizontal center center-justified layout">
                <div style="width: 60px;font-size:14px;">Per Op.</div>
                <div class="vertical start center-justified layout">
                  <div class="horizontal start layout">
                    <span style="width:50px;">READ</span>
                    <lablup-progress-bar
                      class="start"
                      progress="${this.qos?.max_throughput_iops
                        ? (this.ioUsecRead / this.qos.max_throughput_iops) * 100
                        : this.ioUsecRead > 0
                          ? 100
                          : 0}"
                      description="${this.ioUsecRead}usec/ops"
                    ></lablup-progress-bar>
                  </div>
                  <div class="horizontal start layout">
                    <span style="width:50px;">WRITE</span>
                    <lablup-progress-bar
                      class="end"
                      progress="${this.qos?.max_throughput_iops
                        ? (this.ioUsecRead / this.qos.max_throughput_iops) * 100
                        : this.ioUsecRead > 0
                          ? 100
                          : 0}"
                      description="${this.ioUsecWrite}usec/ops"
                    ></lablup-progress-bar>
                  </div>
                </div>
              </div>
              <div class="horizontal end-justified layout end-justified-area">
                <mwc-button
                  id="update-now-btn"
                  unelevated
                  @click="${() =>
                    this._readPerformanceInformation(this.hostID)}"
                >
                  ${NetAppOnTap.msg.updateNow}
                </mwc-button>
              </div>
            </div>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel
          title="QoS Policy Groups"
          elevation="1"
          height="350"
          narrow
          horizontalsize="2x"
          scrollableY
        >
          <div slot="message" class="vertical layout">
            <div
              class="horizontal layout border-bottom-enabled small-padding end-justified end-justified-area"
            >
              <mwc-button
                unelevated
                icon="refresh"
                @click="${() => this._checkQoSPoliciesVisibility()}"
              >
                <span>${NetAppOnTap.msg.refresh}</span>
              </mwc-button>
            </div>
            <vaadin-grid
              theme="row-stripes colume-borders compact"
              id="qos-policy-groups"
              aria-label="qos-policy-groups"
              height-by-rows
              .items="${this.qosPolicies ?? null}"
            >
              <vaadin-grid-column
                width="40px"
                flex-grow="0"
                header="#"
                text-align="center"
                .renderer="${this._indexRenderer}"
              ></vaadin-grid-column>
              <vaadin-grid-column
                flex-grow="1"
                auto-width
                resizable
                header="Policy Name"
              >
                <template>
                  <span>[[item.name]]</span>
                </template>
              </vaadin-grid-column>
              <vaadin-grid-column
                flex-grow="1"
                auto-width
                resizable
                header="Guarantee"
                .renderer="${this._boundQoSGuaranteeRenderer}"
              ></vaadin-grid-column>
              <vaadin-grid-column
                flex-grow="1"
                auto-width
                resizable
                header="Limit"
                .renderer="${this._boundQosLimitGuaranteeRenderer}"
              ></vaadin-grid-column>
              <vaadin-grid-column
                flex-grow="0"
                width="100px"
                resizable
                header="Shared"
                .renderer="${this._boundQoSPolicyGroupSharingRenderer}"
              ></vaadin-grid-column>
            </vaadin-grid>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel title="SVM" elevation="1" height="350" narrow>
          <div slot="message">
            <mwc-list>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">label</mwc-icon>
                <span>${this.svmName ?? NetAppOnTap.msg.notSelectedYet}</span>
                <span slot="secondary">Name</span>
              </mwc-list-item>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">loyalty</mwc-icon>
                <span class="netapp-id">
                  ${this.svmID ?? NetAppOnTap.msg.notSelectedYet}
                </span>
                <span slot="secondary">ID</span>
              </mwc-list-item>
            </mwc-list>
          </div>
        </lablup-activity-panel>
        <lablup-activity-panel
          title="Snapshot Info"
          elevation="1"
          height="350"
          narrow
        >
          <div slot="message">
            <mwc-list>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">label</mwc-icon>
                <span>
                  ${this.snapshotPolicyName ?? NetAppOnTap.msg.notSelectedYet}
                </span>
                <span slot="secondary">Policy Name</span>
              </mwc-list-item>
              <mwc-list-item twoline graphic="avatar">
                <mwc-icon slot="graphic">storage</mwc-icon>
                <span>
                  ${this.isSnapMirroring ?? NetAppOnTap.msg.notSelectedYet}
                </span>
                <span slot="secondary">Snap mirroring</span>
              </mwc-list-item>
            </mwc-list>
          </div>
        </lablup-activity-panel>
        <backend-ai-dialog
          id="qtree-quota-description"
          fixed
          backdrop
          persistent
          narrowLayout
        >
          <span slot="title">Quota rule and Qtree Settings Description</span>
          <div slot="content" class="vertical layout" style="padding-top:0;">
            <wl-expansion class="quota" name="quota-qtree-setting" open>
              <span slot="title">Quota Rule</span>
              <h4 class="description">Space Limit</h4>
              <div class="border-bottom-enabled"></div>
              <div class="horizontal layout flex justified distancing">
                <h4 class="limit">Hard Limit</h4>
                <mwc-textfield
                  class="space"
                  id="space-hard-limit"
                  value="${this._markIfUnlimited(this.spaceLimit.hard?.value)}"
                  disabled
                  suffix="${this.spaceLimit.hard?.value > 0
                    ? this.spaceLimit.hard?.unit
                    : ''}"
                ></mwc-textfield>
              </div>
              <div class="horizontal layout flex justified distancing">
                <h4 class="limit">Soft Limit</h4>
                <mwc-textfield
                  class="space"
                  id="space-soft-limit"
                  value="${this._markIfUnlimited(this.spaceLimit.soft?.value)}"
                  disabled
                  suffix="${this.spaceLimit.soft?.value > 0
                    ? this.spaceLimit.soft?.unit
                    : ''}"
                ></mwc-textfield>
              </div>
              <h4 class="description">File Limit</h4>
              <div class="border-bottom-enabled"></div>

              <div class="horizontal layout flex justified distancing">
                <h4 class="limit">Hard Limit</h4>
                <mwc-textfield
                  class="files"
                  id="files-hard-limit"
                  value="${this._markIfUnlimited(this.fileLimit.hard?.value)}"
                  disabled
                  suffix="${this.fileLimit.soft?.value > 0
                    ? this.fileLimit.hard?.unit
                    : ''}"
                ></mwc-textfield>
              </div>
              <div class="horizontal layout flex justified distancing">
                <h4 class="limit">Soft Limit</h4>
                <mwc-textfield
                  class="files"
                  id="files-soft-limit"
                  value="${this._markIfUnlimited(this.fileLimit.soft?.value)}"
                  disabled
                  suffix="${this.fileLimit.soft?.value > 0
                    ? this.fileLimit.soft?.unit
                    : ''}"
                ></mwc-textfield>
              </div>
            </wl-expansion>
            <wl-expansion class="qtree" name="quota-qtree-setting">
              <span slot="title">Qtree Settings</span>
              <div class="vertical layout">
                <div class="horizontal layout flex justified distancing">
                  <h4 class="config">Qtree Name</h4>
                  <mwc-textfield
                    id="qtree-name"
                    pattern="^[a-zA-Z0-9._-]*$"
                    value="${this.volumeName}"
                    disabled
                  ></mwc-textfield>
                </div>
                <div class="horizontal layout flex justified distancing">
                  <h4 class="config">Security Style</h4>
                  <mwc-textfield
                    value="${this.securityStyle}"
                    disabled
                  ></mwc-textfield>
                </div>
                <div class="horizontal layout flex justified distancing">
                  <h4 class="config">Export Policy</h4>
                  <mwc-textfield
                    value="${this.exportPolicy}"
                    disabled
                  ></mwc-textfield>
                </div>
              </div>
            </wl-expansion>
          </div>
        </backend-ai-dialog>
        <backend-ai-dialog id="qos-detail-dialog" fixed backdrop>
          <span slot="title">QoS Policy Description</span>
          <div slot="content" class="vertical layout">
            <div class="horizontal layout flex distancing">
              <h4 class="config">Current Qos Policy</h4>
              <mwc-textfield
                id="current-qos-name"
                disabled
                value="${this.qos?.name ?? ''}"
              ></mwc-textfield>
            </div>
            <h4 class="description">Guarantee</h4>
            <div class="border-bottom-enabled"></div>
            <div class="horizontal layout flex justified distancing">
              <mwc-textfield
                label="IOPS"
                class="two-col"
                id="detail-guarantee-iops"
                type="number"
                min="0"
                placeholder="Unlimited"
                disabled
              ></mwc-textfield>
              <mwc-textfield
                label="MB/S"
                class="two-col"
                id="detail-guarantee-mbps"
                type="number"
                min="0"
                placeholder="Unlimited"
                disabled
              ></mwc-textfield>
            </div>
            <h4 class="description">Limit</h4>
            <div class="border-bottom-enabled"></div>
            <div class="horizontal layout flex justified distancing">
              <mwc-textfield
                label="IOPS"
                class="two-col"
                id="detail-limit-iops"
                type="number"
                min="0"
                placeholder="Unlimited"
                disabled
              ></mwc-textfield>
              <mwc-textfield
                label="MB/S"
                class="two-col"
                id="detail-limit-mbps"
                type="number"
                min="0"
                placeholder="Unlimited"
                disabled
              ></mwc-textfield>
            </div>
            <div class="horizontal layout flex center justified distancing">
              <div class="vertical layout start-justified">
                <h4 class="no-margin">${NetAppOnTap.msg.sharedCapacity}</h4>
              </div>
              <mwc-switch id="sharing-switch" disabled></mwc-switch>
            </div>
          </div>
        </backend-ai-dialog>
      </div>
    `;

}
}

declare global {
interface HTMLElementTagNameMap {
'netapp-ontap': NetAppOnTap;
}
}
