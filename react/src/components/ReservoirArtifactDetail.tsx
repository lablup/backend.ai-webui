import type { ReservoirArtifact } from '../types/reservoir';
import {
  Card,
  Button,
  Typography,
  Descriptions,
  Tag,
  Space,
  Flex,
  List,
  Modal,
  Select,
  Progress,
  Alert,
  Divider,
  theme,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  Loader,
  AlertCircle,
  CloudDownload,
  Package,
  Container,
  Brain,
  Info,
} from 'lucide-react';
import React, { useState } from 'react';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

interface ReservoirArtifactDetailProps {
  artifact: ReservoirArtifact;
  onBack: () => void;
  onPull: (artifactId: string, version?: string) => void;
}

const ReservoirArtifactDetail: React.FC<ReservoirArtifactDetailProps> = ({
  artifact,
  onBack,
  onPull,
}) => {
  const { token } = theme.useToken();
  const [isPullModalVisible, setIsPullModalVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(
    artifact.versions[0],
  );
  const [isPulling, setIsPulling] = useState(false);

  const getStatusIcon = (status: ReservoirArtifact['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle size={16} color={token.colorSuccess} />;
      case 'pulling':
        return <Loader size={16} color={token.colorInfo} />;
      case 'verifying':
        return <Loader size={16} color={token.colorWarning} />;
      case 'available':
        return <CloudDownload size={16} color={token.colorPrimary} />;
      case 'error':
        return <AlertCircle size={16} color={token.colorError} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: ReservoirArtifact['status']) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pulling':
        return 'processing';
      case 'verifying':
        return 'warning';
      case 'available':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: ReservoirArtifact['type']) => {
    switch (type) {
      case 'model':
        return <Brain size={18} color={token.colorPrimary} />;
      case 'package':
        return <Package size={18} color={token.colorInfo} />;
      case 'image':
        return <Container size={18} color={token.colorWarning} />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: ReservoirArtifact['type']) => {
    switch (type) {
      case 'model':
        return 'blue';
      case 'package':
        return 'green';
      case 'image':
        return 'orange';
      default:
        return 'default';
    }
  };

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
      <Flex
        align="center"
        gap="middle"
        style={{ marginBottom: token.marginLG }}
      >
        <Button
          type="text"
          icon={<ArrowLeft size={18} />}
          onClick={onBack}
        ></Button>
        <Divider type="vertical" />
        <Flex align="center" gap="small">
          {getTypeIcon(artifact.type)}
          <Title level={3} style={{ margin: 0 }}>
            {artifact.name}
          </Title>
          <Tag color={getTypeColor(artifact.type)}>
            {artifact.type.toUpperCase()}
          </Tag>
          <Tag
            color={getStatusColor(artifact.status)}
            icon={getStatusIcon(artifact.status)}
          >
            {artifact.status.toUpperCase()}
          </Tag>
        </Flex>
      </Flex>

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
              Pull Artifact
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
            <Text code>{artifact.size}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Source">
            {artifact.source || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {dayjs(artifact.updated_at).fromNow()}
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
        <List
          dataSource={artifact.versions}
          renderItem={(version, index) => (
            <List.Item
              actions={[
                artifact.status === 'available' ? (
                  <Button
                    key="pull"
                    type="link"
                    icon={<Download size={14} />}
                    onClick={() => {
                      setSelectedVersion(version);
                      setIsPullModalVisible(true);
                    }}
                    disabled={isPulling}
                  >
                    Pull
                  </Button>
                ) : null,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Tag color={index === 0 ? 'blue' : 'default'}>
                    {index === 0 ? 'LATEST' : `v${version}`}
                  </Tag>
                }
                title={<Text strong>{version}</Text>}
                description={
                  artifact.checksums?.[version] && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      SHA256: {artifact.checksums[version]}
                    </Text>
                  )
                }
              />
            </List.Item>
          )}
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
