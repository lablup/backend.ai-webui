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
  DownOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { Button, List, Typography, theme } from 'antd';
import { createStyles } from 'antd-style';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SLIDE_DURATION = 300;

const useStyles = createStyles(({ css, token }) => ({
  stepSlider: css`
    position: relative;
    overflow: hidden;
    height: 20px;
  `,
  stepSlide: css`
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: ${token.marginXXS}px;
    height: 20px;
    transition:
      transform ${SLIDE_DURATION}ms ease-in-out,
      opacity ${SLIDE_DURATION}ms ease-in-out;
  `,
  // Visible position (center)
  slideCenter: css`
    transform: translateY(0);
    opacity: 1;
  `,
  // Exited upward (out of view)
  slideUp: css`
    transform: translateY(-100%);
    opacity: 0;
  `,
  // Waiting below (before entering)
  slideDown: css`
    transform: translateY(100%);
    opacity: 0;
  `,
  // Instantly position without transition (used to place new element below before animating in)
  noTransition: css`
    transition: none !important;
  `,
  expandToggle: css`
    cursor: pointer;
    user-select: none;
    &:hover {
      opacity: 0.7;
    }
  `,
  expandIcon: css`
    transition: transform 0.2s ease;
    font-size: 10px;
  `,
  expandIconOpen: css`
    transform: rotate(0deg);
  `,
  expandIconClosed: css`
    transform: rotate(-90deg);
  `,
  stepList: css`
    overflow: hidden;
    transition:
      max-height 0.25s ease-in-out,
      opacity 0.25s ease-in-out;
  `,
  stepListExpanded: css`
    max-height: 200px;
    opacity: 1;
  `,
  stepListCollapsed: css`
    max-height: 0;
    opacity: 0;
  `,
}));

const StepIcon: React.FC<{
  status: string;
  size?: number;
  animated?: boolean;
}> = ({ status, size = 14, animated = false }) => {
  const { token } = theme.useToken();

  if (status === 'resolved') {
    return (
      <CheckCircleOutlined
        style={{ color: token.colorSuccess, fontSize: size }}
      />
    );
  }
  if (status === 'rejected') {
    return (
      <CloseCircleOutlined
        style={{ color: token.colorError, fontSize: size }}
      />
    );
  }
  if (status === 'warned') {
    return (
      <ExclamationCircleOutlined
        style={{ color: token.colorWarning, fontSize: size }}
      />
    );
  }
  if (status === 'pending') {
    return animated ? (
      <LoadingOutlined style={{ color: token.colorInfo, fontSize: size }} />
    ) : (
      <ClockCircleOutlined style={{ color: token.colorInfo, fontSize: size }} />
    );
  }
  if (status === 'cancelled') {
    return (
      <MinusCircleOutlined
        style={{ color: token.colorTextDisabled, fontSize: size }}
      />
    );
  }
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${token.colorBorder}`,
      }}
    />
  );
};

const BAIMultiStepNotificationItem: React.FC<{
  notification: NotificationState;
  onRetry?: () => void;
  onCancel?: () => void;
  showDate?: boolean;
}> = ({ notification, onRetry, onCancel, showDate }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const { multiStep } = notification;

  const [expanded, setExpanded] = useState(false);

  // Two-element animation: outgoing slides up, incoming slides up from below
  const prevStepRef = useRef(multiStep?.currentStep ?? 0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [incoming, setIncoming] = useState(multiStep?.currentStep ?? 0);
  // 'idle' = no animation, 'animating' = transition in progress
  const [phase, setPhase] = useState<'idle' | 'ready' | 'animating'>('idle');

  useEffect(() => {
    const newStep = multiStep?.currentStep ?? 0;
    if (newStep !== prevStepRef.current) {
      const prev = prevStepRef.current;
      prevStepRef.current = newStep;

      // Phase 1: place outgoing at center, incoming at bottom (no transition)
      setOutgoing(prev);
      setIncoming(newStep);
      setPhase('ready');
    }
  }, [multiStep?.currentStep]);

  useEffect(() => {
    if (phase === 'ready') {
      // Phase 2: after one frame, start the transition
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('animating');
        });
      });
      return () => cancelAnimationFrame(raf);
    }
    if (phase === 'animating') {
      // Phase 3: after transition ends, clean up
      const timeout = setTimeout(() => {
        setOutgoing(null);
        setPhase('idle');
      }, SLIDE_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  if (!multiStep) return null;

  const { currentStep, totalSteps, steps, overallStatus } = multiStep;
  const currentStepDef = steps[currentStep];

  const overallIcon =
    overallStatus === 'completed' ? (
      <CheckCircleOutlined style={{ color: token.colorSuccess }} />
    ) : overallStatus === 'failed' ? (
      <CloseCircleOutlined style={{ color: token.colorError }} />
    ) : overallStatus === 'warned' ? (
      <ExclamationCircleOutlined style={{ color: token.colorWarning }} />
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
        : overallStatus === 'warned'
          ? t('notification.StepWarning')
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
    (overallStatus === 'failed' || overallStatus === 'warned');
  const showCancel = onCancel != null && overallStatus === 'running';
  const actionButton = notification.extraData?.actionButton as
    | { label: string; onClick: () => void }
    | undefined;

  // showDate is true when rendered inside the Drawer (detail view)
  const isDetailView = showDate === true;

  const isTerminal =
    overallStatus === 'completed' ||
    overallStatus === 'failed' ||
    overallStatus === 'warned' ||
    overallStatus === 'cancelled';

  const incomingStepDef = steps[incoming];
  const outgoingStepDef = outgoing != null ? steps[outgoing] : null;

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

        {/* Current step: icon + counter + animated label */}
        <BAIFlex
          direction="row"
          align="center"
          gap={'xxs'}
          className={isDetailView ? styles.expandToggle : undefined}
          onClick={isDetailView ? () => setExpanded((v) => !v) : undefined}
        >
          {overallStatus !== 'warned' && (
            <StepIcon
              status={
                isTerminal
                  ? overallStatus === 'completed'
                    ? 'resolved'
                    : overallStatus === 'failed'
                      ? 'rejected'
                      : 'cancelled'
                  : (incomingStepDef?.status ?? 'idle')
              }
              animated={!isTerminal}
            />
          )}
          {!isTerminal && (
            <Typography.Text
              style={{ fontSize: token.fontSizeSM, whiteSpace: 'nowrap' }}
              type="secondary"
            >
              {currentStep + 1}/{totalSteps}
            </Typography.Text>
          )}
          {isTerminal ? (
            <Typography.Text
              style={{ fontSize: token.fontSizeSM }}
              type="secondary"
            >
              {stepLabel}
            </Typography.Text>
          ) : (
            <div className={styles.stepSlider} style={{ flex: 1 }}>
              {outgoing != null && outgoingStepDef && (
                <div
                  className={`${styles.stepSlide} ${
                    phase === 'ready' ? styles.slideCenter : styles.slideUp
                  }`}
                >
                  <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                    {outgoingStepDef.label}
                  </Typography.Text>
                </div>
              )}
              <div
                className={`${styles.stepSlide} ${
                  phase === 'ready'
                    ? `${styles.slideDown} ${styles.noTransition}`
                    : styles.slideCenter
                }`}
              >
                <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                  {incomingStepDef?.label}
                </Typography.Text>
              </div>
            </div>
          )}
          {isDetailView && totalSteps > 1 && (
            <DownOutlined
              className={`${styles.expandIcon} ${
                expanded ? styles.expandIconOpen : styles.expandIconClosed
              }`}
              style={{ color: token.colorTextSecondary }}
            />
          )}
        </BAIFlex>

        {/* Expandable step list: Drawer only */}
        {isDetailView && (
          <div
            className={`${styles.stepList} ${
              expanded ? styles.stepListExpanded : styles.stepListCollapsed
            }`}
          >
            <BAIFlex
              direction="column"
              align="stretch"
              gap={'xxs'}
              style={{ paddingTop: token.paddingXXS }}
            >
              {steps.map((step, idx) => (
                <BAIFlex
                  key={idx}
                  direction="row"
                  align="center"
                  gap={'xxs'}
                  style={{ opacity: step.status === 'idle' ? 0.4 : 1 }}
                >
                  <BAIFlex style={{ width: 16, justifyContent: 'center' }}>
                    <StepIcon
                      status={step.status}
                      size={12}
                      animated={step.status === 'pending'}
                    />
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
              ))}
            </BAIFlex>
          </div>
        )}

        {/* Description: shown on failure/cancellation with detail message */}
        {isTerminal && notification.description && (
          <Typography.Text
            style={{
              fontSize: token.fontSizeSM,
              color:
                overallStatus === 'failed'
                  ? token.colorError
                  : overallStatus === 'warned'
                    ? token.colorWarning
                    : token.colorTextSecondary,
            }}
          >
            {notification.description}
          </Typography.Text>
        )}

        {/* Buttons: retry / cancel / action */}
        <BAIFlex direction="row" align="end" gap={'xxs'} justify="end">
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
            {actionButton && (
              <Button type="link" size="small" onClick={actionButton.onClick}>
                {actionButton.label}
              </Button>
            )}
          </BAIFlex>
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
          {isDetailView && (
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
