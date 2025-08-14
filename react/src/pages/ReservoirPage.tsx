import BAIRadioGroup from '../components/BAIRadioGroup';
import { INITIAL_FETCH_KEY, useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import type { ReservoirArtifact } from '../types/reservoir';
import { theme, Col, Row, Statistic, Card } from 'antd';
import {
  BAIPropertyFilter,
  BAICard,
  BAIFlex,
  BAIArtifactTable,
  ArtifactRevisionForModal,
  BAIImportArtifactModal,
} from 'backend.ai-ui';
import _ from 'lodash';
import {
  CheckCircle,
  HardDrive,
  Activity,
  Calendar,
  DatabaseIcon,
} from 'lucide-react';
import React, {
  useMemo,
  useRef,
  useDeferredValue,
  useTransition,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  ReservoirPageQuery,
  ReservoirPageQuery$variables,
} from 'src/__generated__/ReservoirPageQuery.graphql';
import BAIFetchKeyButton from 'src/components/BAIFetchKeyButton';
import { StringParam, withDefault, useQueryParam } from 'use-query-params';

type TabKey = 'artifacts' | 'audit';

const ReservoirPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    null,
  );
  const [selectedRevision, setSelectedRevision] =
    useState<ArtifactRevisionForModal | null>(null);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: withDefault(StringParam, '-updated_at'),
    filter: withDefault(StringParam, undefined),
    statusCategory: withDefault(StringParam, 'all'),
  });

  // const queryVariables: ReservoirPageQuery$variables = useMemo(() => ({}));

  const [curTabKey, setCurTabKey] = useQueryParam(
    'tab',
    withDefault(StringParam, 'artifacts'),
    {
      updateType: 'replace',
    },
  );

  const queryMapRef = useRef({
    [curTabKey]: {
      queryParams,
      tablePaginationOption,
    },
  });

  queryMapRef.current[curTabKey] = {
    queryParams,
    tablePaginationOption,
  };

  const queryVariables: ReservoirPageQuery$variables = useMemo(
    () => ({
      offset: baiPaginationOption.offset,
      limit: baiPaginationOption.limit,
      order: [
        {
          field: 'NAME',
          direction: 'DESC',
        },
      ],
    }),
    [baiPaginationOption.offset, baiPaginationOption.limit],
  );
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const [fetchKey, updateFetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const [isPendingTransition, startTransition] = useTransition();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // const [rescanArtifacts, isInflightRescanArtifacts] =
  //   useMutation<ReservoirPageRescanArtifactsMutation>(graphql`
  //     mutation ReservoirPageRescanArtifactsMutation(
  //       $input: ScanArtifactsInput!
  //     ) {
  //       scanArtifacts(input: $input) {
  //         artifacts {
  //           id
  //         }
  //       }
  //     }
  //   `);

  const queryRef = useLazyLoadQuery<ReservoirPageQuery>(
    graphql`
      query ReservoirPageQuery(
        $order: [ArtifactOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        artifacts(orderBy: $order, limit: $limit, offset: $offset) {
          count
          edges {
            node {
              id
              ...BAIArtifactTableArtifactFragment
              ...BAIImportArtifactModalArtifactFragment
              revisions(
                first: 1
                orderBy: { field: VERSION, direction: DESC }
              ) {
                edges {
                  node {
                    id
                    ...BAIImportArtifactModalArtifactRevisionFragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchKey:
        deferredFetchKey === INITIAL_FETCH_KEY ? undefined : deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const { artifacts } = queryRef;

  // Mock data - in real implementation, this would come from API
  const mockArtifacts: ReservoirArtifact[] = useMemo(
    () => [
      {
        id: '1',
        name: 'transformers',
        type: 'package',
        size: '145MB',
        updated_at: '2025-07-08T13:20:00Z',
        status: 'verified',
        versions: ['4.30.0', '4.29.1', '4.28.0'],
        versionDetails: [
          {
            version: '4.30.0',
            size: '145MB',
            updated_at: '2025-07-08T13:20:00Z',
            checksum: 'sha256:a1b2c3d4e5f6',
            isInstalled: true,
          },
          {
            version: '4.29.1',
            size: '142MB',
            updated_at: '2025-07-05T10:15:00Z',
            checksum: 'sha256:b2c3d4e5f6a1',
            isInstalled: false,
            isPulling: false,
          },
          {
            version: '4.28.0',
            size: '140MB',
            updated_at: '2025-07-02T09:30:00Z',
            checksum: 'sha256:c3d4e5f6a1b2',
            isInstalled: true,
          },
        ],
        description:
          'State-of-the-art Machine Learning for PyTorch, TensorFlow, and JAX.',
        source: 'PyPI',
        sourceUrl: 'https://pypi.org/project/transformers/',
      },
      {
        id: '2',
        name: 'llama-2-7b-chat',
        type: 'model',
        size: '13.5GB',
        updated_at: '2025-07-07T09:15:00Z',
        status: 'verified',
        versions: ['1.1.0', '1.0.0'],
        versionDetails: [
          {
            version: '1.1.0',
            size: '13.5GB',
            updated_at: '2025-07-07T09:15:00Z',
            checksum: 'sha256:d4e5f6a1b2c3',
            isInstalled: true,
          },
          {
            version: '1.0.0',
            size: '13.2GB',
            updated_at: '2025-07-01T14:30:00Z',
            checksum: 'sha256:e5f6a1b2c3d4',
          },
        ],
        description: "Meta's Llama 2 Chat model with 7 billion parameters.",
        source: 'HuggingFace',
        sourceUrl: 'https://huggingface.co/meta-llama/Llama-2-7b-chat-hf',
      },
      {
        id: '3',
        name: 'pytorch-training',
        type: 'image',
        size: '2.3GB',
        updated_at: '2025-07-06T16:45:00Z',
        status: 'pulling',
        versions: ['2.0.0', '1.13.1'],
        versionDetails: [
          {
            version: '2.0.0',
            size: '2.3GB',
            updated_at: '2025-07-06T16:45:00Z',
            checksum: 'sha256:f6a1b2c3d4e5',
            isPulling: true,
          },
          {
            version: '1.13.1',
            size: '2.1GB',
            updated_at: '2025-06-28T12:00:00Z',
            checksum: 'sha256:a1b2c3d4e5f6',
          },
        ],
        description: 'PyTorch training environment with CUDA support.',
        source: 'Docker Hub',
        sourceUrl: 'https://hub.docker.com/r/pytorch/pytorch',
      },
      {
        id: '4',
        name: 'numpy',
        type: 'package',
        size: '28MB',
        updated_at: '2025-07-05T11:30:00Z',
        status: 'verified',
        versions: ['1.26.0', '1.25.0', '1.24.0'],
        versionDetails: [
          {
            version: '1.26.0',
            size: '28MB',
            updated_at: '2025-07-05T11:30:00Z',
            checksum: 'sha256:b2c3d4e5f6a1',
          },
          {
            version: '1.25.0',
            size: '27MB',
            updated_at: '2025-06-20T08:45:00Z',
            checksum: 'sha256:c3d4e5f6a1b2',
          },
          {
            version: '1.24.0',
            size: '26MB',
            updated_at: '2025-06-10T15:20:00Z',
            checksum: 'sha256:d4e5f6a1b2c3',
          },
        ],
        description:
          'Fundamental package for scientific computing with Python.',
        source: 'PyPI',
        sourceUrl: 'https://pypi.org/project/numpy/',
      },
      {
        id: '5',
        name: 'tensorflow-serving',
        type: 'image',
        size: '1.8GB',
        updated_at: '2025-07-04T14:20:00Z',
        status: 'verifying',
        versions: ['2.14.0', '2.13.0'],
        versionDetails: [
          {
            version: '2.14.0',
            size: '1.8GB',
            updated_at: '2025-07-04T14:20:00Z',
            checksum: 'sha256:e5f6a1b2c3d4',
          },
          {
            version: '2.13.0',
            size: '1.7GB',
            updated_at: '2025-06-25T11:10:00Z',
            checksum: 'sha256:f6a1b2c3d4e5',
          },
        ],
        description: 'TensorFlow Serving for model deployment.',
        source: 'Docker Hub',
        sourceUrl: 'https://hub.docker.com/r/tensorflow/serving',
      },
      {
        id: '6',
        name: 'scikit-learn',
        type: 'package',
        size: '52MB',
        updated_at: '2025-07-08T08:00:00Z',
        status: 'available',
        versions: ['1.5.0', '1.4.0', '1.3.0'],
        versionDetails: [
          {
            version: '1.5.0',
            size: '52MB',
            updated_at: '2025-07-08T08:00:00Z',
            checksum: 'sha256:a1b2c3d4e5f6',
          },
          {
            version: '1.4.0',
            size: '50MB',
            updated_at: '2025-06-30T16:30:00Z',
            checksum: 'sha256:b2c3d4e5f6a1',
          },
          {
            version: '1.3.0',
            size: '48MB',
            updated_at: '2025-06-15T13:45:00Z',
            checksum: 'sha256:c3d4e5f6a1b2',
          },
        ],
        description: 'Machine learning library for Python.',
        source: 'PyPI',
        sourceUrl: 'https://pypi.org/project/scikit-learn/',
      },
      {
        id: '7',
        name: 'bert-base-uncased',
        type: 'model',
        size: '440MB',
        updated_at: '2025-07-07T12:00:00Z',
        status: 'available',
        versions: ['1.0.0'],
        versionDetails: [
          {
            version: '1.0.0',
            size: '440MB',
            updated_at: '2025-07-07T12:00:00Z',
            checksum: 'sha256:d4e5f6a1b2c3',
          },
        ],
        description:
          'BERT base model (uncased) for natural language processing.',
        source: 'HuggingFace',
        sourceUrl: 'https://huggingface.co/bert-base-uncased',
      },
      {
        id: '8',
        name: 'ubuntu-ml',
        type: 'image',
        size: '1.2GB',
        updated_at: '2025-07-06T10:00:00Z',
        status: 'available',
        versions: ['22.04', '20.04'],
        versionDetails: [
          {
            version: '22.04',
            size: '1.2GB',
            updated_at: '2025-07-06T10:00:00Z',
            checksum: 'sha256:e5f6a1b2c3d4',
          },
          {
            version: '20.04',
            size: '1.1GB',
            updated_at: '2025-06-20T14:15:00Z',
            checksum: 'sha256:f6a1b2c3d4e5',
          },
        ],
        description: 'Ubuntu with machine learning tools pre-installed.',
        source: 'Docker Hub',
        sourceUrl: 'https://hub.docker.com/_/ubuntu',
      },
    ],
    [],
  );

  // Helper function to parse property filter
  // const parsePropertyFilter = (filterString?: string) => {
  //   if (!filterString) return null;

  //   // Simple parser for "property == value" format
  //   const match = filterString.match(/(\w+)\s*(==|!=|contains)\s*(.+)/);
  //   if (match) {
  //     const [, property, operator, value] = match;
  //     return { property, operator, value: value.trim() };
  //   }
  //   return null;
  // };

  // Filter artifacts based on status category and property filters
  // const filteredArtifacts = useMemo(() => {
  //   if (curTabKey !== 'artifacts') {
  //     return []; // Return empty array for non-artifacts tabs
  //   }

  //   let filtered = mockArtifacts.filter((artifact) => {
  //     switch (queryParams.statusCategory) {
  //       case 'all':
  //         return true; // Show all artifacts
  //       case 'installed':
  //         return ['verified', 'pulling', 'verifying'].includes(artifact.status);
  //       case 'available':
  //         return ['available'].includes(artifact.status);
  //       default:
  //         return true;
  //     }
  //   });

  //   // Apply property filter if exists
  //   const propertyFilter = parsePropertyFilter(queryParams.filter);
  //   if (propertyFilter) {
  //     filtered = filtered.filter((artifact) => {
  //       const { property, operator, value } = propertyFilter;

  //       switch (property) {
  //         case 'name':
  //           if (operator === 'contains') {
  //             return artifact.name.toLowerCase().includes(value.toLowerCase());
  //           } else if (operator === '==') {
  //             return artifact.name.toLowerCase() === value.toLowerCase();
  //           }
  //           break;
  //         case 'type':
  //           if (operator === '==') {
  //             return artifact.type === value;
  //           }
  //           break;
  //         case 'source':
  //           if (operator === 'contains') {
  //             return (
  //               artifact.source?.toLowerCase().includes(value.toLowerCase()) ||
  //               false
  //             );
  //           } else if (operator === '==') {
  //             return artifact.source?.toLowerCase() === value.toLowerCase();
  //           }
  //           break;
  //         case 'status':
  //           if (operator === '==') {
  //             return artifact.status === value;
  //           }
  //           break;
  //         default:
  //           return true;
  //       }
  //       return true;
  //     });
  //   }

  //   return filtered;
  // }, [
  //   mockArtifacts,
  //   curTabKey,
  //   queryParams.statusCategory,
  //   queryParams.filter,
  // ]);

  // // Filter audit logs based on filter
  // const filteredAuditLogs = useMemo(() => {
  //   if (curTabKey !== 'audit') {
  //     return [];
  //   }
  //   // Add filter logic here if needed
  //   return mockAuditLogs;
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [mockAuditLogs, curTabKey, queryParams.auditFilter]);

  // Count for badges and statistics
  const artifactCounts = useMemo(() => {
    const installedCount = mockArtifacts.filter((a) =>
      ['verified', 'pulling', 'verifying'].includes(a.status),
    ).length;
    const availableCount = mockArtifacts.filter((a) =>
      ['available'].includes(a.status),
    ).length;
    const pullingCount = mockArtifacts.filter(
      (a) => a.status === 'pulling',
    ).length;

    // Calculate total size of installed artifacts
    const totalSizeBytes = mockArtifacts
      .filter((a) => ['verified', 'pulling', 'verifying'].includes(a.status))
      .reduce((total, artifact) => {
        const sizeStr = artifact.size;
        const value = parseFloat(sizeStr);
        const unit = sizeStr.replace(/[0-9.]/g, '').trim();

        if (unit === 'GB') return total + value * 1024;
        if (unit === 'MB') return total + value;
        return total;
      }, 0);

    // Recent activity (artifacts updated in last 24 hours)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentlyUpdated = mockArtifacts.filter(
      (a) => new Date(a.updated_at) > oneDayAgo,
    ).length;

    return {
      all: mockArtifacts.length,
      installed: installedCount,
      available: availableCount,
      pulling: pullingCount,
      model: mockArtifacts.filter((a) => a.type === 'model').length,
      package: mockArtifacts.filter((a) => a.type === 'package').length,
      image: mockArtifacts.filter((a) => a.type === 'image').length,
      totalSizeGB: (totalSizeBytes / 1024).toFixed(1),
      recentlyUpdated,
    };
  }, [mockArtifacts]);

  // const handlePullArtifact = (artifactId: string, version?: string) => {
  //   // Mock implementation - in real app, this would trigger an API call
  //   console.log(
  //     `Pulling artifact ${artifactId}${version ? ` version ${version}` : ''}`,
  //   );
  //   updateFetchKey(); // Trigger refresh
  // };

  const handleStatisticCardClick = (statusCategory: string) => {
    // Switch to artifacts tab if not already there
    if (curTabKey !== 'artifacts') {
      setCurTabKey('artifacts');
    }

    // Check if the card is already active (toggle off functionality)
    const isCurrentlyActive =
      statusCategory === 'pulling'
        ? queryParams.statusCategory === 'all' &&
          queryParams.filter === 'status == pulling'
        : queryParams.statusCategory === statusCategory;

    if (isCurrentlyActive) {
      // Toggle off: return to 'all' with no filters
      setQuery(
        {
          statusCategory: 'all',
          filter: undefined,
        },
        'replaceIn',
      );
    } else {
      // Toggle on: apply the filter
      if (statusCategory === 'pulling') {
        // For pulling, set RadioGroup to 'all' and add status filter
        setQuery(
          {
            statusCategory: 'all',
            filter: 'status == pulling',
          },
          'replaceIn',
        );
      } else {
        // For other categories, use normal statusCategory filter and clear property filter
        setQuery(
          {
            statusCategory,
            filter: undefined,
          },
          'replaceIn',
        );
      }
    }

    setTablePaginationOption({ current: 1 });
    // setSelectedArtifactList([]);
  };

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <Row gutter={[16, 16]}>
        {/* <Col xs={12} sm={8} lg={6} xl={4}>
          <Card size="small" variant="borderless">
            <Statistic
              title="Total Artifacts"
              value={artifactCounts.all}
              prefix={<Package size={16} />}
            />
          </Card>
        </Col> */}
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card
            size="small"
            variant="borderless"
            hoverable
            onClick={() => handleStatisticCardClick('installed')}
            style={{
              cursor: 'pointer',
              border:
                queryParams.statusCategory === 'installed'
                  ? `1px solid ${token.colorPrimary}`
                  : `1px solid ${token.colorBorder}`,
              backgroundColor:
                queryParams.statusCategory === 'installed'
                  ? token.colorPrimaryBg
                  : undefined,
              transition: 'all 0.2s ease',
            }}
          >
            <Statistic
              title="Installed"
              value={artifactCounts.installed}
              prefix={<CheckCircle size={16} />}
              valueStyle={{
                color:
                  queryParams.statusCategory === 'installed'
                    ? token.colorPrimary
                    : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card
            size="small"
            variant="borderless"
            hoverable
            onClick={() => handleStatisticCardClick('available')}
            style={{
              cursor: 'pointer',
              border:
                queryParams.statusCategory === 'available'
                  ? `1px solid ${token.colorPrimary}`
                  : `1px solid ${token.colorBorder}`,
              backgroundColor:
                queryParams.statusCategory === 'available'
                  ? token.colorPrimaryBg
                  : undefined,
              transition: 'all 0.2s ease',
            }}
          >
            <Statistic
              title="Available"
              value={artifactCounts.available}
              prefix={<DatabaseIcon />}
              valueStyle={{
                color:
                  queryParams.statusCategory === 'available'
                    ? token.colorPrimary
                    : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card
            size="small"
            variant="borderless"
            hoverable
            onClick={() => handleStatisticCardClick('pulling')}
            style={{
              cursor: 'pointer',
              border:
                queryParams.statusCategory === 'all' &&
                queryParams.filter === 'status == pulling'
                  ? `1px solid ${token.colorPrimary}`
                  : `1px solid ${token.colorBorder}`,
              backgroundColor:
                queryParams.statusCategory === 'all' &&
                queryParams.filter === 'status == pulling'
                  ? token.colorPrimaryBg
                  : undefined,
              transition: 'all 0.2s ease',
            }}
          >
            <Statistic
              title="Currently Pulling"
              value={artifactCounts.pulling}
              prefix={<Activity />}
              valueStyle={{
                color:
                  queryParams.statusCategory === 'all' &&
                  queryParams.filter === 'status == pulling'
                    ? token.colorPrimary
                    : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card
            size="small"
            variant="borderless"
            style={{
              backgroundColor: token.colorFillTertiary,
            }}
          >
            <Statistic
              title="Storage Used"
              value={artifactCounts.totalSizeGB}
              suffix="GB"
              prefix={<HardDrive />}
              precision={1}
              valueStyle={{ color: token.colorTextSecondary }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card
            size="small"
            variant="borderless"
            style={{
              backgroundColor: token.colorFillTertiary,
            }}
          >
            <Statistic
              title="Recent Updates"
              value={artifactCounts.recentlyUpdated}
              prefix={<Calendar />}
              suffix="(24h)"
              valueStyle={{
                color: token.colorTextSecondary,
                fontWeight: 'normal',
              }}
            />
          </Card>
        </Col>
      </Row>
      <BAICard
        activeTabKey={curTabKey}
        onTabChange={(key) => {
          const storedQuery = queryMapRef.current[key] || {
            queryParams: {
              statusCategory: 'all',
            },
          };
          setQuery({ ...storedQuery.queryParams }, 'replace');
          setTablePaginationOption(
            storedQuery.tablePaginationOption || { current: 1 },
          );
          setCurTabKey(key as TabKey);
        }}
        tabList={[
          {
            key: 'artifacts',
            tab: t('reservoirPage.ReservoirArtifacts'),
          },
        ]}
        styles={{
          body: {
            padding: `${token.paddingSM}px ${token.paddingLG}px ${token.paddingLG}px ${token.paddingLG}px`,
          },
        }}
      >
        {curTabKey === 'artifacts' ? (
          <BAIFlex direction="column" align="stretch" gap={'sm'}>
            <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
              <BAIFlex
                gap={'sm'}
                align="start"
                justify="between"
                style={{
                  flexShrink: 1,
                }}
                wrap="wrap"
              >
                <BAIRadioGroup
                  optionType="button"
                  value={queryParams.statusCategory}
                  onChange={(e) => {
                    setQuery({ statusCategory: e.target.value }, 'replaceIn');
                    setTablePaginationOption({ current: 1 });
                    // setSelectedArtifactList([]);
                  }}
                  options={[
                    {
                      label: 'All',
                      value: 'all',
                    },
                    {
                      label: 'Installed',
                      value: 'installed',
                    },
                    {
                      label: 'Available',
                      value: 'available',
                    },
                  ]}
                />
                <BAIPropertyFilter
                  filterProperties={[
                    {
                      key: 'name',
                      propertyLabel: 'Name',
                      type: 'string',
                    },
                    {
                      key: 'type',
                      propertyLabel: 'Type',
                      type: 'string',
                      strictSelection: true,
                      defaultOperator: '==',
                      options: [
                        { label: 'Model', value: 'model' },
                        { label: 'Package', value: 'package' },
                        { label: 'Image', value: 'image' },
                      ],
                    },
                    {
                      key: 'source',
                      propertyLabel: 'Source',
                      type: 'string',
                    },
                    {
                      key: 'status',
                      propertyLabel: 'Status',
                      type: 'string',
                      strictSelection: true,
                      defaultOperator: '==',
                      options: [
                        { label: 'Verified', value: 'verified' },
                        { label: 'Pulling', value: 'pulling' },
                        { label: 'Verifying', value: 'verifying' },
                        { label: 'Available', value: 'available' },
                        { label: 'Error', value: 'error' },
                      ],
                    },
                  ]}
                  value={queryParams.filter}
                  onChange={(value) => {
                    setQuery({ filter: value }, 'replaceIn');
                    setTablePaginationOption({ current: 1 });
                    // setSelectedArtifactList([]);
                  }}
                />
              </BAIFlex>
              <BAIFetchKeyButton
                value={fetchKey}
                autoUpdateDelay={10_000}
                loading={isPendingTransition}
                onChange={() =>
                  startTransition(() => {
                    updateFetchKey();
                    // rescanArtifacts({
                    //   variables: {
                    //     input: {
                    //       storageId: 'fe878f09-06cc-4b91-9242-4c71015cce07',
                    //       registryId: 'fe878f09-06cc-4b91-9242-4c71015cce05',
                    //       limit: 100,
                    //     },
                    //   },
                    // });
                  })
                }
              />
            </BAIFlex>
            {/* <ReservoirArtifactList
              artifactGroupsFrgmt={filterOutNullAndUndefined(
                artifactGroups.edges.map((e) => e?.node),
              )}
              type={
                queryParams.statusCategory as 'all' | 'installed' | 'available'
              }
              order={queryParams.order}
              loading={isPendingTransition}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: filteredArtifacts.length,
                onChange: (current, pageSize) => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({ current, pageSize });
                  }
                },
              }}
              onChangeOrder={(order) => {
                setQuery({ order }, 'replaceIn');
              }}
              onClickPull={(artifactId: string) => {
                console.log(artifactId);
                artifactGroups.edges.forEach((edge) =>
                  edge.node.artifacts.edges.forEach((artifact) => {
                    console.log(artifact.node.id);
                    if (artifact.node.id === artifactId) {
                      setSelectedVersion(artifact.node);
                      return;
                    }
                  }),
                );
              }}
            /> */}
            <BAIArtifactTable
              artifactFragment={artifacts.edges.map((edge) => edge.node)}
              onClickPull={(artifactId: string, revisionId: string) => {
                setSelectedArtifactId(artifactId);
                artifacts.edges.forEach((artifact) =>
                  artifact.node.revisions.edges.forEach((edge) => {
                    if (edge.node.id === revisionId) {
                      return setSelectedRevision(edge.node);
                    }
                  }),
                );
              }}
              loading={isPendingTransition}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: artifacts.count,
                onChange: (current, pageSize) => {
                  startTransition(() => {
                    if (_.isNumber(current) && _.isNumber(pageSize)) {
                      setTablePaginationOption({ current, pageSize });
                    }
                  });
                },
              }}
            />
          </BAIFlex>
        ) : null}
        {/* TODO: implement audit log for reservoir page */}
        {/* {curTabKey === 'audit' ? (
          <Suspense fallback={<Skeleton active />}>
            <ReservoirAuditLogList
              auditLogs={filteredAuditLogs}
              loading={false}
              filterValue={queryParams.auditFilter}
              onFilterChange={(value) => {
                setQuery({ auditFilter: value }, 'replaceIn');
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: filteredAuditLogs.length,
                showTotal: (total) => (
                  <Typography.Text type="secondary">
                    {t('general.TotalItems', { total: total })}
                  </Typography.Text>
                ),
                onChange: (current, pageSize) => {
                  if (_.isNumber(current) && _.isNumber(pageSize)) {
                    setTablePaginationOption({ current, pageSize });
                  }
                },
              }}
              order={queryParams.auditOrder}
              onChangeOrder={(order) => {
                setQuery({ auditOrder: order }, 'replaceIn');
              }}
            />
          </Suspense>
        ) : null} */}
      </BAICard>
      <BAIImportArtifactModal
        selectedArtifactFrgmt={
          selectedArtifactId
            ? artifacts.edges.find(
                (edge) => edge.node.id === selectedArtifactId,
              )!.node
            : null
        }
        selectedArtifactRevisionFrgmt={
          selectedRevision ? [selectedRevision] : []
        }
        onOk={() => {
          setSelectedArtifactId(null);
          setSelectedRevision(null);
        }}
        onCancel={() => {
          setSelectedArtifactId(null);
          setSelectedRevision(null);
        }}
      />
    </BAIFlex>
  );
};

export default ReservoirPage;
