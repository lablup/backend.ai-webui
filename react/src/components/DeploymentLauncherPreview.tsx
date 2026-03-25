import { preserveDotStartCase, getImageFullName } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useThemeMode } from '../hooks/useThemeMode';
import {
  DeploymentLauncherFormValue,
  DeploymentLauncherStepKey,
} from '../pages/DeploymentLauncherPage';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import ImageMetaIcon from './ImageMetaIcon';
import { ImageTags } from './ImageTags';
import VFolderLazyView from './VFolderLazyView';
import {
  Typography,
  Form,
  Descriptions,
  Tag,
  Row,
  Col,
  Divider,
  Card,
  Table,
  theme,
} from 'antd';
import { BAICard, BAIDoubleTag, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const DeploymentLauncherPreview: React.FC<{
  onClickEditStep: (stepKey: DeploymentLauncherStepKey) => void;
}> = ({ onClickEditStep }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance<DeploymentLauncherFormValue>();
  const { isDarkMode } = useThemeMode();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const supportExtendedImageInfo =
    baiClient?.supports('extended-image-info') ?? false;
  const [, { getBaseVersion, getBaseImage, tagAlias }] =
    useBackendAIImageMetaData();

  return (
    <BAIFlex direction="column" gap="md">
      {/* Metadata Summary */}
      <BAICard
        title={t('deployment.launcher.Deployment')}
        showDivider
        size="small"
        status={
          _.some(
            form.getFieldsError([
              ['metadata', 'name'],
              ['metadata', 'tags'],
              ['defaultDeploymentStrategy', 'type'],
              ['networkAccess', 'preferredDomainName'],
              ['networkAccess', 'openToPublic'],
            ]),
            (fieldError) => fieldError.errors.length > 0,
          )
            ? 'error'
            : undefined
        }
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => onClickEditStep('deployment')}
      >
        <Descriptions
          size="small"
          column={1}
          items={[
            {
              key: 'deploymentName',
              label: t('deployment.launcher.DeploymentName'),
              children: form.getFieldValue(['metadata', 'name']) || (
                <Typography.Text type="secondary">
                  {t('general.None')}
                </Typography.Text>
              ),
            },
            ...(form.getFieldValue(['metadata', 'tags'])?.length > 0
              ? [
                  {
                    key: 'tags',
                    label: t('deployment.launcher.Tags'),
                    children: (
                      <BAIFlex direction="row" gap="xs" wrap="wrap">
                        {form
                          .getFieldValue(['metadata', 'tags'])
                          .map((tag: string, index: number) => (
                            <Tag key={index}>{tag}</Tag>
                          ))}
                      </BAIFlex>
                    ),
                  },
                ]
              : []),
            {
              key: 'defaultDeploymentStrategy',
              label: t('deployment.launcher.defaultDeploymentStrategy'),
              children:
                form.getFieldValue(['defaultDeploymentStrategy', 'type']) ===
                'ROLLING' ? (
                  t('deployment.launcher.RollingUpdate')
                ) : form.getFieldValue([
                    'defaultDeploymentStrategy',
                    'type',
                  ]) === 'BLUE_GREEN' ? (
                  t('deployment.launcher.BlueGreenDeployment')
                ) : form.getFieldValue([
                    'defaultDeploymentStrategy',
                    'type',
                  ]) === 'CANARY' ? (
                  t('deployment.launcher.CanaryDeployment')
                ) : (
                  <Typography.Text type="secondary">
                    {t('general.None')}
                  </Typography.Text>
                ),
            },
            {
              key: 'desiredReplicas',
              label: t('deployment.NumberOfDesiredReplicas'),
              children: form.getFieldValue(['desiredReplicaCount']),
            },
            ...(form.getFieldValue(['networkAccess', 'preferredDomainName'])
              ? [
                  {
                    key: 'preferredDomainName',
                    label: t('deployment.launcher.PreferredDomainName'),
                    children: (
                      <Typography.Text type="secondary">
                        {form.getFieldValue([
                          'networkAccess',
                          'preferredDomainName',
                        ])}
                      </Typography.Text>
                    ),
                  },
                ]
              : []),
            {
              key: 'openToPublic',
              label: t('deployment.launcher.OpenToPublic'),
              children: form.getFieldValue(['networkAccess', 'openToPublic'])
                ? t('button.Yes')
                : t('button.No'),
            },
          ]}
        />
      </BAICard>

      {/* Initial Revisions Summary */}
      <BAICard
        title={t('deployment.launcher.InitialRevision')}
        showDivider
        size="small"
        status={
          _.some(
            form.getFieldsError([
              ['initialRevision', 'name'],
              ['initialRevision', 'image'],
              ['initialRevision', 'modelRuntimeConfig', 'runtimeVariant'],
              [
                'initialRevision',
                'modelRuntimeConfig',
                'inferenceRuntimeConfig',
              ],
              ['initialRevision', 'modelMountConfig', 'vfolderId'],
              ['initialRevision', 'modelMountConfig', 'mountDestination'],
              ['initialRevision', 'modelMountConfig', 'definitionPath'],
              ['environments', 'environment'],
              ['environments', 'version'],
              ['environments', 'manual'],
              ['cluster_mode'],
              ['cluster_size'],
              ['resourceGroup'],
              ['resource', 'cpu'],
              ['resource', 'mem'],
              ['resource', 'accelerator'],
              ['resource', 'acceleratorType'],
              ['resource', 'shmem'],
            ]),
            (fieldError) => fieldError.errors.length > 0,
          ) ||
          _.some(
            form.getFieldValue([
              'initialRevision',
              'modelRuntimeConfig',
              'inferenceRuntimeConfig',
            ]) as Array<{ variable: string; value: string }>,
            (v, idx) => {
              return (
                form.getFieldError([
                  'initialRevision',
                  'modelRuntimeConfig',
                  'inferenceRuntimeConfig',
                  // @ts-ignore
                  idx,
                  // @ts-ignore
                  'variable',
                ]).length > 0 ||
                form.getFieldError([
                  'initialRevision',
                  'modelRuntimeConfig',
                  'inferenceRuntimeConfig',
                  // @ts-ignore
                  idx,
                  // @ts-ignore
                  'value',
                ]).length > 0
              );
            },
          ) ||
          _.some(
            form.getFieldValue([
              'initialRevision',
              'modelRuntimeConfig',
              'environ',
            ]) as Array<{ variable: string; value: string }>,
            (v, idx) => {
              return (
                form.getFieldError([
                  'initialRevision',
                  'modelRuntimeConfig',
                  'environ',
                  // @ts-ignore
                  idx,
                  // @ts-ignore
                  'variable',
                ]).length > 0 ||
                form.getFieldError([
                  'initialRevision',
                  'modelRuntimeConfig',
                  'environ',
                  // @ts-ignore
                  idx,
                  // @ts-ignore
                  'value',
                ]).length > 0
              );
            },
          )
            ? 'error'
            : undefined
        }
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => onClickEditStep('revisions')}
      >
        {form.getFieldValue(['initialRevision', 'name'])?.length > 0 && (
          <Descriptions
            size="small"
            column={1}
            items={[
              {
                key: 'revisionName',
                label: t('deployment.launcher.RevisionName'),
                children: form.getFieldValue(['initialRevision', 'name']) || (
                  <Typography.Text type="secondary">
                    {t('general.None')}
                  </Typography.Text>
                ),
              },
            ]}
          />
        )}
        <Descriptions
          size="small"
          column={1}
          items={[
            {
              key: 'containerImage',
              label: t('deployment.launcher.ContainerImage'),
              children: supportExtendedImageInfo ? (
                <Row style={{ flexFlow: 'nowrap' }}>
                  <Col>
                    <ImageMetaIcon
                      image={
                        form.getFieldValue(['environments', 'manual']) ||
                        form.getFieldValue(['environments', 'version'])
                      }
                      style={{ marginRight: token.marginXS }}
                    />
                  </Col>
                  <Col>
                    <BAIFlex direction="row" wrap="wrap">
                      {form.getFieldValue(['environments', 'manual']) ? (
                        <Typography.Text
                          code
                          style={{ wordBreak: 'break-all' }}
                          copyable={{
                            text: form.getFieldValue([
                              'environments',
                              'manual',
                            ]),
                          }}
                        >
                          {form.getFieldValue(['environments', 'manual'])}
                        </Typography.Text>
                      ) : (
                        <>
                          <Typography.Text>
                            {tagAlias(
                              form.getFieldValue(['environments', 'image'])
                                ?.base_image_name,
                            )}
                          </Typography.Text>
                          <Divider type="vertical" />
                          <Typography.Text>
                            {
                              form.getFieldValue(['environments', 'image'])
                                ?.version
                            }
                          </Typography.Text>
                          <Divider type="vertical" />
                          <Typography.Text>
                            {
                              form.getFieldValue(['environments', 'image'])
                                ?.architecture
                            }
                          </Typography.Text>
                          <Divider type="vertical" />
                          {/* TODO: replace this with AliasedImageDoubleTags after image list query with ImageNode is implemented. */}
                          {_.map(
                            form.getFieldValue(['environments', 'image'])?.tags,
                            (tag: { key: string; value: string }) => {
                              const isCustomized = _.includes(
                                tag.key,
                                'customized_',
                              );
                              const tagValue = isCustomized
                                ? _.find(
                                    form.getFieldValue([
                                      'environments',
                                      'image',
                                    ])?.labels,
                                    {
                                      key: 'ai.backend.customized-image.name',
                                    },
                                  )?.value
                                : tag.value;
                              const aliasedTag = tagAlias(tag.key + tagValue);
                              return _.isEqual(
                                aliasedTag,
                                preserveDotStartCase(tag.key + tagValue),
                              ) || isCustomized ? (
                                <BAIDoubleTag
                                  key={tag.key}
                                  values={[
                                    {
                                      label: tagAlias(tag.key),
                                      color: isCustomized ? 'cyan' : 'blue',
                                    },
                                    {
                                      label: tagValue,
                                      color: isCustomized ? 'cyan' : 'blue',
                                    },
                                  ]}
                                />
                              ) : (
                                <Tag
                                  key={tag.key}
                                  color={isCustomized ? 'cyan' : 'blue'}
                                >
                                  {aliasedTag}
                                </Tag>
                              );
                            },
                          )}
                          <Typography.Text
                            style={{ color: token.colorPrimary }}
                            copyable={{
                              text:
                                getImageFullName(
                                  form.getFieldValue(['environments', 'image']),
                                ) ||
                                form.getFieldValue(['environments', 'version']),
                            }}
                          />
                        </>
                      )}
                    </BAIFlex>
                  </Col>
                </Row>
              ) : (
                <Row style={{ flexFlow: 'nowrap', gap: token.sizeXS }}>
                  <Col>
                    <ImageMetaIcon
                      image={
                        form.getFieldValue(['environments', 'manual']) ||
                        form.getFieldValue(['environments', 'version'])
                      }
                    />
                  </Col>
                  <Col>
                    <BAIFlex direction="row" wrap="wrap">
                      {form.getFieldValue(['environments', 'manual']) ? (
                        <Typography.Text
                          code
                          style={{ wordBreak: 'break-all' }}
                          copyable={{
                            text: form.getFieldValue([
                              'environments',
                              'manual',
                            ]),
                          }}
                        >
                          {form.getFieldValue(['environments', 'manual'])}
                        </Typography.Text>
                      ) : (
                        <>
                          <Typography.Text>
                            {tagAlias(
                              getBaseImage(
                                form.getFieldValue(['environments', 'version']),
                              ),
                            )}
                          </Typography.Text>
                          <Divider type="vertical" />
                          <Typography.Text>
                            {getBaseVersion(
                              form.getFieldValue(['environments', 'version']),
                            )}
                          </Typography.Text>
                          <Divider type="vertical" />
                          <Typography.Text>
                            {
                              form.getFieldValue(['environments', 'image'])
                                ?.architecture
                            }
                          </Typography.Text>
                          <Divider type="vertical" />
                          <ImageTags
                            tag={form.getFieldValue([
                              'environments',
                              'image',
                              'tag',
                            ])}
                            labels={
                              form.getFieldValue(['environments', 'image'])
                                ?.labels as Array<{
                                key: string;
                                value: string;
                              }>
                            }
                          />
                          <Typography.Text
                            style={{ color: token.colorPrimary }}
                            copyable={{
                              text:
                                getImageFullName(
                                  form.getFieldValue(['environments', 'image']),
                                ) ||
                                form.getFieldValue(['environments', 'version']),
                            }}
                          />
                        </>
                      )}
                    </BAIFlex>
                  </Col>
                </Row>
              ),
            },
          ]}
        />

        {/* FIXME: Antd bug: If Divider is inside Descriptions, the style may not be applied correctly */}
        <Divider orientation="vertical" style={{ fontSize: token.fontSize }}>
          {t('deployment.launcher.RuntimeAndMountConfig')}
        </Divider>

        <Descriptions
          size="small"
          column={1}
          items={[
            {
              key: 'runtimeVariant',
              label: t('deployment.launcher.RuntimeVariant'),
              children: form.getFieldValue([
                'initialRevision',
                'modelRuntimeConfig',
                'runtimeVariant',
              ]) || (
                <Typography.Text type="secondary">
                  {t('general.None')}
                </Typography.Text>
              ),
            },
            {
              key: 'modelStorageToMount',
              label: t('deployment.launcher.ModelStorageToMount'),
              children: form.getFieldValue([
                'initialRevision',
                'modelMountConfig',
                'vfolderId',
              ]) ? (
                <VFolderLazyView
                  uuid={form.getFieldValue([
                    'initialRevision',
                    'modelMountConfig',
                    'vfolderId',
                  ])}
                />
              ) : (
                <Typography.Text type="secondary">
                  {t('general.None')}
                </Typography.Text>
              ),
            },
            {
              key: 'mountDestination',
              label: t('deployment.launcher.MountDestination'),
              children: form.getFieldValue([
                'initialRevision',
                'modelMountConfig',
                'mountDestination',
              ]) || <Typography.Text>/models</Typography.Text>,
            },
            {
              key: 'definitionPath',
              label: t('deployment.launcher.DefinitionPath'),
              children: form.getFieldValue([
                'initialRevision',
                'modelMountConfig',
                'definitionPath',
              ]) || <Typography.Text>model-definition.yaml</Typography.Text>,
            },
            ...(form.getFieldValue('mount_ids')?.length > 0
              ? [
                  {
                    key: 'additionalMounts',
                    label: t('deployment.launcher.AdditionalMounts'),
                    span: 2,
                    children: (
                      <Table
                        rowKey="name"
                        size="small"
                        pagination={false}
                        style={{ width: '100%' }}
                        columns={[
                          {
                            dataIndex: 'name',
                            title: t('data.folders.Name'),
                          },
                          {
                            dataIndex: 'alias',
                            title: t('session.launcher.FolderAlias'),
                            render: (value, record) => {
                              return _.isEmpty(value) ? (
                                <Typography.Text
                                  type="secondary"
                                  style={{
                                    opacity: 0.7,
                                  }}
                                >
                                  {`/home/work/${record.name}`}
                                </Typography.Text>
                              ) : (
                                value
                              );
                            },
                          },
                        ]}
                        dataSource={_.map(
                          form.getFieldValue('mount_ids'),
                          (v) => {
                            const name =
                              form.getFieldValue('vfoldersNameMap')?.[v] || v;
                            return {
                              name,
                              alias: form.getFieldValue('mount_id_map')?.[v],
                            };
                          },
                        )}
                      />
                    ),
                  },
                ]
              : []),
            ...(form.getFieldValue([
              'initialRevision',
              'modelRuntimeConfig',
              'inferenceRuntimeConfig',
            ])?.length > 0
              ? [
                  {
                    key: 'inferenceRuntimeConfig',
                    label: t('deployment.launcher.InferenceRuntimeConfig'),
                    children: (
                      <SyntaxHighlighter
                        style={isDarkMode ? dark : undefined}
                        customStyle={{
                          margin: 0,
                          width: '100%',
                        }}
                      >
                        {_.map(
                          form.getFieldValue([
                            'initialRevision',
                            'modelRuntimeConfig',
                            'inferenceRuntimeConfig',
                          ]) || [],
                          (v: { variable: string; value: string }) =>
                            `${v?.variable || ''}="${v?.value || ''}"`,
                        ).join('\n')}
                      </SyntaxHighlighter>
                    ),
                  },
                ]
              : []),
            ...(form.getFieldValue([
              'initialRevision',
              'modelRuntimeConfig',
              'environ',
            ])?.length > 0
              ? [
                  {
                    key: 'environmentVariables',
                    label: t('deployment.launcher.EnvironmentVariables'),
                    children: (
                      <SyntaxHighlighter
                        style={isDarkMode ? dark : undefined}
                        customStyle={{
                          margin: 0,
                          width: '100%',
                        }}
                      >
                        {_.map(
                          form.getFieldValue([
                            'initialRevision',
                            'modelRuntimeConfig',
                            'environ',
                          ]) || [],
                          (v: { variable: string; value: string }) =>
                            `${v?.variable || ''}="${v?.value || ''}"`,
                        ).join('\n')}
                      </SyntaxHighlighter>
                    ),
                  },
                ]
              : []),
          ]}
        />

        <Divider orientation="vertical" style={{ fontSize: token.fontSize }}>
          {t('deployment.launcher.ResourceAllocation')}
        </Divider>

        <Descriptions
          size="small"
          column={1}
          items={[
            {
              key: 'clusterMode',
              label: t('deployment.launcher.ClusterMode'),
              children:
                form.getFieldValue('cluster_mode') === 'single-node'
                  ? t('deployment.launcher.SingleNode')
                  : t('deployment.launcher.MultiNode'),
            },
            {
              key: 'clusterSize',
              label: t('deployment.launcher.ClusterSize'),
              children: form.getFieldValue('cluster_size') || 1,
            },
            {
              key: 'resourceGroup',
              label: t('deployment.launcher.ResourceGroup'),
              children: form.getFieldValue('resourceGroup') || (
                <Typography.Text type="secondary">
                  {t('general.None')}
                </Typography.Text>
              ),
            },
            {
              key: 'resourceAllocation',
              label: t('deployment.launcher.ResourceAllocation'),
              children: (
                <BAIFlex
                  direction="row"
                  align="start"
                  gap={'sm'}
                  wrap="wrap"
                  style={{ flex: 1 }}
                >
                  {form.getFieldValue('allocationPreset') === 'custom' ? (
                    // Custom allocation - no preset tag
                    ''
                  ) : (
                    <Tag>{form.getFieldValue('allocationPreset')}</Tag>
                  )}

                  <ResourceNumbersOfSession
                    resource={form.getFieldValue('resource')}
                  />
                </BAIFlex>
              ),
            },
          ]}
        />
        <Card
          size="small"
          type="inner"
          title={t('deployment.launcher.TotalAllocation')}
          style={{ marginTop: token.marginXS }}
        >
          <BAIFlex direction="row" gap="xxs">
            <ResourceNumbersOfSession
              resource={form.getFieldValue('resource')}
              containerCount={form.getFieldValue('cluster_size') || 1}
            />
          </BAIFlex>
        </Card>
      </BAICard>
    </BAIFlex>
  );
};

export default DeploymentLauncherPreview;
