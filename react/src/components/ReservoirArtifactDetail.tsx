import type { ReservoirArtifact } from '../types/reservoir';
import {
  getStatusColor,
  getStatusIcon,
  getTypeColor,
  getTypeIcon,
} from '../utils/reservoir';
import BAIText from './BAIText';
import {
  Card,
  Button,
  Typography,
  Descriptions,
  Tag,
  Space,
  Table,
  TableColumnsType,
  Modal,
  Select,
  Progress,
  Alert,
  Divider,
  theme,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ArrowLeft, Download, Info, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

interface ReservoirArtifactDetailProps {
  artifact: ReservoirArtifact;
  onPull: (artifactId: string, version?: string) => void;
}

const ReservoirArtifactDetail: React.FC<ReservoirArtifactDetailProps> = ({
  artifact,
  onPull,
}) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [isPullModalVisible, setIsPullModalVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(
    artifact.versions[0],
  );
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = () => {
    setIsPulling(true);
    onPull(artifact.id, selectedVersion);
    setIsPullModalVisible(false);

    // Simulate pulling progress
    setTimeout(() => {
      setIsPulling(false);
    }, 3000);
  };

  const renderPullingProgress = () => {
    if (artifact.status === 'pulling' || isPulling) {
      return (
        <Alert
          message="Pulling in progress"
          description={
            <div>
              <Paragraph>
                Downloading {artifact.name} version {selectedVersion}...
              </Paragraph>
              <Progress
                percent={Math.floor(Math.random() * 100)}
                status="active"
              />
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: token.marginMD }}
        />
      );
    }
    return null;
  };

  return (
    <div>
      <BAIFlex align="center" style={{ marginBottom: token.marginLG }}>
        <Button
          type="text"
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/reservoir')}
        ></Button>
        <Divider
          type="vertical"
          style={{ marginLeft: 0, marginRight: token.marginMD }}
        />
        <BAIFlex align="center" gap="xs">
          <Title level={3} style={{ margin: 0 }}>
            {artifact.name}
          </Title>
          <Tag color={getTypeColor(artifact.type)} style={{ margin: 0 }}>
            {getTypeIcon(artifact.type, 18)} {artifact.type.toUpperCase()}
          </Tag>
          <Tag
            color={getStatusColor(artifact.status)}
            icon={getStatusIcon(artifact.status)}
            style={{ margin: 0 }}
          >
            {artifact.status.toUpperCase()}
          </Tag>
        </BAIFlex>
      </BAIFlex>

      {renderPullingProgress()}

      <Card
        title="Basic Information"
        extra={
          artifact.status === 'available' ? (
            <Button
              type="primary"
              icon={<Download size={16} />}
              onClick={() => setIsPullModalVisible(true)}
              disabled={isPulling}
              loading={isPulling}
            >
              {`Pull latest(v${artifact.versions[0]}) version`}
            </Button>
          ) : null
        }
        style={{ marginBottom: token.marginMD }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Name">{artifact.name}</Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag
              color={getTypeColor(artifact.type)}
              icon={getTypeIcon(artifact.type)}
            >
              {' '}
              {artifact.type.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={getStatusColor(artifact.status)}
              icon={getStatusIcon(artifact.status)}
            >
              {artifact.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Size">
            <BAIText monospace>{artifact.size}</BAIText>
          </Descriptions.Item>
          <Descriptions.Item label="Source">
            {artifact.sourceUrl ? (
              <Typography.Link
                href={artifact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {artifact.source || 'N/A'}
              </Typography.Link>
            ) : (
              artifact.source || 'N/A'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {dayjs(artifact.updated_at).format('lll')}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            <Paragraph>
              {artifact.description || 'No description available'}
            </Paragraph>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Available Versions"
        style={{ marginBottom: token.marginMD }}
        extra={
          <Text type="secondary">
            {artifact.versions.length} version
            {artifact.versions.length > 1 ? 's' : ''} available
          </Text>
        }
      >
        <Table
          dataSource={(
            artifact.versionDetails ||
            artifact.versions.map((version) => ({
              version,
              size: artifact.size,
              updated_at: artifact.updated_at,
              checksum: artifact.checksums?.[version],
              isInstalled: false, // default to false for legacy data
              isPulling: false, // default to false for legacy data
            }))
          ).map((versionData, index) => ({
            ...versionData,
            key: versionData.version,
            isLatest: index === 0,
          }))}
          columns={
            [
              {
                title: 'Version',
                dataIndex: 'version',
                key: 'version',
                render: (version: string, record: any) => (
                  <div>
                    <BAIFlex align="center" gap="xs">
                      <BAIText strong>{version}</BAIText>
                      {record.isLatest && <Tag color="blue">LATEST</Tag>}
                      {record.isInstalled && (
                        <Tag color="green" icon={<CheckCircle size={12} />}>
                          INSTALLED
                        </Tag>
                      )}
                    </BAIFlex>
                    {record.checksum && (
                      <Typography.Text
                        type="secondary"
                        style={{
                          fontSize: '12px',
                          display: 'block',
                          marginTop: '4px',
                        }}
                      >
                        {/* SHA256: {record.checksum} */}
                      </Typography.Text>
                    )}
                  </div>
                ),
                width: '40%',
              },
              {
                title: 'Action',
                key: 'action',
                render: (_, record: any) => {
                  const getButtonText = () => {
                    if (record.isPulling) return 'Pulling';
                    if (record.isInstalled) return 'Reinstall';
                    return 'Pull';
                  };

                  const getButtonType = () => {
                    if (record.isPulling) return 'default';
                    if (record.isInstalled) return 'default';
                    return 'primary';
                  };

                  return (
                    <Button
                      icon={<Download size={16} />}
                      onClick={() => {
                        setSelectedVersion(record.version);
                        setIsPullModalVisible(true);
                      }}
                      size="small"
                      disabled={record.isPulling || record.isInstalled}
                      type={getButtonType()}
                      loading={record.isPulling}
                    >
                      {getButtonText()}
                    </Button>
                  );
                },
                width: '15%',
              },
              {
                title: 'Size',
                dataIndex: 'size',
                key: 'size',
                render: (size: string) => <BAIText monospace>{size}</BAIText>,
                width: '20%',
              },
              {
                title: 'Updated',
                dataIndex: 'updated_at',
                key: 'updated_at',
                render: (updated_at: string) => (
                  <Typography.Text type="secondary">
                    {dayjs(updated_at).format('lll')}
                  </Typography.Text>
                ),
                width: '25%',
              },
            ] as TableColumnsType<any>
          }
          pagination={false}
          size="small"
        />
      </Card>

      {artifact.dependencies && artifact.dependencies.length > 0 && (
        <Card title="Dependencies" style={{ marginBottom: token.marginMD }}>
          <Space wrap>
            {artifact.dependencies.map((dep) => (
              <Tag key={dep} color="default">
                {dep}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {artifact.tags && artifact.tags.length > 0 && (
        <Card title="Tags">
          <Space wrap>
            {artifact.tags.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {artifact.status === 'available' && (
        <Modal
          title="Pull Artifact"
          open={isPullModalVisible}
          onOk={handlePull}
          onCancel={() => setIsPullModalVisible(false)}
          okText="Pull"
          cancelText="Cancel"
          okButtonProps={{
            loading: isPulling,
            disabled: !selectedVersion,
          }}
        >
          <Alert
            message="Pull Confirmation"
            description={
              <div>
                <Paragraph>
                  You are about to pull <Text strong>{artifact.name}</Text> to
                  your local repository.
                </Paragraph>
                <Paragraph>
                  <Text strong>Type:</Text> {artifact.type}
                  <br />
                  <Text strong>Size:</Text> {artifact.size}
                  <br />
                  <Text strong>Source:</Text> {artifact.source}
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
            icon={<Info size={16} />}
            style={{ marginBottom: token.marginMD }}
          />

          <div>
            <Text strong>Select Version:</Text>
            <Select
              value={selectedVersion}
              onChange={setSelectedVersion}
              style={{ width: '100%', marginTop: token.marginXS }}
              placeholder="Select a version"
            >
              {artifact.versions.map((version) => (
                <Select.Option key={version} value={version}>
                  {version}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReservoirArtifactDetail;
