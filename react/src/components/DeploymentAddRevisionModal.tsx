/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeploymentAddRevisionModalAddMutation } from '../__generated__/DeploymentAddRevisionModalAddMutation.graphql';
import { DeploymentAddRevisionModalQuery } from '../__generated__/DeploymentAddRevisionModalQuery.graphql';
import { tokenizeShellCommand } from '../helper/parseCliCommand';
import {
  mergeExtraArgs,
  reverseMapExtraArgs,
} from '../helper/runtimeExtraArgsParser';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  buildArgsSchemaKeySet,
  buildDefaultsMap,
  flattenPresets,
  getAllExtraArgsEnvVarNames,
  getExtraArgsEnvVarName,
  type RuntimeParameterGroup,
} from '../hooks/useRuntimeParameterSchema';
import ImageEnvironmentSelectFormItems, {
  type ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import RuntimeParameterFormSection, {
  type RuntimeParameterValues,
} from './RuntimeParameterFormSection';
import VFolderSelect from './VFolderSelect';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Divider,
  Form,
  type FormInstance,
  Input,
  InputNumber,
  Segmented,
  Select,
  Skeleton,
  Typography,
  theme,
} from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAIProjectResourceGroupSelect,
  filterOutNullAndUndefined,
  isValidUUID,
  toLocalId,
} from 'backend.ai-ui';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

/**
 * Resolve a UUID from either a raw UUID or a Strawberry global id like
 * `ImageV2:<uuid>`. `ImageInput.id` is declared as `ID!` but parsed as
 * `UUID!` server-side, so we decode the form value before submitting.
 * `toLocalId` calls `atob` which throws on non-base64 input — guard with
 * try/catch and verify the decoded value is a UUID.
 */
const safeDecodeUuid = (idOrGlobalId: string): string | undefined => {
  if (isValidUUID(idOrGlobalId)) return idOrGlobalId;
  try {
    const decoded = toLocalId(idOrGlobalId);
    return decoded && isValidUUID(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = theme.useToken();
  return (
    <Divider titlePlacement="left">
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {children}
      </Typography.Text>
    </Divider>
  );
};

interface DeploymentAddRevisionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deploymentId: string;
}

type FormValues = ImageEnvironmentFormInput & {
  name?: string;
  clusterMode: 'SINGLE_NODE' | 'MULTI_NODE';
  clusterSize: number;
  resourceGroup: string;
  runtimeVariantId: string;
  modelFolderId: string;
  mountDestination: string;
  definitionPath: string;
  customDefinitionMode?: 'command' | 'file';
  startCommand?: string;
  commandPort?: number;
  commandHealthCheck?: string;
  commandModelMount?: string;
  commandInitialDelay?: number;
  commandMaxRetries?: number;
  environ: { name: string; value: string }[];
};

interface DeploymentAddRevisionModalFormBodyProps {
  deploymentId: string;
  form: FormInstance<FormValues>;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onIsAddingChange: (v: boolean) => void;
}

const DeploymentAddRevisionModalFormBody: React.FC<
  DeploymentAddRevisionModalFormBodyProps
> = ({ deploymentId, form, open, onClose, onSuccess, onIsAddingChange }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const currentProject = useCurrentProjectValue();

  // Runtime parameter refs — kept outside form state so slider/input changes
  // don't re-render the modal. Read at submit time via serializeRuntimeParamsToEnviron.
  const runtimeParamValuesRef = useRef<RuntimeParameterValues>({});
  const runtimeParamTouchedKeysRef = useRef<Set<string>>(new Set());
  const runtimeParamGroupsRef = useRef<RuntimeParameterGroup[] | null>(null);

  const { deployment, runtimeVariants, resource_presets } =
    useLazyLoadQuery<DeploymentAddRevisionModalQuery>(
      graphql`
        query DeploymentAddRevisionModalQuery($deploymentId: ID!) {
          deployment(id: $deploymentId) {
            metadata {
              projectId
            }
            currentRevision {
              clusterConfig {
                mode
                size
              }
              resourceConfig {
                resourceGroupName
              }
              modelRuntimeConfig {
                runtimeVariantId
                environ {
                  entries {
                    name
                    value
                  }
                }
              }
              modelMountConfig {
                vfolderId
                mountDestination
                definitionPath
              }
            }
          }
          runtimeVariants {
            edges {
              node {
                id
                name
              }
            }
          }
          resource_presets {
            name
            resource_slots
          }
        }
      `,
      { deploymentId },
      { fetchPolicy: 'network-only' },
    );

  const [commitAdd] = useMutation<DeploymentAddRevisionModalAddMutation>(
    graphql`
      mutation DeploymentAddRevisionModalAddMutation(
        $input: AddRevisionInput!
      ) {
        addModelRevision(input: $input) {
          revision {
            id
            name
          }
        }
      }
    `,
  );

  const currentRevision = (
    deployment as unknown as {
      currentRevision?: {
        clusterConfig?: { mode?: string; size?: number } | null;
        resourceConfig?: { resourceGroupName?: string | null } | null;
        modelRuntimeConfig?: {
          runtimeVariantId?: string | null;
          environ?: {
            entries?: ReadonlyArray<{ name: string; value: string }> | null;
          } | null;
        } | null;
        modelMountConfig?: {
          vfolderId?: string | null;
          mountDestination?: string | null;
          definitionPath?: string | null;
        } | null;
      } | null;
    }
  )?.currentRevision;

  const runtimeVariantOptions = filterOutNullAndUndefined(
    (runtimeVariants?.edges ?? []).map((e) => e?.node),
  ).map((node) => ({ value: toLocalId(node.id) ?? node.id, label: node.name }));

  // Pre-populate from current revision once when the modal opens.
  useEffect(() => {
    if (!open || !currentRevision) return;
    const rev = currentRevision;
    form.setFieldsValue({
      clusterMode:
        (rev?.clusterConfig?.mode as 'SINGLE_NODE' | 'MULTI_NODE') ??
        'MULTI_NODE',
      clusterSize: rev?.clusterConfig?.size ?? 1,
      resourceGroup: rev?.resourceConfig?.resourceGroupName ?? '',
      runtimeVariantId: rev?.modelRuntimeConfig?.runtimeVariantId ?? undefined,
      modelFolderId: rev?.modelMountConfig?.vfolderId ?? undefined,
      mountDestination: rev?.modelMountConfig?.mountDestination ?? '/models',
      definitionPath:
        rev?.modelMountConfig?.definitionPath ?? 'model-definition.yaml',
      environ: (rev?.modelRuntimeConfig?.environ?.entries ?? []).map((e) => ({
        name: e.name,
        value: e.value,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRevision]);

  const parseResourceSlotEntries = (resourceSlotsJson: string | null) => {
    const slots = JSON.parse(resourceSlotsJson ?? '{}') as Record<
      string,
      string
    >;
    return Object.entries(slots).map(([resourceType, quantity]) => ({
      resourceType,
      quantity: String(quantity),
    }));
  };

  // Serialize runtime parameter UI values (from RuntimeParameterFormSection)
  // into an environ map — mirrors ServiceLauncherPageContent logic.
  const serializeRuntimeParamsToEnviron = (
    environ: Record<string, string>,
    runtimeVariant: string,
  ) => {
    const groups = runtimeParamGroupsRef.current;
    if (!groups || Object.keys(runtimeParamValuesRef.current).length === 0)
      return;

    const extraArgsEnvVar = getExtraArgsEnvVarName(runtimeVariant);
    for (const envName of getAllExtraArgsEnvVarNames()) {
      if (envName !== extraArgsEnvVar) delete environ[envName];
    }

    const touchedValues: Record<string, string> = {};
    for (const [key, val] of Object.entries(runtimeParamValuesRef.current)) {
      if (runtimeParamTouchedKeysRef.current.has(key)) touchedValues[key] = val;
    }

    const presets = flattenPresets(groups);
    const presetMap = new Map(presets.map((p) => [p.key, p]));
    const defaults = buildDefaultsMap(groups);
    const argsValues: Record<string, string> = {};
    const envValues: Record<string, string> = {};

    for (const [key, val] of Object.entries(touchedValues)) {
      if (val === '' || val === undefined) continue;
      const preset = presetMap.get(key);
      if (!preset) continue;
      if (preset.presetTarget === 'ENV') envValues[key] = val;
      else argsValues[key] = val;
    }

    const argsSchemaKeys = buildArgsSchemaKeySet(groups);
    if (environ[extraArgsEnvVar] && argsSchemaKeys.size > 0) {
      const { unmappedText } = reverseMapExtraArgs(
        environ[extraArgsEnvVar],
        argsSchemaKeys,
      );
      if (unmappedText) environ[extraArgsEnvVar] = unmappedText;
      else delete environ[extraArgsEnvVar];
    }

    for (const preset of presets) {
      if (preset.presetTarget === 'ENV') delete environ[preset.key];
    }

    if (Object.keys(argsValues).length > 0) {
      const manualArgs = environ[extraArgsEnvVar] ?? '';
      const merged = mergeExtraArgs(argsValues, manualArgs, defaults);
      if (merged) environ[extraArgsEnvVar] = merged;
      else delete environ[extraArgsEnvVar];
    }

    for (const [key, val] of Object.entries(envValues)) {
      const preset = presetMap.get(key);
      if (preset?.defaultValue !== null && preset?.defaultValue === val)
        continue;
      environ[key] = val;
    }
  };

  const handleFinish = (values: FormValues) => {
    const imageId = values.environments?.image?.id;
    if (!imageId) {
      form.setFields([
        {
          name: ['environments', 'version'],
          errors: [t('modelService.ImageRequired')],
        },
      ]);
      return;
    }
    // `ImageInput.id` is declared as `ID!` but parsed as `UUID!`
    // server-side. The form provides a Strawberry global id
    // (`ImageV2:<uuid>` base64-encoded), so decode before submitting.
    const decodedImageId = safeDecodeUuid(imageId);
    if (!decodedImageId) {
      form.setFields([
        {
          name: ['environments', 'version'],
          errors: [t('modelService.ImageRequired')],
        },
      ]);
      return;
    }

    const preset = resource_presets?.find(
      (p) => p?.name === values.resourceGroup,
    );
    const entries = parseResourceSlotEntries(preset?.resource_slots ?? null);

    const variantName =
      runtimeVariantOptions.find((o) => o.value === values.runtimeVariantId)
        ?.label ?? '';
    const isCustom = variantName === 'custom';
    const isCommandMode = values.customDefinitionMode === 'command';

    // Build environ: runtime param section for non-custom, manual list for custom.
    const environRecord: Record<string, string> = {};
    if (!isCustom) {
      serializeRuntimeParamsToEnviron(environRecord, variantName);
    } else {
      for (const { name, value } of values.environ ?? []) {
        if (name) environRecord[name] = value;
      }
    }
    const environEntries = Object.entries(environRecord).map(
      ([name, value]) => ({ name, value }),
    );

    // Build modelDefinition for custom + command mode.
    // `ModelServiceConfigInput.startCommand` is `JSON!` in the schema but
    // the server-side Pydantic `ModelDefinition` validator requires a list
    // of shell tokens. Tokenize the user-typed command string the same
    // way `generateModelDefinitionYaml` does.
    const modelDefinition =
      isCustom && isCommandMode && values.startCommand
        ? {
            models: [
              {
                name: 'model',
                modelPath: values.commandModelMount ?? '/models',
                service: {
                  preStartActions: [],
                  startCommand: tokenizeShellCommand(values.startCommand),
                  port: values.commandPort ?? 8000,
                  healthCheck: values.commandHealthCheck
                    ? {
                        path: values.commandHealthCheck,
                        interval: 10,
                        maxRetries: values.commandMaxRetries ?? 10,
                        maxWaitTime: 15,
                      }
                    : null,
                },
              },
            ],
          }
        : null;

    const mountDestination =
      isCustom && isCommandMode
        ? (values.commandModelMount ?? '/models')
        : values.mountDestination || '/models';
    const definitionPath =
      isCustom && isCommandMode
        ? 'model-definition.yaml'
        : values.definitionPath || 'model-definition.yaml';

    onIsAddingChange(true);
    commitAdd({
      variables: {
        input: {
          deploymentId: toLocalId(deploymentId) ?? deploymentId,
          name: values.name || undefined,
          clusterConfig: {
            mode: values.clusterMode,
            size: values.clusterSize,
          },
          resourceConfig: {
            resourceGroup: { name: values.resourceGroup },
            resourceSlots: { entries },
          },
          image: { id: decodedImageId },
          modelRuntimeConfig: {
            runtimeVariantId: values.runtimeVariantId,
            inferenceRuntimeConfig: null,
            environ:
              environEntries.length > 0 ? { entries: environEntries } : null,
          },
          modelMountConfig: {
            vfolderId: values.modelFolderId,
            mountDestination,
            definitionPath,
          },
          modelDefinition,
          options: { autoActivate: true },
        },
      },
      onCompleted: (_, errors) => {
        onIsAddingChange(false);
        if (errors && errors.length > 0) {
          const err = errors[0];
          const isInProgress = err?.message?.includes(
            'Another deployment is already in progress',
          );
          message.error(
            isInProgress
              ? t('deployment.AnotherDeploymentInProgress')
              : (err?.message ?? t('general.ErrorOccurred')),
          );
          return;
        }
        form.resetFields();
        onSuccess();
        onClose();
      },
      onError: (err) => {
        onIsAddingChange(false);
        const isInProgress = err.message?.includes(
          'Another deployment is already in progress',
        );
        message.error(
          isInProgress
            ? t('deployment.AnotherDeploymentInProgress')
            : (err.message ?? t('general.ErrorOccurred')),
        );
      },
    });
  };

  return (
    <Form<FormValues>
      form={form}
      layout="vertical"
      style={{ marginTop: token.marginXS }}
      onFinish={handleFinish}
      initialValues={{
        clusterMode: 'MULTI_NODE',
        clusterSize: 1,
        mountDestination: '/models',
        definitionPath: 'model-definition.yaml',
        customDefinitionMode: 'command',
        commandPort: 8000,
        commandHealthCheck: '/health',
        commandModelMount: '/models',
        commandInitialDelay: 60,
        commandMaxRetries: 10,
        environ: [],
      }}
    >
      <Form.Item name="name" label={t('deployment.RevisionName')}>
        <Input placeholder={t('deployment.RevisionNamePlaceholder')} />
      </Form.Item>

      <SectionHeader>{t('deployment.step.ClusterAndResources')}</SectionHeader>
      <BAIFlex gap="sm">
        <Form.Item
          name="clusterMode"
          label={t('deployment.ClusterMode')}
          rules={[{ required: true }]}
          style={{ flex: 1 }}
        >
          <Select
            options={[
              { value: 'SINGLE_NODE', label: 'SINGLE_NODE' },
              { value: 'MULTI_NODE', label: 'MULTI_NODE' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="clusterSize"
          label={t('deployment.ClusterSize')}
          rules={[{ required: true }]}
          style={{ flex: 1 }}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
      </BAIFlex>
      <Form.Item
        name="resourceGroup"
        label={t('deployment.ResourceGroup')}
        rules={[{ required: true }]}
      >
        <BAIProjectResourceGroupSelect
          projectName={currentProject?.name ?? ''}
          showSearch
          autoSelectDefault
        />
      </Form.Item>

      <SectionHeader>{t('deployment.step.ModelAndRuntime')}</SectionHeader>
      <Form.Item
        name="modelFolderId"
        label={t('deployment.ModelFolder')}
        rules={[{ required: true }]}
      >
        <VFolderSelect
          autoSelectDefault
          valuePropName="id"
          filter={(vf) => vf.usage_mode === 'model' && vf.status === 'ready'}
          showOpenButton
          showCreateButton
          showRefreshButton
        />
      </Form.Item>
      <Form.Item
        name="runtimeVariantId"
        label={t('deployment.RuntimeVariant')}
        rules={[
          { required: true },
          {
            warningOnly: true,
            validator: async (_rule, value: string) => {
              const variantName = runtimeVariantOptions.find(
                (o) => o.value === value,
              )?.label;
              if (variantName && variantName !== 'custom') {
                return Promise.reject(
                  t('modelService.RuntimeVariantDefaultCommandAppliedNote'),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Select options={runtimeVariantOptions} showSearch />
      </Form.Item>

      {/* Runtime parameter section — shown for non-custom variants */}
      <Form.Item dependencies={['runtimeVariantId']} noStyle>
        {({ getFieldValue }) => {
          const variantId = getFieldValue('runtimeVariantId');
          const variantName = runtimeVariantOptions.find(
            (o) => o.value === variantId,
          )?.label;
          if (!variantName || variantName === 'custom') return null;
          return (
            <div style={{ marginBottom: token.marginMD }}>
              <Suspense fallback={null}>
                <RuntimeParameterFormSection
                  runtimeVariant={variantName}
                  onChange={(values) => {
                    runtimeParamValuesRef.current = {
                      ...runtimeParamValuesRef.current,
                      ...values,
                    };
                  }}
                  onTouchedKeysChange={(keys) => {
                    runtimeParamTouchedKeysRef.current = keys;
                  }}
                  onGroupsLoaded={(groups) => {
                    runtimeParamGroupsRef.current = groups;
                  }}
                  initialExtraArgs=""
                  initialEnvVars={undefined}
                />
              </Suspense>
            </div>
          );
        }}
      </Form.Item>

      {/* Model definition — command vs file mode for custom variant */}
      <Form.Item dependencies={['runtimeVariantId']} noStyle>
        {({ getFieldValue }) => {
          const variantId = getFieldValue('runtimeVariantId');
          const variantName = runtimeVariantOptions.find(
            (o) => o.value === variantId,
          )?.label;
          if (variantName !== 'custom') {
            return null;
          }
          // Custom variant: Segmented command vs file mode
          return (
            <>
              <Form.Item name="customDefinitionMode" noStyle>
                <Segmented
                  options={[
                    {
                      label: t('modelService.EnterCommand'),
                      value: 'command',
                    },
                    { label: t('modelService.UseConfigFile'), value: 'file' },
                  ]}
                  style={{ marginBottom: token.marginMD }}
                />
              </Form.Item>
              <Form.Item dependencies={['customDefinitionMode']} noStyle>
                {({ getFieldValue: getField }) =>
                  getField('customDefinitionMode') === 'command' ? (
                    <>
                      <Form.Item
                        name="startCommand"
                        label={t('modelService.StartCommand')}
                        rules={[{ required: true, whitespace: true }]}
                      >
                        <Input.TextArea
                          placeholder={t(
                            'modelService.StartCommandPlaceholder',
                          )}
                          autoSize={{ minRows: 2 }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="commandModelMount"
                        label={t('modelService.ModelMountDestination')}
                      >
                        <Input placeholder="/models" allowClear />
                      </Form.Item>
                      <BAIFlex gap="sm">
                        <Form.Item
                          name="commandPort"
                          label={t('modelService.Port')}
                          style={{ flex: 1 }}
                        >
                          <InputNumber
                            min={1}
                            max={65535}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item
                          name="commandHealthCheck"
                          label={t('modelService.HealthCheck')}
                          style={{ flex: 1 }}
                        >
                          <Input placeholder="/health" allowClear />
                        </Form.Item>
                      </BAIFlex>
                      <BAIFlex gap="sm">
                        <Form.Item
                          name="commandInitialDelay"
                          label={t('modelService.InitialDelay')}
                          style={{ flex: 1 }}
                        >
                          <InputNumber
                            min={0}
                            step={0.5}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item
                          name="commandMaxRetries"
                          label={t('modelService.MaxRetries')}
                          style={{ flex: 1 }}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </BAIFlex>
                    </>
                  ) : (
                    <BAIFlex gap="sm">
                      <Form.Item
                        name="mountDestination"
                        label={t('deployment.ModelMountDestination')}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                      >
                        <Input allowClear placeholder="/models" />
                      </Form.Item>
                      <Form.Item
                        name="definitionPath"
                        label={t('deployment.ModelDefinitionPath')}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                      >
                        <Input allowClear placeholder="model-definition.yaml" />
                      </Form.Item>
                    </BAIFlex>
                  )
                }
              </Form.Item>
            </>
          );
        }}
      </Form.Item>

      <ImageEnvironmentSelectFormItems />

      {/* Environment variables — only shown for custom variant */}
      <Form.Item dependencies={['runtimeVariantId']} noStyle>
        {({ getFieldValue }) => {
          const variantId = getFieldValue('runtimeVariantId');
          const variantName = runtimeVariantOptions.find(
            (o) => o.value === variantId,
          )?.label;
          if (variantName !== 'custom') return null;
          return (
            <>
              <SectionHeader>{t('deployment.Environ')}</SectionHeader>
              <Form.List name="environ">
                {(fields, { add, remove }) => (
                  <BAIFlex direction="column" gap="xs">
                    {fields.map(({ key, name }) => (
                      <BAIFlex key={key} gap="xs" align="center">
                        <Form.Item
                          name={[name, 'name']}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Input placeholder="KEY" />
                        </Form.Item>
                        <Form.Item
                          name={[name, 'value']}
                          style={{ flex: 2, marginBottom: 0 }}
                        >
                          <Input placeholder="VALUE" />
                        </Form.Item>
                        <MinusCircleOutlined
                          onClick={() => remove(name)}
                          style={{ color: token.colorTextSecondary }}
                        />
                      </BAIFlex>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add({ name: '', value: '' })}
                      icon={<PlusOutlined />}
                    >
                      {t('button.Add')}
                    </Button>
                  </BAIFlex>
                )}
              </Form.List>
            </>
          );
        }}
      </Form.Item>
    </Form>
  );
};

const DeploymentAddRevisionModal: React.FC<DeploymentAddRevisionModalProps> = ({
  open,
  onClose,
  onSuccess,
  deploymentId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const [isAdding, setIsAdding] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <BAIModal
      open={open}
      title={t('deployment.AddRevision')}
      onCancel={handleCancel}
      width={720}
      footer={
        <BAIFlex justify="end" gap="xs">
          <Button onClick={handleCancel}>{t('button.Cancel')}</Button>
          <BAIButton
            type="primary"
            loading={isAdding}
            onClick={() => form.submit()}
          >
            {t('deployment.AddRevision')}
          </BAIButton>
        </BAIFlex>
      }
    >
      {open && (
        <Suspense fallback={<Skeleton active />}>
          <DeploymentAddRevisionModalFormBody
            deploymentId={deploymentId}
            form={form}
            open={open}
            onClose={onClose}
            onSuccess={onSuccess}
            onIsAddingChange={setIsAdding}
          />
        </Suspense>
      )}
    </BAIModal>
  );
};

export default DeploymentAddRevisionModal;
