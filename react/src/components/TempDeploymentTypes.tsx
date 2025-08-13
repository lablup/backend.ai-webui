// TypeScript interfaces based on GraphQL schema v2-schema.graphql

// Base Node interface
interface Node {
  /** The Globally Unique ID of this object */
  id: string;
}

// Enums as const assertions for better TypeScript compatibility
const DeploymentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

const ClusterMode = {
  SINGLE_NODE: 'SINGLE_NODE',
  MULTI_NODE: 'MULTI_NODE',
} as const;

const DeploymentStrategyType = {
  ROLLING: 'ROLLING',
  BLUE_GREEN: 'BLUE_GREEN',
  CANARY: 'CANARY',
} as const;

const ReplicaStatus = {
  HEALTHY: 'HEALTHY',
  UNHEALTHY: 'UNHEALTHY',
} as const;

// Type definitions
type DeploymentStatusType =
  (typeof DeploymentStatus)[keyof typeof DeploymentStatus];
type ClusterModeType = (typeof ClusterMode)[keyof typeof ClusterMode];
type DeploymentStrategyTypeType =
  (typeof DeploymentStrategyType)[keyof typeof DeploymentStrategyType];
type ReplicaStatusType = (typeof ReplicaStatus)[keyof typeof ReplicaStatus];

// Supporting interfaces
interface ModelDeploymentMetadata {
  name: string;
  status: DeploymentStatusType;
  tags: string[];
  createdAt: string; // DateTime as ISO string
  updatedAt: string; // DateTime as ISO string
}

interface EndpointToken {
  token: string;
}

interface ModelDeploymentNetworkAccess {
  endpointUrl?: string;
  preferredDomainName?: string;
  openToPublic: boolean;
  accessTokens: EndpointToken[];
}

interface VirtualFolderNode extends Node {
  // Extended from external schema
}

interface ModelMountConfig {
  vfolder: VirtualFolderNode;
  mountDestination: string;
  definitionPath: string;
}

interface ModelRuntimeConfig {
  runtimeVariant: string;
  serviceConfig?: any; // JSONString
  environ?: any; // JSONString
}

interface ImageNode extends Node {
  // Extended from external schema
}

interface ModelRevision extends Node {
  name: string;
  modelRuntimeConfig: ModelRuntimeConfig;
  modelMountConfig: ModelMountConfig;
  image: ImageNode;
  createdAt: string; // DateTime as ISO string
}

interface ModelRevisionEdge {
  cursor: string;
  node: ModelRevision;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

interface ModelRevisionConnection {
  pageInfo: PageInfo;
  edges: ModelRevisionEdge[];
  count: number;
}

interface EndpointAutoScalingRuleNode extends Node {
  // Extended from external schema
}

interface ScalingRule {
  autoScalingRules: EndpointAutoScalingRuleNode[];
}

interface ModelReplica extends Node {
  name: string;
  status: ReplicaStatusType;
  revision: ModelRevision;
  routings: RoutingNode[];
}

interface ModelReplicaEdge {
  cursor: string;
  node: ModelReplica;
}

interface ModelReplicaConnection {
  pageInfo: PageInfo;
  edges: ModelReplicaEdge[];
  count: number;
}

interface ReplicaState {
  desiredReplicaCount: number;
  replicas: ModelReplicaConnection;
}

interface DeploymentStrategy {
  type: DeploymentStrategyTypeType;
}

interface ClusterConfig {
  mode: ClusterModeType;
  size: number;
}

interface ScalingGroupNode extends Node {
  // Extended from external schema
}

interface ResourceConfig {
  resourceGroup: ScalingGroupNode;
  resourceSlots: any; // JSONString
  resourceOpts?: any; // JSONString
}

interface UserNode extends Node {
  // Extended from external schema
  email?: string;
}

interface RoutingNode extends Node {
  routingId: string; // UUID
  endpoint: string;
  session: string; // UUID
  status: string;
  trafficRatio: number;
  createdAt: string; // DateTime as ISO string
  liveStat: any; // JSONString
}

interface ModelDeployment extends Node {
  metadata: ModelDeploymentMetadata;
  networkAccess: ModelDeploymentNetworkAccess;
  revision?: ModelRevision;
  revisionHistory: ModelRevisionConnection;
  scalingRule: ScalingRule;
  replicaState: ReplicaState;
  deploymentStrategy: DeploymentStrategy;
  clusterConfig: ClusterConfig;
  resourceConfig: ResourceConfig;
  createdUser: UserNode;
}

// Connection types for ModelDeployment
interface ModelDeploymentEdge {
  cursor: string;
  node: ModelDeployment;
}

interface ModelDeploymentConnection {
  pageInfo: PageInfo;
  edges: ModelDeploymentEdge[];
  count: number;
}

export { DeploymentStatus, ClusterMode, DeploymentStrategyType, ReplicaStatus };

export type {
  ModelDeployment,
  ModelDeploymentConnection,
  ModelDeploymentEdge,
  ModelDeploymentMetadata,
  ModelDeploymentNetworkAccess,
  ModelRevision,
  ModelRevisionConnection,
  ScalingRule,
  ReplicaState,
  DeploymentStrategy,
  ClusterConfig,
  ResourceConfig,
  UserNode,
  DeploymentStatusType,
  ClusterModeType,
  DeploymentStrategyTypeType,
  ReplicaStatusType,
};
