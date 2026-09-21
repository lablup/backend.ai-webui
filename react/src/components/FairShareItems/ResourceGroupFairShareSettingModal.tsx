/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupFairShareSettingModalFragment$key } from '../../__generated__/ResourceGroupFairShareSettingModalFragment.graphql';
import {
  ResourceGroupFairShareSettingModalMutation,
  ResourceGroupFairShareSettingModalMutation$variables,
} from '../../__generated__/ResourceGroupFairShareSettingModalMutation.graphql';
import { App } from '../../app-shim';
import { Form, FormInstance } from '../../form-engine';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import {
  AstryxFormNumberInput,
  AstryxFormTextInput,
} from '../astryxFormControls';
import { Grid } from '@astryxdesign/core/Grid';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAIQuestionIconWithTooltip,
  BAIAlert,
  BAICard,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface ResourceGroupFairShareTableProps extends BAIModalProps {
  resourceGroupNodeFrgmt: ResourceGroupFairShareSettingModalFragment$key | null;
  onRequestClose?: (success: boolean) => void;
}

const ResourceGroupFairShareSettingModal: React.FC<
  ResourceGroupFairShareTableProps
> = ({ resourceGroupNodeFrgmt, onRequestClose, ...modalProps }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = useTheme();
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
          fairShareSpec {
            halfLifeDays
            lookbackDays
            decayUnitDays
            defaultWeight
            resourceWeights {
              resourceType
              weight
              usesDefault
            }
          }
        }
      }
    }
  `);

  const formRef =
    useRef<
      FormInstance<
        ResourceGroupFairShareSettingModalMutation$variables['input']
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
        style={{ marginBottom: token('--spacing-5') }}
      />
      <Form ref={formRef} layout="vertical" initialValues={INITIAL_FORM_VALUES}>
        <Form.Item
          label={t('fairShare.ResourceGroup')}
          name="resourceGroupName"
          required
        >
          <AstryxFormTextInput label={t('fairShare.ResourceGroup')} disabled />
        </Form.Item>

        {/* antd `Row gutter={[24,16]}` + `Col span={12}` (a fixed 2-up over
            antd's 24-column grid, no breakpoint props) -> Astryx `Grid
            columns={2}`. `gutter` resolves to the spacing steps by VALUE, not
            by name (P9): 24px = step 6 across, 16px = step 4 down. The `Col`
            wrappers with `alignSelf: 'start'` become the grid's own
            `align="start"`. */}
        <Grid columns={2} columnGap={6} rowGap={4} align="start" width="100%">
          <Form.Item
            hidden
            style={{ minWidth: 0 }}
            label={
              <BAIFlex gap="xxs">
                {t('fairShare.DecayUnitDays')}
                <BAIQuestionIconWithTooltip
                  title={t('fairShare.DecayUnitDaysDescription')}
                />
              </BAIFlex>
            }
            name="decayUnitDays"
          >
            {/* antd `InputNumber suffix` (a unit string) -> `NumberInput
                units` (MAPPING §3.17). */}
            <AstryxFormNumberInput
              label={t('fairShare.DecayUnitDays')}
              min={1}
              step={1}
              units={t('fairShare.Days')}
            />
          </Form.Item>
          <Form.Item
            style={{ minWidth: 0 }}
            label={
              <BAIFlex gap="xxs">
                {t('fairShare.HalfLifeDays')}
                <BAIQuestionIconWithTooltip
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
            <AstryxFormNumberInput
              label={t('fairShare.HalfLifeDays')}
              min={1}
              step={1}
              units={t('fairShare.Days')}
            />
          </Form.Item>
          <Form.Item
            style={{ minWidth: 0 }}
            label={
              <BAIFlex gap="xxs">
                {t('fairShare.LookbackDays')}
                <BAIQuestionIconWithTooltip
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
            <AstryxFormNumberInput
              label={t('fairShare.LookbackDays')}
              min={1}
              step={1}
              units={t('fairShare.Days')}
            />
          </Form.Item>
          <Form.Item
            style={{ minWidth: 0 }}
            label={
              <BAIFlex gap="xxs">
                {t('fairShare.DefaultWeight')}
                <BAIQuestionIconWithTooltip
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
            <AstryxFormNumberInput
              label={t('fairShare.DefaultWeight')}
              min={0}
              step={0.1}
            />
          </Form.Item>
        </Grid>

        <Form.Item
          label={
            <BAIFlex gap="xxs">
              {t('fairShare.ResourceWeights')}
              <BAIQuestionIconWithTooltip
                title={t('fairShare.ResourceWeightsDescription')}
              />
            </BAIFlex>
          }
          hidden={_.isEmpty(resourceGroup?.fairShareSpec?.resourceWeights)}
        >
          <BAICard
            styles={{
              body: { paddingBottom: 0, paddingTop: token('--spacing-4') },
            }}
          >
            <Grid
              columns={2}
              columnGap={6}
              rowGap={4}
              align="start"
              width="100%"
            >
              {_.map(resourceGroup?.fairShareSpec?.resourceWeights, (entry) => {
                const weightLabel =
                  _.get(mergedResourceSlots, entry?.resourceType)
                    ?.description || _.upperCase(entry?.resourceType || '');
                return (
                  <Form.Item
                    key={entry?.resourceType}
                    style={{ minWidth: 0 }}
                    label={weightLabel}
                    name={['resourceWeights', entry?.resourceType]}
                  >
                    <AstryxFormNumberInput
                      label={weightLabel}
                      min={0}
                      step={0.1}
                    />
                  </Form.Item>
                );
              })}
            </Grid>
          </BAICard>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default ResourceGroupFairShareSettingModal;
