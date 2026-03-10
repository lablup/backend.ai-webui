/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import {
  type SessionTemplate,
  type SessionTemplateBody,
  useSessionTemplates,
} from '../hooks/useSessionTemplates';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Form, Input, Select, theme } from 'antd';
import {
  BAIButton,
  BAIDynamicStepInputNumber,
  BAIDynamicUnitInputNumber,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useBAILogger,
  useResourceSlotsDetails,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SessionTemplateSettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel' | 'onClose'
> {
  editingTemplate?: SessionTemplate | null;
  onRequestClose?: (success: boolean) => void;
}

type ResourceRow = {
  type: string | undefined;
  allocation: string | number | undefined;
};

type SessionTemplateFormValues = {
  name?: string;
  domain_name: string;
  group_name?: string;
  session_type: 'interactive' | 'batch' | 'inference';
  image: string;
  resources: ResourceRow[];
};

// Base resource slots always shown (cpu, mem are fundamental)
const BASE_RESOURCE_SLOTS = ['cpu', 'mem'];

/**
 * Generate dynamic step values based on server-provided round_length.
 * round_length=0 → integer steps (1, 2, 4, 8, ...)
 * round_length=1 → 0.1 precision (0.1, 0.5, 1, 2, 4, ...)
 * round_length>=2 → fine precision (0.01, 0.05, 0.1, 0.5, 1, ...)
 */
const generateDynamicSteps = (roundLength: number): number[] => {
  if (roundLength <= 0) return [0, 1, 2, 4, 8, 16, 32, 64, 128];
  if (roundLength === 1) return [0, 0.1, 0.2, 0.5, 1, 2, 4, 8];
  return [0, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 4];
};

interface ResourceAllocationInputProps {
  resourceType: string | undefined;
  displayUnit?: string;
  roundLength?: number;
  value?: string | number;
  onChange?: (value: string | number | undefined) => void;
}

const ResourceAllocationInput: React.FC<ResourceAllocationInputProps> = ({
  resourceType,
  displayUnit,
  roundLength = 0,
  value,
  onChange,
}) => {
  if (resourceType === 'mem') {
    return (
      <BAIDynamicUnitInputNumber
        units={['m', 'g', 't']}
        min="0m"
        max="1024g"
        value={typeof value === 'string' ? value : '0g'}
        onChange={(v) => onChange?.(v ?? undefined)}
        style={{ width: '100%' }}
      />
    );
  }

  const numValue = typeof value === 'number' ? value : Number(value ?? 0);
  const handleChange = (v: number) => onChange?.(String(v));

  const dynamicSteps = generateDynamicSteps(roundLength);

  return (
    <BAIDynamicStepInputNumber
      dynamicSteps={dynamicSteps}
      min={0}
      value={numValue}
      onChange={handleChange}
      addonSuffix={displayUnit || undefined}
      style={{ width: '100%' }}
    />
  );
};

interface ResourceRowFieldProps {
  fieldName: number;
  onRemove: (name: number) => void;
  showRemove: boolean;
  resourceTypeOptions: Array<{ label: string; value: string }>;
  mergedResourceSlots: Record<
    string,
    | {
        human_readable_name?: string;
        display_unit?: string;
        number_format?: { binary: boolean; round_length: number };
      }
    | undefined
  >;
}

const ResourceRowField: React.FC<ResourceRowFieldProps> = ({
  fieldName,
  onRemove,
  showRemove,
  resourceTypeOptions,
  mergedResourceSlots,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const form = Form.useFormInstance<SessionTemplateFormValues>();
  const resourceType = Form.useWatch(['resources', fieldName, 'type'], form);
  const slotDetail = resourceType
    ? mergedResourceSlots?.[resourceType]
    : undefined;

  return (
    <BAIFlex gap="xs" align="start" wrap="wrap" style={{ width: '100%' }}>
      <Form.Item
        name={[fieldName, 'type']}
        style={{
          flex: `0 0 ${token.controlHeight * 4}px`,
          minWidth: token.controlHeight * 3,
          marginBottom: token.marginXS,
        }}
      >
        <Select
          placeholder={t('sessionTemplate.ResourceType')}
          options={resourceTypeOptions}
          onChange={() => {
            // Reset allocation when resource type changes
            form.setFieldValue(
              ['resources', fieldName, 'allocation'],
              undefined,
            );
          }}
        />
      </Form.Item>
      <Form.Item
        name={[fieldName, 'allocation']}
        style={{
          flex: 1,
          minWidth: token.controlHeight * 3,
          marginBottom: token.marginXS,
        }}
      >
        <ResourceAllocationInput
          resourceType={resourceType}
          displayUnit={slotDetail?.display_unit}
          roundLength={slotDetail?.number_format?.round_length}
        />
      </Form.Item>
      {showRemove && (
        <BAIButton
          type="text"
          icon={<MinusCircleOutlined />}
          onClick={() => onRemove(fieldName)}
          style={{ marginTop: token.marginXXS }}
        />
      )}
    </BAIFlex>
  );
};

const SessionTemplateSettingModal: React.FC<
  SessionTemplateSettingModalProps
> = ({ editingTemplate, onRequestClose, ...baiModalProps }) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const isEditMode = !!editingTemplate;

  const [form] = Form.useForm<SessionTemplateFormValues>();
  const domainName = Form.useWatch('domain_name', form);

  const { createTemplate, updateTemplate, isCreating, isUpdating } =
    useSessionTemplates();

  // -------------------------------------------------------------------------
  // Dynamic resource slots from backend
  // -------------------------------------------------------------------------
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const resourceTypeOptions = _.compact([
    ...BASE_RESOURCE_SLOTS.map((slot) => {
      const detail = mergedResourceSlots?.[slot];
      return {
        label: detail?.human_readable_name || slot.toUpperCase(),
        value: slot,
      };
    }),
    ..._.map(
      _.omitBy(mergedResourceSlots, (_value, key) =>
        [...BASE_RESOURCE_SLOTS, 'shmem'].includes(key),
      ),
      (detail, key) => ({
        label: detail?.human_readable_name || key,
        value: key,
      }),
    ),
  ]);

  // -------------------------------------------------------------------------
  // Fetch domains
  // -------------------------------------------------------------------------
  const { data: domainsData, error: domainsError } = useTanQuery({
    queryKey: ['sessionTemplateSettingModal', 'domains'],
    queryFn: async () => {
      const result = await baiClient.domain.list(['name']);
      return result?.domains ?? [];
    },
    enabled: !!baiModalProps.open,
    staleTime: 30_000,
  });

  // -------------------------------------------------------------------------
  // Fetch groups (dependent on selected domain)
  // -------------------------------------------------------------------------
  const { data: groupsData, error: groupsError } = useTanQuery({
    queryKey: ['sessionTemplateSettingModal', 'groups', domainName ?? null],
    queryFn: async () => {
      if (!domainName) return [];
      const result = await baiClient.group.list(true, domainName, [
        'id',
        'name',
      ]);
      return result?.groups ?? [];
    },
    enabled: !!baiModalProps.open && !!domainName,
    staleTime: 30_000,
  });

  const queryError = domainsError || groupsError;

  // -------------------------------------------------------------------------
  // Convert raw resource value to form-friendly value per type
  // -------------------------------------------------------------------------
  const toFormAllocation = (
    type: string,
    rawValue: string,
  ): string | number => {
    if (type === 'mem') {
      // rawValue may be bytes (e.g. "4294967296") or already unit string (e.g. "4g")
      const asNumber = Number(rawValue);
      if (!isNaN(asNumber) && rawValue.match(/^\d+$/)) {
        // pure numeric bytes → convert to GiB unit string
        const gib = asNumber / (1024 * 1024 * 1024);
        if (Number.isInteger(gib)) return `${gib}g`;
        const mib = asNumber / (1024 * 1024);
        if (Number.isInteger(mib)) return `${mib}m`;
        return `${gib}g`;
      }
      // already has unit addonAfter, return as-is
      return rawValue;
    }
    return rawValue;
  };

  // -------------------------------------------------------------------------
  // Populate form when editing or reset for create
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!baiModalProps.open) return;

    if (editingTemplate) {
      const resources = editingTemplate.template?.spec?.resources ?? {};
      const resourceRows: ResourceRow[] = Object.entries(resources).map(
        ([key, value]) => ({
          type: key,
          allocation: toFormAllocation(key, value ?? ''),
        }),
      );

      form.setFieldsValue({
        name: editingTemplate.name ?? undefined,
        domain_name: editingTemplate.domain_name,
        group_name: editingTemplate.group_name ?? undefined,
        session_type:
          editingTemplate.template?.spec?.session_type ?? 'interactive',
        image: editingTemplate.template?.spec?.kernel?.image ?? '',
        resources:
          resourceRows.length > 0
            ? resourceRows
            : [{ type: undefined, allocation: undefined }],
      });
    } else {
      form.resetFields();
    }
  }, [baiModalProps.open, editingTemplate, form]);

  // -------------------------------------------------------------------------
  // Clear group selection when domain changes (only when user changes it)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!baiModalProps.open || !domainName) return;
    if (editingTemplate?.domain_name !== domainName) {
      form.setFieldValue('group_name', undefined);
    }
  }, [baiModalProps.open, domainName, editingTemplate, form]);

  // -------------------------------------------------------------------------
  // Build template body from form values
  // -------------------------------------------------------------------------
  const buildTemplateBody = (
    values: SessionTemplateFormValues,
  ): SessionTemplateBody => {
    const resourceRows = (values.resources ?? []).filter(
      (r) => r.type && r.allocation !== undefined && r.allocation !== '',
    );

    const resources: Record<string, string> = {};
    for (const row of resourceRows) {
      if (!row.type) continue;
      const rawValue = String(row.allocation ?? '');
      if (row.type === 'mem') {
        // rawValue is a unit string like "4g", "512m" — convert to bytes
        const unitMatch = rawValue.match(/^([0-9.]+)([mgt])$/i);
        if (unitMatch) {
          const num = parseFloat(unitMatch[1]);
          const unit = unitMatch[2].toLowerCase();
          let bytes: number;
          if (unit === 'm') bytes = num * 1024 * 1024;
          else if (unit === 'g') bytes = num * 1024 * 1024 * 1024;
          else bytes = num * 1024 * 1024 * 1024 * 1024; // 't'
          resources[row.type] = String(Math.round(bytes));
        } else {
          // fallback: try as plain GiB number
          const gib = parseFloat(rawValue);
          resources[row.type] = isNaN(gib)
            ? rawValue
            : String(Math.round(gib * 1024 * 1024 * 1024));
        }
      } else {
        resources[row.type] = rawValue;
      }
    }

    const existingSpec = editingTemplate?.template?.spec;

    return {
      api_version: '6',
      kind: 'task_template',
      metadata: {
        name: values.name ?? '',
        tag: null,
      },
      spec: {
        session_type: values.session_type,
        kernel: {
          image: values.image,
        },
        scaling_group: existingSpec?.scaling_group ?? 'default',
        mounts: existingSpec?.mounts ?? {},
        resources,
        agent_list: existingSpec?.agent_list ?? null,
      },
    };
  };

  // -------------------------------------------------------------------------
  // Submit handler
  // -------------------------------------------------------------------------
  const handleOk = () => {
    return form
      .validateFields()
      .then(async (values) => {
        const templateBody = buildTemplateBody(values);

        try {
          if (isEditMode && editingTemplate) {
            await updateTemplate(editingTemplate.id, {
              template: templateBody,
            });
            message.success(t('sessionTemplate.SuccessfullyUpdated'));
          } else {
            await createTemplate({
              template: templateBody,
              domain_name: values.domain_name,
              group_name: values.group_name,
            });
            message.success(t('sessionTemplate.SuccessfullyCreated'));
          }
          onRequestClose?.(true);
        } catch (err) {
          logger.error('Session template save error:', err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          message.error(
            isEditMode
              ? t('sessionTemplate.FailedToUpdate', { error: errorMessage })
              : t('sessionTemplate.FailedToCreate', { error: errorMessage }),
          );
        }
      })
      .catch((err) => {
        logger.error('Form validation failed:', err);
      });
  };

  const handleCancel = () => {
    onRequestClose?.(false);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <BAIModal
      {...baiModalProps}
      title={
        isEditMode
          ? t('sessionTemplate.EditSessionTemplate')
          : t('sessionTemplate.CreateSessionTemplate')
      }
      destroyOnHidden
      width={token.screenSM}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isCreating || isUpdating}
    >
      {queryError && (
        <div style={{ color: token.colorError, marginBottom: token.marginSM }}>
          {t('sessionTemplate.FailedToLoadFormData')}
        </div>
      )}
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          session_type: 'interactive',
          resources: [{ type: undefined, allocation: undefined }],
        }}
      >
        {/* Name */}
        <Form.Item label={t('sessionTemplate.Name')} name="name">
          <Input placeholder={t('sessionTemplate.NamePlaceholder')} />
        </Form.Item>

        {/* Domain Name */}
        <Form.Item
          label={t('sessionTemplate.DomainName')}
          name="domain_name"
          rules={[
            {
              required: true,
              message: t('sessionTemplate.PleaseSelectDomain'),
            },
          ]}
        >
          <Select
            showSearch
            disabled={isEditMode}
            placeholder={t('sessionTemplate.SelectDomain')}
            options={(domainsData ?? []).map((d: { name: string }) => ({
              label: d.name,
              value: d.name,
            }))}
          />
        </Form.Item>

        {/* Project/Group */}
        <Form.Item label={t('sessionTemplate.Project')} name="group_name">
          <Select
            showSearch
            allowClear
            disabled={isEditMode || !domainName}
            placeholder={
              domainName
                ? t('sessionTemplate.SelectProject')
                : t('sessionTemplate.SelectDomainFirst')
            }
            options={(groupsData ?? []).map((g: { name: string }) => ({
              label: g.name,
              value: g.name,
            }))}
          />
        </Form.Item>

        {/* Session Type */}
        <Form.Item
          label={t('sessionTemplate.SessionType')}
          name="session_type"
          rules={[
            {
              required: true,
              message: t('sessionTemplate.PleaseSelectSessionType'),
            },
          ]}
        >
          <Select
            options={[
              {
                label: t('sessionTemplate.Interactive'),
                value: 'interactive',
              },
              { label: t('sessionTemplate.Batch'), value: 'batch' },
              { label: t('sessionTemplate.Inference'), value: 'inference' },
            ]}
          />
        </Form.Item>

        {/* Image */}
        <Form.Item
          label={t('sessionTemplate.Image')}
          name="image"
          rules={[
            {
              required: true,
              message: t('sessionTemplate.PleaseInputImage'),
            },
          ]}
        >
          <Input placeholder={t('sessionTemplate.ImagePlaceholder')} />
        </Form.Item>

        {/* Resources (dynamic list with BAIDynamic components) */}
        <Form.Item
          label={t('sessionTemplate.Resources')}
          style={{ marginBottom: 0 }}
        >
          <Form.List name="resources">
            {(fields, { add, remove }) => (
              <BAIFlex direction="column" gap="xs" align="stretch">
                {fields.map(({ key, name }) => (
                  <ResourceRowField
                    key={key}
                    fieldName={name}
                    onRemove={remove}
                    showRemove={fields.length > 1}
                    resourceTypeOptions={resourceTypeOptions}
                    mergedResourceSlots={mergedResourceSlots ?? {}}
                  />
                ))}
                <Form.Item noStyle>
                  <BAIButton
                    type="dashed"
                    icon={<PlusOutlined />}
                    block
                    onClick={() =>
                      add({ type: undefined, allocation: undefined })
                    }
                  >
                    {t('button.Add')}
                  </BAIButton>
                </Form.Item>
              </BAIFlex>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default SessionTemplateSettingModal;
