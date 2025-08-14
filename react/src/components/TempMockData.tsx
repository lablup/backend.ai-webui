import {
  ClusterMode,
  DeploymentStatus,
  DeploymentStrategyType,
  ModelDeployment,
  ReplicaStatus,
} from './TempDeploymentTypes';

// Mock data following ModelDeployment interface structure
export const mockDeployments: ModelDeployment[] = [
  {
    id: 'deployment-1',
    metadata: {
      name: 'llama-3-deployment',
      status: DeploymentStatus.ACTIVE,
      tags: ['llm', 'production', 'chat'],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
    },
    networkAccess: {
      endpointUrl: 'https://api.example.com/v1/llama-3',
      preferredDomainName: 'llama3.ai.company.com',
      openToPublic: true,
      accessTokens: [{ token: 'token-abc123' }, { token: 'token-def456' }],
    },
    revision: {
      id: 'revision-1',
      name: 'v1.2.0',
      modelRuntimeConfig: {
        runtimeVariant: 'transformers',
        serviceConfig: { max_tokens: 4096, temperature: 0.7 },
        environ: { CUDA_VISIBLE_DEVICES: '0,1,2,3' },
      },
      modelMountConfig: {
        vfolder: { id: 'vfolder-1' },
        mountDestination: '/models',
        definitionPath: '/models/config.json',
      },
      image: { id: 'image-1' },
      createdAt: '2024-01-15T09:00:00Z',
    },
    revisionHistory: {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: 'cursor-start',
        endCursor: 'cursor-end',
      },
      edges: [
        {
          cursor: 'revision-cursor-1',
          node: {
            id: 'revision-1',
            name: 'v1.2.0',
            modelRuntimeConfig: {
              runtimeVariant: 'transformers',
              serviceConfig: { max_tokens: 4096 },
              environ: { CUDA_VISIBLE_DEVICES: '0,1,2,3' },
            },
            modelMountConfig: {
              vfolder: { id: 'vfolder-1' },
              mountDestination: '/models',
              definitionPath: '/models/config.json',
            },
            image: { id: 'image-1' },
            createdAt: '2024-01-15T09:00:00Z',
          },
        },
      ],
      count: 1,
    },
    scalingRule: {
      autoScalingRules: [{ id: 'scaling-rule-1' }, { id: 'scaling-rule-2' }],
    },
    replicaState: {
      desiredReplicaCount: 4,
      replicas: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        edges: [
          {
            cursor: 'replica-cursor-1',
            node: {
              id: 'replica-1',
              name: 'replica-1',
              status: ReplicaStatus.HEALTHY,
              revision: {
                id: 'revision-1',
                name: 'v1.2.0',
                modelRuntimeConfig: {
                  runtimeVariant: 'transformers',
                },
                modelMountConfig: {
                  vfolder: { id: 'vfolder-1' },
                  mountDestination: '/models',
                  definitionPath: '/models/config.json',
                },
                image: { id: 'image-1' },
                createdAt: '2024-01-15T09:00:00Z',
              },
              routings: [
                {
                  id: 'routing-1',
                  routingId: 'route-uuid-1',
                  endpoint: '/chat',
                  session: 'session-uuid-1',
                  status: 'active',
                  trafficRatio: 0.5,
                  createdAt: '2024-01-15T10:30:00Z',
                  liveStat: { requests: 150, latency: 200 },
                },
              ],
            },
          },
        ],
        count: 4,
      },
    },
    deploymentStrategy: {
      type: DeploymentStrategyType.ROLLING,
    },
    clusterConfig: {
      mode: ClusterMode.MULTI_NODE,
      size: 4,
    },
    resourceConfig: {
      resourceGroup: { id: 'resource-group-1' },
      resourceSlots: {
        'cuda.device': 8,
        cpu: 32,
        mem: '128GiB',
      },
      resourceOpts: {
        shmem: '8GiB',
      },
    },
    createdUser: {
      id: 'user-1',
      email: 'admin@company.com',
    },
  },
  {
    id: 'deployment-2',
    metadata: {
      name: 'gpt-4-expert-setup',
      status: DeploymentStatus.ACTIVE,
      tags: ['gpt-4', 'expert', 'api'],
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
    },
    networkAccess: {
      endpointUrl: 'https://api.example.com/v1/gpt-4',
      preferredDomainName: 'gpt4.ai.company.com',
      openToPublic: false,
      accessTokens: [{ token: 'token-ghi789' }],
    },
    revision: {
      id: 'revision-2',
      name: 'v2.1.0',
      modelRuntimeConfig: {
        runtimeVariant: 'vllm',
        serviceConfig: { max_tokens: 8192, temperature: 0.3 },
        environ: { CUDA_VISIBLE_DEVICES: '0,1,2,3,4,5,6,7' },
      },
      modelMountConfig: {
        vfolder: { id: 'vfolder-2' },
        mountDestination: '/models',
        definitionPath: '/models/model.json',
      },
      image: { id: 'image-2' },
      createdAt: '2024-01-14T14:00:00Z',
    },
    revisionHistory: {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: 'cursor-start-2',
        endCursor: 'cursor-end-2',
      },
      edges: [
        {
          cursor: 'revision-cursor-2',
          node: {
            id: 'revision-2',
            name: 'v2.1.0',
            modelRuntimeConfig: {
              runtimeVariant: 'vllm',
              serviceConfig: { max_tokens: 8192 },
              environ: { CUDA_VISIBLE_DEVICES: '0,1,2,3,4,5,6,7' },
            },
            modelMountConfig: {
              vfolder: { id: 'vfolder-2' },
              mountDestination: '/models',
              definitionPath: '/models/model.json',
            },
            image: { id: 'image-2' },
            createdAt: '2024-01-14T14:00:00Z',
          },
        },
      ],
      count: 3,
    },
    scalingRule: {
      autoScalingRules: [{ id: 'scaling-rule-3' }],
    },
    replicaState: {
      desiredReplicaCount: 8,
      replicas: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        edges: [
          {
            cursor: 'replica-cursor-2',
            node: {
              id: 'replica-2',
              name: 'replica-2',
              status: ReplicaStatus.HEALTHY,
              revision: {
                id: 'revision-2',
                name: 'v2.1.0',
                modelRuntimeConfig: {
                  runtimeVariant: 'vllm',
                },
                modelMountConfig: {
                  vfolder: { id: 'vfolder-2' },
                  mountDestination: '/models',
                  definitionPath: '/models/model.json',
                },
                image: { id: 'image-2' },
                createdAt: '2024-01-14T14:00:00Z',
              },
              routings: [
                {
                  id: 'routing-2',
                  routingId: 'route-uuid-2',
                  endpoint: '/completions',
                  session: 'session-uuid-2',
                  status: 'active',
                  trafficRatio: 1.0,
                  createdAt: '2024-01-14T15:45:00Z',
                  liveStat: { requests: 287, latency: 150 },
                },
              ],
            },
          },
        ],
        count: 8,
      },
    },
    deploymentStrategy: {
      type: DeploymentStrategyType.BLUE_GREEN,
    },
    clusterConfig: {
      mode: ClusterMode.MULTI_NODE,
      size: 8,
    },
    resourceConfig: {
      resourceGroup: { id: 'resource-group-2' },
      resourceSlots: {
        'cuda.device': 16,
        cpu: 64,
        mem: '256GiB',
      },
      resourceOpts: {
        shmem: '16GiB',
      },
    },
    createdUser: {
      id: 'user-2',
      email: 'ml-engineer@company.com',
    },
  },
  {
    id: 'deployment-3',
    metadata: {
      name: 'bert-sentiment-analyzer',
      status: DeploymentStatus.INACTIVE,
      tags: ['bert', 'sentiment', 'nlp'],
      createdAt: '2024-01-13T11:20:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
    },
    networkAccess: {
      endpointUrl: 'https://api.example.com/v1/sentiment',
      preferredDomainName: 'sentiment.ai.company.com',
      openToPublic: true,
      accessTokens: [{ token: 'token-jkl012' }, { token: 'token-mno345' }],
    },
    revision: {
      id: 'revision-3',
      name: 'v1.0.1',
      modelRuntimeConfig: {
        runtimeVariant: 'pytorch',
        serviceConfig: { batch_size: 32 },
        environ: { CUDA_VISIBLE_DEVICES: '0,1' },
      },
      modelMountConfig: {
        vfolder: { id: 'vfolder-3' },
        mountDestination: '/models',
        definitionPath: '/models/bert-config.json',
      },
      image: { id: 'image-3' },
      createdAt: '2024-01-13T10:00:00Z',
    },
    revisionHistory: {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      edges: [
        {
          cursor: 'revision-cursor-3',
          node: {
            id: 'revision-3',
            name: 'v1.0.1',
            modelRuntimeConfig: {
              runtimeVariant: 'pytorch',
              serviceConfig: { batch_size: 32 },
            },
            modelMountConfig: {
              vfolder: { id: 'vfolder-3' },
              mountDestination: '/models',
              definitionPath: '/models/bert-config.json',
            },
            image: { id: 'image-3' },
            createdAt: '2024-01-13T10:00:00Z',
          },
        },
      ],
      count: 1,
    },
    scalingRule: {
      autoScalingRules: [],
    },
    replicaState: {
      desiredReplicaCount: 2,
      replicas: {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        edges: [
          {
            cursor: 'replica-cursor-3',
            node: {
              id: 'replica-3',
              name: 'replica-3',
              status: ReplicaStatus.UNHEALTHY,
              revision: {
                id: 'revision-3',
                name: 'v1.0.1',
                modelRuntimeConfig: {
                  runtimeVariant: 'pytorch',
                },
                modelMountConfig: {
                  vfolder: { id: 'vfolder-3' },
                  mountDestination: '/models',
                  definitionPath: '/models/bert-config.json',
                },
                image: { id: 'image-3' },
                createdAt: '2024-01-13T10:00:00Z',
              },
              routings: [
                {
                  id: 'routing-3',
                  routingId: 'route-uuid-3',
                  endpoint: '/analyze',
                  session: 'session-uuid-3',
                  status: 'inactive',
                  trafficRatio: 0.0,
                  createdAt: '2024-01-13T11:20:00Z',
                  liveStat: { requests: 0, latency: 0 },
                },
              ],
            },
          },
        ],
        count: 2,
      },
    },
    deploymentStrategy: {
      type: DeploymentStrategyType.CANARY,
    },
    clusterConfig: {
      mode: ClusterMode.SINGLE_NODE,
      size: 1,
    },
    resourceConfig: {
      resourceGroup: { id: 'resource-group-3' },
      resourceSlots: {
        'cuda.device': 2,
        cpu: 8,
        mem: '32GiB',
      },
      resourceOpts: {
        shmem: '4GiB',
      },
    },
    createdUser: {
      id: 'user-3',
      email: 'data-scientist@company.com',
    },
  },
];
