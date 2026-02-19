// Login flow orchestration has been migrated to React
// (see react/src/hooks/useLoginOrchestration.ts).
import { LitElement } from 'lit-element';

declare const BackendAIWebUI_base: typeof LitElement;
/**
 Backend.AI Web UI

 `backend-ai-webui` is a minimal Lit shell that provides Backend.AI client
 class exposure and lit-translate language synchronization. All routing, UI,
 login orchestration, and logout handling is handled by React.

 @group Backend.AI Web UI
 @element backend-ai-webui
 */
export default class BackendAIWebUI extends BackendAIWebUI_base {
  hasLoadedStrings: boolean;
  is_connected: boolean;
  lang: string;
  supportLanguageCodes: string[];
  constructor();
  static get styles(): import('lit-element').CSSResult[];
  firstUpdated(): void;
  connectedCallback(): Promise<void>;
  disconnectedCallback(): void;
  shouldUpdate(changedProperties: any): boolean;
  refreshPage(): void;
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
