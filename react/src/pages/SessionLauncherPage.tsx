import BAICard from '../BAICard';
import DatePickerISO from '../components/DatePickerISO';
import { useWebComponentInfo } from '../components/DefaultProviders';
import EnvVarFormList from '../components/EnvVarFormList';
import Flex from '../components/Flex';
import ImageEnvironmentSelectFormItems from '../components/ImageEnvironmentSelectFormItems';
import ImageMetaIcon from '../components/ImageMetaIcon';
import PortSelectFormItem, { PortTag } from '../components/PortSelectFormItem';
import ResourceAllocationFormItems, {
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
} from '../components/ResourceAllocationFormItems';
import ResourceGroupSelect from '../components/ResourceGroupSelect';
import ResourceNumber from '../components/ResourceNumber';
import SessionNameFormItem from '../components/SessionNameFormItem';
import VFolderTableFromItem from '../components/VFolderTableFormItem';
import { iSizeToSize } from '../helper';
import {
  BlockOutlined,
  LeftOutlined,
  PlayCircleFilled,
  PlayCircleOutlined,
  RightOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import {
  Affix,
  Alert,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Form,
  Grid,
  Input,
  Popconfirm,
  Segmented,
  Select,
  StepProps,
  Steps,
  Table,
  Tag,
  Typography,
  message,
  theme,
} from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
  JsonParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

const INITIAL_FORM_VALUES = {
  sessionType: 'interactive',
  allocationPreset: 'custom',
  ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
};
const stepParam = withDefault(NumberParam, 0);
const formValuesParam = withDefault(JsonParam, INITIAL_FORM_VALUES);

const SessionLauncherPage = () => {
  const [
    { step: currentStep, formValues: initialFormValues, redirectTo },
    setQuery,
  ] = useQueryParams({
    step: stepParam,
    formValues: formValuesParam,
    redirectTo: StringParam,
  });

  const navigate = useNavigate();
  const { moveTo } = useWebComponentInfo();

  const { run: syncFormToURLWithDebounce } = useDebounceFn(
    () => {
      console.log(
        'syncFormToURLWithDebounce',
        form.getFieldValue(['batch', 'scheduleDate']),
        form.getFieldsValue(),
      );
      // To sync the latest form values to URL,
      // 'trailing' is set to true, and get the form values here."
      setQuery(
        {
          // formValues: form.getFieldsValue(),
          formValues: _.omit(form.getFieldsValue(), ['environments.image']),
        },
        'replaceIn',
      );
    },
    {
      leading: false,
      wait: 500,
      trailing: true,
    },
  );

  const setCurrentStep = (nextStep: number) => {
    setQuery(
      {
        step: nextStep,
      },
      'pushIn',
    );
  };
  const { token } = theme.useToken();

  const { t } = useTranslation();

  const screens = Grid.useBreakpoint();

  const [form] = Form.useForm<{
    sessionType: 'interactive' | 'batch' | 'inference';
    batch: {
      enabled: boolean;
    };
  }>();

  useEffect(() => {
    if (
      // if form is changed, validate it to show error on the first render
      JSON.stringify(INITIAL_FORM_VALUES) !== JSON.stringify(initialFormValues)
    ) {
      form.validateFields().catch((e) => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // TODO: scroll to top
  }, [currentStep]);

  // before initialFormValues is set, use getFieldValue and useWatch will return undefined
  const sessionType =
    Form.useWatch('sessionType', { form, preserve: true }) ||
    form.getFieldValue('sessionType') ||
    initialFormValues.sessionType;

  const steps = _.filter(
    [
      {
        title: t('session.launcher.SessionType'),
        key: 'sessionType',
        // status: form.getFieldError('name').length > 0 ? 'error' : undefined,
      },
      {
        title: `${t('session.launcher.Environments')} & ${t(
          'session.launcher.ResourceAllocation',
        )} `,
        key: 'environment',
      },
      sessionType !== 'inference' && {
        title: t('webui.menu.Data&Storage'),
        key: 'storage',
      },
      {
        title: t('session.launcher.Network'),
        key: 'network',
      },
      {
        title: t('session.launcher.ConfirmAndLaunch'),
        icon: (
          <PlayCircleFilled />
          // <Flex
          //   align="center"
          //   justify="center"
          //   style={{
          //     // border: '1px solid gray',
          //     backgroundColor: '#E8E7E7',
          //     width: 24,
          //     height: 24,
          //     borderRadius: 12,
          //     fontSize: 16,
          //   }}
          // >
          //   <CaretRightOutlined />
          // </Flex>
        ),
        // @ts-ignore
        key: 'review',
      },
    ] as StepProps[],
    (v) => !!v,
  );

  const currentStepKey:
    | 'sessionType'
    | 'environment'
    | 'storage'
    | 'network'
    // @ts-ignore
    | 'review' = steps[currentStep]?.key;

  const hasError = _.some(
    form.getFieldsError(),
    (item) => item.errors.length > 0,
  );

  console.log(form.getFieldError(['resource', 'shmem']));
  console.log(form.getFieldValue(['resource']));

  const moveToPreview = () => {
    // TODO: if handling more async validations, required fetch, use `useTransition`
    form
      .validateFields()
      .catch((e) => {})
      .finally(() => {
        setCurrentStep(steps.length - 1);
      });
  };

  return (
    <Flex
      direction="column"
      align="stretch"
      style={{
        padding: token.paddingSM,
        width: '100%',
        justifyContent: 'revert',
        // height: 500,
        // overflow: 'scroll',
      }}
    >
      {redirectTo && (
        <Breadcrumb
          items={[
            {
              title: t('webui.menu.Sessions'),
              onClick: (e) => {
                e.preventDefault();
                moveTo(redirectTo);
              },
              href: redirectTo,
            },
            {
              title: t('session.launcher.StartNewSession'),
            },
          ]}
        />
      )}
      <Flex direction="row" gap="md" align="start">
        <Flex
          direction="column"
          align="stretch"
          style={{ flex: 1, maxWidth: 700 }}
        >
          <Flex direction="row" justify="between">
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              {t('session.launcher.StartNewSession')}
            </Typography.Title>
            <Flex direction="row" gap={'sm'}>
              <Popconfirm
                title={t('session.launcher.ResetFormConfirm')}
                onConfirm={() => {
                  navigate('/session/start');
                }}
              >
                <Button
                  danger
                  type="link"
                  style={{ paddingRight: 0, paddingLeft: 0 }}
                >
                  {t('button.Reset')}
                </Button>
              </Popconfirm>
              <Button
                type="link"
                icon={<BlockOutlined />}
                disabled
                style={{ paddingRight: 0, paddingLeft: 0 }}
              >
                {t('session.launcher.Template')}
              </Button>
            </Flex>
          </Flex>
          {/* <Suspense fallback={<FlexActivityIndicator />}> */}
          <Form.Provider
            onFormChange={(name, info) => {
              console.log('###', name, info);
              // use OnFormChange instead of Form's onValuesChange,
              // because onValuesChange will not be triggered when form is changed programmatically
              syncFormToURLWithDebounce();
            }}
          >
            <Form
              form={form}
              layout="vertical"
              requiredMark="optional"
              initialValues={initialFormValues}
            >
              <Flex
                direction="column"
                align="stretch"
                gap="md"
                // style={{  }}
              >
                {/* Step 0 fields */}
                <Card
                  title={t('session.launcher.SessionType')}
                  style={{
                    display:
                      currentStepKey === 'sessionType' ? 'block' : 'none',
                  }}
                >
                  <Form.Item name="sessionType">
                    {/* <Radio.Group
                    options={[
                      {
                        label: (
                          <Flex
                            direction="column"
                            align="start"
                            style={{ marginBottom: token.marginXS }}
                          >
                            <Typography.Text strong>
                              🏃‍♀️ Make, test and run
                            </Typography.Text>
                            <Typography.Text type="secondary">
                              <Typography.Text strong>
                                Interactive mode
                              </Typography.Text>{' '}
                              allows you to create, test and run code
                              interactively via jupyter notebook, visual studio
                              code, etc.
                            </Typography.Text>
                          </Flex>
                        ),
                        value: 'interactive',
                      },
                      {
                        label: (
                          <Flex direction="column" align="start">
                            <Typography.Text strong>
                              ⌚️ Start an long-running task
                            </Typography.Text>
                            <Typography.Text type="secondary">
                              <Typography.Text strong>
                                Batch mode
                              </Typography.Text>{' '}
                              runs your code with multiple node & clusters to
                              scale your idea
                            </Typography.Text>
                          </Flex>
                        ),
                        value: 'batch',
                      },
                    ]}
                  /> */}
                    <Segmented
                      width={100}
                      options={[
                        {
                          label: (
                            <SessionTypeItem
                              title="🏃‍♀️ Make, test and run"
                              description="Interactive mode allows you to create, test and run code interactively via jupyter notebook, visual studio code, etc."
                            />
                          ),
                          value: 'interactive',
                        },
                        {
                          label: (
                            <SessionTypeItem
                              title="⌚️ Start an long-running task"
                              description="Batch mode runs your code with multiple node & clusters to scale your idea"
                            />
                          ),
                          value: 'batch',
                        },
                        // {
                        //   label: (
                        //     <SessionTypeItem
                        //       title="🤖 Run a inference service"
                        //       description="Inference allow you dynamically scale your mode service"
                        //     />
                        //   ),
                        //   value: 'inference',
                        // },
                      ]}
                    />
                  </Form.Item>
                  <SessionNameFormItem />
                </Card>

                {sessionType === 'batch' && (
                  <Card
                    title={t('session.launcher.BatchModeConfig')}
                    style={{
                      display:
                        currentStepKey === 'sessionType' ? 'block' : 'none',
                    }}
                  >
                    <Form.Item
                      label={t('session.launcher.StartUpCommand')}
                      name={['batch', 'command']}
                      rules={[
                        {
                          required: true,
                          type: 'string',
                        },
                      ]}
                    >
                      <Input.TextArea autoSize />
                    </Form.Item>
                    <Form.Item label={t('session.launcher.SessionStartTime')}>
                      <Flex direction="row" gap={'xs'}>
                        <Form.Item
                          noStyle
                          name={['batch', 'enabled']}
                          valuePropName="checked"
                        >
                          <Checkbox
                            onChange={(e) => {
                              if (
                                e.target.checked &&
                                _.isEmpty(
                                  form.getFieldValue(['batch', 'scheduleDate']),
                                )
                              ) {
                                form.setFieldValue(
                                  ['batch', 'scheduleDate'],
                                  dayjs().add(2, 'minutes').toISOString(),
                                );
                              } else if (e.target.checked === false) {
                                form.setFieldValue(
                                  ['batch', 'scheduleDate'],
                                  undefined,
                                );
                              }
                            }}
                          >
                            {t('session.launcher.Enable')}
                          </Checkbox>
                        </Form.Item>
                        <Form.Item
                          noStyle
                          // dependencies={[['batch', 'enabled']]}
                          shouldUpdate={(prev, next) => {
                            return (
                              // @ts-ignore
                              prev.batch?.enabled !== next.batch?.enabled
                            );
                          }}
                        >
                          {() => {
                            const disabled =
                              form.getFieldValue('batch')?.enabled !== true;
                            return (
                              <>
                                <Form.Item
                                  name={['batch', 'scheduleDate']}
                                  noStyle
                                >
                                  <DatePickerISO
                                    disabled={disabled}
                                    showTime
                                    // format={'YYYY-MM-DD HH:mm:ss'}
                                  />
                                </Form.Item>
                                {/* <Form.Item
                                      noStyle
                                      name={['batch', 'scheduleTime']}
                                    >
                                      <TimePicker disabled={disabled} />
                                    </Form.Item> */}
                              </>
                            );
                          }}
                        </Form.Item>
                      </Flex>
                    </Form.Item>
                  </Card>
                )}

                {sessionType === 'inference' && (
                  <Card title="Inference Mode Configuration">
                    <Form.Item
                      name={['inference', 'vFolderName']}
                      label={t('session.launcher.ModelStorageToMount')}
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Select />
                      {/* <VFolderSelect
                          filter={(vf) => vf.usage_mode === 'model'}
                          autoSelectDefault
                          /> */}
                    </Form.Item>
                  </Card>
                )}

                {/* Step Start*/}
                <Card
                  title={t('session.launcher.Environments')}
                  style={{
                    display:
                      currentStepKey === 'environment' ? 'block' : 'none',
                  }}
                >
                  <ErrorBoundary
                    fallbackRender={(e) => {
                      console.log(e);
                      return null;
                    }}
                  >
                    <ImageEnvironmentSelectFormItems />
                  </ErrorBoundary>
                  <Form.Item label="Environment Variables">
                    <EnvVarFormList
                      name={'envvars'}
                      formItemProps={{
                        validateTrigger: ['onChange', 'onBlur'],
                      }}
                    />
                  </Form.Item>
                </Card>
                <Card
                  title={t('session.launcher.ResourceAllocation')}
                  style={{
                    display:
                      currentStepKey === 'environment' ? 'block' : 'none',
                  }}
                >
                  <ResourceAllocationFormItems />
                </Card>

                {/* Step Start*/}
                <Card
                  title={t('webui.menu.Data&Storage')}
                  style={{
                    display: currentStepKey === 'storage' ? 'block' : 'none',
                  }}
                >
                  <VFolderTableFromItem />
                  {/* <VFolderTable /> */}
                </Card>

                {/* Step Start*/}
                <Card
                  title={t('session.launcher.Network')}
                  style={{
                    display: currentStepKey === 'network' ? 'block' : 'none',
                  }}
                >
                  <PortSelectFormItem />
                </Card>

                {/* Step Start*/}
                {currentStepKey === 'review' && (
                  <>
                    <BAICard
                      title={t('session.launcher.SessionType')}
                      size="small"
                      status={
                        form.getFieldError('name').length > 0 ||
                        form.getFieldError(['batch', 'command']).length > 0
                          ? 'error'
                          : undefined
                      }
                      extraButtonTitle={t('button.Edit')}
                      onClickExtraButton={() => {
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'sessionType'),
                        );
                      }}
                      // extra={
                      //   <Button
                      //     type="link"
                      //     onClick={() => {
                      //       setCurrentStep(
                      //         // @ts-ignore
                      //         steps.findIndex((v) => v.key === 'sessionType'),
                      //       );
                      //     }}
                      //     icon={
                      //       form.getFieldError('name').length > 0 && (
                      //         <ExclamationCircleTwoTone
                      //           twoToneColor={token.colorError}
                      //         />
                      //       )
                      //     }
                      //   >
                      //     {t('button.Edit')}
                      //   </Button>
                      // }
                    >
                      <Descriptions size="small">
                        <Descriptions.Item
                          label={t('session.SessionType')}
                          span={24}
                        >
                          {form.getFieldValue('sessionType')}
                        </Descriptions.Item>
                        {!_.isEmpty(form.getFieldValue('name')) && (
                          <Descriptions.Item
                            label={t('session.launcher.SessionName')}
                            span={24}
                          >
                            {form.getFieldValue('name')}
                          </Descriptions.Item>
                        )}
                        {sessionType === 'batch' && (
                          <Descriptions.Item
                            label={t('session.launcher.StartUpCommand')}
                          >
                            <Input.TextArea
                              readOnly
                              bordered={false}
                              autoSize
                              value={form.getFieldValue(['batch', 'command'])}
                            ></Input.TextArea>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </BAICard>
                    <BAICard
                      title={t('session.launcher.Environments')}
                      size="small"
                      status={
                        _.some(form.getFieldValue('envvars'), (v, idx) => {
                          return (
                            form.getFieldError(['envvars', idx, 'variable'])
                              .length > 0 ||
                            form.getFieldError(['envvars', idx, 'value'])
                              .length > 0
                          );
                        })
                          ? 'error'
                          : undefined
                      }
                      extraButtonTitle={t('button.Edit')}
                      onClickExtraButton={() => {
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'environment'),
                        );
                      }}
                    >
                      <Descriptions size="small" layout="vertical" column={1}>
                        <Descriptions.Item label="Image">
                          <Flex direction="row" gap="xs" style={{ flex: 1 }}>
                            <ImageMetaIcon
                              image={
                                form.getFieldValue('environments')?.version
                              }
                            />
                            {/* {form.getFieldValue('environments').image} */}
                            <Typography.Text copyable code>
                              {form.getFieldValue('environments')?.version}
                            </Typography.Text>
                          </Flex>
                        </Descriptions.Item>
                        {form.getFieldValue('envvars')?.length > 0 && (
                          <Descriptions.Item
                            label={t('session.launcher.EnvironmentVariable')}
                          >
                            {form.getFieldValue('envvars')?.length ? (
                              <SyntaxHighlighter
                                style={darcula}
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
                              <Typography.Text type="secondary">
                                -
                              </Typography.Text>
                            )}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </BAICard>
                    <BAICard
                      title={t('session.launcher.ResourceAllocation')}
                      status={
                        _.some(form.getFieldValue('resource'), (v, key) => {
                          //                         console.log(form.getFieldError(['resource', 'shmem']));
                          // console.log(form.getFieldValue(['resource']));
                          return (
                            form.getFieldError(['resource', key]).length > 0
                          );
                        })
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
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'environment'),
                        );
                      }}
                    >
                      <Flex direction="column" gap={'xs'} align="stretch">
                        {_.some(form.getFieldValue('resource'), (v, key) => {
                          //                         console.log(form.getFieldError(['resource', 'shmem']));
                          // console.log(form.getFieldValue(['resource']));
                          return (
                            form.getFieldWarning(['resource', key]).length > 0
                          );
                        }) && (
                          <Alert
                            type="warning"
                            showIcon
                            message={t(
                              'session.launcher.EnqueueComputeSessionWarning',
                            )}
                          />
                        )}

                        <Descriptions>
                          <Descriptions.Item
                            span={24}
                            label={t('environment.ResourcePresets')}
                          >
                            <Flex
                              direction="row"
                              align="start"
                              gap={'sm'}
                              wrap="wrap"
                              style={{ flex: 1 }}
                            >
                              {form.getFieldValue('allocationPreset') ===
                              'custom' ? (
                                // t('session.launcher.CustomAllocation')
                                ''
                              ) : (
                                <Tag>
                                  {form.getFieldValue('allocationPreset')}
                                </Tag>
                              )}

                              {_.map(
                                _.omit(
                                  form.getFieldValue('resource'),
                                  'shmem',
                                  'accelerator',
                                  'acceleratorType',
                                ),
                                (value, type) => {
                                  return (
                                    <ResourceNumber
                                      key={type}
                                      // @ts-ignore
                                      type={type}
                                      value={
                                        type === 'mem'
                                          ? iSizeToSize(value, 'b')?.number + ''
                                          : value
                                      }
                                      opts={{
                                        shmem: form.getFieldValue('resource')
                                          .shmem
                                          ? iSizeToSize(
                                              form.getFieldValue('resource')
                                                .shmem,
                                              'b',
                                            )?.number
                                          : undefined,
                                      }}
                                    />
                                  );
                                },
                              )}
                              {_.isNumber(
                                form.getFieldValue(['resource', 'accelerator']),
                              ) && (
                                <ResourceNumber
                                  // @ts-ignore
                                  type={form.getFieldValue([
                                    'resource',
                                    'acceleratorType',
                                  ])}
                                  value={form.getFieldValue([
                                    'resource',
                                    'accelerator',
                                  ])}
                                />
                              )}
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
                        </Descriptions>
                      </Flex>
                    </BAICard>
                    <BAICard
                      title={t('webui.menu.Data&Storage')}
                      size="small"
                      status={
                        form.getFieldError('vfoldersAliasMap').length > 0
                          ? 'error'
                          : undefined
                      }
                      extraButtonTitle={t('button.Edit')}
                      onClickExtraButton={() => {
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'storage'),
                        );
                      }}
                    >
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
                          dataSource={_.map(
                            form.getFieldValue('mounts'),
                            (v) => {
                              return {
                                name: v,
                                alias:
                                  form.getFieldValue('vfoldersAliasMap')?.[v],
                              };
                            },
                          )}
                        ></Table>
                      ) : (
                        <Alert
                          type="warning"
                          showIcon
                          message={t('session.launcher.NoFolderMounted')}
                        />
                      )}
                    </BAICard>
                    <BAICard
                      title="Network"
                      size="small"
                      status={
                        form.getFieldError('ports').length > 0
                          ? 'error'
                          : undefined
                      }
                      extraButtonTitle={t('button.Edit')}
                      onClickExtraButton={() => {
                        setCurrentStep(
                          // @ts-ignore
                          steps.findIndex((v) => v.key === 'network'),
                        );
                      }}
                    >
                      <Descriptions size="small">
                        <Descriptions.Item
                          label={t('session.launcher.PreOpenPortTitle')}
                        >
                          <Flex
                            direction="row"
                            gap="xs"
                            style={{ flex: 1 }}
                            wrap="wrap"
                          >
                            {/* {form.getFieldValue('environments').image} */}
                            {_.sortBy(form.getFieldValue('ports'), (v) =>
                              parseInt(v),
                            ).map((v) => (
                              <PortTag value={v} style={{ margin: 0 }}>
                                {v}
                              </PortTag>
                            ))}
                            {form.getFieldValue('ports')?.length !==
                            0 ? undefined : (
                              <Typography.Text type="secondary">
                                -
                              </Typography.Text>
                            )}
                          </Flex>
                        </Descriptions.Item>
                      </Descriptions>
                    </BAICard>
                  </>
                )}

                <Flex direction="row" justify="between">
                  <Flex gap={'sm'}>
                    {/* <Popconfirm
                    title={t('session.CheckAgainDialog')}
                    placement="topLeft"
                    okButtonProps={{
                      danger: true,
                    }}
                    okText={t('button.Reset')}
                    onConfirm={() => {
                      // @ts-ignore
                      form.resetFields({

                      });
                    }}
                  >
                    <Button ghost danger>
                      {t('button.Reset')}
                    </Button>
                  </Popconfirm> */}
                    {currentStep === steps.length - 1 && (
                      <Button
                        icon={<SaveOutlined />}
                        disabled
                        onClick={() => {
                          message.info(
                            'Not implemented yet: Template edit modal',
                          );
                        }}
                      >
                        Save as a template
                      </Button>
                    )}
                  </Flex>
                  <Flex direction="row" gap="sm">
                    {currentStep !== steps.length - 1 && (
                      <Button onClick={moveToPreview}>Skip to Review</Button>
                    )}
                    {currentStep > 0 && (
                      <Button
                        onClick={() => {
                          setCurrentStep(currentStep - 1);
                        }}
                        icon={<LeftOutlined />}
                      >
                        Previous
                      </Button>
                    )}
                    {currentStep === steps.length - 1 ? (
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        disabled={hasError}
                      >
                        {t('session.launcher.Launch')}
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        ghost
                        onClick={() => {
                          setCurrentStep(currentStep + 1);
                        }}
                      >
                        Next <RightOutlined />
                      </Button>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Form>
          </Form.Provider>
          {/* </Suspense> */}
        </Flex>
        {screens.md && (
          <Affix
            offsetTop={150}
            // direction="column"
            style={{ zIndex: 2 }}
          >
            <Steps
              size="small"
              direction="vertical"
              current={currentStep}
              onChange={(nextCurrent) => {
                // handle "skip to review" step specifically, because validation
                if (nextCurrent === steps.length - 1) {
                  moveToPreview();
                } else {
                  setCurrentStep(nextCurrent);
                }
              }}
              items={_.map(steps, (s, idx) => ({
                ...s,
                status: idx === currentStep ? 'process' : 'wait',
              }))}
            />
          </Affix>
        )}
      </Flex>
      {/* <FolderExplorer
        folderName={selectedFolderName}
        open={!!selectedFolderName}
        onRequestClose={() => {
          setSelectedFolderName(undefined);
        }}
      /> */}
    </Flex>
  );
};

const SessionTypeItem: React.FC<{
  title: string;
  description?: string;
}> = ({ title, description }) => {
  const { token } = theme.useToken();
  return (
    <Flex
      direction="column"
      style={{ padding: token.paddingXS }}
      align="stretch"
    >
      <Typography.Title level={5}>{title}</Typography.Title>
      <Typography.Text
        type="secondary"
        // @ts-ignore
        style={{ textWrap: 'wrap' }}
      >
        {description}
      </Typography.Text>
    </Flex>
  );
};

// interface StepContentProps extends FlexProps{

// }
// const StepContent: React.FC<{}> = () => {
//   return <Flex>

//   </Flex>
// }

export default SessionLauncherPage;
