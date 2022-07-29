/**
 @license
 Copyright (c) 2015-2022 Lablup Inc. All rights reserved.
 */
import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

 /**
  Pipeline Utils

  `pipeline-utils` is collection of common utility methods.

 @group Backend.AI pipeline
 @element pipeline-utils
 */
 @customElement('pipeline-utils')
export default class PipelineUtils extends LitElement {
  public shadowRoot: any; // ShadowRoot

  constructor() {
    super();
  }

  static _humanReadableDate(start) {
    const d = new Date(start);
    return d.toLocaleString();
  }

  static _humanReadableTimeDuration(d1, d2 = null) {
    const startTime = new Date(d1).getTime();
    let result = '';
    if (d2 !== null && d2 !== undefined) {
      const passedTime = new Date(d2).getTime();
      let distance = Math.abs(passedTime - startTime); // multiply to second
      const days = Math.floor(distance / 86400000);
      distance -= days * 86400000;
      const hours = Math.floor(distance / 3600000);
      distance -= hours * 3600000;
      const minutes = Math.floor(distance / 60000);
      distance -= minutes * 60000;
      const seconds = Math.floor(distance / 1000);
      result += days > 0 ? `${days}d` : '';
      result += hours > 0 ? `${hours}h ` : '';
      result += minutes > 0 ? `${minutes}m ` : '';
      result += seconds > 0 ? `${seconds}s` : '';
      // if updated time was too short to display then just return 1 second
      if (result === '') {
        result = `1s`;
      }
    } else {
      // if d2 is null, then it's on-going
      result = '-';
    }
    return result;
  }

  static _humanReadablePassedTime(d) {
    const startTime = new Date(d).getTime();
    const currentTime = new Date().getTime();
    const distance = currentTime - startTime;
    const days = Math.floor(distance / 86400000);
    if (days > 0) {
      return `${days}d ago`;
    }
    d -= days * 86400000;
    const hours = Math.floor(distance / 3600000);
    if (hours > 0) {
      return `${hours}h ago`;
    }
    d -= hours * 3600000;
    const minutes = Math.floor(distance / 60000);
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    d -= minutes * 60000;
    const seconds = Math.floor(distance / 1000);
    return `${seconds}s ago`;
  }

  static _getStatusColor(status) {
    let color = 'lightgrey';
    switch (status) {
    case 'RUNNING':
    case 'RESTARTING':
    case 'RESIZING':
    case 'TERMINATING':
      color = 'green';
      break;
    case 'ERROR':
    case 'CANCELLED':
      color = 'red';
      break;
    case 'WAITING':
    case 'PAUSED':
    case 'SUSPENDED':
    case 'BUILDING':
    case 'PULLING':
    case 'SCHEDULED':
    case 'PREPARING':
    case 'PENDING':
      color = 'yellow';
      break;
    case 'TERMINATED':
      color = 'lightgrey';
      break;
    default:
      color = 'lightgrey';
      break;
    }
    return color;
  }

  static _getResultColor(result) {
    let color = 'lightgrey';
    switch (result) {
    case 'SUCCESS':
      color = 'blue';
      break;
    case 'FAILURE':
      color = 'red';
      break;
    case 'UNDEFINED':
      color = 'lightgrey';
      break;
    default:
      color = 'lightgrey';
      break;
    }
    return color;
  }

  static _setCustomEvent(eventName: string, detail: any) {
    const moveToViewEvent = new CustomEvent(eventName, detail);
    document.dispatchEvent(moveToViewEvent);
  }

  /**
  * Combine kernel and version
  *
  * @param {string} kernel - kernel name
  * @param {string} version - version
  * @return {string} `${kernel}:${version}`
  */
  static _generateKernelIndex(kernel, version) {
   return kernel + ':' + version;
 }

  render() {
    // language=HTML
    return html`
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pipeline-utils': PipelineUtils;
  }
}
