/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import { BackendAIPage } from './backend-ai-page';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 Backend.AI Metadata Reader / Storage

 `backend-ai-metadata-store` is a general metadata storage.
  @group Backend.AI Web UI
 */
@customElement('backend-ai-metadata-store')
export default class BackendAIMetadataStore extends BackendAIPage {
  @property({ type: Object }) options = Object();
  @property({ type: Object }) imageInfo = Object();
  @property({ type: Object }) imageNames = Object();
  @property({ type: Object }) imageTagAlias = Object();
  @property({ type: Object }) imageTagReplace = Object();
  @property({ type: Object }) kernel_labels = Object();
  @property({ type: Object }) aliases = Object();
  @property({ type: Object }) tags = Object();
  @property({ type: Object }) icons = Object();
  @property({ type: Object }) deviceInfo = Object();

  constructor() {
    super();
    this.readImageMetadata();
    //this.readDeviceMetadata();
  }

  firstUpdated() {}

  async readImageMetadata() {
    return fetch('resources/image_metadata.json')
      .then((response) => response.json())
      .then((json) => {
        this.imageInfo = json.imageInfo;
        for (const key in this.imageInfo) {
          if ({}.hasOwnProperty.call(this.imageInfo, key)) {
            this.tags[key] = [];
            this.kernel_labels[key] = [];
            if ('name' in this.imageInfo[key]) {
              this.aliases[key] = this.imageInfo[key].name;
              this.imageNames[key] = this.imageInfo[key].name;
            }
            if ('icon' in this.imageInfo[key]) {
              this.icons[key] = this.imageInfo[key].icon; // Can be used as kernel_icons
            } else {
              this.icons[key] = 'default.png';
            }

            if ('label' in this.imageInfo[key]) {
              this.kernel_labels[key] = this.imageInfo[key].label;
              this.imageInfo[key].label.forEach((item) => {
                if (!('category' in item)) {
                  this.tags[key].push(item);
                }
              });
            } else {
              this.kernel_labels[key] = [];
            }
          }
        }
        this.imageTagAlias = json.tagAlias;
        this.imageTagReplace = json.tagReplace;
      })
      .then(() => {
        const event: CustomEvent = new CustomEvent(
          'backend-ai-metadata-image-loaded',
          { detail: '' },
        );
        document.dispatchEvent(event);
      });
  }

  readDeviceMetadata() {
    fetch('resources/device_metadata.json')
      .then((response) => response.json())
      .then((json) => {
        this.deviceInfo = json.deviceInfo;
        // console.log(this.deviceInfo);
        for (const key in this.deviceInfo) {
          if ({}.hasOwnProperty.call(this.deviceInfo, key)) {
          }
        }
      })
      .then(() => {
        const event: CustomEvent = new CustomEvent(
          'backend-ai-metadata-device-loaded',
          { detail: '' },
        );
        document.dispatchEvent(event);
      });
  }

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  render() {
    // language=HTML
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-metadata-store': BackendAIMetadataStore;
  }
}
