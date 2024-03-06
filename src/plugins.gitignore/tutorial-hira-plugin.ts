/**
 @license
 Copyright (c) 2015-2024 Lablup Inc. All rights reserved.
 */
import { BackendAiStyles } from '../components/backend-ai-general-styles';
import { BackendAIPage } from '../components/backend-ai-page';
import '@material/mwc-tab-bar/mwc-tab-bar';
import { CSSResultGroup, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
  Test plugin for Backend.AI WebUI
 
  */
@customElement('tutorial-hira-plugin')
export default class TestPlugin extends BackendAIPage {
  @property({ type: String }) menuitem = 'Tutorial'; // Menu name on sidebar. You may keep this value empty to hide from menu.
  @property({ type: String }) is = 'tutorial-hira-plugin'; // Should exist and unique.
  @property({ type: String }) permission = 'user'; // Can be 'user', 'admin' or 'superadmin'.
  @property({ type: String }) _tab = 'tab1';

  private vidoeBasePath = '/resources/videos/';
  constructor() {
    super();
  }

  static get styles(): CSSResultGroup {
    return [
      BackendAiStyles,
      // language=CSS
      css`
        .tab-content {
          width: 100%;
        }
      `,
    ];
  }

  firstUpdated() {}

  connectedCallback() {
    super.connectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {}

  /**
   * Display the tab.
   *
   * @param {mwc-tab} tab
   */
  _showTab(tab) {
    const els = this.shadowRoot?.querySelectorAll<HTMLElement>(
      '.tab-content',
    ) as NodeListOf<HTMLElement>;
    for (let x = 0; x < els.length; x++) {
      els[x].style.display = 'none';
    }
    (
      this.shadowRoot?.querySelector('#' + tab.title) as HTMLElement
    ).style.display = 'block';
    this._tab = tab.title;
  }

  render() {
    // language=HTML
    return html`
      <mwc-tab-bar>
        <mwc-tab
          title="tab1"
          label="Backend.AI 시작하기"
          @click="${(e) => this._showTab(e.target)}"
        ></mwc-tab>
        <mwc-tab
          title="tab2"
          label="NumPy 와 Pandas 실습​"
          @click="${(e) => this._showTab(e.target)}"
        ></mwc-tab>
        <mwc-tab
          title="tab3"
          label="의료 데이터 분석 실습​"
          @click="${(e) => this._showTab(e.target)}"
        ></mwc-tab>
      </mwc-tab-bar>
      <div id="tab1" class="tab-content">1</div>
      <div id="tab2" class="tab-content" style="display:none;">2</div>
      <div id="tab3" class="tab-content" style="display:none;">
        <video controls width="100%">
          <source
            src="${`${this.vidoeBasePath}/Tutorial_medical_examples.mp4`}"
            type="video/mp4"
          />

          Download the
          <a href="${`${this.vidoeBasePath}/Tutorial_medical_examples.mp4`}">
            MP4
          </a>
          video.
        </video>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tutorial-hira-plugin': TestPlugin;
  }
}
