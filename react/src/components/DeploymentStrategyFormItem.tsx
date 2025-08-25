import InputNumberWithSlider from './InputNumberWithSlider';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { Form, Radio, Typography, Alert, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

export interface DeploymentStrategyFormValues {
  defaultDeploymentStrategy: {
    type: 'ROLLING' | 'BLUE_GREEN' | 'CANARY';
  };
}

const DeploymentStrategyFormItem: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const strategyDescriptions = {
    ROLLING: t('deployment.launcher.RollingDescription'),
    BLUE_GREEN: t('deployment.launcher.BlueGreenDescription'),
    CANARY: t('deployment.launcher.CanaryDescription'),
  };

  return (
    <>
      <Form.Item
        name={['defaultDeploymentStrategy', 'type']}
        rules={[
          {
            required: true,
            message: t('deployment.launcher.DeploymentStrategyRequired'),
          },
        ]}
      >
        <Radio.Group>
          <BAIFlex direction="column" gap="md" align="stretch">
            <Radio value="ROLLING">
              <BAIFlex direction="column" gap="xxs" align="start">
                <BAIFlex direction="row" gap="xs" align="center">
                  <Typography.Text>
                    {t('deployment.launcher.RollingUpdate')}
                  </Typography.Text>
                  <QuestionIconWithTooltip
                    title={strategyDescriptions.ROLLING}
                  />
                </BAIFlex>
              </BAIFlex>
            </Radio>
            <Radio value="BLUE_GREEN">
              <BAIFlex direction="column" gap="xxs" align="start">
                <BAIFlex direction="row" gap="xs" align="center">
                  <Typography.Text>
                    {t('deployment.launcher.BlueGreenDeployment')}
                  </Typography.Text>
                  <QuestionIconWithTooltip
                    title={strategyDescriptions.BLUE_GREEN}
                  />
                </BAIFlex>
              </BAIFlex>
            </Radio>
            {/* TODO: Uncomment when CANARY strategy is implemented */}
            {/* <Radio value="CANARY">
              <BAIFlex direction="column" gap="xxs" align="start">
                <Typography.Text>
                  {t('deployment.launcher.CanaryDeployment')}
                </Typography.Text>
                <QuestionIconWithTooltip
                  title={strategyDescriptions.CANARY}
                />
              </BAIFlex>
            </Radio> */}
          </BAIFlex>
        </Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const strategyType = getFieldValue([
            'defaultDeploymentStrategy',
            'type',
          ]);

          if (strategyType === 'BLUE_GREEN' || strategyType === 'CANARY') {
            return (
              <Alert
                message={t('deployment.launcher.AdvancedStrategyWarning')}
                description={
                  <Trans
                    i18nKey={
                      'deployment.launcher.AdvancedStrategyWarningDescription'
                    }
                  />
                }
                type="warning"
                showIcon
                style={{
                  marginBottom: token.marginLG,
                }}
              />
            );
          }

          return null;
        }}
      </Form.Item>
      <Form.Item
        name={['desiredReplicaCount']}
        label={t('deployment.NumberOfDesiredReplicas')}
        rules={[
          {
            required: true,
          },
          {
            type: 'number',
            min: 0,
          },
        ]}
      >
        <InputNumberWithSlider
          inputContainerMinWidth={190}
          min={0}
          inputNumberProps={{
            addonAfter: '#',
          }}
          step={1}
        />
      </Form.Item>
    </>
  );
};

export default DeploymentStrategyFormItem;
