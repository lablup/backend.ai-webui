import BAICard from '../components/BAICard';
import BAIPropertyFilter from '../components/BAIPropertyFilter';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import ReservoirArtifactDetail from '../components/ReservoirArtifactDetail';
import ReservoirArtifactList from '../components/ReservoirArtifactList';
import { handleRowSelectionChange } from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import type { ReservoirArtifact } from '../types/reservoir';
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
} from 'antd';
import { Flex } from 'backend.ai-ui';
import _ from 'lodash';
import {
  Trash2,
  CheckCircle,
  HardDrive,
  Activity,
  Calendar,
  DatabaseIcon,
} from 'lucide-react';
import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, withDefault } from 'use-query-params';

type TabKey = 'artifacts' | 'audit';

const ReservoirPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedArtifact, setSelectedArtifact] =
    useState<ReservoirArtifact | null>(null);
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
    tab: withDefault(StringParam, 'artifacts'),
    statusCategory: withDefault(StringParam, 'all'),
  });

  const queryMapRef = useRef({
    [queryParams.tab]: {
      queryParams,
      tablePaginationOption,
    },
  });

  queryMapRef.current[queryParams.tab] = {
    queryParams,
    tablePaginationOption,
  };

  const [, updateFetchKey] = useUpdatableState('initial-fetch');

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
        versions: ['4.28.0', '4.29.1', '4.30.0'],
        description:
          'State-of-the-art Machine Learning for PyTorch, TensorFlow, and JAX.',
        source: 'PyPI',
      },
      {
        id: '2',
        name: 'llama-2-7b-chat',
        type: 'model',
        size: '13.5GB',
        updated_at: '2025-07-07T09:15:00Z',
        status: 'verified',
        versions: ['1.0.0', '1.1.0'],
        description: "Meta's Llama 2 Chat model with 7 billion parameters.",
        source: 'HuggingFace',
      },
      {
        id: '3',
        name: 'pytorch-training',
        type: 'image',
        size: '2.3GB',
        updated_at: '2025-07-06T16:45:00Z',
        status: 'pulling',
        versions: ['1.13.1', '2.0.0'],
        description: 'PyTorch training environment with CUDA support.',
        source: 'Docker Hub',
      },
      {
        id: '4',
        name: 'numpy',
        type: 'package',
        size: '28MB',
        updated_at: '2025-07-05T11:30:00Z',
        status: 'verified',
        versions: ['1.24.0', '1.25.0', '1.26.0'],
        description:
          'Fundamental package for scientific computing with Python.',
        source: 'PyPI',
      },
      {
        id: '5',
        name: 'tensorflow-serving',
        type: 'image',
        size: '1.8GB',
        updated_at: '2025-07-04T14:20:00Z',
        status: 'verifying',
        versions: ['2.13.0', '2.14.0'],
        description: 'TensorFlow Serving for model deployment.',
        source: 'Docker Hub',
      },
      {
        id: '6',
        name: 'scikit-learn',
        type: 'package',
        size: '52MB',
        updated_at: '2025-07-08T08:00:00Z',
        status: 'available',
        versions: ['1.3.0', '1.4.0', '1.5.0'],
        description: 'Machine learning library for Python.',
        source: 'PyPI',
      },
      {
        id: '7',
        name: 'bert-base-uncased',
        type: 'model',
        size: '440MB',
        updated_at: '2025-07-07T12:00:00Z',
        status: 'available',
        versions: ['1.0.0'],
        description:
          'BERT base model (uncased) for natural language processing.',
        source: 'HuggingFace',
      },
      {
        id: '8',
        name: 'ubuntu-ml',
        type: 'image',
        size: '1.2GB',
        updated_at: '2025-07-06T10:00:00Z',
        status: 'available',
        versions: ['20.04', '22.04'],
        description: 'Ubuntu with machine learning tools pre-installed.',
        source: 'Docker Hub',
      },
    ],
    [],
  );

  // Filter artifacts based on status category
  const filteredArtifacts = useMemo(() => {
    if (queryParams.tab !== 'artifacts') {
      return []; // Return empty array for non-artifacts tabs
    }

    return mockArtifacts.filter((artifact) => {
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
  }, [mockArtifacts, queryParams.tab, queryParams.statusCategory]);

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

  const handleArtifactSelect = (artifact: ReservoirArtifact) => {
    setSelectedArtifact(artifact);
  };

  const handleBackToList = () => {
    setSelectedArtifact(null);
  };

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

  if (selectedArtifact) {
    return (
      <Flex direction="column" align="stretch" gap={'md'}>
        <ReservoirArtifactDetail
          artifact={selectedArtifact}
          onBack={handleBackToList}
          onPull={handlePullArtifact}
        />
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="stretch" gap={'md'}>
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
          <Card size="small" variant="borderless">
            <Statistic
              title="Installed"
              value={artifactCounts.installed}
              prefix={<CheckCircle size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card size="small" variant="borderless">
            <Statistic
              title="Available"
              value={artifactCounts.available}
              prefix={<DatabaseIcon />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card size="small" variant="borderless">
            <Statistic
              title="Currently Pulling"
              value={artifactCounts.pulling}
              prefix={<Activity />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={6} xl={4}>
          <Card size="small" variant="borderless">
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
          <Card size="small" variant="borderless">
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
        variant="borderless"
        title="Reservoir"
        // extra={
        //   <Flex gap={'xs'}>
        //     <BAIFetchKeyButton
        //       loading={false}
        //       autoUpdateDelay={30_000}
        //       value={fetchKey}
        //       onChange={(newFetchKey) => {
        //         updateFetchKey(newFetchKey);
        //       }}
        //     />
        //     <Button
        //       type="primary"
        //       icon={<RefreshCw size={16} />}
        //       onClick={() => {
        //         console.log('Syncing with remote catalog...');
        //         updateFetchKey();
        //       }}
        //     >
        //       Sync Catalog
        //     </Button>
        //   </Flex>
        // }
        styles={{
          header: {
            borderBottom: 'none',
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        <BAITabs
          activeKey={queryParams.tab}
          onChange={(key) => {
            const storedQuery = queryMapRef.current[key] || {
              queryParams: {
                statusCategory: 'all',
              },
            };
            setQuery(
              { ...storedQuery.queryParams, tab: key as TabKey },
              'replace',
            );
            setTablePaginationOption(
              storedQuery.tablePaginationOption || { current: 1 },
            );
            setSelectedArtifactList([]);
          }}
          items={_.map(
            {
              artifacts: 'Artifacts',
              audit: 'Audit Logs',
            },
            (label, key) => ({
              key,
              label: (
                <Flex justify="center" gap={10}>
                  {label}
                  {
                    // Only show badge for artifacts tab
                    key === 'artifacts' && (artifactCounts.all || 0) > 0 && (
                      <Badge
                        count={artifactCounts.all}
                        color={
                          queryParams.tab === key
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
                    )
                  }
                </Flex>
              ),
            }),
          )}
        />
        {queryParams.tab === 'artifacts' ? (
          <Flex direction="column" align="stretch" gap={'sm'}>
            <Flex justify="between" wrap="wrap" gap={'sm'}>
              <Flex
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
                  ]}
                  value={queryParams.filter}
                  onChange={(value) => {
                    setQuery({ filter: value }, 'replaceIn');
                    setTablePaginationOption({ current: 1 });
                    setSelectedArtifactList([]);
                  }}
                />
              </Flex>
              <Flex gap={'sm'}>
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
              </Flex>
            </Flex>
            <ReservoirArtifactList
              artifacts={filteredArtifacts}
              onArtifactSelect={handleArtifactSelect}
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
          </Flex>
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ minHeight: 400 }}
          >
            <Typography.Title level={4} type="secondary">
              Audit Logs
            </Typography.Title>
            <Typography.Text type="secondary">
              Audit logs functionality will be implemented here.
            </Typography.Text>
          </Flex>
        )}
      </BAICard>
    </Flex>
  );
};

export default ReservoirPage;
