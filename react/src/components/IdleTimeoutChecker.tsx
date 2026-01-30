import BAIRadioGroup from './BAIRadioGroup';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import {
  App,
  Card,
  Form,
  FormItemProps,
  InputNumber,
  Radio,
  Switch,
  theme,
} from 'antd';
import type { FormInstance } from 'antd/lib';
import {
  BAIButton,
  BAICard,
  BAIFlex,
  BAIText,
  useBAILogger,
  useErrorMessageResolver,
  useFetchKey,
} from 'backend.ai-ui';
import { TFunction } from 'i18next';
import _ from 'lodash';
import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useResourceSlots } from 'src/hooks/backendai';
import type { IdleInfoType } from 'src/hooks/useIdleChecker';
import useIdleChecker from 'src/hooks/useIdleChecker';

export interface IdleTimeoutCheckerProps {}

// Helper function to process resource slots
// This function extracts utilization and memory thresholds from the idleInfo object
const processResourceSlots = (
  resourceSlots: Record<string, any>,
  idleInfo: IdleInfoType,
): Record<string, any> => {
  return _.mapValues(resourceSlots, (_slot, key) => {
    const baseKey = _.head(key.split('.')) ?? '';
    const thresholds =
      idleInfo?.checkers?.utilization?.['resource-thresholds'] || {};
    return {
      [`${baseKey}_util`]: thresholds[`${baseKey}_util`]?.average,
      [baseKey]: thresholds[baseKey]?.average,
      [`${baseKey}_mem`]: thresholds[`${baseKey}_mem`]?.average,
    };
  });
};

// Helper function to create resource thresholds
// This function constructs an object with utilization and memory thresholds based on the resource slots and values provided
const createResourceThresholds = (
  resourceSlots: Record<string, any>,
  values: Record<string, any>,
): Record<string, any> => {
  return _.fromPairs(
    _.flatMap(resourceSlots, (_slot, key) => {
      const baseKey = _.head(key.split('.')) ?? '';
      return [
        [
          `${baseKey}_util`,
          !_.isEmpty(values[`${baseKey}_util`])
            ? { average: values[`${baseKey}_util`] }
            : undefined,
        ],
        [baseKey, values[baseKey] ? { average: values[baseKey] } : undefined],
        [
          `${baseKey}_mem`,
          !_.isEmpty(values[`${baseKey}_mem`])
            ? { average: values[`${baseKey}_mem`] }
            : undefined,
        ],
      ];
    }).filter(([_, value]) => value !== undefined),
  );
};

const validateStringInputNumber = (
  t: TFunction,
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  },
): Exclude<FormItemProps['rules'], undefined> => {
  return [
    {
      validator: (_rule, value: string) => {
        if (_.isEmpty(value)) {
          return Promise.resolve();
        }

        const numValue = Number(value);
        if (isNaN(numValue)) {
          return Promise.reject(t('general.validation.NumbersOnly'));
        }
        if (min !== undefined && numValue < min) {
          return Promise.reject(
            t('general.validation.MustBeGreaterThanOrEqualTo', { value: min }),
          );
        }
        if (max !== undefined && numValue > max) {
          return Promise.reject(
            t('general.validation.MustBeLessThanOrEqualTo', { value: max }),
          );
        }
        return Promise.resolve();
      },
    },
  ];
};

const IdleTimeoutChecker = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const formRef = useRef<FormInstance>(null);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const { idleInfo, update, clear } = useIdleChecker(fetchKey);
  const { message, modal } = App.useApp();
  const [resourceSlots] = useResourceSlots();
  const { getErrorMessage } = useErrorMessageResolver();
  const { logger } = useBAILogger();

  useLayoutEffect(() => {
    formRef?.current?.resetFields();
  }, []);

  const networkCheckerEnabled = idleInfo?.enabled?.includes('network') ?? false;
  const utilizationCheckerEnabled =
    idleInfo?.enabled?.includes('utilization') ?? false;

  const resourceThresholds = processResourceSlots(
    resourceSlots ?? {},
    idleInfo ?? { checkers: {}, enabled: '' },
  );

  const INITIAL_VALUES = {
    networkChecker: networkCheckerEnabled,
    utilizationChecker: utilizationCheckerEnabled,
    threshold: idleInfo?.checkers?.network_timeout?.threshold
      ? _.toNumber(idleInfo?.checkers?.network_timeout?.threshold)
      : undefined,
    'app-streaming-packet-timeout': idleInfo?.['app-streaming-packet-timeout'],
    ..._.merge({}, ...Object.values(resourceThresholds)),
    'time-window': idleInfo?.checkers?.utilization?.['time-window'],
    'initial-grace-period':
      idleInfo?.checkers?.utilization?.['initial-grace-period'],
    'thresholds-check-operator':
      idleInfo?.checkers?.utilization?.['thresholds-check-operator'],
  };

  const handleOK = async () => {
    formRef.current
      ?.validateFields()
      .then(async (values) => {
        const networkCheckerEnabled =
          formRef.current?.getFieldValue('networkChecker');
        const utilizationCheckerEnabled =
          formRef.current?.getFieldValue('utilizationChecker');

        const network_timeout = {
          ...(values.threshold && { threshold: values.threshold }),
        };

        const resourceThresholds = createResourceThresholds(
          resourceSlots ?? {},
          values,
        );

        const utilization = {
          ...(Object.keys(resourceThresholds).length > 0 && {
            'resource-thresholds': resourceThresholds,
          }),
          ...(values['thresholds-check-operator'] && {
            'thresholds-check-operator': values['thresholds-check-operator'],
          }),
          ...(values['time-window'] && {
            'time-window': values['time-window'],
          }),
          ...(values['initial-grace-period'] && {
            'initial-grace-period': values['initial-grace-period'],
          }),
        };

        const checkers = {
          ...(!_.isEmpty(network_timeout) && { network_timeout }),
          ...(!_.isEmpty(utilization) && { utilization }),
        };

        const body: IdleInfoType = {
          enabled: [
            networkCheckerEnabled && 'network_timeout',
            utilizationCheckerEnabled && 'utilization',
          ]
            .filter(Boolean)
            .join(','),
          ...(values['app-streaming-packet-timeout'] && {
            'app-streaming-packet-timeout':
              values['app-streaming-packet-timeout'],
          }),
          ...(!_.isEmpty(checkers) && { checkers }),
        };
        await update.mutateAsync(body, {
          onSuccess: () => {
            message.success(t('resourcePolicy.IdleCheckerUpdated'));
            updateFetchKey();
          },
          onError: (error) => {
            message.error(
              getErrorMessage(
                error,
                t('resourcePolicy.FailedToUpdateIdleChecker'),
              ),
            );
            logger.error(error);
          },
        });
      })
      .catch(() => {});
  };

  const handleDelete = async () => {
    modal.confirm({
      title: t('resourcePolicy.DeleteIdleChecker'),
      content: (
        <BAIFlex direction="column" align="start" gap={'sm'}>
          <BAIText>{t('resourcePolicy.DeleteIdleCheckerWarning')}</BAIText>
          <BAIText>
            {t('resourcePolicy.ConfirmDeleteIdleCheckerConfigs')}{' '}
          </BAIText>
        </BAIFlex>
      ),
      okButtonProps: { danger: true },
      okText: t('button.Delete'),
      onOk: async () => {
        await clear.mutateAsync(undefined, {
          onSuccess: () => {
            message.success(t('resourcePolicy.IdleCheckerDeleted'));
            updateFetchKey();
          },
          onError: (error) => {
            message.error(
              getErrorMessage(
                error,
                t('resourcePolicy.FailedToDeleteIdleChecker'),
              ),
            );
            logger.error(error);
          },
        });
      },
    });
  };
  return (
    <Form
      ref={formRef}
      style={{
        maxWidth: 700,
      }}
      initialValues={INITIAL_VALUES}
      layout="vertical"
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAICard
          title={
            <BAIFlex gap="xxs">
              <BAIText>{t('resourcePolicy.NetworkTrafficIdleChecker')}</BAIText>
              <QuestionIconWithTooltip
                title={t('resourcePolicy.NetworkTrafficIdleCheckerTooltip')}
              />
            </BAIFlex>
          }
          extra={
            <Form.Item name="networkChecker" noStyle>
              <Switch
                size="small"
                onChange={() => {
                  formRef.current?.validateFields();
                }}
              />
            </Form.Item>
          }
        >
          <Form.Item noStyle dependencies={['networkChecker']}>
            {({ getFieldValue }) => {
              const isEnabled = getFieldValue('networkChecker');
              return (
                <>
                  <Form.Item
                    name="threshold"
                    label={t('resourcePolicy.ThresholdSec')}
                    layout="vertical"
                    rules={[
                      {
                        required: isEnabled,
                      },
                      ...validateStringInputNumber(t, { min: 0 }),
                    ]}
                    tooltip={t('resourcePolicy.NetworkThresholdTooltip')}
                  >
                    <InputNumber
                      disabled={!isEnabled}
                      stringMode
                      style={{
                        width: '100%',
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="app-streaming-packet-timeout"
                    label={t('resourcePolicy.AppStreamingPacketTimeout')}
                    layout="vertical"
                    style={{
                      whiteSpace: 'normal',
                    }}
                    rules={[
                      {
                        required: isEnabled,
                      },
                      ...validateStringInputNumber(t, { min: 0 }),
                    ]}
                    tooltip={
                      <>
                        {t('resourcePolicy.AppStreamingPacketTimeoutTooltip1')}
                        <br />
                        <br />
                        {t('resourcePolicy.AppStreamingPacketTimeoutTooltip2')}
                      </>
                    }
                  >
                    <InputNumber
                      disabled={!isEnabled}
                      style={{
                        width: '100%',
                      }}
                      stringMode
                    />
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>
        </BAICard>
        <BAICard
          title={
            <BAIFlex gap={'xxs'}>
              <BAIText>{t('resourcePolicy.UtilizationIdleChecker')}</BAIText>
              <QuestionIconWithTooltip
                title={t('resourcePolicy.UtilizationIdleCheckerTooltip')}
              />
            </BAIFlex>
          }
          extra={
            <Form.Item name="utilizationChecker" noStyle>
              <Switch
                size="small"
                onChange={() => {
                  formRef.current?.validateFields();
                }}
              />
            </Form.Item>
          }
        >
          <BAICard
            type="inner"
            title={
              <BAIFlex gap={'xxs'}>
                <BAIText>
                  {t('resourcePolicy.UtilizationThresholdCriteria')}
                </BAIText>
                <QuestionIconWithTooltip
                  title={
                    <>
                      {t('resourcePolicy.UtilizationThresholdTooltip1')}
                      <br />
                      <br />
                      {t('resourcePolicy.UtilizationThresholdTooltip2')}
                    </>
                  }
                />
              </BAIFlex>
            }
            style={{
              marginBottom: token.margin,
            }}
          >
            <Form.Item noStyle dependencies={['utilizationChecker']}>
              {({ getFieldValue }) => {
                const isEnabled = getFieldValue('utilizationChecker');
                return _.flatMap(resourceSlots, (_slot, key) => {
                  const baseKey = _.head(key.split('.'));
                  return (
                    <>
                      {baseKey === 'cpu' ? (
                        <Form.Item
                          name={`${baseKey}_util`}
                          label={t('resourcePolicy.CPUUtilization')}
                          rules={validateStringInputNumber(t, { min: 0 })}
                        >
                          <InputNumber
                            stringMode
                            disabled={!isEnabled}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      ) : baseKey === 'mem' ? (
                        <Form.Item
                          name="mem"
                          label={t('resourcePolicy.Memory')}
                          rules={validateStringInputNumber(t, { min: 0 })}
                        >
                          <InputNumber
                            stringMode
                            disabled={!isEnabled}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      ) : (
                        <>
                          <Form.Item
                            name={`${baseKey}_util`}
                            label={`${baseKey?.toUpperCase()} ${t('resourcePolicy.Utilization')}`}
                            rules={validateStringInputNumber(t, { min: 0 })}
                          >
                            <InputNumber
                              stringMode
                              disabled={!isEnabled}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                          <Form.Item
                            name={`${baseKey}_mem`}
                            label={`${baseKey?.toUpperCase()} ${t('resourcePolicy.Memory')}`}
                            rules={validateStringInputNumber(t, { min: 0 })}
                          >
                            <InputNumber
                              stringMode
                              disabled={!isEnabled}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </>
                      )}
                    </>
                  );
                });
              }}
            </Form.Item>
          </BAICard>
          <BAICard
            type="inner"
            styles={{
              body: {
                padding: `${token.paddingMD}px ${token.paddingMD}px 0px`,
              },
            }}
          >
            <Form.Item noStyle dependencies={['utilizationChecker']}>
              {(form) => {
                const utilizationEnabled =
                  form.getFieldValue('utilizationChecker');
                return (
                  <>
                    <Form.Item
                      name="time-window"
                      label={t('resourcePolicy.TimeWindowSec')}
                      rules={[
                        {
                          required: utilizationEnabled,
                        },
                        ...validateStringInputNumber(t, { min: 0 }),
                      ]}
                      tooltip={{
                        placement: 'top',
                        title: (
                          <BAIFlex direction="column">
                            {t('resourcePolicy.TimeWindowTooltip1')}
                            <br />
                            <br />
                            {t('resourcePolicy.TimeWindowTooltip2')}
                            <br />
                            <br />
                            {t('resourcePolicy.TimeWindowTooltip3')}
                          </BAIFlex>
                        ),
                      }}
                    >
                      <InputNumber
                        stringMode
                        disabled={!utilizationEnabled}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="initial-grace-period"
                      label={t('resourcePolicy.InitialGracePeriod')}
                      rules={[
                        {
                          required: utilizationEnabled,
                        },
                        ...validateStringInputNumber(t, { min: 0 }),
                      ]}
                      tooltip={{
                        placement: 'top',
                        title: (
                          <BAIFlex direction="column">
                            {t('resourcePolicy.InitialGracePeriodTooltip1')}
                            <br />
                            <br />
                            {t('resourcePolicy.InitialGracePeriodTooltip2')}
                          </BAIFlex>
                        ),
                      }}
                    >
                      <InputNumber
                        stringMode
                        disabled={!utilizationEnabled}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item
                      layout="horizontal"
                      name="thresholds-check-operator"
                      label={t('resourcePolicy.LogicalOperator')}
                      tooltip={{
                        placement: 'top',
                        title: (
                          <BAIFlex direction="column">
                            {t('resourcePolicy.LogicalOperatorTooltipAND')}
                            <br />
                            <br />
                            {t('resourcePolicy.LogicalOperatorTooltipOR')}
                          </BAIFlex>
                        ),
                      }}
                    >
                      <BAIRadioGroup disabled={!utilizationEnabled}>
                        <Radio value="and">AND</Radio>
                        <Radio value="or">OR</Radio>
                      </BAIRadioGroup>
                    </Form.Item>
                  </>
                );
              }}
            </Form.Item>
          </BAICard>
          <Card.Meta
            description={
              <Form.Item
                noStyle
                dependencies={[
                  'utilizationChecker',
                  'initial-grace-period',
                  'time-window',
                ]}
              >
                {({ getFieldValue }) => {
                  const utilizationEnabled =
                    getFieldValue('utilizationChecker');
                  const initialGracePeriod = getFieldValue(
                    'initial-grace-period',
                  );
                  const timeWindow = getFieldValue('time-window');
                  if (utilizationEnabled) {
                    const initialGracePeriodText = initialGracePeriod
                      ? ` (${initialGracePeriod} sec)`
                      : '';
                    const timeWindowText = timeWindow
                      ? ` (${timeWindow} sec)`
                      : '';
                    return (
                      <BAIFlex
                        direction="column"
                        style={{ marginTop: token.marginXS }}
                        align="start"
                      >
                        {t('resourcePolicy.UtilizationCheckerDescription', {
                          initialGracePeriod: initialGracePeriodText,
                          timeWindow: timeWindowText,
                        })}
                      </BAIFlex>
                    );
                  } else {
                    return null;
                  }
                }}
              </Form.Item>
            }
          />
        </BAICard>
      </BAIFlex>
      <BAIFlex align="center" style={{ height: 40 }}>
        <BAIText type="danger">
          {t('resourcePolicy.ManagerRestartNote')}
        </BAIText>
      </BAIFlex>
      <BAIFlex justify="between" gap={'xs'}>
        <BAIButton danger onClick={handleDelete}>
          {t('button.Delete')}
        </BAIButton>
        <BAIButton type="primary" action={handleOK}>
          {t('button.Save')}
        </BAIButton>
      </BAIFlex>
    </Form>
  );
};

export default IdleTimeoutChecker;
