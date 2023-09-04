import EnvVarFormList from '../components/EnvVarFormList';
import Flex from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import ImageEnvironmentSelectFormItems from '../components/ImageEnvironmentSelectFormItems';
import ResourceAllocationFormItems from '../components/ResourceAllocationFormItems';
import ResourceGroupSelect from '../components/ResourceGroupSelect';
import { BlockOutlined, PlayCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Grid,
  Input,
  Segmented,
  Select,
  StepProps,
  Steps,
  Typography,
  theme,
} from 'antd';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
        title: 'Session Type',
        key: 'sessionType',
      },
      {
        title: 'Environment & Resources',
        key: 'environment',
      },
      sessionType !== 'inference' && {
        title: 'Storage',
        key: 'storage&network',
      },
      {
        title: 'Network',
        key: 'network',
      },
      {
        title: 'Review & Start',
        icon: <PlayCircleOutlined />,
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
            <Form form={form} layout="vertical" requiredMark="optional">
              <Flex
                direction="column"
                align="stretch"
                gap="md"
                // style={{  }}
              >
                {/* Step 0 fields */}
                {currentStep === 0 && (
                  <>
                    <Flex justify="end">
                      <Button type="link" icon={<BlockOutlined />}>
                        Start using a template
                      </Button>
                    </Flex>
                    <Card title="Session type">
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
                            message: t(
                              'session.Validation.SessionNameTooLong64',
                            ),
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
                      <Card title="Batch Mode Configuration">
                        <Form.Item
                          label="Startup Command"
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
                              <Checkbox>{t('button.Activate')}</Checkbox>
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
                                      <DatePicker
                                        disabled={disabled}
                                        showTime
                                        placeholder="Select time"
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
                  </>
                )}

                {/* Step Start*/}
                {currentStepKey === 'environment' && (
                  <>
                    <Card title="Environment">
                      <ImageEnvironmentSelectFormItems />

                      <Form.Item label="Environment Variables">
                        <EnvVarFormList name={'envvars'} />
                      </Form.Item>
                    </Card>
                    <Card title="Resources">
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
                  </>
                )}

                {/* Step Start*/}
                {currentStepKey === 'storage' && (
                  <>
                    <Card title="Storage"></Card>
                  </>
                )}
                {/* Step Start*/}
                {currentStepKey === 'network' && (
                  <>
                    <Card title="Network">
                      <Form.Item
                        label={t('session.launcher.PreOpenPortTitle')}
                        help={t('session.launcher.PreOpenPortRange')}
                        rules={
                          [
                            // {
                            //   pattern:
                            //     /^(102[4-9]|10[3-9][0-9]|1[1-9][0-9]{2}|[2-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
                            //   message: t('session.launcher.PreOpenPortRange'),
                            // },
                            // TODO: find a way to validate each item
                            // ({ getFieldValue }) => ({
                            //   validator(rule, values) {
                            //     console.log('sadfasdfasdf');
                            //     if (
                            //       _.every(values, (v) =>
                            //         /^(102[4-9]|10[3-9][0-9]|1[1-9][0-9]{2}|[2-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/.test(
                            //           v,
                            //         ),
                            //       )
                            //     ) {
                            //       return Promise.resolve();
                            //     }
                            //     return Promise.reject(
                            //       new Error(
                            //         'The new password that you entered do not match!',
                            //       ),
                            //     );
                            //   },
                            // }),
                          ]
                        }
                      >
                        <Select
                          mode="tags"
                          style={{ width: '100%' }}
                          // placeholder={t('session.launcher.preopen')}
                          onChange={(value) => {
                            console.log(value);
                          }}
                          // TODO: find a way to allow only options event if tokenSeparators is set
                          options={[]}
                          suffixIcon={null}
                          open={false}
                          tokenSeparators={[',', ' ']}
                        />
                      </Form.Item>
                    </Card>
                  </>
                )}

                {/* Step Start*/}
                {currentStepKey === 'review' && (
                  <>
                    <Card title="Review and start"></Card>
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
                    >
                      Previous
                    </Button>
                  )}
                  {currentStep === steps.length - 1 ? (
                    <Button type="primary">Start</Button>
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
                      Next
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
