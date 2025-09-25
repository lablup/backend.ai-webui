import BAIRadioGroup from '../components/BAIRadioGroup';
import ReservoirArtifactDetail from '../components/ReservoirArtifactDetail';
import ReservoirArtifactList from '../components/ReservoirArtifactList';
import ReservoirAuditLogList from '../components/ReservoirAuditLogList';
import { handleRowSelectionChange } from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import type { ReservoirArtifact, ReservoirAuditLog } from '../types/reservoir';
import {
  Button,
  Badge,
  Typography,
  theme,
  Col,
  Row,
  Tooltip,
  Statistic,
  Card,
  Skeleton,
} from 'antd';
import { BAICard, BAIFlex, BAIPropertyFilter } from 'backend.ai-ui';
import _ from 'lodash';
import {
  Trash2,
  CheckCircle,
  HardDrive,
  Activity,
  Calendar,
  DatabaseIcon,
} from 'lucide-react';
import React, { useState, useMemo, useRef, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { StringParam, withDefault, useQueryParam } from 'use-query-params';

type TabKey = 'artifacts' | 'audit';

const ReservoirPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { artifactId } = useParams<{ artifactId: string }>();
  const [selectedArtifactList, setSelectedArtifactList] = useState<
    Array<ReservoirArtifact>
  >([]);

  const {
    // baiPaginationOption,
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
    auditFilter: withDefault(StringParam, undefined),
    auditOrder: withDefault(StringParam, '-timestamp'),
  });

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

  const [, updateFetchKey] = useUpdatableState('initial-fetch');

  // Mock audit log data
  const mockAuditLogs: ReservoirAuditLog[] = useMemo(
    () => [
      {
        id: '1',
        artifactName: 'transformers',
        artifactVersion: '4.30.0',
        operation: 'pull',
        modifier: 'john.doe@company.com',
        timestamp: '2025-07-08T14:30:00Z',
        status: 'success',
        details: 'Successfully pulled transformers version 4.30.0',
      },
      {
        id: '2',
        artifactName: 'llama-2-7b-chat',
        artifactVersion: '1.1.0',
        operation: 'install',
        modifier: 'jane.smith@company.com',
        timestamp: '2025-07-08T10:15:00Z',
        status: 'success',
        details: 'Successfully installed llama-2-7b-chat version 1.1.0',
      },
      {
        id: '3',
        artifactName: 'pytorch-training',
        artifactVersion: '2.0.0',
        operation: 'pull',
        modifier: 'system',
        timestamp: '2025-07-08T09:00:00Z',
        status: 'in_progress',
        details: 'Pulling pytorch-training version 2.0.0 in progress',
      },
      {
        id: '4',
        artifactName: 'numpy',
        artifactVersion: '1.25.0',
        operation: 'uninstall',
        modifier: 'admin@company.com',
        timestamp: '2025-07-07T16:45:00Z',
        status: 'success',
        details: 'Successfully uninstalled numpy version 1.25.0',
      },
      {
        id: '5',
        artifactName: 'scikit-learn',
        artifactVersion: '1.4.0',
        operation: 'update',
        modifier: 'bob.wilson@company.com',
        timestamp: '2025-07-07T14:20:00Z',
        status: 'failed',
        details: 'Failed to update scikit-learn: dependency conflict',
      },
      {
        id: '6',
        artifactName: 'tensorflow-serving',
        operation: 'verify',
        modifier: 'system',
        timestamp: '2025-07-07T08:30:00Z',
        status: 'success',
        details: 'All versions verified successfully',
      },
      {
        id: '7',
        artifactName: 'bert-base-uncased',
        artifactVersion: '1.0.0',
        operation: 'pull',
        modifier: 'alice.johnson@company.com',
        timestamp: '2025-07-06T18:00:00Z',
        status: 'success',
        details: 'Successfully pulled bert-base-uncased version 1.0.0',
      },
      {
        id: '8',
        artifactName: 'ubuntu-ml',
        artifactVersion: '20.04',
        operation: 'delete',
        modifier: 'admin@company.com',
        timestamp: '2025-07-06T12:15:00Z',
        status: 'success',
        details: 'Successfully deleted ubuntu-ml version 20.04',
      },
    ],
    [],
  );

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
  const parsePropertyFilter = (filterString?: string) => {
    if (!filterString) return null;

    // Simple parser for "property == value" format
    const match = filterString.match(/(\w+)\s*(==|!=|contains)\s*(.+)/);
    if (match) {
      const [, property, operator, value] = match;
      return { property, operator, value: value.trim() };
    }
    return null;
  };

  // Filter artifacts based on status category and property filters
  const filteredArtifacts = useMemo(() => {
    if (curTabKey !== 'artifacts') {
      return []; // Return empty array for non-artifacts tabs
    }

    let filtered = mockArtifacts.filter((artifact) => {
      switch (queryParams.statusCategory) {
        case 'all':
          return true; // Show all artifacts
        case 'installed':
          return ['verified', 'pulling', 'verifying'].includes(artifact.status);
        case 'available':
          return ['available'].includes(artifact.status);
        default:
          return true;
      }
    });

    // Apply property filter if exists
    const propertyFilter = parsePropertyFilter(queryParams.filter);
    if (propertyFilter) {
      filtered = filtered.filter((artifact) => {
        const { property, operator, value } = propertyFilter;

        switch (property) {
          case 'name':
            if (operator === 'contains') {
              return artifact.name.toLowerCase().includes(value.toLowerCase());
            } else if (operator === '==') {
              return artifact.name.toLowerCase() === value.toLowerCase();
            }
            break;
          case 'type':
            if (operator === '==') {
              return artifact.type === value;
            }
            break;
          case 'source':
            if (operator === 'contains') {
              return (
                artifact.source?.toLowerCase().includes(value.toLowerCase()) ||
                false
              );
            } else if (operator === '==') {
              return artifact.source?.toLowerCase() === value.toLowerCase();
            }
            break;
          case 'status':
            if (operator === '==') {
              return artifact.status === value;
            }
            break;
          default:
            return true;
        }
        return true;
      });
    }

    return filtered;
  }, [
    mockArtifacts,
    curTabKey,
    queryParams.statusCategory,
    queryParams.filter,
  ]);

  // Filter audit logs based on filter
  const filteredAuditLogs = useMemo(() => {
    if (curTabKey !== 'audit') {
      return [];
    }
    // Add filter logic here if needed
    return mockAuditLogs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockAuditLogs, curTabKey, queryParams.auditFilter]);

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

  // Find selected artifact based on URL parameter
  const selectedArtifact = useMemo(() => {
    if (!artifactId) return null;
    return mockArtifacts.find((artifact) => artifact.id === artifactId) || null;
  }, [artifactId, mockArtifacts]);

  const handlePullArtifact = (artifactId: string, version?: string) => {
    // Mock implementation - in real app, this would trigger an API call
    console.log(
      `Pulling artifact ${artifactId}${version ? ` version ${version}` : ''}`,
    );
    updateFetchKey(); // Trigger refresh
  };

  const isInstalledStatus = (status: ReservoirArtifact['status']) => {
    return ['verified', 'pulling', 'verifying'].includes(status);
  };

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
    setSelectedArtifactList([]);
  };

  if (selectedArtifact) {
    return (
      <BAIFlex direction="column" align="stretch" gap={'md'}>
        <ReservoirArtifactDetail
          artifact={selectedArtifact}
          onPull={handlePullArtifact}
        />
      </BAIFlex>
    );
  }

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
          setSelectedArtifactList([]);
          setCurTabKey(key as TabKey);
        }}
        tabList={[
          {
            key: 'artifacts',
            tab: (
              <BAIFlex justify="center" gap={10}>
                Reservoir Artifacts
                {(artifactCounts.all || 0) > 0 && (
                  <Badge
                    count={artifactCounts.all}
                    color={
                      curTabKey === 'artifacts'
                        ? token.colorPrimary
                        : token.colorTextDisabled
                    }
                    size="small"
                    showZero
                    style={{
                      paddingRight: token.paddingXS,
                      paddingLeft: token.paddingXS,
                      fontSize: 10,
                    }}
                  />
                )}
              </BAIFlex>
            ),
          },
          {
            key: 'audit',
            tab: 'Audit Logs',
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
                    setSelectedArtifactList([]);
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
                    setSelectedArtifactList([]);
                  }}
                />
              </BAIFlex>
              <BAIFlex gap={'sm'}>
                {selectedArtifactList.length > 0 && (
                  <>
                    {t('general.NSelected', {
                      count: selectedArtifactList.length,
                    })}
                    <Tooltip title="Remove Selected">
                      <Button
                        icon={<Trash2 size={16} color={token.colorError} />}
                        onClick={() => {
                          console.log('Removing selected artifacts');
                          setSelectedArtifactList([]);
                        }}
                      />
                    </Tooltip>
                  </>
                )}
              </BAIFlex>
            </BAIFlex>
            <ReservoirArtifactList
              artifacts={filteredArtifacts}
              onPull={handlePullArtifact}
              type={
                queryParams.statusCategory as 'all' | 'installed' | 'available'
              }
              order={queryParams.order}
              loading={false}
              rowSelection={{
                type: 'checkbox',
                preserveSelectedRowKeys: true,
                getCheckboxProps: (record) => ({
                  disabled: !isInstalledStatus(record.status),
                }),
                onChange: (selectedRowKeys) => {
                  handleRowSelectionChange(
                    selectedRowKeys,
                    filteredArtifacts,
                    setSelectedArtifactList,
                  );
                },
                selectedRowKeys: _.map(selectedArtifactList, (i) => i.id),
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: filteredArtifacts.length,
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
              onChangeOrder={(order) => {
                setQuery({ order }, 'replaceIn');
              }}
            />
          </BAIFlex>
        ) : null}
        {curTabKey === 'audit' ? (
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
        ) : null}
      </BAICard>
    </BAIFlex>
  );
};

export default ReservoirPage;
