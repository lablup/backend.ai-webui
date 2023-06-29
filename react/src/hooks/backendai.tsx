export interface StorageHostSettingData {
  id: string;
  quota_scope_id: string;
  storage_host_name: string;
  details: {
    hard_limit_bytes: number;
    usage_bytes: number;
    usage_count: number;
  }
}
