/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PrometheusQueryPresetEditorModalCreateMutation } from '../__generated__/PrometheusQueryPresetEditorModalCreateMutation.graphql';
import {
  PrometheusQueryPresetEditorModalFragment$data,
  PrometheusQueryPresetEditorModalFragment$key,
} from '../__generated__/PrometheusQueryPresetEditorModalFragment.graphql';
import { PrometheusQueryPresetEditorModalUpdateMutation } from '../__generated__/PrometheusQueryPresetEditorModalUpdateMutation.graphql';
import { useCurrentUserRole } from '../hooks/backendai';
import PrometheusCategorySelect from './PrometheusCategorySelect';
import PrometheusQueryTemplatePreview from './PrometheusQueryTemplatePreview';
import { App, Form, Input } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  BAISelect,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

const { TextArea } = Input;

type PrometheusQueryPresetFormValues = {
  name: string;
  description?: string | null;
  categoryId?: string | null;
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
    filterLabels: [],
    groupLabels: [],
  };
};

const PrometheusQueryPresetEditorModal: React.FC<
  PrometheusQueryPresetEditorModalProps
> = ({ presetFrgmt, onRequestClose, ...baiModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const currentUserRole = useCurrentUserRole();

  const preset = useFragment(
    graphql`
      fragment PrometheusQueryPresetEditorModalFragment on QueryDefinition {
        id
        name
        description
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

  // The parent unmounts this modal on close via `BAIUnmountAfterClose`, so a
  // fresh form instance re-applies `initialValues` on every open — stale values
  // are never carried across reopens (FR-3326).
  const [form] = Form.useForm<PrometheusQueryPresetFormValues>();
  const watchedQueryTemplate = Form.useWatch('queryTemplate', form);

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
    return form
      .validateFields()
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
      title={
        preset
          ? t('prometheusQueryPreset.EditPreset')
          : t('prometheusQueryPreset.CreatePreset')
      }
      okText={preset ? t('button.Save') : t('button.Create')}
      confirmLoading={isInflightCreate || isInflightUpdate}
    >
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        initialValues={getInitialValues(preset ?? null)}
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

        <Suspense
          fallback={
            <Form.Item label={t('prometheusQueryPreset.Category')}>
              <BAISelect
                loading
                disabled
                placeholder={t('prometheusQueryPreset.NoCategory')}
              />
            </Form.Item>
          }
        >
          <Form.Item
            label={t('prometheusQueryPreset.Category')}
            name="categoryId"
          >
            <PrometheusCategorySelect
              allowClear
              placeholder={t('prometheusQueryPreset.NoCategory')}
              notFoundContent={t('prometheusQueryPreset.NoCategory')}
            />
          </Form.Item>
        </Suspense>

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
            currentUserRole === 'superadmin' ? (
              <PrometheusQueryTemplatePreview
                queryTemplate={
                  // `Form.useWatch` returns `undefined` on the very first render
                  // before `initialValues` are applied. In edit mode that would
                  // hide the preview for a tick and then trigger the 800ms
                  // debounce; falling back to the fragment value lets the
                  // preview start fetching the existing template immediately.
                  watchedQueryTemplate ?? preset?.queryTemplate ?? ''
                }
              />
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
          <BAISelect
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
          <BAISelect
            mode="tags"
            tokenSeparators={[',']}
            notFoundContent={null}
            suffixIcon={null}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default PrometheusQueryPresetEditorModal;
