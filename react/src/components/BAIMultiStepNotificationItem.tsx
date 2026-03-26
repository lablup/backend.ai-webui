/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationState } from '../hooks/useBAINotification';
import BAINotificationBackgroundProgress from './BAINotificationBackgroundProgress';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { Button, List, Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';

const BAIMultiStepNotificationItem: React.FC<{
  notification: NotificationState;
  onRetry?: () => void;
  onCancel?: () => void;
  showDate?: boolean;
}> = ({ notification, onRetry, onCancel, showDate }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { multiStep } = notification;

  if (!multiStep) return null;

  const { currentStep, totalSteps, steps, overallStatus } = multiStep;
  const currentStepDef = steps[currentStep];

  const overallIcon =
    overallStatus === 'completed' ? (
      <CheckCircleOutlined style={{ color: token.colorSuccess }} />
    ) : overallStatus === 'failed' ? (
      <CloseCircleOutlined style={{ color: token.colorError }} />
    ) : overallStatus === 'cancelled' ? (
      <MinusCircleOutlined style={{ color: token.colorTextDisabled }} />
    ) : (
      <ClockCircleOutlined style={{ color: token.colorInfo }} />
    );

  const stepLabel =
    overallStatus === 'completed'
      ? t('notification.AllStepsCompleted')
      : overallStatus === 'failed'
        ? t('notification.StepFailed')
        : overallStatus === 'cancelled'
          ? t('notification.Cancelled')
          : currentStepDef
            ? t('notification.StepProgress', {
                current: currentStep + 1,
                total: totalSteps,
                label: currentStepDef.label,
              })
            : t('notification.StepProgress', {
                current: currentStep + 1,
                total: totalSteps,
                label: '',
              });

  const currentStepProgress = currentStepDef?.progress;

  const showRetry =
    onRetry != null &&
    (overallStatus === 'failed' || overallStatus === 'cancelled');
  const showCancel = onCancel != null && overallStatus === 'running';

  return (
    <List.Item>
      <BAIFlex direction="column" align="stretch" gap={'xxs'}>
        {/* Header: icon + message */}
        <BAIFlex
          direction="row"
          align="start"
          gap={'xs'}
          style={{ paddingRight: token.paddingMD }}
        >
          <BAIFlex style={{ height: 22 }}>{overallIcon}</BAIFlex>
          <Typography.Paragraph style={{ fontWeight: 500 }}>
            {notification.message}
          </Typography.Paragraph>
        </BAIFlex>

        {/* Step counter description */}
        <BAIFlex direction="row" align="end" gap={'xxs'} justify="between">
          <Typography.Paragraph>{stepLabel}</Typography.Paragraph>
          <BAIFlex gap={'xxs'}>
            {showRetry && (
              <Button type="link" size="small" onClick={onRetry}>
                {t('button.Retry')}
              </Button>
            )}
            {showCancel && (
              <Button type="link" size="small" onClick={onCancel}>
                {t('button.Cancel')}
              </Button>
            )}
          </BAIFlex>
        </BAIFlex>

        {/* Step list */}
        <BAIFlex direction="column" align="stretch" gap={'xxs'}>
          {steps.map((step, idx) => {
            const stepIcon =
              step.status === 'resolved' ? (
                <CheckCircleOutlined
                  style={{ color: token.colorSuccess, fontSize: 12 }}
                />
              ) : step.status === 'rejected' ? (
                <CloseCircleOutlined
                  style={{ color: token.colorError, fontSize: 12 }}
                />
              ) : step.status === 'pending' ? (
                <ClockCircleOutlined
                  style={{ color: token.colorInfo, fontSize: 12 }}
                />
              ) : step.status === 'cancelled' ? (
                <MinusCircleOutlined
                  style={{ color: token.colorTextDisabled, fontSize: 12 }}
                />
              ) : (
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: `1px solid ${token.colorBorder}`,
                  }}
                />
              );

            return (
              <BAIFlex
                key={idx}
                direction="row"
                align="center"
                gap={'xxs'}
                style={{ opacity: step.status === 'idle' ? 0.4 : 1 }}
              >
                <BAIFlex style={{ width: 16, justifyContent: 'center' }}>
                  {stepIcon}
                </BAIFlex>
                <Typography.Text
                  style={{
                    fontSize: token.fontSizeSM,
                    color:
                      step.status === 'idle'
                        ? token.colorTextDisabled
                        : undefined,
                  }}
                >
                  {step.label}
                </Typography.Text>
              </BAIFlex>
            );
          })}
        </BAIFlex>

        {/* Progress bar for SSE steps */}
        <BAIFlex direction="row" align="center" justify="end" gap={'sm'}>
          {notification.backgroundTask &&
            (currentStepProgress != null ||
              notification.backgroundTask.percent != null) && (
              <BAINotificationBackgroundProgress
                backgroundTask={{
                  ...notification.backgroundTask,
                  percent:
                    currentStepProgress ?? notification.backgroundTask.percent,
                }}
                showDate={showDate}
              />
            )}
          {showDate && (
            <BAIFlex>
              <Typography.Text type="secondary">
                {dayjs(notification.created).format('lll')}
              </Typography.Text>
            </BAIFlex>
          )}
        </BAIFlex>
      </BAIFlex>
    </List.Item>
  );
};

export default BAIMultiStepNotificationItem;
