import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import { ModelCardModalFragment$key } from './__generated__/ModelCardModalFragment.graphql';
import { BankOutlined } from '@ant-design/icons';
import {
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
  onOk?: (result: any) => void;
}
const ModelCardModal: React.FC<ModelCardModalProps> = ({
  modelCardModalFrgmt = null,
  onOk,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const model_info = useFragment(
    graphql`
      fragment ModelCardModalFragment on ModelInfo {
        name
        author
        title
        version
        created_at
        modified_at
        description
        task
        category
        label
        license
        min_resource
      }
    `,
    modelCardModalFrgmt,
  );

  return (
    <Modal {...props} title={model_info?.title || model_info?.name}>
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
                <ResourceNumber
                  key="cpu"
                  type="cpu"
                  value={model_info?.min_resource?.cpu.toString()}
                />
                {/* <ResourceNumber
                  key="mem"
                  type="mem"
                  value={(model_info?.min_resource?.memory).toString()}
                /> */}
              </Flex>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ModelCardModal;
