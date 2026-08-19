/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
// FRONTIER (ticket 17 / ticket 34): `Form.useFormInstance` / `Form.useWatch`
// keep reading the antd form engine (locked SHIM decision).
import { Form } from '../form-engine';
import { getImageFullName } from '../helper';
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
import {
  imageNodeTagFacts,
  ImageMetaDivider,
  ImageTagBadges,
  ImageTags,
} from './ImageTags';
import { PortTag } from './PortSelectFormItem';
import { SessionOwnerSetterPreviewCard } from './SessionOwnerSetterCard';
import SourceCodeView from './SourceCodeView';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import { BAICard, BAIFlex, BAITableAstryx, BAIText } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Copy-only affordance replacing antd `Typography.Text copyable` with no
 * children (a bare copy icon that copies the full image name).
 */
const CopyValueIconButton: React.FC<{ value?: string; label: string }> = ({
  value,
  label,
}) => {
  'use memo';
  const [copied, setCopied] = useState(false);
  return (
    <IconButton
      variant="ghost"
      size="sm"
      icon={copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
      label={label}
      tooltip={label}
      isDisabled={copied}
      onClick={() => {
        void navigator.clipboard?.writeText(value ?? '');
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    />
  );
};

const SessionLauncherPreview: React.FC<{
  onClickEditStep: (stepKey: SessionLauncherStepKey) => void;
}> = ({ onClickEditStep }) => {
  const app = App.useApp();
  const { t } = useTranslation();
  const form = Form.useFormInstance<SessionLauncherFormValue>();
  const baiClient = useSuspendedBackendaiClient();
  const sessionType = Form.useWatch('sessionType', { form, preserve: true });
  const supportBatchTimeout = baiClient?.supports('batch-timeout') ?? false;
  const supportExtendedImageInfo =
    baiClient?.supports('extended-image-info') ?? false;
  const currentProject = useCurrentProjectValue();
  const [, { getBaseVersion, getBaseImage, tagAlias }] =
    useBackendAIImageMetaData();

  return (
    <>
      {form.getFieldValue('bootstrap_script') && (
        <Banner
          status="info"
          title={t('session.launcher.UsingBootstrapScriptInfo')}
          endContent={
            <Button
              size="sm"
              variant="ghost"
              label={t('notification.SeeDetail')}
              onClick={() => {
                app.modal.info({
                  title: t('session.launcher.BootstrapScriptDetail'),
                  content: (
                    <BAIFlex direction="column" align="start">
                      <Text as="p" display="block">
                        {t('userSettings.BootstrapScriptDescription')}
                      </Text>
                      <SourceCodeView language={'shell'}>
                        {form.getFieldValue('bootstrap_script')}
                      </SourceCodeView>
                    </BAIFlex>
                  ),
                  width: 800,
                });
              }}
            />
          }
        />
      )}
      <BAICard
        title={t('session.launcher.SessionType')}
        showDivider
        size="small"
        status={
          form.getFieldError('sessionName').length > 0 ||
          form.getFieldError(['batch', 'command']).length > 0 ||
          form.getFieldError(['batch', 'scheduleDate']).length > 0
            ? 'error'
            : undefined
        }
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('sessionType');
        }}
      >
        <MetadataList columns="single">
          <MetadataListItem label={t('session.SessionType')}>
            {form.getFieldValue('sessionType')}
          </MetadataListItem>
          {!_.isEmpty(form.getFieldValue('sessionName')) && (
            <MetadataListItem label={t('session.launcher.SessionName')}>
              {form.getFieldValue('sessionName')}
            </MetadataListItem>
          )}
          {sessionType === 'batch' && (
            <>
              <MetadataListItem label={t('session.launcher.StartUpCommand')}>
                {form.getFieldValue(['batch', 'command']) ? (
                  <SourceCodeView language="shell">
                    {form.getFieldValue(['batch', 'command'])}
                  </SourceCodeView>
                ) : (
                  <Text color="secondary">{t('general.None')}</Text>
                )}
              </MetadataListItem>
              <MetadataListItem label={t('session.launcher.SessionStartTime')}>
                {form.getFieldValue(['batch', 'scheduleDate']) ? (
                  dayjs(form.getFieldValue(['batch', 'scheduleDate'])).format(
                    'LLL (Z)',
                  )
                ) : (
                  <Text color="secondary">{t('general.None')}</Text>
                )}
              </MetadataListItem>
              {supportBatchTimeout ? (
                <MetadataListItem
                  label={t('session.launcher.BatchJobTimeoutDuration')}
                >
                  {form.getFieldValue(['batch', 'timeout']) ? (
                    <Text>
                      {form.getFieldValue(['batch', 'timeout'])}
                      {form.getFieldValue(['batch', 'timeoutUnit']) || 's'}
                    </Text>
                  ) : (
                    <Text color="secondary">{t('general.None')}</Text>
                  )}
                </MetadataListItem>
              ) : null}
            </>
          )}
        </MetadataList>
      </BAICard>
      <SessionOwnerSetterPreviewCard
        onClickExtraButton={() => {
          onClickEditStep('sessionType');
        }}
      />
      <BAICard
        title={t('session.launcher.Environments')}
        showDivider
        size="small"
        status={
          _.some(
            form.getFieldValue(
              'envvars',
            ) as SessionLauncherFormValue['envvars'],
            (_v, idx) => {
              return (
                form.getFieldError(['envvars', idx, 'variable']).length > 0 ||
                form.getFieldError(['envvars', idx, 'value']).length > 0
              );
            },
          )
            ? 'error'
            : undefined
        }
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('environment');
        }}
      >
        <MetadataList columns="single">
          <MetadataListItem label={t('session.launcher.Project')}>
            {currentProject.name}
          </MetadataListItem>
          <MetadataListItem label={t('general.Image')}>
            {supportExtendedImageInfo ? (
              <BAIFlex direction="row" align="center" gap="xs" wrap="nowrap">
                <ImageMetaIcon
                  image={
                    form.getFieldValue('environments')?.version ||
                    form.getFieldValue('environments')?.manual
                  }
                />
                <BAIFlex direction="row" align="center" gap="xxs" wrap="wrap">
                  {form.getFieldValue('environments')?.manual ? (
                    <BAIText code copyable>
                      {form.getFieldValue('environments')?.manual}
                    </BAIText>
                  ) : (
                    <>
                      <Text>
                        {tagAlias(
                          form.getFieldValue('environments')?.image
                            ?.base_image_name,
                        )}
                      </Text>
                      <ImageMetaDivider />
                      <Text>
                        {form.getFieldValue('environments')?.image?.version}
                      </Text>
                      <ImageMetaDivider />
                      <Text>
                        {
                          form.getFieldValue('environments')?.image
                            ?.architecture
                        }
                      </Text>
                      <ImageMetaDivider />
                      {/* TODO: replace this with AliasedImageDoubleTags after image list query with ImageNode is implemented. */}
                      <ImageTagBadges
                        facts={imageNodeTagFacts(
                          form.getFieldValue('environments')?.image?.tags,
                          form.getFieldValue('environments')?.image?.labels,
                          tagAlias,
                        )}
                      />
                      <BAIFlex gap={'xxs'}>
                        <CopyValueIconButton
                          label={t('button.CopySomething', {
                            name: t('general.Image'),
                          })}
                          value={
                            getImageFullName(
                              form.getFieldValue('environments')?.image,
                            ) || form.getFieldValue('environments')?.version
                          }
                        />
                      </BAIFlex>
                    </>
                  )}
                </BAIFlex>
              </BAIFlex>
            ) : (
              <BAIFlex direction="row" align="center" gap="xs" wrap="nowrap">
                <ImageMetaIcon
                  image={
                    form.getFieldValue('environments')?.version ||
                    form.getFieldValue('environments')?.manual
                  }
                />
                <BAIFlex direction="row" align="center" gap="xxs" wrap="wrap">
                  {form.getFieldValue('environments')?.manual ? (
                    <BAIText code copyable>
                      {form.getFieldValue('environments')?.manual}
                    </BAIText>
                  ) : (
                    <>
                      <Text>
                        {tagAlias(
                          getBaseImage(
                            form.getFieldValue('environments')?.version,
                          ),
                        )}
                      </Text>
                      <ImageMetaDivider />
                      <Text>
                        {getBaseVersion(
                          form.getFieldValue('environments')?.version,
                        )}
                      </Text>
                      <ImageMetaDivider />
                      <Text>
                        {
                          form.getFieldValue('environments')?.image
                            ?.architecture
                        }
                      </Text>
                      <ImageMetaDivider />
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
                      <CopyValueIconButton
                        label={t('button.CopySomething', {
                          name: t('general.Image'),
                        })}
                        value={
                          getImageFullName(
                            form.getFieldValue('environments')?.image,
                          ) || form.getFieldValue('environments')?.version
                        }
                      />
                    </>
                  )}
                </BAIFlex>
              </BAIFlex>
            )}
          </MetadataListItem>
          {form.getFieldValue('envvars')?.length > 0 && (
            <MetadataListItem label={t('session.launcher.EnvironmentVariable')}>
              {form.getFieldValue('envvars')?.length ? (
                <SourceCodeView language={'shell'}>
                  {_.map(
                    form.getFieldValue('envvars'),
                    (v: { variable: string; value: string }) =>
                      `${v?.variable || ''}="${v?.value || ''}"`,
                  ).join('\n')}
                </SourceCodeView>
              ) : (
                <Text color="secondary">-</Text>
              )}
            </MetadataListItem>
          )}
        </MetadataList>
      </BAICard>
      <BAICard
        title={t('session.launcher.ResourceAllocation')}
        showDivider
        status={
          _.some(form.getFieldValue('resource'), (_v, key) => {
            return (
              // @ts-ignore
              form.getFieldError(['resource', key]).length > 0
            );
          }) ||
          form.getFieldError(['num_of_sessions']).length > 0 ||
          form.getFieldError('resourceGroup').length > 0
            ? 'error'
            : undefined
        }
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
            <Banner
              status="warning"
              title={t('session.launcher.EnqueueComputeSessionWarning')}
            />
          )}
          {(form.getFieldWarning(['cluster_size'] as any) as any[]).length >
            0 && (
            <Banner
              status="warning"
              title={
                (form.getFieldWarning(['cluster_size'] as any) as string[])[0]
              }
            />
          )}

          <MetadataList columns={2}>
            <MetadataListItem label={t('general.ResourceGroup')}>
              {form.getFieldValue('resourceGroup') || (
                <Text color="secondary">{t('general.None')}</Text>
              )}
            </MetadataListItem>
            <MetadataListItem
              label={t('session.launcher.ResourceAllocationPerContainer')}
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
                  <Badge label={form.getFieldValue('allocationPreset')} />
                )}

                <ResourceNumbersOfSession
                  resource={form.getFieldValue('resource')}
                />
              </BAIFlex>
            </MetadataListItem>
            {baiClient.supports('agent-select') &&
              !baiClient?._config?.hideAgents && (
                <MetadataListItem label={t('session.launcher.AgentNode')}>
                  {_.castArray(form.getFieldValue('agent')).join(', ') ||
                    t('session.launcher.AutoSelect')}
                </MetadataListItem>
              )}
            <MetadataListItem label={t('session.launcher.NumberOfContainer')}>
              {form.getFieldValue('cluster_size') === 1
                ? form.getFieldValue('num_of_sessions')
                : form.getFieldValue('cluster_size')}
            </MetadataListItem>
            <MetadataListItem label={t('session.launcher.ClusterMode')}>
              {form.getFieldValue('cluster_mode') === 'single-node'
                ? t('session.launcher.SingleNode')
                : t('session.launcher.MultiNode')}
            </MetadataListItem>
          </MetadataList>
          <Card padding={3}>
            <BAIFlex direction="column" align="stretch" gap="xs">
              <Heading level={6}>
                {t('session.launcher.TotalAllocation')}
              </Heading>
              <BAIFlex direction="row" gap="xxs" wrap="wrap">
                <ResourceNumbersOfSession
                  resource={form.getFieldValue('resource')}
                  containerCount={
                    form.getFieldValue('cluster_size') === 1
                      ? form.getFieldValue('num_of_sessions')
                      : form.getFieldValue('cluster_size')
                  }
                />
              </BAIFlex>
            </BAIFlex>
          </Card>
        </BAIFlex>
      </BAICard>
      <BAICard
        title={t('webui.menu.Data&Storage')}
        showDivider
        size="small"
        status={
          form.getFieldError('mount_id_map').length > 0 ? 'error' : undefined
        }
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('storage');
        }}
      >
        <BAIFlex direction="column" align="stretch" gap={'xs'}>
          {form.getFieldValue('mount_ids')?.length > 0 ? (
            <BAITableAstryx
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
                      <Text color="placeholder">
                        {`/home/work/${record.name}`}
                      </Text>
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
            />
          ) : (
            <Banner
              status="warning"
              title={t('session.launcher.NoFolderMounted')}
            />
          )}
          {form.getFieldValue('autoMountedFolderNames')?.length > 0 ? (
            <MetadataList columns="single">
              <MetadataListItem label={t('data.AutomountFolders')}>
                <BAIFlex gap="xs" wrap="wrap">
                  {_.map(
                    form.getFieldValue('autoMountedFolderNames'),
                    (name) => {
                      return <Badge key={name} label={name} />;
                    },
                  )}
                </BAIFlex>
              </MetadataListItem>
            </MetadataList>
          ) : null}
        </BAIFlex>
      </BAICard>
      <BAICard
        title="Network"
        showDivider
        size="small"
        status={form.getFieldError('ports').length > 0 ? 'error' : undefined}
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('network');
        }}
      >
        <MetadataList columns="single">
          <MetadataListItem label={t('session.launcher.PreOpenPortTitle')}>
            <BAIFlex direction="row" gap="xs" style={{ flex: 1 }} wrap="wrap">
              {_.sortBy(form.getFieldValue('ports'), (v) => parseInt(v)).map(
                (v, idx) => (
                  <PortTag key={idx + v} value={v} style={{ margin: 0 }}>
                    {v}
                  </PortTag>
                ),
              )}

              {!_.isArray(form.getFieldValue('ports')) ||
              form.getFieldValue('ports')?.length === 0 ? (
                <Text color="secondary">{t('general.None')}</Text>
              ) : null}
            </BAIFlex>
          </MetadataListItem>
        </MetadataList>
      </BAICard>
    </>
  );
};

export default SessionLauncherPreview;
