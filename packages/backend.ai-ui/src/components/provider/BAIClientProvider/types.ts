// Backend.AI Client Interface
export interface BAIClient {
  // Add methods and properties of the client here
  // Example:
  // request: (endpoint: string, options?: RequestInit) => Promise<any>;
  // Add more methods as needed based on the actual Backend.AI client API
  isManagerVersionCompatibleWith: (version: string) => boolean;
  vfolder: {
    info: (name: string) => Promise<vfolderInfo>;
    list: (path: string) => Promise<any>;
    list_hosts: () => Promise<VFolderHosts>;
    list_all_hosts: () => Promise<{
      allowed: Array<string>;
      default: string;
    }>;
    list_files: (
      path: string,
      id: string,
    ) => Promise<{ items: Array<VFolderFile> }>;
    delete_files: (
      files: Array<string>,
      recursive: boolean,
      name: string,
    ) => Promise<any>;
    mkdir: (
      path: string,
      name: string | null,
      parents: string | null,
      exist_ok: string | null,
    ) => Promise<any>;
    request_download_token: (
      file: string,
      name: string,
      archive?: boolean,
    ) => Promise<VFolderDownloadToken>;
    create_upload_session: (
      path: string,
      fs: object,
      name: string,
    ) => Promise<any>;
    rename_file: (
      target_path: string,
      new_name: string,
      targetFolder: string,
      is_dir: boolean,
    ) => Promise<any>;
  };
  current_group_id: () => string;
  current_group: string;
  user_uuid: string;
  email: string;
  accessKey: string;
  _config: BackendAIConfig;
  supports: (feature: string) => boolean;
}

export type BackendAIConfig = {
  domainName: string;
  maxFileUploadSize: number;
  isDirectorySizeVisible: boolean;
  [key: string]: any;
};

export type VFolderFile = {
  name: string;
  type: 'FILE' | 'DIRECTORY';
  size: number;
  mode: number;
  created: string;
  modified: string;
};

export type vfolderInfo = {
  cloneable: boolean;
  created_at: string;
  group: string | null;
  host: string;
  id: string;
  is_owner: boolean;
  last_used: string;
  name: string;
  num_files: number;
  permission: string;
  quota_scope_id: string;
  status: string;
  type: string;
  usage_mode: string;
  used_bytes: number;
  user: string;
};

export interface VFolderHosts {
  allowed: Array<string>;
  default: string;
  volume_info: {
    [key: string]: {
      backend: string;
      capabilities: Array<string>;
      sftp_scaling_groups: Array<string>;
      usage: {
        percentage: number;
      };
    };
  };
}

export type VFolderDownloadToken = {
  token: string;
  url: string;
};
