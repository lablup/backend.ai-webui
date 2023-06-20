export interface StorageHostSettingData {
  key: string;
  name: string;
  id: string;
  max_file_count: number | null;
  soft_limit: number | null;
  hard_limit: number | null;
  vendor_options: object;
}
