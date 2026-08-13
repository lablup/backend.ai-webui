/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { Form, FormInstance, FormProps } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import {
  StartSessionWithDefaultValue,
  useStartSession,
} from '../hooks/useStartSession';
import { toProjectContext } from '../types/projectContext';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import HuggingFaceModelPreview from './HuggingFaceModelPreview';
import { AstryxFormTextInput } from './astryxFormControls';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  BAIButton,
  BAIFlex,
  BAISelect,
  BAIVFolderSelectAstryx,
  BAIVFolderSelectAstryxRef,
  generateRandomString,
  safeDecodeUuid,
  toGlobalId,
  toLocalId,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import {
  RotateCw,
  CloudDownload,
  FolderOpenIcon,
  PlusIcon,
} from 'lucide-react';
import { startTransition, Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImportHuggingFaceModelFormValues {
  model: string;
  revision?: string;
  token?: string;
  vfolderId: string;
}

interface ImportHuggingFaceModelFormProps extends FormProps {
  onRequestClose?: () => void;
}

// Model IDs are `name` or `org/name`, where each segment is [\w.-]+
const HUGGINGFACE_MODEL_ID_REGEX = /^[\w.-]+(?:\/[\w.-]+)?$/;

// Path prefixes on huggingface.co that are not model repositories
const NON_MODEL_URL_PREFIXES = [
  'datasets',
  'spaces',
  'collections',
  'organizations',
  'blog',
  'docs',
  'papers',
  'settings',
  'pricing',
];

export const parseHuggingFaceModel = (
  input: string,
): { modelId: string; revision?: string } | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      return null;
    }
    if (!/(^|\.)huggingface\.co$/.test(parsedUrl.hostname)) {
      return null;
    }
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    if (segments.length === 0 || NON_MODEL_URL_PREFIXES.includes(segments[0])) {
      return null;
    }
    const treeIndex = segments.indexOf('tree');
    const idSegments =
      treeIndex === -1
        ? segments.slice(0, 2)
        : segments.slice(0, Math.min(treeIndex, 2));
    const revision =
      treeIndex !== -1 && segments[treeIndex + 1]
        ? decodeURIComponent(segments[treeIndex + 1])
        : undefined;
    const modelId = idSegments.join('/');
    if (!HUGGINGFACE_MODEL_ID_REGEX.test(modelId)) {
      return null;
    }
    return { modelId, revision };
  }

  if (!HUGGINGFACE_MODEL_ID_REGEX.test(trimmed)) {
    return null;
  }
  return { modelId: trimmed };
};

const createHuggingFaceDownloadScript = (
  modelId: string,
  folderName: string,
  revision?: string,
) => {
  // Helper function to escape shell arguments
  const escapeShellArg = (arg: string): string => {
    return `'${arg.replace(/'/g, "'\\''")}'`;
  };

  const modelName = modelId.split('/').pop() ?? modelId;
  // Download into a per-model subfolder so multiple models can coexist
  // in the same model folder.
  const targetDir = `/home/work/${folderName}/${modelName}`;

  return [
    '#!/bin/sh',
    '# Install the Hugging Face CLI and download the model into the mounted folder',
    `pip install -q -U 'huggingface_hub[cli]'`,
    `hf download ${escapeShellArg(modelId)}${
      revision ? ` --revision ${escapeShellArg(revision)}` : ''
    } --local-dir ${escapeShellArg(targetDir)}`,
  ].join('\n');
};

const ImportHuggingFaceModelForm: React.FC<ImportHuggingFaceModelFormProps> = ({
  onRequestClose,
  ...formProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const app = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const formRef = useRef<FormInstance<ImportHuggingFaceModelFormValues> | null>(
    null,
  );
  const baiClient = useSuspendedBackendaiClient();
  const currentProject = useCurrentProjectValue();
  const { startSessionWithDefault, upsertSessionNotification } =
    useStartSession();
  const { open: openFolderExplorer } = useFolderExplorerOpener();

  const vfolderSelectRef = useRef<BAIVFolderSelectAstryxRef>(null);
  const [isFolderCreateModalOpen, setIsFolderCreateModalOpen] = useState(false);
  // id → name for selected folders, resolved by BAIVFolderSelectAstryx (and seeded
  // directly when a folder is created through FolderCreateModalV2). The name
  // is needed to build the download path under `/home/work/<folder>/`.
  const [folderNameMap, setFolderNameMap] = useState<Record<string, string>>(
    {},
  );

  const handleImport = async (values: ImportHuggingFaceModelFormValues) => {
    const parsed = parseHuggingFaceModel(values.model);
    if (!parsed) {
      app.message.error(t('import.InvalidHuggingFaceModel'));
      return;
    }
    const folderName = folderNameMap[values.vfolderId];
    if (!folderName) {
      // The id → name resolution query has not returned yet; ask to retry
      // instead of launching a session with a broken download path.
      app.message.error(t('import.FolderNameNotResolvedYet'));
      return;
    }

    const revision = values.revision?.trim() || parsed.revision;
    const token = values.token?.trim();

    try {
      // Session names only allow a restricted charset (folder names may
      // contain e.g. Korean), and a random suffix avoids name collisions
      // when several downloads target the same folder concurrently.
      const sessionSafeFolderName = folderName.replace(/[^a-zA-Z0-9-_]/g, '-');
      const launcherValue: StartSessionWithDefaultValue = {
        sessionName: `hf-model-to-${sessionSafeFolderName}-${generateRandomString()}`,
        environments: {
          version: baiClient._config.default_import_environment,
        },
        sessionType: 'batch',
        batch: {
          command: createHuggingFaceDownloadScript(
            parsed.modelId,
            folderName,
            revision,
          ),
          enabled: true,
        },
        // Without an explicit allocation the import session is scheduled with
        // the bare-minimum resources and the `hf download` Python process
        // gets OOM-killed.
        resource: {
          cpu: 2,
          mem: '4g',
          shmem: '0g',
          accelerator: 0,
        },
        mount_ids: [toLocalId(values.vfolderId)],
        // Pass the token as an environment variable instead of interpolating
        // it into the shell command.
        ...(token ? { envvars: [{ variable: 'HF_TOKEN', value: token }] } : {}),
      };

      const results = await startSessionWithDefault(launcherValue);

      if (results.fulfilled && results.fulfilled.length > 0) {
        upsertSessionNotification(results.fulfilled);
        formRef.current?.resetFields();
        onRequestClose?.();
      }

      if (results?.rejected && results.rejected.length > 0) {
        const error = results.rejected[0].reason;
        app.modal.error({
          title: error?.title,
          content: getErrorMessage(error),
        });
      }
    } catch (error: any) {
      app.message.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <Form ref={formRef} layout="vertical" {...formProps}>
        <Form.Item>{t('import.HuggingFaceModelWillBeDownloaded')}</Form.Item>
        <Form.Item
          name="model"
          label={t('import.HuggingFaceModelUrlOrId')}
          rules={[
            {
              required: true,
              message: t('general.ValueRequired', {
                name: t('import.HuggingFaceModelUrlOrId'),
              }),
            },
            { type: 'string', max: 2048 },
            {
              validator: (_rule, value) => {
                if (!value || parseHuggingFaceModel(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(t('import.InvalidHuggingFaceModel')),
                );
              },
            },
          ]}
        >
          <AstryxFormTextInput
            label={t('import.HuggingFaceModelUrlOrId')}
            placeholder="https://huggingface.co/openai/gpt-oss-20b"
          />
        </Form.Item>
        {/* The preview must stay mounted even while the input is
            unparseable: `useDebounce` seeds its state with the current
            value, so remounting on every unparseable→parseable transition
            (`openai/` → `openai/g`) would fire an undebounced request at the
            rate-limited API. `hidden` collapses the row to `display: none`,
            so an empty input leaves no gap above the next field without
            unmounting anything. */}
        <Form.Item noStyle dependencies={['model']}>
          {({
            getFieldValue,
          }: FormInstance<ImportHuggingFaceModelFormValues>) => {
            const modelId = parseHuggingFaceModel(
              getFieldValue('model') ?? '',
            )?.modelId;
            return (
              <Form.Item hidden={!modelId}>
                <HuggingFaceModelPreview modelId={modelId} />
              </Form.Item>
            );
          }}
        </Form.Item>
        <Form.Item
          name="revision"
          label={t('import.HuggingFaceRevision')}
          rules={[{ type: 'string', max: 200 }]}
        >
          <AstryxFormTextInput
            label={t('import.HuggingFaceRevision')}
            placeholder="main"
          />
        </Form.Item>
        <Form.Item
          name="token"
          label={t('import.HuggingFaceToken')}
          rules={[{ type: 'string', max: 512 }]}
          extra={t('import.HuggingFaceTokenAdminVisibleWarning')}
        >
          {/* antd `Input.Password` → `TextInput type="password"`
              (MAPPING §3.6). PILOT-DECISION: antd's built-in reveal toggle has
              no Astryx counterpart and is dropped; `autoComplete="off"` has no
              adapter prop, and the field is not a login credential. */}
          <AstryxFormTextInput
            label={t('import.HuggingFaceToken')}
            type="password"
          />
        </Form.Item>
        <Form.Item
          label={t('deployment.ModelFolder')}
          required
          extra={t('import.OnlyWritableModelFoldersAreListed')}
        >
          <BAIFlex direction="row" gap="xs">
            <Suspense fallback={<BAISelect loading style={{ flex: 1 }} />}>
              <Form.Item
                name="vfolderId"
                noStyle
                rules={[
                  {
                    required: true,
                    message: t('general.ValueRequired', {
                      name: t('deployment.ModelFolder'),
                    }),
                  },
                ]}
              >
                <BAIVFolderSelectAstryx
                  ref={vfolderSelectRef}
                  label={t('deployment.ModelFolder')}
                  isLabelHidden
                  excludeDeleted
                  // The session writes into the folder, so a read-only mount
                  // fails. `mount_rw` covers read-only *shares* and hosts, but
                  // the resolver filters rows by scope only and strips
                  // MOUNT_RW afterwards, so a row-level `ro` folder still comes
                  // back — exclude it here too.
                  filter='usage_mode == "model" & permission != "ro"'
                  requiredPermission="mount_rw"
                  currentProjectId={currentProject.id ?? undefined}
                  onResolvedNamesChange={(nameMap) => {
                    setFolderNameMap((prev) => ({ ...prev, ...nameMap }));
                  }}
                />
              </Form.Item>
            </Suspense>
            <Form.Item dependencies={['vfolderId']} noStyle>
              {({
                getFieldValue,
              }: FormInstance<ImportHuggingFaceModelFormValues>) => {
                const vfolderId = getFieldValue('vfolderId');
                return (
                  // antd `Space.Compact` of icon-only buttons → `ButtonGroup` +
                  // `IconButton` (MAPPING §3.3). Each Tooltip-wrapped button
                  // becomes an `IconButton` with a required accessible `label`
                  // plus its own `tooltip` — the wrapping Tooltip is dropped
                  // because Astryx forbids wrapping a disabled trigger (P18:
                  // `IconButton` has no `disabledMessage`, so the disabled
                  // "Open folder" action carries `tooltip` instead).
                  <ButtonGroup label={t('deployment.ModelFolder')}>
                    <IconButton
                      icon={<FolderOpenIcon size="1em" />}
                      label={t('modelService.OpenFolder')}
                      tooltip={t('modelService.OpenFolder')}
                      isDisabled={!vfolderId}
                      onClick={() => {
                        if (vfolderId) {
                          openFolderExplorer(toLocalId(vfolderId));
                        }
                      }}
                    />
                    <IconButton
                      icon={<PlusIcon size="1em" />}
                      label={t('data.CreateANewStorageFolder')}
                      tooltip={t('data.CreateANewStorageFolder')}
                      onClick={() => setIsFolderCreateModalOpen(true)}
                    />
                    <IconButton
                      icon={<RotateCw size="1em" />}
                      label={t('button.Refresh')}
                      tooltip={t('button.Refresh')}
                      onClick={() => {
                        startTransition(() => {
                          vfolderSelectRef.current?.refetch();
                        });
                      }}
                    />
                  </ButtonGroup>
                );
              }}
            </Form.Item>
          </BAIFlex>
        </Form.Item>
        <Form.Item>
          <BAIButton
            icon={<CloudDownload />}
            action={async () => {
              try {
                const values = await formRef.current?.validateFields();
                if (!values) return;
                await handleImport(values);
              } catch (error) {
                logger.error('Form validation failed:', error);
              }
            }}
            block
            type="primary"
          >
            {t('import.DownloadModelToFolder')}
          </BAIButton>
        </Form.Item>
      </Form>
      <FolderCreateModalV2
        open={isFolderCreateModalOpen}
        project={toProjectContext(currentProject)}
        initialValues={{ usage_mode: 'model' }}
        onRequestClose={(result) => {
          setIsFolderCreateModalOpen(false);
          if (result?.accessControl?.permission === 'READ_ONLY') {
            app.message.warning(t('import.CreatedFolderIsReadOnly'));
            return;
          }
          if (result?.id) {
            // `createVfolderV2` returns a `VFolder` (Strawberry) global ID,
            // but BAIVFolderSelectAstryx's value query reads from `vfolder_nodes`
            // (`VirtualFolderNode`, Graphene). Both encode the same UUID but
            // with different `__typename:` prefixes, so re-encode to the
            // VirtualFolderNode global ID form before selecting it.
            const newFolderUuid = safeDecodeUuid(result.id);
            if (!newFolderUuid) return;
            const newFolderGlobalId = toGlobalId(
              'VirtualFolderNode',
              newFolderUuid,
            );
            if (result.metadata?.name) {
              setFolderNameMap((prev) => ({
                ...prev,
                [newFolderGlobalId]: result.metadata.name,
              }));
            }
            formRef.current?.setFieldValue('vfolderId', newFolderGlobalId);
            startTransition(() => {
              vfolderSelectRef.current?.refetch();
            });
          }
        }}
      />
    </>
  );
};

export default ImportHuggingFaceModelForm;
