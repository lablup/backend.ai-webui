import { useBackendaiImageMetaData } from '../hooks';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import { ModelCardModalFragment$key } from './__generated__/ModelCardModalFragment.graphql';
import { BankOutlined } from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Divider,
  Form,
  Modal,
  ModalProps,
  Tag,
  Typography,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

const { Title, Paragraph, Text } = Typography;

interface ModelCardModalProps extends ModalProps {
  modelCardModalFrgmt?: ModelCardModalFragment$key | null;
  onRequestClose: () => void;
}
const ModelCardModal: React.FC<ModelCardModalProps> = ({
  modelCardModalFrgmt = null,
  onRequestClose,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [metadata] = useBackendaiImageMetaData();
  const model_info = useFragment(
    graphql`
      fragment ModelCardModalFragment on ModelInfo {
        id
        name
        author
        title
        version
        created_at
        modified_at
        description
        task
        category
        architecture
        framework
        label
        license
        min_resource
        architecture
        framework
      }
    `,
    modelCardModalFrgmt,
  );

  return (
    <Modal
      {...props}
      title={model_info?.title || model_info?.name}
      onCancel={onRequestClose}
      footer={
        <Button
          type="primary"
          onClick={() => {
            onRequestClose();
          }}
        >
          {t('button.Close')}
        </Button>
      }
    >
      <Flex justify="start" align="start">
        <Tag bordered={false}>{model_info?.category}</Tag>
        <Tag bordered={false} color="success">
          {model_info?.task}
        </Tag>
        <Tag icon={<BankOutlined />} bordered={false} color="geekblue">
          {model_info?.license}
        </Tag>
      </Flex>
      <Title level={5}>{t('modelStore.Description')}</Title>
      <Paragraph>{model_info?.description}</Paragraph>
      <Divider />
      <Descriptions
        title={t('modelStore.Metadata')}
        column={1}
        size="small"
        bordered
        items={[
          {
            key: 'author',
            label: t('modelStore.Author'),
            children: model_info?.author,
          },
          {
            key: 'version',
            label: t('modelStore.Version'),
            children: model_info?.version,
          },
          {
            key: 'architecture',
            label: t('environment.Architecture'),
            children: model_info?.architecture,
          },
          {
            key: 'frameworks',
            label: t('modelStore.Framework'),
            children: (
              <Flex direction="row" gap={'xs'}>
                {_.map(_.castArray(model_info?.framework), (framework) => {
                  const targetImageKey = framework?.replace(/\s*\d+\s*$/, '');
                  const imageInfo = _.find(
                    metadata?.imageInfo,
                    (imageInfo) => imageInfo.name === targetImageKey,
                  );
                  return imageInfo?.icon ? (
                    <Flex gap={'xxs'}>
                      <img
                        style={{
                          width: '1em',
                          height: '1em',
                        }}
                        src={'resources/icons/' + imageInfo?.icon}
                        alt={framework || ''}
                      />
                      {framework}
                    </Flex>
                  ) : (
                    <Typography.Text>{framework}</Typography.Text>
                  );
                })}
              </Flex>
            ),
          },
          {
            key: 'created',
            label: t('modelStore.Created'),
            children: dayjs(model_info?.created_at).format('lll'),
          },
          {
            key: 'last_modified',
            label: t('modelStore.LastModified'),
            children: dayjs(model_info?.modified_at).format('lll'),
          },
          {
            key: 'min_resource',
            label: t('modelStore.MinResource'),
            children: (
              <Flex gap="xs">
                {model_info?.min_resource &&
                  _.map(JSON.parse(model_info?.min_resource), (value, type) => {
                    return (
                      <ResourceNumber
                        key={type}
                        // @ts-ignore
                        type={type}
                        value={_.toString(value)}
                      />
                    );
                  })}
              </Flex>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ModelCardModal;
