import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { App, Col, Form, Input, InputNumber, Row, theme } from 'antd';
import { FormInstance } from 'antd/lib';
import {
  BAIAlert,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useBAILogger,
  useResourceSlotsDetails,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import { ResourceGroupFairShareSettingModalFragment$key } from 'src/__generated__/ResourceGroupFairShareSettingModalFragment.graphql';
import {
  ResourceGroupFairShareSettingModalMutation,
  ResourceGroupFairShareSettingModalMutation$variables,
} from 'src/__generated__/ResourceGroupFairShareSettingModalMutation.graphql';

interface ResourceGroupFairShareTableProps extends BAIModalProps {
  resourceGroupNodeFrgmt: ResourceGroupFairShareSettingModalFragment$key | null;
  onRequestClose?: () => void;
}

const ResourceGroupFairShareSettingModal: React.FC<
  ResourceGroupFairShareTableProps
> = ({ resourceGroupNodeFrgmt, onRequestClose, ...modalProps }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const { logger } = useBAILogger();
  const { message } = App.useApp();

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupFairShareSettingModalFragment on ResourceGroup {
        name
        fairShareSpec {
          decayUnitDays
          halfLifeDays
          lookbackDays
          defaultWeight
          resourceWeights {
            entries {
              resourceType
              quantity
            }
          }
        }
      }
    `,
    resourceGroupNodeFrgmt,
  );

  const [
    commitModifyResourceGroupFairShareSpec,
    isInflightCommitModifyResourceGroupFairShareSpec,
  ] = useMutation<ResourceGroupFairShareSettingModalMutation>(graphql`
    mutation ResourceGroupFairShareSettingModalMutation(
      $input: UpdateResourceGroupFairShareSpecInput!
    ) {
      updateResourceGroupFairShareSpec(input: $input) {
        resourceGroup {
          id
          name
        }
      }
    }
  `);

  const formRef =
    useRef<
      FormInstance<
        ResourceGroupFairShareSettingModalMutation$variables['input'] | null
      >
    >(null);

  const INITIAL_FORM_VALUES = {
    resourceGroup: resourceGroup?.name ?? '',
    decayUnitDays: resourceGroup?.fairShareSpec?.decayUnitDays ?? 1,
    halfLifeDays: resourceGroup?.fairShareSpec?.halfLifeDays ?? 7,
    lookbackDays: resourceGroup?.fairShareSpec?.lookbackDays ?? 28,
    defaultWeight: resourceGroup?.fairShareSpec?.defaultWeight ?? 1,
    resourceWeights: _.reduce(
      resourceGroup?.fairShareSpec?.resourceWeights?.entries,
      (acc, entry) => {
        if (entry?.resourceType) {
          acc[entry.resourceType] = entry.quantity;
        }
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  return (
    <BAIModal
      title={t('fairShare.FairShareSettingTitleWithName', {
        name: t('fairShare.ResourceGroup'),
      })}
      onCancel={onRequestClose}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((response) => {
            commitModifyResourceGroupFairShareSpec({
              variables: {
                input: {
                  resourceGroup: resourceGroup?.name ?? '',
                  decayUnitDays: response?.decayUnitDays,
                  halfLifeDays: response?.halfLifeDays,
                  lookbackDays: response?.lookbackDays,
                  defaultWeight: response?.defaultWeight,
                  resourceWeights: _.map(
                    response?.resourceWeights || {},
                    (quantity, resourceType) => ({
                      resourceType,
                      weight: quantity,
                    }),
                  ),
                },
              },
              onCompleted: (res, errors) => {
                if (!res?.updateResourceGroupFairShareSpec) {
                  message.error(t('dialog.ErrorOccurred'));
                  return;
                }
                if (errors && errors?.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error);
                  }
                  return;
                }
                message.success(
                  t('fairShare.FairShareSettingsSuccessfullyUpdated'),
                );
                onRequestClose?.();
              },
              onError: (error) => {
                message.error(error.message);
                logger.error(error);
              },
            });
          })
          .catch((error) => {
            logger.error(error);
          });
      }}
      okButtonProps={{
        loading: isInflightCommitModifyResourceGroupFairShareSpec,
      }}
      {...modalProps}
    >
      <BAIAlert
        type="warning"
        description={t('fairShare.FairShareSettingDescription')}
        showIcon
        style={{ marginBottom: token.marginMD }}
      />
      <Form ref={formRef} layout="vertical" initialValues={INITIAL_FORM_VALUES}>
        <Form.Item
          label={t('fairShare.ResourceGroup')}
          name="resourceGroup"
          required
        >
          <Input disabled />
        </Form.Item>

        <Row gutter={[24, 16]}>
          <Col span={12} style={{ alignSelf: 'start' }}>
            <Form.Item
              label={
                <BAIFlex gap="xxs">
                  {t('fairShare.DecayUnitDays')}
                  <QuestionIconWithTooltip
                    title={t('fairShare.DecayUnitDaysDescription')}
                  />
                </BAIFlex>
              }
              name="decayUnitDays"
              rules={[
                {
                  required: true,
                  message: t('fairShare.PleaseInputFieldWithFieldName', {
                    field: t('fairShare.DecayUnitDays'),
                  }),
                },
                {
                  validator: (_, value) => {
                    if (value % 1 !== 0) {
                      return Promise.reject(
                        new Error(t('error.OnlyIntegersAreAllowed')),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                step={1}
                suffix={t('fairShare.Days')}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ alignSelf: 'start' }}>
            <Form.Item
              label={
                <BAIFlex gap="xxs">
                  {t('fairShare.HalfLifeDays')}
                  <QuestionIconWithTooltip
                    title={t('fairShare.HalfLifeDaysDescription')}
                  />
                </BAIFlex>
              }
              name="halfLifeDays"
              rules={[
                {
                  required: true,
                  message: t('fairShare.PleaseInputFieldWithFieldName', {
                    field: t('fairShare.HalfLifeDays'),
                  }),
                },
                {
                  validator: (_, value) => {
                    if (value % 1 !== 0) {
                      return Promise.reject(
                        new Error(t('error.OnlyIntegersAreAllowed')),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                step={1}
                style={{ width: '100%' }}
                suffix={t('fairShare.Days')}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ alignSelf: 'start' }}>
            <Form.Item
              label={
                <BAIFlex gap="xxs">
                  {t('fairShare.LookbackDays')}
                  <QuestionIconWithTooltip
                    title={t('fairShare.LookbackDaysDescription')}
                  />
                </BAIFlex>
              }
              name="lookbackDays"
              rules={[
                {
                  required: true,
                  message: t('fairShare.PleaseInputFieldWithFieldName', {
                    field: t('fairShare.LookbackDays'),
                  }),
                },
                {
                  validator: (_, value) => {
                    if (value % 1 !== 0) {
                      return Promise.reject(
                        new Error(t('error.OnlyIntegersAreAllowed')),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                step={1}
                style={{ width: '100%' }}
                suffix={t('fairShare.Days')}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ alignSelf: 'start' }}>
            <Form.Item
              label={
                <BAIFlex gap="xxs">
                  {t('fairShare.DefaultWeight')}
                  <QuestionIconWithTooltip
                    title={t('fairShare.DefaultWeightDescription')}
                  />
                </BAIFlex>
              }
              name="defaultWeight"
              rules={[
                {
                  required: true,
                  message: t('fairShare.PleaseInputFieldWithFieldName', {
                    field: t('fairShare.DefaultWeight'),
                  }),
                },
              ]}
            >
              <InputNumber min={1} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={t('fairShare.ResourceWeights')}
          name="resourceWeights"
        >
          <Row gutter={[24, 16]}>
            {_.map(
              resourceGroup?.fairShareSpec?.resourceWeights?.entries,
              (entry) => {
                return (
                  <Col
                    span={12}
                    key={entry?.resourceType}
                    style={{ alignSelf: 'start' }}
                  >
                    <Form.Item
                      label={
                        _.get(mergedResourceSlots, entry?.resourceType)
                          ?.description ||
                        _.upperCase(entry?.resourceType || '')
                      }
                      name={['resourceWeights', entry?.resourceType]}
                      rules={[
                        {
                          required: true,
                          message: t(
                            'fairShare.PleaseInputFieldWithFieldName',
                            {
                              field: `${
                                _.get(mergedResourceSlots, entry?.resourceType)
                                  ?.description ||
                                _.upperCase(entry?.resourceType || '')
                              } ${t('fairShare.Weight')}`,
                            },
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        step={0.1}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                );
              },
            )}
          </Row>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default ResourceGroupFairShareSettingModal;
