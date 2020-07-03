import { LitElement } from "lit-element";
import '../plastics/mwc/mwc-drawer';
import '../plastics/mwc/mwc-top-app-bar-fixed';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-menu';
import 'weightless/progress-spinner';
import 'weightless/popover';
import 'weightless/popover-card';
import './backend-ai-settings-store';
import './backend-ai-splash';
import './backend-ai-help-button';
import './lablup-notification';
import './backend-ai-indicator-pool';
import './lablup-terms-of-service';
import './backend-ai-dialog';
import './backend-ai-sidepanel-task';
import './backend-ai-sidepanel-notification';
import './backend-ai-app-launcher';
import './backend-ai-resource-broker';
import '../lib/backend.ai-client-es6';
import '../plastics/mwc/mwc-multi-select';
import './backend-ai-offline-indicator';
import './backend-ai-login';
declare const BackendAIConsole_base: (new (...args: any[]) => {
    _storeUnsubscribe: import("redux").Unsubscribe;
    connectedCallback(): void;
    disconnectedCallback(): void;
    stateChanged(_state: unknown): void;
    readonly isConnected: boolean;
}) & typeof LitElement;
/**
 Backend.AI GUI Console

 `backend-ai-console` is a shell of Backend.AI GUI console (web / app).

 Example:

 <backend-ai-console>
 ... content ...
 </backend-ai-console>lablup-terms-of-service

 @group Backend.AI Console
 @element backend-ai-console
 */
export default class BackendAIConsole extends BackendAIConsole_base {
    shadowRoot: any;
    hasLoadedStrings: boolean;
    menuTitle: string;
    siteDescription: string;
    user_id: string;
    full_name: string;
    domain: string;
    is_connected: boolean;
    is_admin: boolean;
    is_superadmin: boolean;
    allow_signout: boolean;
    proxy_url: string;
    connection_mode: string;
    connection_server: string;
    edition: string;
    validUntil: string;
    groups: any[];
    current_group: string;
    plugins: any;
    notification: any;
    splash: any;
    loginPanel: any;
    _page: string;
    _sidepanel: string;
    _drawerOpened: boolean;
    _offlineIndicatorOpened: boolean;
    _offline: boolean;
    config: any;
    appBody: any;
    appPage: any;
    contentBody: any;
    mainToolbar: any;
    drawerToggleButton: any;
    sidebarMenu: any;
    TOSdialog: any;
    mini_ui: boolean;
    lang: string;
    supportLanguageCodes: string[];
    blockedMenuitem: any;
    constructor();
    static get styles(): (import("lit-element").CSSResult | (import("lit-element").CSSResult | import("lit-element").CSSResult[])[])[];
    firstUpdated(): void;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    attributeChangedCallback(name: any, oldval: any, newval: any): void;
    shouldUpdate(changedProperties: any): boolean;
    loadConfig(config: any): void;
    refreshPage(): void;
    showUpdateNotifier(): void;
    _parseConfig(fileName: any): Promise<void>;
    toggleSidebarUI(): void;
    toggleSidePanelUI(): void;
    toggleSidePanelType(): void;
    _openSidePanel(panel: any): void;
    _changeDrawerLayout(width: any, height: any): void;
    _refreshUserInfoPanel(): void;
    _loadPageElement(): void;
    _openUserPrefDialog(): void;
    _hideUserPrefDialog(): void;
    _updateUserPassword(): void;
    _menuSelected(e: any): void;
    updated(changedProps: any): void;
    _updateSidebar(view: any): void;
    close_app_window(performClose?: boolean): Promise<void>;
    logout(performClose?: boolean): Promise<void>;
    updateTitleColor(backgroundColorVal: string, colorVal: string): void;
    changeGroup(e: any): void;
    toggleDrawer(): void;
    _toggleDropdown(): void;
    showTOSAgreement(): void;
    showPPAgreement(): void;
    _moveTo(url: any): void;
    _moveToLogPage(): void;
    _readRecentProjectGroup(): any;
    _writeRecentProjectGroup(value: string): void;
    _deleteRecentProjectGroupInfo(): void;
    _moveToUserSettingsPage(): void;
    addTooltips(): Promise<void>;
    _createPopover(anchor: string, title: string): void;
    protected render(): import("lit-element").TemplateResult;
    stateChanged(state: any): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "backend-ai-console": BackendAIConsole;
    }
}
export {};
//# sourceMappingURL=backend-ai-console.d.ts.map