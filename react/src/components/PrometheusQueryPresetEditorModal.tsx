/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PrometheusQueryPresetEditorModalCategoriesQuery } from '../__generated__/PrometheusQueryPresetEditorModalCategoriesQuery.graphql';
import { PrometheusQueryPresetEditorModalCreateMutation } from '../__generated__/PrometheusQueryPresetEditorModalCreateMutation.graphql';
import {
  PrometheusQueryPresetEditorModalFragment$data,
  PrometheusQueryPresetEditorModalFragment$key,
} from '../__generated__/PrometheusQueryPresetEditorModalFragment.graphql';
import { PrometheusQueryPresetEditorModalUpdateMutation } from '../__generated__/PrometheusQueryPresetEditorModalUpdateMutation.graphql';
import ErrorBoundaryWithNullFallback from './ErrorBoundaryWithNullFallback';
import PrometheusPresetPreview from './PrometheusPresetPreview';
import {
  App,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
  Skeleton,
} from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { RefObject, Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

const { TextArea } = Input;

type PrometheusQueryPresetFormValues = {
  name: string;
  description?: string | null;
  categoryId?: string | null;
  rank?: number | null;
  metricName: string;
  queryTemplate: string;
  timeWindow?: string | null;
  filterLabels?: Array<string>;
  groupLabels?: Array<string>;
};

interface PrometheusQueryPresetEditorModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  presetFrgmt?: PrometheusQueryPresetEditorModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
  onComplete?: () => void;
}

/**
 * Build the form's initial values.
 * - Create mode: minimal defaults; required fields stay empty so the user is
 *   prompted to fill them.
 * - Edit mode: hydrated from the row fragment.
 */
const getInitialValues = (
  preset: PrometheusQueryPresetEditorModalFragment$data | null,
): Partial<PrometheusQueryPresetFormValues> => {
  if (preset) {
    return {
      name: preset.name,
      description: preset.description ?? undefined,
      categoryId: preset.categoryId ?? undefined,
      rank: preset.rank ?? 0,
      metricName: preset.metricName,
      queryTemplate: preset.queryTemplate,
      timeWindow: preset.timeWindow ?? undefined,
      filterLabels: preset.options?.filterLabels
        ? Array.from(preset.options.filterLabels)
        : [],
      groupLabels: preset.options?.groupLabels
        ? Array.from(preset.options.groupLabels)
        : [],
    };
  }
  return {
    rank: 0,
    filterLabels: [],
    groupLabels: [],
  };
};

/**
 * Inner content: fetches the categories list (which can suspend) and renders
 * the form. Wrapped in Suspense by the outer component so the modal shell
 * (title + footer) stays mounted while categories load.
 */
const PrometheusQueryPresetEditorModalContent: React.FC<{
  preset: PrometheusQueryPresetEditorModalFragment$data | null;
  formRef: RefObject<FormInstance<PrometheusQueryPresetFormValues>>;
}> = ({ preset, formRef }) => {
  'use memo';
  const { t } = useTranslation();

  const { prometheusQueryPresetCategories } =
    useLazyLoadQuery<PrometheusQueryPresetEditorModalCategoriesQuery>(
      graphql`
        query PrometheusQueryPresetEditorModalCategoriesQuery {
          prometheusQueryPresetCategories {
            id
            name
          }
        }
      `,
      {},
    );

  // The list query may legitimately return an empty array in dev environments
  // where no categories are seeded; the form must still submit fine with
  // categoryId left null.
  const categoryOptions = _.map(
    prometheusQueryPresetCategories ?? [],
    (category) => ({
      label: category.name,
      value: category.id,
    }),
  );

  return (
    <Form
      ref={formRef}
      layout="vertical"
      preserve={false}
      initialValues={getInitialValues(preset)}
    >
      <Form.Item
        label={t('prometheusQueryPreset.Name')}
        name="name"
        rules={[
          {
            required: true,
            message: t('prometheusQueryPreset.NameRequired'),
          },
        ]}
        extra={t('prometheusQueryPreset.NameMustBeUnique')}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={t('prometheusQueryPreset.Description')}
        name="description"
      >
        <TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
      </Form.Item>

      <Form.Item label={t('prometheusQueryPreset.Category')} name="categoryId">
        <Select
          allowClear
          placeholder={t('prometheusQueryPreset.NoCategory')}
          options={categoryOptions}
          notFoundContent={t('prometheusQueryPreset.NoCategory')}
        />
      </Form.Item>

      <Form.Item label={t('prometheusQueryPreset.Rank')} name="rank">
        <InputNumber style={{ width: '100%' }} step={1} />
      </Form.Item>

      <Form.Item
        label={t('prometheusQueryPreset.MetricName')}
        name="metricName"
        rules={[
          {
            required: true,
            message: t('prometheusQueryPreset.MetricNameRequired'),
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={t('prometheusQueryPreset.QueryTemplate')}
        name="queryTemplate"
        rules={[
          {
            required: true,
            message: t('prometheusQueryPreset.QueryTemplateRequired'),
          },
        ]}
        extra={
          preset ? (
            <ErrorBoundaryWithNullFallback>
              <Suspense fallback={null}>
                <PrometheusPresetPreview presetGlobalId={preset.id} />
              </Suspense>
            </ErrorBoundaryWithNullFallback>
          ) : undefined
        }
      >
        <TextArea autoSize={{ minRows: 4, maxRows: 12 }} />
      </Form.Item>

      <Form.Item
        label={t('prometheusQueryPreset.TimeWindow')}
        name="timeWindow"
      >
        <Input placeholder="5m" />
      </Form.Item>

      <Form.Item
        label={t('prometheusQueryPreset.FilterLabels')}
        name="filterLabels"
      >
        <Select
          mode="tags"
          tokenSeparators={[',']}
          notFoundContent={null}
          suffixIcon={null}
        />
      </Form.Item>

      <Form.Item
        label={t('prometheusQueryPreset.GroupLabels')}
        name="groupLabels"
      >
        <Select
          mode="tags"
          tokenSeparators={[',']}
          notFoundContent={null}
          suffixIcon={null}
        />
      </Form.Item>
    </Form>
  );
};

const PrometheusQueryPresetEditorModal: React.FC<
  PrometheusQueryPresetEditorModalProps
> = ({ presetFrgmt, onRequestClose, onComplete, ...baiModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();

  const preset = useFragment(
    graphql`
      fragment PrometheusQueryPresetEditorModalFragment on QueryDefinition {
        id
        name
        description
        rank
        categoryId
        metricName
        queryTemplate
        timeWindow
        options {
          filterLabels
          groupLabels
        }
      }
    `,
    presetFrgmt ?? null,
  );

  const formRef = useRef<FormInstance<PrometheusQueryPresetFormValues>>(null);

  const [commitCreateMutation, isInflightCreate] =
    useMutation<PrometheusQueryPresetEditorModalCreateMutation>(graphql`
      mutation PrometheusQueryPresetEditorModalCreateMutation(
        $input: CreateQueryDefinitionInput!
      ) {
        adminCreatePrometheusQueryPreset(input: $input) {
          preset {
            id
            name
            description
            rank
            categoryId
            metricName
            queryTemplate
            timeWindow
            options {
              filterLabels
              groupLabels
            }
          }
        }
      }
    `);

  const [commitUpdateMutation, isInflightUpdate] =
    useMutation<PrometheusQueryPresetEditorModalUpdateMutation>(graphql`
      mutation PrometheusQueryPresetEditorModalUpdateMutation(
        $id: ID!
        $input: ModifyQueryDefinitionInput!
      ) {
        adminModifyPrometheusQueryPreset(id: $id, input: $input) {
          preset {
            id
            name
            description
            rank
            categoryId
            metricName
            queryTemplate
            timeWindow
            options {
              filterLabels
              groupLabels
            }
          }
        }
      }
    `);

  const handleOk = () => {
    return formRef.current
      ?.validateFields()
      .then((values) => {
        if (preset) {
          // Edit mode: compute diff and send only changed fields.
          const initial = getInitialValues(preset);

          // Build partial input containing only fields that differ from initial.
          const input: Record<string, unknown> = {};

          if (values.name !== initial.name) {
            input.name = values.name;
          }
          if (values.description !== initial.description) {
            input.description = values.description ?? null;
          }
          if (values.categoryId !== initial.categoryId) {
            input.categoryId = values.categoryId ?? null;
          }
          if (values.rank !== initial.rank) {
            input.rank = values.rank ?? 0;
          }
          if (values.metricName !== initial.metricName) {
            input.metricName = values.metricName;
          }
          if (values.queryTemplate !== initial.queryTemplate) {
            input.queryTemplate = values.queryTemplate;
          }
          if (values.timeWindow !== initial.timeWindow) {
            input.timeWindow = values.timeWindow ?? null;
          }

          // For label arrays, compare element-by-element. If the user explicitly
          // clears to [], we must send [] (not omit). If unchanged, omit.
          const currentFilterLabels = values.filterLabels ?? [];
          const initialFilterLabels = initial.filterLabels ?? [];
          if (!_.isEqual(currentFilterLabels, initialFilterLabels)) {
            input.options = {
              ...(input.options as object | undefined),
              filterLabels: currentFilterLabels,
            };
          }
          const currentGroupLabels = values.groupLabels ?? [];
          const initialGroupLabels = initial.groupLabels ?? [];
          if (!_.isEqual(currentGroupLabels, initialGroupLabels)) {
            input.options = {
              ...(input.options as object | undefined),
              groupLabels: currentGroupLabels,
            };
          }

          commitUpdateMutation({
            variables: {
              id: toLocalId(preset.id),
              input,
            },
            onCompleted: (_res, errors) => {
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
                // Keep modal open so the user can correct the input and retry
                return;
              }
              message.success(t('prometheusQueryPreset.SuccessfullyUpdated'));
              onComplete?.();
              onRequestClose(true);
            },
            onError: (error) => {
              message.error(error.message);
              // Keep modal open so the user can correct the input and retry
            },
          });
          return;
        }

        // CreateQueryDefinitionInput requires `options.filterLabels` and
        // `options.groupLabels` as `[String!]!` — accept empty arrays when
        // the user leaves the tags input untouched.
        commitCreateMutation({
          variables: {
            input: {
              name: values.name,
              description: values.description ?? null,
              categoryId: values.categoryId ?? null,
              rank: values.rank ?? 0,
              metricName: values.metricName,
              queryTemplate: values.queryTemplate,
              timeWindow: values.timeWindow ?? null,
              options: {
                filterLabels: values.filterLabels ?? [],
                groupLabels: values.groupLabels ?? [],
              },
            },
          },
          onCompleted: (_res, errors) => {
            if (errors && errors.length > 0) {
              const errorMsgList = _.map(errors, (error) => error.message);
              for (const error of errorMsgList) {
                message.error(error);
              }
              // Keep modal open so the user can correct the input and retry
              return;
            }
            message.success(t('prometheusQueryPreset.SuccessfullyCreated'));
            onRequestClose(true);
          },
          onError: (error) => {
            message.error(error.message);
            // Keep modal open so the user can correct the input and retry
          },
        });
      })
      .catch((err) => {
        logger.error(err);
      });
  };

  const handleCancel = () => {
    onRequestClose(false);
  };

  return (
    <BAIModal
      {...baiModalProps}
      onOk={handleOk}
      onCancel={handleCancel}
      centered
      destroyOnHidden
      title={
        preset
          ? t('prometheusQueryPreset.EditPreset')
          : t('prometheusQueryPreset.CreatePreset')
      }
      okText={preset ? t('button.Save') : t('button.Create')}
      confirmLoading={isInflightCreate || isInflightUpdate}
    >
      <ErrorBoundaryWithNullFallback>
        <Suspense fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
          <BAIFlex direction="column" align="stretch">
            <PrometheusQueryPresetEditorModalContent
              preset={preset ?? null}
              formRef={
                formRef as RefObject<
                  FormInstance<PrometheusQueryPresetFormValues>
                >
              }
            />
          </BAIFlex>
        </Suspense>
      </ErrorBoundaryWithNullFallback>
    </BAIModal>
  );
};

export default PrometheusQueryPresetEditorModal;
