import './backend-ai-dialog';
import './backend-ai-indicator-pool';
// backend-ai-login has been migrated to React (backend-ai-react-login-view)
import './backend-ai-settings-store';
import './lablup-notification';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-menu';
import { LitElement } from 'lit-element';
import 'weightless/popover';
import 'weightless/popover-card';
import 'weightless/progress-spinner';

declare const BackendAIWebUI_base: typeof LitElement;
/**
 Backend.AI Web UI

 `backend-ai-webui` is a shell of Backend.AI Web UI (web / app).

 Example:

 <backend-ai-webui>
 ... content ...
 </backend-ai-webui>

@group Backend.AI Web UI
 @element backend-ai-webui
 */
export default class BackendAIWebUI extends BackendAIWebUI_base {
  hasLoadedStrings: boolean;
  menuTitle: string;
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
  loginPanel: any;
  _page: string;
  _sidepanel: string;
  _drawerOpened: boolean;
  _offlineIndicatorOpened: boolean;
  _offline: boolean;
  config: any;
  appPage: any;
  contentBody: any;
  mainToolbar: any;
  drawerToggleButton: any;
  sidebarMenu: any;
  mini_ui: boolean;
  lang: string;
  supportLanguageCodes: string[];
  blockedMenuitem: any;
  inactiveMenuItem: any;
  constructor();
  static get styles(): (
    | import('lit-element').CSSResult
    | (import('lit-element').CSSResult | import('lit-element').CSSResult[])[]
  )[];
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
  _updatePageFromPath(path: string): void;
  _moveTo(url: any, params?: any, fromReact?: boolean): void;
  _moveToLogPage(): void;
  _readRecentProjectGroup(): any;
  _writeRecentProjectGroup(value: string): void;
  _deleteRecentProjectGroupInfo(): void;
  _moveToUserSettingsPage(): void;
  addTooltips(): Promise<void>;
  _createPopover(anchor: string, title: string): void;
  protected render(): import('lit-element').TemplateResult;
}

export {};

export interface SessionResources {
  group_name?: string;
  domain?: string;
  type?: 'interactive' | 'batch' | 'inference' | 'system';
  cluster_mode: 'single-node' | 'multi-node';
  cluster_size: number;
  maxWaitSeconds: number;
  starts_at?: string;
  startupCommand?: string;
  bootstrap_script?: string;
  owner_access_key?: string;
  reuseIfExists?: boolean;
  config?: {
    resources?: {
      cpu: number;
      mem: string;
      [key: string]: number | string;
    };
    resource_opts?: {
      shmem?: string;
      allow_fractional_resource_fragmentation?: boolean;
    };
    mounts?: string[];
    mount_ids?: string[];
    mount_map?: {
      [key: string]: string;
    };
    environ?: {
      [key: string]: string;
    };
    scaling_group?: string;
    preopen_ports?: number[];
    agent_list?: string[];
  };
}
