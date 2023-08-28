import Flex, { FlexProps } from '../components/Flex';
import FlexActivityIndicator from '../components/FlexActivityIndicator';
import ImageEnvironmentSelectFormItems from '../components/ImageEnvironmentSelectFormItems';
import ResourceGroupSelect from '../components/ResourceGroupSelect';
import SliderInputItem from '../components/SliderInputFormItem';
import VFolderSelect from '../components/VFolderSelect';
import { useTanQuery } from '../hooks/reactQueryAlias';
import {
  BlockOutlined,
  CheckOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Segmented,
  Select,
  StepProps,
  Steps,
  StepsProps,
  Tabs,
  TimePicker,
  Typography,
  theme,
} from 'antd';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const SessionLauncherPage = () => {
  const { token } = theme.useToken();

  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const [form] = Form.useForm<{
    sessionType: 'interactive' | 'batch' | 'inference';
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
    <Flex direction="column" align="stretch" style={{ margin: token.marginSM }}>
      <Flex direction="row" justify="between">
        <Typography.Title level={2} style={{ marginTop: 0 }}>
          Start session
        </Typography.Title>
        <Flex>
          {currentStep === 0 && (
            <Button type="link" icon={<BlockOutlined />}>
              Start using a template
            </Button>
          )}
        </Flex>
      </Flex>
      <Flex direction="row" gap="md" align="start">
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

        <Flex direction="column">
          <Suspense fallback={<FlexActivityIndicator />}>
            <Form form={form} layout="vertical" requiredMark="optional">
              <Flex
                direction="column"
                align="stretch"
                style={{ width: 960 }}
                gap="md"
              >
                {/* Step 0 fields */}
                {currentStep === 0 && (
                  <>
                    <Card title="Session type">
                      <Form.Item name="sessionType">
                        <Segmented
                          options={[
                            {
                              label: (
                                <SessionTypeItem
                                  title="🏃‍♀️ Make, test and run"
                                  description="Interactive mode allows you to create, test and run code interactively via juptyer notebook, visual studio code, etc."
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
                            {
                              label: (
                                <SessionTypeItem
                                  title="🤖 Run a inference service"
                                  description="Inference allow you dynamically scale your mode service"
                                />
                              ),
                              value: 'inference',
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item label="Session name" help="slkadfjalsjdlfjsf">
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
                            <Form.Item noStyle name={['batch', 'scheduleDate']}>
                              <DatePicker />
                            </Form.Item>
                            <Form.Item noStyle name={['batch', 'scheduleTime']}>
                              <TimePicker />
                            </Form.Item>
                          </Flex>
                        </Form.Item>
                      </Card>
                    )}

                    {sessionType === 'inference' && (
                      <Card
                        title="Inference Mode Configuration"
                        bodyStyle={{ width: 640 }}
                      >
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
                    <Card title="Environment" bodyStyle={{ width: 640 }}>
                      <ImageEnvironmentSelectFormItems />
                      <Form.Item label="Environment variables"></Form.Item>
                    </Card>
                    <Card title="Resources" bodyStyle={{ maxWidth: 640 }}>
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
                      <SliderInputItem
                        name={'cpu'}
                        label={t('session.launcher.CPU')}
                        tooltip={<Trans i18nKey={'session.launcher.DescCPU'} />}
                        // min={parseInt(
                        //   _.find(
                        //     currentImage?.resource_limits,
                        //     (i) => i?.key === 'cpu',
                        //   )?.min || '0',
                        // )}
                        // max={parseInt(
                        //   _.find(
                        //     currentImage?.resource_limits,
                        //     (i) => i?.key === 'cpu',
                        //   )?.max || '100',
                        // )}
                        inputNumberProps={{
                          addonAfter: t('session.launcher.Core'),
                        }}
                        required
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
                      <SliderInputItem
                        name={'mem'}
                        label={t('session.launcher.Memory')}
                        tooltip={
                          <Trans i18nKey={'session.launcher.DescMemory'} />
                        }
                        max={30}
                        inputNumberProps={{
                          addonAfter: 'GB',
                        }}
                        step={0.05}
                        required
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
                      <SliderInputItem
                        name={'shmem'}
                        label={t('session.launcher.SharedMemory')}
                        tooltip={
                          <Trans
                            i18nKey={'session.launcher.DescSharedMemory'}
                          />
                        }
                        max={30}
                        step={0.1}
                        inputNumberProps={{
                          addonAfter: 'GB',
                        }}
                        required
                        rules={[
                          {
                            required: true,
                          },
                        ]}
                      />
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
                    <Card title="Network"></Card>
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
