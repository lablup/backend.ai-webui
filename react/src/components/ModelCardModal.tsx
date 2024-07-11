import { useBackendAIImageMetaData } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import ModelCloneModal from './ModelCloneModal';
import ResourceNumber from './ResourceNumber';
import { ModelCardModalFragment$key } from './__generated__/ModelCardModalFragment.graphql';
import { BankOutlined, CopyOutlined, FileOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Tag,
  Typography,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Cog } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface ModelCardModalProps extends BAIModalProps {
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

  const [visibleCloneModal, setVisibleCloneModal] = useState(false);

  const [metadata] = useBackendAIImageMetaData();
  const model_card = useFragment(
    graphql`
      fragment ModelCardModalFragment on ModelCard {
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
        readme
        min_resource
        architecture
        framework
        vfolder {
          cloneable
        }
        vfolder_node @since(version: "24.09.*") {
          ...ModelCloneModalVFolderFragment
        }
        vfolder {
          id
          name
          host
        }
      }
    `,
    modelCardModalFrgmt,
  );
  return (
    <BAIModal
      {...props}
      title={model_card?.title || model_card?.name}
      centered
      onCancel={onRequestClose}
      destroyOnClose
      width={800}
      footer={[
        <Button
          onClick={() => {
            onRequestClose();
          }}
          key="close"
        >
          {t('button.Close')}
        </Button>,
      ]}
    >
      <Flex
        direction="row"
        align="start"
        style={{ marginBottom: token.marginSM }}
        gap={'xs'}
        wrap="wrap"
      >
        <Flex
          justify="start"
          align="start"
          gap={'xs'}
          style={{ flex: 1 }}
          wrap="wrap"
        >
          {model_card?.category && (
            <Tag bordered={false} style={{ marginRight: 0 }}>
              {model_card?.category}
            </Tag>
          )}
          {model_card?.task && (
            <Tag bordered={false} color="success" style={{ marginRight: 0 }}>
              {model_card?.task}
            </Tag>
          )}
          {model_card?.label &&
            _.map(model_card?.label, (label) => (
              <Tag
                key={label}
                bordered={false}
                color="blue"
                style={{ marginRight: 0 }}
              >
                {label}
              </Tag>
            ))}
          {model_card?.license && (
            <Tag
              icon={<BankOutlined />}
              bordered={false}
              color="geekblue"
              style={{ marginRight: 0 }}
            >
              {model_card?.license}
            </Tag>
          )}
        </Flex>
        <Flex direction="row" justify="end" gap={'sm'}>
          {/* <Button
            type="primary"
            ghost
            icon={<DownloadOutlined />}
            size="small"
            disabled
          >
            {t('button.Download')}
          </Button> */}
          <Button disabled ghost size="small" icon={<Cog />}>
            {t('modelStore.FinetuneModel')}
          </Button>
          <Button
            type="primary"
            ghost
            icon={<CopyOutlined />}
            size="small"
            disabled={!model_card?.vfolder?.cloneable}
            onClick={() => {
              // const event = new CustomEvent('backend-ai-vfolder-cloning', {
              //   detail: {
              //     // TODO: change this to vfolder name
              //     name: mode_card?.name,
              //   },
              // });
              // onRequestClose();
              // document.dispatchEvent(event);
              setVisibleCloneModal(true);
            }}
          >
            {t('modelStore.CloneToFolder')}
          </Button>
        </Flex>
      </Flex>
      <Row gutter={[token.marginLG, token.marginLG]}>
        <Col xs={{ span: 24 }}>
          <Flex direction="column" align="stretch" gap={'xs'}>
            <Typography.Paragraph
              ellipsis={{
                rows: 3,
                expandable: 'collapsible',
                symbol: (expanded) => (
                  <Button size="small" type="link">
                    {expanded ? t('button.Collapse') : t('button.Expand')}
                  </Button>
                ),
              }}
            >
              {model_card?.description}
            </Typography.Paragraph>
            <Descriptions
              style={{ marginTop: token.marginMD }}
              // title={t('modelStore.Metadata')}
              column={1}
              size="small"
              bordered
              items={[
                {
                  key: 'author',
                  label: t('modelStore.Author'),
                  children: model_card?.author,
                },
                {
                  key: 'version',
                  label: t('modelStore.Version'),
                  children: model_card?.version,
                },
                {
                  key: 'architecture',
                  label: t('environment.Architecture'),
                  children: model_card?.architecture,
                },
                {
                  key: 'frameworks',
                  label: t('modelStore.Framework'),
                  children: (
                    <Flex direction="row" gap={'xs'}>
                      {_.map(
                        _.filter(
                          _.castArray(model_card?.framework),
                          (v) => !_.isEmpty(v),
                        ),
                        (framework, index) => {
                          const targetImageKey = framework?.replace(
                            /\s*\d+\s*$/,
                            '',
                          );
                          const imageInfo = _.find(
                            metadata?.imageInfo,
                            (imageInfo) => imageInfo?.name === targetImageKey,
                          );
                          const uniqueKey = `${framework}-${index}`;
                          return imageInfo?.icon ? (
                            <Flex gap={'xxs'} key={uniqueKey}>
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
                            <Typography.Text key={uniqueKey}>
                              {framework}
                            </Typography.Text>
                          );
                        },
                      )}
                    </Flex>
                  ),
                },
                {
                  key: 'created',
                  label: t('modelStore.Created'),
                  children: dayjs(model_card?.created_at).format('lll'),
                },
                {
                  key: 'last_modified',
                  label: t('modelStore.LastModified'),
                  children: dayjs(model_card?.modified_at).format('lll'),
                },
                {
                  key: 'min_resource',
                  label: t('modelStore.MinResource'),
                  children: (
                    <Flex gap="xs">
                      {model_card?.min_resource &&
                        _.map(
                          JSON.parse(model_card?.min_resource),
                          (value, type) => {
                            return (
                              <ResourceNumber
                                key={type}
                                // @ts-ignore
                                type={type}
                                value={_.toString(value)}
                              />
                            );
                          },
                        )}
                    </Flex>
                  ),
                },
              ]}
            />
          </Flex>
        </Col>
        {!!model_card?.readme ? (
          <Col xs={{ span: 24 }}>
            <Card
              size="small"
              title={
                <Flex direction="row" gap={'xs'}>
                  <FileOutlined />
                  README.md
                </Flex>
              }
              styles={{
                body: {
                  padding: token.paddingLG,
                  overflow: 'auto',
                  // height: screen.lg ? 'calc(100vh - 243px)' : undefined,
                  minHeight: 200,
                },
              }}
            >
              <Markdown>{model_card?.readme || ''}</Markdown>
            </Card>
          </Col>
        ) : null}
      </Row>
      <Suspense>
        <ModelCloneModal
          vfolderNode={model_card?.vfolder_node || null}
          deprecatedVFolderInfo={{
            id: model_card?.vfolder?.id || '',
            host: model_card?.vfolder?.host || '',
            name: model_card?.vfolder?.name || '',
          }}
          title={t('modelStore.CloneAsFolder')}
          open={visibleCloneModal}
          onOk={() => {
            setVisibleCloneModal(false);
          }}
          onCancel={() => {
            setVisibleCloneModal(false);
          }}
        />
      </Suspense>
    </BAIModal>
  );
};

export default ModelCardModal;
