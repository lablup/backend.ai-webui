/**
 @license
 Copyright (c) 2015-2025 Lablup Inc. All rights reserved.
 */
import * as ai from '../lib/backend.ai-client-esm';
import { BackendAIWebUIStyles } from './backend-ai-webui-styles';
import { LitElement, html, CSSResultGroup } from 'lit';
import { registerTranslateConfig, use as setLanguage } from 'lit-translate';
import { customElement, property } from 'lit/decorators.js';

// Expose Backend.AI client classes globally for React components.
// Previously set by the now-removed backend-ai-login.ts.
// @ts-ignore
globalThis.BackendAIClient = ai.backend.Client;
// @ts-ignore
globalThis.BackendAIClientConfig = ai.backend.ClientConfig;

// lit-translate configuration for remaining Lit components
registerTranslateConfig({
  loader: (lang) =>
    fetch(`/resources/i18n/${lang}.json`).then((res) => res.json()),
});

// Global store initialization (settings, metadata, tasker, utils) has been
// moved to React. See react/src/global-stores.ts.
// The stores are assigned to globalThis from there, so existing Lit code
// that references globalThis.backendaioptions, globalThis.backendaimetadata,
// globalThis.tasker, or globalThis.backendaiutils continues to work.

/**
 Backend.AI Web UI

 `backend-ai-webui` is a minimal Lit shell that provides:
 - Backend.AI client class exposure (globalThis.BackendAIClient)
 - lit-translate language synchronization for remaining Lit components
 - Connected state tracking for legacy Lit code

 Login flow orchestration has been migrated to React
 (see react/src/hooks/useLoginOrchestration.ts and react/src/components/LoginView.tsx).
 Logout and app-close handling has been migrated to React
 (see react/src/hooks/useLogout.ts).
 Global store initialization (settings, metadata, tasker, utils) is now
 handled by React (see react/src/global-stores.ts).
 Config loading from config.toml is handled entirely by React
 (see react/src/hooks/useWebUIConfig.ts).

 All routing, page rendering, and UI is handled by React.
 Notifications are dispatched directly via the 'add-bai-notification'
 CustomEvent handled by BAINotificationButton in React.

 @group Backend.AI Web UI
 @element backend-ai-webui
 */
@customElement('backend-ai-webui')
export default class BackendAIWebUI extends LitElement {
  @property({ type: Boolean }) hasLoadedStrings = false;
  @property({ type: Boolean }) is_connected = false;
  @property({ type: String }) lang = 'default';
  @property({ type: Array }) supportLanguageCodes = [
    'en',
    'ko',
    'de',
    'el',
    'es',
    'fi',
    'fr',
    'id',
    'it',
    'ja',
    'mn',
    'ms',
    'pl',
    'pt',
    'pt-BR',
    'ru',
    'th',
    'tr',
    'vi',
    'zh-CN',
    'zh-TW',
  ];
  @property({ type: Object }) _refreshPage = this.refreshPage.bind(this);

  static get styles(): CSSResultGroup {
    return [BackendAIWebUIStyles];
  }

  firstUpdated() {
    // Login orchestration has been moved to React.
    // See react/src/hooks/useLoginOrchestration.ts.

    // Keep lit-translate in sync when user changes language (for remaining Lit components)
    document.addEventListener('language-changed', async (e) => {
      await setLanguage((e as CustomEvent).detail.language);
    });
  }

  async connectedCallback() {
    super.connectedCallback();
    document.addEventListener('backend-ai-connected', this._refreshPage);

    const selectedLang = globalThis.backendaioptions.get('selected_language');
    let defaultLang = globalThis.navigator.language.split('-')[0];
    defaultLang = this.supportLanguageCodes.includes(defaultLang)
      ? defaultLang
      : 'en';

    if (!selectedLang) {
      this.lang = defaultLang;
    } else {
      if (selectedLang === 'default') {
        this.lang = defaultLang;
      } else {
        this.lang = this.supportLanguageCodes.includes(selectedLang)
          ? selectedLang
          : defaultLang;
      }
    }
    globalThis.backendaioptions.set('language', this.lang, 'general');
    await setLanguage(this.lang);
    this.hasLoadedStrings = true;
  }

  disconnectedCallback() {
    document.removeEventListener('backend-ai-connected', this._refreshPage);
    super.disconnectedCallback();
  }

  shouldUpdate(changedProperties) {
    return this.hasLoadedStrings && super.shouldUpdate(changedProperties);
  }

  /**
   * Called when backend-ai-connected event fires (after successful login).
   * Proxy URL is now set by React (useConfigRefreshPageEffect in useWebUIConfig.ts).
   */
  refreshPage(): void {
    this.is_connected = true;
  }

  protected render() {
    // language=HTML
    return html`
      <link rel="stylesheet" href="resources/fonts/font-awesome-all.min.css" />
      <link rel="stylesheet" href="resources/custom.css" />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'backend-ai-webui': BackendAIWebUI;
  }
}
