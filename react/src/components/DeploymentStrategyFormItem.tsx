import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { Form, Radio, Typography, Alert } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface DeploymentStrategyFormValues {
  deploymentStrategy: {
    type: 'ROLLING' | 'BLUE_GREEN' | 'CANARY';
  };
}

const DeploymentStrategyFormItem: React.FC = () => {
  const { t } = useTranslation();

  const strategyDescriptions = {
    ROLLING: t('deployment.launcher.RollingDescription'),
    BLUE_GREEN: t('deployment.launcher.BlueGreenDescription'),
    CANARY: t('deployment.launcher.CanaryDescription'),
  };

  return (
    <>
      <Form.Item
        name={['deploymentStrategy', 'type']}
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
          const strategyType = getFieldValue(['deploymentStrategy', 'type']);

          if (strategyType === 'BLUE_GREEN' || strategyType === 'CANARY') {
            return (
              <Alert
                message={t('deployment.launcher.AdvancedStrategyWarning')}
                description={t(
                  'deployment.launcher.AdvancedStrategyWarningDescription',
                )}
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            );
          }

          return null;
        }}
      </Form.Item>
    </>
  );
};

export default DeploymentStrategyFormItem;
