import EnvVarFormList from '../components/EnvVarFormList';
import Flex from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import ImageEnvironmentSelectFormItems from '../components/ImageEnvironmentSelectFormItems';
import ImageMetaIcon from '../components/ImageMetaIcon';
import PortSelectFormItem from '../components/PortSelectFormItem';
import ResourceAllocationFormItems from '../components/ResourceAllocationFormItems';
import ResourceGroupSelect from '../components/ResourceGroupSelect';
import {
  BlockOutlined,
  LeftOutlined,
  PlayCircleOutlined,
  PlayCircleTwoTone,
  RightOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Descriptions,
  Form,
  Grid,
  Input,
  Segmented,
  Select,
  StepProps,
  Steps,
  Tag,
  Typography,
  theme,
} from 'antd';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const SessionLauncherPage = () => {
  const { token } = theme.useToken();

  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const screens = Grid.useBreakpoint();

  const [form] = Form.useForm<{
    sessionType: 'interactive' | 'batch' | 'inference';
    batch: {
      enabled: boolean;
    };
  }>();

  // use getFieldValue to get value from form even if item is not mounted
  const sessionType =
    Form.useWatch('sessionType', form) || form.getFieldValue('sessionType');

  const steps = _.filter(
    [
      {
        title: t('session.launcher.SessionType'),
        key: 'sessionType',
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
          <PlayCircleTwoTone twoToneColor={token.colorPrimary} />
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

  console.log(form.getFieldsValue());
  console.log('envs', form.getFieldValue('envvars'));
  return (
    <Flex
      direction="column"
      align="stretch"
      style={{ padding: token.paddingSM, width: '100%' }}
    >
      <Flex direction="row" justify="between">
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          Start session
        </Typography.Title>
        <Button type="link" icon={<BlockOutlined />}>
          Start using a template
        </Button>
      </Flex>
      <Flex direction="row" gap="md" align="start">
        {screens.md && (
          <Flex direction="column">
            <Steps
              size="small"
              direction="vertical"
              current={currentStep}
              onChange={(nextCurrent) => {
                setCurrentStep(nextCurrent);
              }}
              items={steps}
            />
          </Flex>
        )}

        <Flex
          direction="column"
          align="stretch"
          style={{ flex: 1, maxWidth: 700 }}
        >
          <Suspense fallback={<FlexActivityIndicator />}>
            <Form
              form={form}
              layout="vertical"
              requiredMark="optional"
              initialValues={{
                sessionType: 'interactive',
              }}
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
                    <Segmented
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
                  <Form.Item
                    label="Session name"
                    name="name"
                    rules={[
                      {
                        max: 64,
                        message: t('session.Validation.SessionNameTooLong64'),
                      },
                      {
                        pattern:
                          /^(?:[a-zA-Z0-9][a-zA-Z0-9._-]{2,}[a-zA-Z0-9])?$/,
                        message: t(
                          'session.Validation.PleaseFollowSessionNameRule',
                        ).toString(),
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Card>

                {sessionType === 'batch' && (
                  <Card
                    title="Batch Mode Configuration"
                    style={{
                      display:
                        currentStepKey === 'sessionType' ? 'block' : 'none',
                    }}
                  >
                    <Form.Item
                      label={t('session.launcher.StartUpCommand')}
                      required
                      name={['batch', 'command']}
                    >
                      <Input.TextArea />
                    </Form.Item>
                    <Form.Item label="Schedule time">
                      <Flex direction="row" gap={'xs'}>
                        <Form.Item
                          noStyle
                          name={['batch', 'enabled']}
                          valuePropName="checked"
                        >
                          <Checkbox>{t('session.launcher.Enable')}</Checkbox>
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
                                  <DatePicker disabled={disabled} showTime />
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
                  <ImageEnvironmentSelectFormItems />

                  <Form.Item label="Environment Variables">
                    <EnvVarFormList name={'envvars'} />
                  </Form.Item>
                </Card>
                <Card
                  title={t('session.launcher.ResourceAllocation')}
                  style={{
                    display:
                      currentStepKey === 'environment' ? 'block' : 'none',
                  }}
                >
                  <Form.Item
                    name="resourceGroup"
                    label={t('session.ResourceGroup')}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <ResourceGroupSelect autoSelectDefault />
                  </Form.Item>
                  <ResourceAllocationFormItems />
                </Card>

                {/* Step Start*/}
                {currentStepKey === 'storage' && (
                  <>
                    <Card title={t('webui.menu.Data&Storage')}>
                      vFolder & alias
                    </Card>
                  </>
                )}
                {/* Step Start*/}
                {currentStepKey === 'network' && (
                  <>
                    <Card title={t('session.launcher.Network')}>
                      <PortSelectFormItem />
                    </Card>
                  </>
                )}

                {/* Step Start*/}
                {currentStepKey === 'review' && (
                  <>
                    <Card
                      title={t('session.launcher.SessionType')}
                      size="small"
                      extra={
                        <Button
                          type="link"
                          onClick={() => {
                            setCurrentStep(
                              // @ts-ignore
                              steps.findIndex((v) => v.key === 'sessionType'),
                            );
                          }}
                        >
                          {t('button.Edit')}
                        </Button>
                      }
                    >
                      <Descriptions size="small">
                        <Descriptions.Item label="Session Type" span={24}>
                          {form.getFieldValue('sessionType')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Session name" span={24}>
                          {form.getFieldValue('name')}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    <Card
                      title={t('session.launcher.Environments')}
                      size="small"
                      extra={
                        <Button
                          type="link"
                          onClick={() => {
                            setCurrentStep(
                              // @ts-ignore
                              steps.findIndex((v) => v.key === 'environment'),
                            );
                          }}
                        >
                          {t('button.Edit')}
                        </Button>
                      }
                    >
                      <Descriptions size="small" layout="vertical">
                        <Descriptions.Item label="Image" span={24}>
                          <Flex direction="row" gap="xs">
                            <ImageMetaIcon
                              image={
                                form.getFieldValue('environments')?.version
                              }
                            />
                            {/* {form.getFieldValue('environments').image} */}
                            <Typography.Text code copyable>
                              {form.getFieldValue('environments')?.version}
                            </Typography.Text>
                          </Flex>
                        </Descriptions.Item>
                        <Descriptions.Item
                          span={24}
                          label={t('session.launcher.EnvironmentVariable')}
                        >
                          {form.getFieldValue('envvars')?.length ? (
                            <SyntaxHighlighter
                              style={darcula}
                              codeTagProps={{
                                style: {
                                  fontFamily: 'monospace',
                                },
                              }}
                            >
                              {_.map(
                                form.getFieldValue('envvars'),
                                (v: { variable: string; value: string }) =>
                                  `${v.variable}="${v.value}"`,
                              ).join('\n')}
                            </SyntaxHighlighter>
                          ) : (
                            '-'
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                    <Card
                      title={t('session.launcher.ResourceAllocation')}
                      size="small"
                      extra={
                        <Button
                          type="link"
                          onClick={() => {
                            setCurrentStep(
                              // @ts-ignore
                              steps.findIndex((v) => v.key === 'environment'),
                            );
                          }}
                        >
                          {t('button.Edit')}
                        </Button>
                      }
                    ></Card>
                    <Card
                      title="Storage"
                      size="small"
                      extra={
                        <Button
                          type="link"
                          onClick={() => {
                            setCurrentStep(
                              // @ts-ignore
                              steps.findIndex((v) => v.key === 'storage'),
                            );
                          }}
                        >
                          {t('button.Edit')}
                        </Button>
                      }
                    ></Card>
                    <Card
                      title="Network"
                      size="small"
                      extra={
                        <Button
                          type="link"
                          onClick={() => {
                            setCurrentStep(
                              // @ts-ignore
                              steps.findIndex((v) => v.key === 'network'),
                            );
                          }}
                        >
                          {t('button.Edit')}
                        </Button>
                      }
                    >
                      <Descriptions size="small">
                        <Descriptions.Item label="Preopend port">
                          {/* {form.getFieldValue('environments').image} */}
                          {_.sortBy(form.getFieldValue('ports')).map((v) => (
                            <Tag>{v}</Tag>
                          ))}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </>
                )}

                <Flex direction="row" justify="end" gap="sm">
                  {currentStep !== steps.length - 1 && (
                    <Button
                      onClick={() => {
                        setCurrentStep(4);
                      }}
                    >
                      Skip to Review
                    </Button>
                  )}
                  {currentStep > 0 && (
                    <Button
                      onClick={() => {
                        setCurrentStep((prev) => {
                          return prev - 1;
                        });
                      }}
                      icon={<LeftOutlined />}
                    >
                      Previous
                    </Button>
                  )}
                  {currentStep === steps.length - 1 ? (
                    <Button type="primary" icon={<PlayCircleOutlined />}>
                      Start
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      ghost
                      onClick={() => {
                        setCurrentStep((prev) => {
                          return prev + 1;
                        });
                      }}
                    >
                      Next <RightOutlined />
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Form>
          </Suspense>
        </Flex>
      </Flex>
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
