/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { App, Col, Form, Input, InputNumber, Row, theme } from 'antd';
import { FormInstance } from 'antd/lib';
import {
  BAIAlert,
  BAICard,
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
  onRequestClose?: (success: boolean) => void;
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
            resourceType
            weight
            usesDefault
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
      adminUpdateResourceGroupFairShareSpec(input: $input) {
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
    resourceGroupName: resourceGroup?.name ?? '',
    decayUnitDays: resourceGroup?.fairShareSpec?.decayUnitDays ?? 1,
    halfLifeDays: resourceGroup?.fairShareSpec?.halfLifeDays ?? 7,
    lookbackDays: resourceGroup?.fairShareSpec?.lookbackDays ?? 28,
    defaultWeight: resourceGroup?.fairShareSpec?.defaultWeight ?? 1,
    resourceWeights: _.reduce(
      resourceGroup?.fairShareSpec?.resourceWeights,
      (acc, entry) => {
        if (entry?.resourceType) {
          acc[entry.resourceType] = entry.weight;
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
      onCancel={() => onRequestClose?.(false)}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((response) => {
            commitModifyResourceGroupFairShareSpec({
              variables: {
                input: {
                  resourceGroupName: resourceGroup?.name ?? '',
                  decayUnitDays: response?.decayUnitDays,
                  halfLifeDays: response?.halfLifeDays,
                  lookbackDays: response?.lookbackDays,
                  defaultWeight: response?.defaultWeight,
                  resourceWeights: _.map(
                    response?.resourceWeights || {},
                    (quantity, resourceType) => ({
                      resourceType: resourceType,
                      weight: quantity,
                    }),
                  ),
                },
              },
              onCompleted: (res, errors) => {
                if (!res?.adminUpdateResourceGroupFairShareSpec) {
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
                onRequestClose?.(true);
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
          name="resourceGroupName"
          required
        >
          <Input disabled />
        </Form.Item>

        <Row gutter={[24, 16]}>
          <Form.Item
            hidden
            label={
              <BAIFlex gap="xxs">
                {t('fairShare.DecayUnitDays')}
                <QuestionIconWithTooltip
                  title={t('fairShare.DecayUnitDaysDescription')}
                />
              </BAIFlex>
            }
            name="decayUnitDays"
          >
            <InputNumber
              min={1}
              step={1}
              suffix={t('fairShare.Days')}
              style={{ width: '100%' }}
            />
          </Form.Item>
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
          label={
            <BAIFlex gap="xxs">
              {t('fairShare.ResourceWeights')}
              <QuestionIconWithTooltip
                title={t('fairShare.ResourceWeightsDescription')}
              />
            </BAIFlex>
          }
          hidden={_.isEmpty(resourceGroup?.fairShareSpec?.resourceWeights)}
        >
          <BAICard
            styles={{ body: { paddingBottom: 0, paddingTop: token.padding } }}
          >
            <Row gutter={[24, 16]}>
              {_.map(resourceGroup?.fairShareSpec?.resourceWeights, (entry) => {
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
                    >
                      <InputNumber
                        min={1}
                        step={0.1}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                );
              })}
            </Row>
          </BAICard>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default ResourceGroupFairShareSettingModal;
