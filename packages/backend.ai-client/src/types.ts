/*
Backend.AI API Library / SDK for Node.JS / Javascript ESModule
==============================================================

(C) Copyright 2016-2026 Lablup Inc.
Licensed under LGPL-3.0-or-later
*/

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
  dependencies?: string[];
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

export type requestInfo = {
  method: string;
  headers: Headers;
  mode?: RequestMode | undefined;
  body?: any | undefined;
  cache?: RequestCache | undefined;
  uri: string;
  credentials?: RequestCredentials | undefined;
  signal?: AbortController['signal'] | undefined;
};
