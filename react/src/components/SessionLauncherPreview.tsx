/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { preserveDotStartCase, getImageFullName } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  SessionLauncherFormValue,
  ResourceNumbersOfSession,
  SessionLauncherStepKey,
} from '../pages/SessionLauncherPage';
import ImageMetaIcon from './ImageMetaIcon';
import { ImageTags } from './ImageTags';
import { PortTag } from './PortSelectFormItem';
import { SessionOwnerSetterPreviewCard } from './SessionOwnerSetterCard';
import SourceCodeView from './SourceCodeView';
import {
  Descriptions,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Alert,
  Card,
  Table,
  Form,
  theme,
  Button,
  App,
} from 'antd';
import { BAIAlert, BAICard, BAIDoubleTag, BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SessionLauncherPreview: React.FC<{
  onClickEditStep: (stepKey: SessionLauncherStepKey) => void;
}> = ({ onClickEditStep }) => {
  const app = App.useApp();
  const { t } = useTranslation();
  const form = Form.useFormInstance<SessionLauncherFormValue>();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const sessionType = Form.useWatch('sessionType', { form, preserve: true });
  const supportBatchTimeout = baiClient?.supports('batch-timeout') ?? false;
  const supportExtendedImageInfo =
    baiClient?.supports('extended-image-info') ?? false;
  const currentProject = useCurrentProjectValue();
  const [, { getBaseVersion, getBaseImage, tagAlias }] =
    useBackendAIImageMetaData();

  // Per-section validation status. A section is "non-success" when it holds a
  // field error; those sections are expanded by default so the user lands on
  // what needs fixing.
  const sessionTypeHasError =
    form.getFieldError('sessionName').length > 0 ||
    form.getFieldError(['batch', 'command']).length > 0 ||
    form.getFieldError(['batch', 'scheduleDate']).length > 0;
  const ownerHasError =
    form.getFieldError(['owner', 'email']).length > 0 ||
    form.getFieldError(['owner', 'accesskey']).length > 0 ||
    form.getFieldError(['owner', 'project']).length > 0 ||
    form.getFieldError(['owner', 'resourceGroup']).length > 0;
  const environmentsHasError = _.some(
    form.getFieldValue('envvars') as SessionLauncherFormValue['envvars'],
    (_v, idx) =>
      form.getFieldError(['envvars', idx, 'variable']).length > 0 ||
      form.getFieldError(['envvars', idx, 'value']).length > 0,
  );
  const resourceAllocationHasError =
    _.some(form.getFieldValue('resource'), (_v, key) => {
      // @ts-ignore
      return form.getFieldError(['resource', key]).length > 0;
    }) ||
    form.getFieldError(['num_of_sessions']).length > 0 ||
    form.getFieldError('resourceGroup').length > 0;
  const dataStorageHasError = form.getFieldError('mount_id_map').length > 0;
  const networkHasError = form.getFieldError('ports').length > 0;

  const sectionErrors: Record<string, boolean> = {
    sessionType: sessionTypeHasError,
    owner: ownerHasError,
    environments: environmentsHasError,
    resourceAllocation: resourceAllocationHasError,
    dataStorage: dataStorageHasError,
    network: networkHasError,
  };
  const nonSuccessKeys = _.keys(_.pickBy(sectionErrors));
  // Resync expansion to the non-success sections whenever the set of failing
  // sections changes (e.g. after validation completes on entering the step).
  const nonSuccessSignature = nonSuccessKeys.join('|');
  const [expandedKeys, setExpandedKeys] = useState<string[]>(nonSuccessKeys);
  const syncExpandedToNonSuccess = useEffectEvent(() => {
    setExpandedKeys(_.keys(_.pickBy(sectionErrors)));
  });
  useEffect(() => {
    syncExpandedToNonSuccess();
  }, [nonSuccessSignature]);

  const isExpanded = (key: string) => expandedKeys.includes(key);
  const handleCollapsedChange = (key: string) => (collapsed: boolean) => {
    setExpandedKeys((prev) =>
      collapsed ? prev.filter((k) => k !== key) : _.uniq([...prev, key]),
    );
  };

  return (
    <>
      {form.getFieldValue('bootstrap_script') && (
        <BAIAlert
          description={t('session.launcher.UsingBootstrapScriptInfo')}
          ghostInfoBg={false}
          action={
            <Button
              size="small"
              type="text"
              onClick={() => {
                app.modal.info({
                  title: t('session.launcher.BootstrapScriptDetail'),
                  content: (
                    <BAIFlex direction="column" align="start">
                      <Typography.Paragraph>
                        {t('userSettings.BootstrapScriptDescription')}
                      </Typography.Paragraph>
                      <SourceCodeView language={'shell'}>
                        {form.getFieldValue('bootstrap_script')}
                      </SourceCodeView>
                    </BAIFlex>
                  ),
                  width: 800,
                });
              }}
            >
              {t('notification.SeeDetail')}
            </Button>
          }
          type="info"
          showIcon
        />
      )}
      <BAICard
        title={t('session.launcher.SessionType')}
        showDivider
        size="small"
        status={sessionTypeHasError ? 'error' : undefined}
        collapsible
        collapsed={!isExpanded('sessionType')}
        onCollapsedChange={handleCollapsedChange('sessionType')}
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('sessionType');
        }}
      >
        <Descriptions size="small" column={1}>
          <Descriptions.Item label={t('session.SessionType')}>
            {form.getFieldValue('sessionType')}
          </Descriptions.Item>
          {!_.isEmpty(form.getFieldValue('sessionName')) && (
            <Descriptions.Item label={t('session.launcher.SessionName')}>
              {form.getFieldValue('sessionName')}
            </Descriptions.Item>
          )}
          {sessionType === 'batch' && (
            <>
              <Descriptions.Item
                label={t('session.launcher.StartUpCommand')}
                styles={{
                  label: {
                    whiteSpace: 'nowrap',
                  },
                  content: {
                    overflow: 'auto',
                    display: 'flex',
                  },
                }}
              >
                {form.getFieldValue(['batch', 'command']) ? (
                  <SourceCodeView language="shell">
                    {form.getFieldValue(['batch', 'command'])}
                  </SourceCodeView>
                ) : (
                  <Typography.Text type="secondary">
                    {t('general.None')}
                  </Typography.Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('session.launcher.SessionStartTime')}>
                {form.getFieldValue(['batch', 'scheduleDate']) ? (
                  dayjs(form.getFieldValue(['batch', 'scheduleDate'])).format(
                    'LLL (Z)',
                  )
                ) : (
                  <Typography.Text type="secondary">
                    {t('general.None')}
                  </Typography.Text>
                )}
              </Descriptions.Item>
              {supportBatchTimeout ? (
                <Descriptions.Item
                  label={t('session.launcher.BatchJobTimeoutDuration')}
                >
                  {form.getFieldValue(['batch', 'timeout']) ? (
                    <Typography.Text>
                      {form.getFieldValue(['batch', 'timeout'])}
                      {form.getFieldValue(['batch', 'timeoutUnit']) || 's'}
                    </Typography.Text>
                  ) : (
                    <Typography.Text type="secondary">
                      {t('general.None')}
                    </Typography.Text>
                  )}
                </Descriptions.Item>
              ) : null}
            </>
          )}
        </Descriptions>
      </BAICard>
      <SessionOwnerSetterPreviewCard
        collapsible
        collapsed={!isExpanded('owner')}
        onCollapsedChange={handleCollapsedChange('owner')}
        onClickExtraButton={() => {
          onClickEditStep('sessionType');
        }}
      />
      <BAICard
        title={t('session.launcher.Environments')}
        showDivider
        size="small"
        status={environmentsHasError ? 'error' : undefined}
        collapsible
        collapsed={!isExpanded('environments')}
        onCollapsedChange={handleCollapsedChange('environments')}
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('environment');
        }}
      >
        <Descriptions size="small" column={1}>
          <Descriptions.Item label={t('session.launcher.Project')}>
            {currentProject.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('general.Image')}>
            {supportExtendedImageInfo ? (
              <Row style={{ flexFlow: 'nowrap' }}>
                <Col>
                  <ImageMetaIcon
                    image={
                      form.getFieldValue('environments')?.version ||
                      form.getFieldValue('environments')?.manual
                    }
                    style={{ marginRight: token.marginXS }}
                  />
                </Col>
                <Col>
                  <BAIFlex direction="row" wrap="wrap">
                    {form.getFieldValue('environments')?.manual ? (
                      <Typography.Text
                        code
                        style={{ wordBreak: 'break-all' }}
                        copyable={{
                          text: form.getFieldValue('environments')?.manual,
                        }}
                      >
                        {form.getFieldValue('environments')?.manual}
                      </Typography.Text>
                    ) : (
                      <>
                        <Typography.Text>
                          {tagAlias(
                            form.getFieldValue('environments')?.image
                              ?.base_image_name,
                          )}
                        </Typography.Text>
                        <Divider type="vertical" />
                        <Typography.Text>
                          {form.getFieldValue('environments')?.image?.version}
                        </Typography.Text>
                        <Divider type="vertical" />
                        <Typography.Text>
                          {
                            form.getFieldValue('environments')?.image
                              ?.architecture
                          }
                        </Typography.Text>
                        <Divider type="vertical" />
                        {/* TODO: replace this with AliasedImageDoubleTags after image list query with ImageNode is implemented. */}
                        <BAIFlex gap={'xxs'}>
                          {_.map(
                            form.getFieldValue('environments')?.image?.tags,
                            (tag: { key: string; value: string }) => {
                              const isCustomized = _.includes(
                                tag.key,
                                'customized_',
                              );
                              const tagValue = isCustomized
                                ? _.find(
                                    form.getFieldValue('environments')?.image
                                      ?.labels,
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
                                  form.getFieldValue('environments')?.image,
                                ) ||
                                form.getFieldValue('environments')?.version,
                            }}
                          />
                        </BAIFlex>
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
                      form.getFieldValue('environments')?.version ||
                      form.getFieldValue('environments')?.manual
                    }
                  />
                </Col>
                <Col>
                  {/* {form.getFieldValue('environments').image} */}
                  <BAIFlex direction="row" wrap="wrap">
                    {form.getFieldValue('environments')?.manual ? (
                      <Typography.Text
                        code
                        style={{ wordBreak: 'break-all' }}
                        copyable={{
                          text: form.getFieldValue('environments')?.manual,
                        }}
                      >
                        {form.getFieldValue('environments')?.manual}
                      </Typography.Text>
                    ) : (
                      <>
                        <Typography.Text>
                          {tagAlias(
                            getBaseImage(
                              form.getFieldValue('environments')?.version,
                            ),
                          )}
                        </Typography.Text>
                        <Divider type="vertical" />
                        <Typography.Text>
                          {getBaseVersion(
                            form.getFieldValue('environments')?.version,
                          )}
                        </Typography.Text>
                        <Divider type="vertical" />
                        <Typography.Text>
                          {
                            form.getFieldValue('environments')?.image
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
                            form.getFieldValue('environments')?.image
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
                                form.getFieldValue('environments')?.image,
                              ) || form.getFieldValue('environments')?.version,
                          }}
                        />
                      </>
                    )}
                  </BAIFlex>
                </Col>
              </Row>
            )}
          </Descriptions.Item>
          {form.getFieldValue('envvars')?.length > 0 && (
            <Descriptions.Item
              label={t('session.launcher.EnvironmentVariable')}
              styles={{
                content: {
                  display: 'flex',
                },
              }}
            >
              {form.getFieldValue('envvars')?.length ? (
                <SourceCodeView language={'shell'}>
                  {_.map(
                    form.getFieldValue('envvars'),
                    (v: { variable: string; value: string }) =>
                      `${v?.variable || ''}="${v?.value || ''}"`,
                  ).join('\n')}
                </SourceCodeView>
              ) : (
                <Typography.Text type="secondary">-</Typography.Text>
              )}
            </Descriptions.Item>
          )}
        </Descriptions>
      </BAICard>
      <BAICard
        title={t('session.launcher.ResourceAllocation')}
        showDivider
        status={resourceAllocationHasError ? 'error' : undefined}
        collapsible
        collapsed={!isExpanded('resourceAllocation')}
        onCollapsedChange={handleCollapsedChange('resourceAllocation')}
        size="small"
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('environment');
        }}
      >
        <BAIFlex direction="column" align="stretch" gap="sm">
          {_.some(
            form.getFieldValue('resource'),
            (_v, key: keyof SessionLauncherFormValue['resource']) => {
              return (
                (form.getFieldWarning(['resource', key] as any) as any[])
                  .length > 0
              );
            },
          ) && (
            <Alert
              type="warning"
              showIcon
              title={t('session.launcher.EnqueueComputeSessionWarning')}
            />
          )}
          {(form.getFieldWarning(['cluster_size'] as any) as any[]).length >
            0 && (
            <Alert
              type="warning"
              showIcon
              title={
                (form.getFieldWarning(['cluster_size'] as any) as string[])[0]
              }
            />
          )}

          <Descriptions column={2}>
            <Descriptions.Item label={t('general.ResourceGroup')} span={2}>
              {form.getFieldValue('resourceGroup') || (
                <Typography.Text type="secondary">
                  {t('general.None')}
                </Typography.Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('session.launcher.ResourceAllocationPerContainer')}
              span={2}
            >
              <BAIFlex
                direction="row"
                align="start"
                gap={'sm'}
                wrap="wrap"
                style={{ flex: 1 }}
              >
                {form.getFieldValue('allocationPreset') === 'custom' ? (
                  // t('session.launcher.CustomAllocation')
                  ''
                ) : (
                  <Tag>{form.getFieldValue('allocationPreset')}</Tag>
                )}

                <ResourceNumbersOfSession
                  resource={form.getFieldValue('resource')}
                />
                {/* {_.chain(
                              form.getFieldValue('allocationPreset') ===
                                'custom'
                                ? form.getFieldValue('resource')
                                : JSON.parse(
                                    form.getFieldValue('selectedPreset')
                                      ?.resource_slots || '{}',
                                  ),
                            )
                              .map((value, type) => {
                                // @ts-ignore
                                if (resourceSlots[type] === undefined)
                                  return undefined;
                                const resource_opts = {
                                  shmem:
                                    form.getFieldValue('selectedPreset')
                                      .shared_memory,
                                };
                                return (
                                  <ResourceNumber
                                    key={type}
                                    // @ts-ignore
                                    type={type}
                                    value={value}
                                    opts={resource_opts}
                                  />
                                );
                              })
                              .compact()
                              .value()} */}
              </BAIFlex>
            </Descriptions.Item>
            {baiClient.supports('agent-select') &&
              !baiClient?._config?.hideAgents && (
                <Descriptions.Item label={t('session.launcher.AgentNode')}>
                  {_.castArray(form.getFieldValue('agent')).join(', ') ||
                    t('session.launcher.AutoSelect')}
                </Descriptions.Item>
              )}
            <Descriptions.Item label={t('session.launcher.NumberOfContainer')}>
              {form.getFieldValue('cluster_size') === 1
                ? form.getFieldValue('num_of_sessions')
                : form.getFieldValue('cluster_size')}
            </Descriptions.Item>
            <Descriptions.Item label={t('session.launcher.ClusterMode')}>
              {form.getFieldValue('cluster_mode') === 'single-node'
                ? t('session.launcher.SingleNode')
                : t('session.launcher.MultiNode')}
            </Descriptions.Item>
          </Descriptions>
          <Card
            size="small"
            type="inner"
            title={t('session.launcher.TotalAllocation')}
          >
            <BAIFlex direction="row" gap="xxs">
              <ResourceNumbersOfSession
                resource={form.getFieldValue('resource')}
                containerCount={
                  form.getFieldValue('cluster_size') === 1
                    ? form.getFieldValue('num_of_sessions')
                    : form.getFieldValue('cluster_size')
                }
              />
            </BAIFlex>
          </Card>
        </BAIFlex>
      </BAICard>
      <BAICard
        title={t('webui.menu.Data&Storage')}
        showDivider
        size="small"
        status={dataStorageHasError ? 'error' : undefined}
        collapsible
        collapsed={!isExpanded('dataStorage')}
        onCollapsedChange={handleCollapsedChange('dataStorage')}
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('storage');
        }}
      >
        <BAIFlex direction="column" align="stretch" gap={'xs'}>
          {form.getFieldValue('mount_ids')?.length > 0 ? (
            <Table
              rowKey="name"
              size="small"
              pagination={false}
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
              dataSource={_.map(form.getFieldValue('mount_ids'), (v) => {
                const name = form.getFieldValue('vfoldersNameMap')?.[v] || v;
                return {
                  name,
                  alias: form.getFieldValue('mount_id_map')?.[v],
                };
              })}
            ></Table>
          ) : (
            <Alert
              type="warning"
              showIcon
              title={t('session.launcher.NoFolderMounted')}
            />
          )}
          {form.getFieldValue('autoMountedFolderNames')?.length > 0 ? (
            <Descriptions size="small">
              <Descriptions.Item label={t('data.AutomountFolders')}>
                <BAIFlex gap="xs" wrap="wrap">
                  {_.map(
                    form.getFieldValue('autoMountedFolderNames'),
                    (name) => {
                      return <Tag key={name}>{name}</Tag>;
                    },
                  )}
                </BAIFlex>
              </Descriptions.Item>
            </Descriptions>
          ) : null}
        </BAIFlex>
      </BAICard>
      <BAICard
        title="Network"
        showDivider
        size="small"
        status={networkHasError ? 'error' : undefined}
        collapsible
        collapsed={!isExpanded('network')}
        onCollapsedChange={handleCollapsedChange('network')}
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('network');
        }}
      >
        <Descriptions size="small">
          <Descriptions.Item label={t('session.launcher.PreOpenPortTitle')}>
            <BAIFlex direction="row" gap="xs" style={{ flex: 1 }} wrap="wrap">
              {/* {form.getFieldValue('environments').image} */}
              {_.sortBy(form.getFieldValue('ports'), (v) => parseInt(v)).map(
                (v, idx) => (
                  <PortTag key={idx + v} value={v} style={{ margin: 0 }}>
                    {v}
                  </PortTag>
                ),
              )}

              {!_.isArray(form.getFieldValue('ports')) ||
              form.getFieldValue('ports')?.length === 0 ? (
                <Typography.Text type="secondary">
                  {t('general.None')}
                </Typography.Text>
              ) : null}
            </BAIFlex>
          </Descriptions.Item>
        </Descriptions>
      </BAICard>
    </>
  );
};

export default SessionLauncherPreview;
