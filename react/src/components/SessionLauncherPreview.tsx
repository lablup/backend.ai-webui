import { preserveDotStartCase, getImageFullName } from '../helper';
import {
  useBackendAIImageMetaData,
  useSuspendedBackendaiClient,
} from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useThemeMode } from '../hooks/useThemeMode';
import {
  SessionLauncherFormValue,
  ResourceNumbersOfSession,
  SessionLauncherStepKey,
} from '../pages/SessionLauncherPage';
import BAICard from './BAICard';
import DoubleTag from './DoubleTag';
import Flex from './Flex';
import ImageMetaIcon from './ImageMetaIcon';
import { ImageTags } from './ImageTags';
import { PortTag } from './PortSelectFormItem';
import { SessionOwnerSetterPreviewCard } from './SessionOwnerSetterCard';
import SourceCodeViewer from './SourceCodeViewer';
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
} from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const SessionLauncherPreview: React.FC<{
  onClickEditStep: (stepKey: SessionLauncherStepKey) => void;
}> = ({ onClickEditStep }) => {
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
  const { isDarkMode } = useThemeMode();

  return (
    <>
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
                labelStyle={{ whiteSpace: 'nowrap' }}
                contentStyle={{
                  overflow: 'auto',
                }}
              >
                {form.getFieldValue(['batch', 'command']) ? (
                  <SourceCodeViewer language="shell">
                    {form.getFieldValue(['batch', 'command'])}
                  </SourceCodeViewer>
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
            (v, idx) => {
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
                  <Flex direction="row" wrap="wrap">
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
                              <DoubleTag
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
                              ) || form.getFieldValue('environments')?.version,
                          }}
                        />
                      </>
                    )}
                  </Flex>
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
                  <Flex direction="row" wrap="wrap">
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
                  </Flex>
                </Col>
              </Row>
            )}
          </Descriptions.Item>
          {form.getFieldValue('envvars')?.length > 0 && (
            <Descriptions.Item
              label={t('session.launcher.EnvironmentVariable')}
            >
              {form.getFieldValue('envvars')?.length ? (
                <SyntaxHighlighter
                  style={isDarkMode ? dark : undefined}
                  codeTagProps={{
                    style: {
                      // fontFamily: 'monospace',
                    },
                  }}
                  // showLineNumbers
                  customStyle={{
                    margin: 0,
                    width: '100%',
                  }}
                >
                  {_.map(
                    form.getFieldValue('envvars'),
                    (v: { variable: string; value: string }) =>
                      `${v?.variable || ''}="${v?.value || ''}"`,
                  ).join('\n')}
                </SyntaxHighlighter>
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
        status={
          _.some(form.getFieldValue('resource'), (v, key) => {
            return (
              // @ts-ignore
              form.getFieldError(['resource', key]).length > 0
            );
          }) ||
          form.getFieldError(['num_of_sessions']).length > 0 ||
          form.getFieldError('resourceGroup').length > 0
            ? 'error'
            : // : _.some(form.getFieldValue('resource'), (v, key) => {
              //     //                         console.log(form.getFieldError(['resource', 'shmem']));
              //     // console.log(form.getFieldValue(['resource']));
              //     return (
              //       form.getFieldWarning(['resource', key]).length >
              //       0
              //     );
              //   })
              // ? 'warning'
              undefined
        }
        size="small"
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('environment');
        }}
      >
        <Flex direction="column" align="stretch">
          {_.some(
            form.getFieldValue('resource'),
            (v, key: keyof SessionLauncherFormValue['resource']) => {
              return (
                // @ts-ignore
                form.getFieldWarning(['resource', key]).length > 0
              );
            },
          ) && (
            <Alert
              type="warning"
              showIcon
              message={t('session.launcher.EnqueueComputeSessionWarning')}
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
              <Flex
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
              </Flex>
            </Descriptions.Item>
            {baiClient.supports('agent-select') &&
              !baiClient?._config?.hideAgents && (
                <Descriptions.Item label={t('session.launcher.AgentNode')}>
                  {form.getFieldValue('agent') ||
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
            <Flex direction="row" gap="xxs">
              <ResourceNumbersOfSession
                resource={form.getFieldValue('resource')}
                containerCount={
                  form.getFieldValue('cluster_size') === 1
                    ? form.getFieldValue('num_of_sessions')
                    : form.getFieldValue('cluster_size')
                }
              />
            </Flex>
          </Card>
        </Flex>
      </BAICard>
      <BAICard
        title={t('webui.menu.Data&Storage')}
        showDivider
        size="small"
        status={
          form.getFieldError('vfoldersAliasMap').length > 0
            ? 'error'
            : undefined
        }
        extraButtonTitle={t('button.Edit')}
        onClickExtraButton={() => {
          onClickEditStep('storage');
        }}
      >
        {/* {console.log(_.sum([form.getFieldValue('mounts')?.length, form.getFieldValue('autoMountedFolderNames')]))} */}
        {/* {_.sum([form.getFieldValue('mounts')?.length, form.getFieldValue('autoMountedFolderNames').length]) > 0 ? ( */}
        <Flex direction="column" align="stretch" gap={'xs'}>
          {form.getFieldValue('mounts')?.length > 0 ? (
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
              dataSource={_.map(form.getFieldValue('mounts'), (v) => {
                return {
                  name: v,
                  alias: form.getFieldValue('vfoldersAliasMap')?.[v],
                };
              })}
            ></Table>
          ) : (
            <Alert
              type="warning"
              showIcon
              message={t('session.launcher.NoFolderMounted')}
            />
          )}
          {form.getFieldValue('autoMountedFolderNames')?.length > 0 ? (
            <Descriptions size="small">
              <Descriptions.Item label={t('data.AutomountFolders')}>
                {_.map(form.getFieldValue('autoMountedFolderNames'), (name) => {
                  return <Tag>{name}</Tag>;
                })}
              </Descriptions.Item>
            </Descriptions>
          ) : null}
        </Flex>
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
        <Descriptions size="small">
          <Descriptions.Item label={t('session.launcher.PreOpenPortTitle')}>
            <Flex direction="row" gap="xs" style={{ flex: 1 }} wrap="wrap">
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
            </Flex>
          </Descriptions.Item>
        </Descriptions>
      </BAICard>
    </>
  );
};

export default SessionLauncherPreview;
