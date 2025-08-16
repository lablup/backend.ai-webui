export interface ReservoirArtifact {
  id: string;
  name: string;
  type: 'model' | 'package' | 'image';
  size: string;
  updated_at: string;
  status: 'verified' | 'pulling' | 'verifying' | 'available' | 'error';
  versions: string[];
  description?: string;
  source?: string;
  tags?: string[];
  dependencies?: string[];
  checksums?: {
    [version: string]: string;
  };
}
