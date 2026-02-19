import './backend-ai-indicator-pool';
// backend-ai-login has been migrated to React (backend-ai-react-login-view)
import './backend-ai-settings-store';
import './lablup-notification';
import { LitElement } from 'lit-element';

declare const BackendAIWebUI_base: typeof LitElement;
/**
 Backend.AI Web UI

 `backend-ai-webui` is a minimal Lit shell that provides global store
 initialization, config loading, notification/indicator pools, and
 login view orchestration. All routing and UI is handled by React.

 @group Backend.AI Web UI
 @element backend-ai-webui
 */
export default class BackendAIWebUI extends BackendAIWebUI_base {
  hasLoadedStrings: boolean;
  is_connected: boolean;
  config: any;
  notification: any;
  auto_logout: boolean;
  edition: string;
  validUntil: string;
  plugins: any;
  proxy_url: string;
  lang: string;
  supportLanguageCodes: string[];
  loginPanel: any;
  constructor();
  static get styles(): import('lit-element').CSSResult[];
  firstUpdated(): void;
  connectedCallback(): Promise<void>;
  disconnectedCallback(): void;
  shouldUpdate(changedProperties: any): boolean;
  loadConfig(config: any): void;
  refreshPage(): void;
  showUpdateNotifier(): void;
  _parseConfig(fileName: any, returning?: boolean): Promise<void>;
  close_app_window(): Promise<void>;
  logout(performClose?: boolean, callbackURL?: string): Promise<void>;
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
