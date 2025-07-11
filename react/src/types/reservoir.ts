export interface ReservoirArtifactVersion {
  version: string;
  size: string;
  updated_at: string;
  checksum?: string;
  isInstalled?: boolean;
  isPulling?: boolean;
}

export interface ReservoirArtifact {
  id: string;
  name: string;
  type: 'model' | 'package' | 'image';
  size: string;
  updated_at: string;
  status: 'verified' | 'pulling' | 'verifying' | 'available' | 'error';
  versions: string[]; // Keep for backward compatibility
  versionDetails?: ReservoirArtifactVersion[]; // New detailed version info
  description?: string;
  source?: string;
  sourceUrl?: string;
  tags?: string[];
  dependencies?: string[];
  checksums?: {
    [version: string]: string;
  };
}

export interface ReservoirAuditLog {
  id: string;
  artifactName: string;
  artifactVersion?: string;
  operation: 'pull' | 'install' | 'uninstall' | 'update' | 'verify' | 'delete';
  modifier: string;
  timestamp: string;
  status: 'success' | 'failed' | 'in_progress';
  details?: string;
}
