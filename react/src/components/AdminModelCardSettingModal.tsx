/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminModelCardSettingModalCreateMutation } from '../__generated__/AdminModelCardSettingModalCreateMutation.graphql';
import type { AdminModelCardSettingModalFragment$key } from '../__generated__/AdminModelCardSettingModalFragment.graphql';
import type { AdminModelCardSettingModalUpdateMutation } from '../__generated__/AdminModelCardSettingModalUpdateMutation.graphql';
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { useCurrentDomainValue } from '../hooks';
import { toProjectContext } from '../types/projectContext';
import BAIFormItem from './BAIFormItem';
import FolderCreateModalV2 from './FolderCreateModalV2';
import FolderLink from './FolderLink';
import VFolderNodeIdenticonV2 from './VFolderNodeIdenticonV2';
import {
  AstryxFormSelector,
  AstryxFormTextArea,
  AstryxFormTagsInput,
  AstryxFormTextInput,
} from './astryx-bui/astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import {
  BAIButton,
  BAIDomainSelect,
  BAIFlex,
  BAIModal,
  type BAIModalProps,
  BAIVFolderSelectAstryx,
  BAIVFolderSelectAstryxRef,
  toGlobalId,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type FormInputType = {
  name: string;
  vfolderId: string;
  domainName?: string;
  author?: string;
  title?: string;
  modelVersion?: string;
  description?: string;
  task?: string;
  category?: string;
  architecture?: string;
  framework?: string[];
  label?: string[];
  license?: string;
  readme?: string;
  accessLevel: string;
};

interface AdminModelCardSettingModalProps extends BAIModalProps {
  modelCardFrgmt?: AdminModelCardSettingModalFragment$key | null | undefined;
  modelStoreProject?: {
    id: string | null | undefined;
    name: string | null | undefined;
  } | null;
  onRequestClose?: (success: boolean) => void;
}

const AdminModelCardSettingModal: React.FC<AdminModelCardSettingModalProps> = ({
  modelCardFrgmt,
  modelStoreProject,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const formRef = useRef<FormInstance<FormInputType>>(null);
  const vfolderSelectRef = useRef<BAIVFolderSelectAstryxRef>(null);
  const [isOpenCreateFolderModal, setIsOpenCreateFolderModal] = useState(false);

  const currentDomain = useCurrentDomainValue();

  const modelCard = useFragment(
    graphql`
      fragment AdminModelCardSettingModalFragment on ModelCardV2 {
        id
        name
        vfolderId
        vfolder {
          metadata {
            name
          }
          ...VFolderNodeIdenticonV2Fragment
        }
        domainName
        projectId
        readme
        accessLevel
        metadata {
          author
          title
          modelVersion
          description
          task
          category
          architecture
          framework
          label
          license
        }
      }
    `,
    modelCardFrgmt,
  );

  const isEditMode = !!modelCard;

  // `name` is nullable, so gate on the same condition `toProjectContext`
  // applies — otherwise the form stays enabled while the context is null.
  const modelStoreProjectContext = toProjectContext(modelStoreProject ?? {});
  const isModelStoreProjectResolved = modelStoreProjectContext !== null;

  const [commitCreateModelCard, isCreateInFlight] =
    useMutation<AdminModelCardSettingModalCreateMutation>(graphql`
      mutation AdminModelCardSettingModalCreateMutation(
        $input: CreateModelCardV2Input!
      ) {
        adminCreateModelCardV2(input: $input) {
          modelCard {
            id
          }
        }
      }
    `);

  const [commitUpdateModelCard, isUpdateInFlight] =
    useMutation<AdminModelCardSettingModalUpdateMutation>(graphql`
      mutation AdminModelCardSettingModalUpdateMutation(
        $input: UpdateModelCardV2Input!
      ) {
        adminUpdateModelCardV2(input: $input) {
          modelCard {
            id
            name
            accessLevel
            metadata {
              author
              title
              modelVersion
              description
              task
              category
              architecture
              framework
              label
              license
            }
            readme
          }
        }
      }
    `);

  const initialValues: Partial<FormInputType> = modelCard
    ? {
        name: modelCard.name,
        vfolderId: modelCard.vfolderId,
        domainName: modelCard.domainName || undefined,
        author: modelCard.metadata?.author || undefined,
        title: modelCard.metadata?.title || undefined,
        modelVersion: modelCard.metadata?.modelVersion || undefined,
        description: modelCard.metadata?.description || undefined,
        task: modelCard.metadata?.task || undefined,
        category: modelCard.metadata?.category || undefined,
        architecture: modelCard.metadata?.architecture || undefined,
        framework:
          modelCard.metadata?.framework?.length > 0
            ? [...modelCard.metadata.framework]
            : undefined,
        label:
          modelCard.metadata?.label?.length > 0
            ? [...modelCard.metadata.label]
            : undefined,
        license: modelCard.metadata?.license || undefined,
        readme: modelCard.readme || undefined,
        accessLevel: modelCard.accessLevel,
      }
    : {
        accessLevel: 'INTERNAL',
        domainName: currentDomain,
      };

  const buildMetadataInput = (values: FormInputType) => ({
    name: values.name,
    author: values.author || null,
    title: values.title || null,
    modelVersion: values.modelVersion || null,
    description: values.description || null,
    task: values.task || null,
    category: values.category || null,
    architecture: values.architecture || null,
    framework:
      values.framework && values.framework.length > 0 ? values.framework : [],
    label: values.label && values.label.length > 0 ? values.label : [],
    license: values.license || null,
    readme: values.readme || null,
    accessLevel: values.accessLevel as 'PUBLIC' | 'INTERNAL',
  });

  const handleMutationError = (error: { message?: string }) => {
    logger.error(error);
    if (error?.message?.includes('unique')) {
      message.error(t('adminModelCard.UniqueConstraintViolation'));
    } else {
      message.error(error?.message || t('general.ErrorOccurred'));
    }
  };

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values: FormInputType) => {
        const metadataInput = buildMetadataInput(values);

        if (isEditMode) {
          commitUpdateModelCard({
            variables: {
              input: {
                id: toLocalId(modelCard.id),
                ...metadataInput,
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                return;
              }
              message.success(t('adminModelCard.ModelCardUpdated'));
              onRequestClose?.(true);
            },
            onError: handleMutationError,
          });
        } else {
          // Model cards are created ONLY in the resolved model-store project
          // (ADR-0001 / FR-3410 — the silent ambient-project fallback was
          // deleted). When the model-store project cannot be resolved, the
          // form is replaced by the ProjectNotFound alert and the OK button
          // is disabled, so this guard only narrows the type.
          if (!modelStoreProjectContext) {
            return;
          }
          commitCreateModelCard({
            variables: {
              input: {
                vfolderId: toLocalId(values.vfolderId),
                // The model card must be created in the MODEL_STORE project —
                // the same project that backs the VFolder selector above.
                // TODO: model cards in the model-store project are slated to
                // become global cards. Once a query that can look up cards across
                // projects of multiple scopes is added, this will need to change.
                modelStoreProjectId: modelStoreProjectContext.id,
                domainName: values.domainName || null,
                ...metadataInput,
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                return;
              }
              message.success(t('adminModelCard.ModelCardCreated'));
              onRequestClose?.(true);
            },
            onError: handleMutationError,
          });
        }
      })
      .catch(() => undefined);
  };

  return (
    <>
      <BAIModal
        {...modalProps}
        title={
          isEditMode
            ? t('adminModelCard.EditModelCard')
            : t('adminModelCard.CreateModelCard')
        }
        onCancel={() => {
          onRequestClose?.(false);
        }}
        okText={isEditMode ? t('button.Save') : t('button.Create')}
        onOk={handleOk}
        okButtonProps={{
          ...modalProps.okButtonProps,
          loading: isCreateInFlight || isUpdateInFlight,
          disabled:
            !isModelStoreProjectResolved || modalProps.okButtonProps?.disabled,
        }}
      >
        {!isModelStoreProjectResolved ? (
          <Banner
            status="error"
            title={t('modelStore.ProjectNotFound')}
            description={t('modelStore.ProjectNotFoundDescription')}
          />
        ) : (
          <Form ref={formRef} layout="vertical" initialValues={initialValues}>
            <BAIFormItem
              name="name"
              label={t('adminModelCard.Name')}
              tooltip={t('adminModelCard.NameTooltip')}
              rules={[
                {
                  required: true,
                  message: t('adminModelCard.NameRequired'),
                },
              ]}
            >
              <AstryxFormTextInput label={t('adminModelCard.Name')} />
            </BAIFormItem>

            {isEditMode ? (
              <BAIFormItem label={t('adminModelCard.ModelStorageFolder')}>
                <BAIFlex gap="xs" align="center">
                  {modelCard.vfolder && (
                    <VFolderNodeIdenticonV2
                      vfolderNodeIdenticonFrgmt={modelCard.vfolder}
                    />
                  )}
                  <FolderLink
                    folderId={modelCard.vfolderId}
                    folderName={
                      modelCard.vfolder?.metadata?.name ?? modelCard.vfolderId
                    }
                  />
                </BAIFlex>
              </BAIFormItem>
            ) : (
              <BAIFormItem
                label={t('adminModelCard.ModelStorageFolder')}
                required
              >
                <BAIFlex gap="xs" align="center">
                  <Suspense
                    fallback={
                      <TextInput
                        value=""
                        label={t('adminModelCard.ModelStorageFolder')}
                        isLabelHidden
                        isDisabled
                        style={{ flex: 1 }}
                      />
                    }
                  >
                    <BAIFormItem
                      name="vfolderId"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: t('adminModelCard.VFolderRequired'),
                        },
                      ]}
                    >
                      <BAIVFolderSelectAstryx
                        ref={vfolderSelectRef}
                        label={t('adminModelCard.ModelStorageFolder')}
                        isLabelHidden
                        excludeDeleted
                        filter='ownership_type == "group"'
                        currentProjectId={modelStoreProject?.id ?? undefined}
                      />
                    </BAIFormItem>
                  </Suspense>
                  {/* The folder-creation modal below targets the model-store
                      project explicitly (ADR-0001), so no ambient project
                      switch is needed before opening it. */}
                  <BAIButton
                    icon={<PlusIcon />}
                    onClick={() => setIsOpenCreateFolderModal(true)}
                  />
                </BAIFlex>
              </BAIFormItem>
            )}

            {isEditMode ? (
              <BAIFormItem label={t('adminModelCard.Domain')}>
                <Text>{modelCard.domainName}</Text>
              </BAIFormItem>
            ) : (
              <Suspense
                fallback={
                  <BAIFormItem
                    name="domainName"
                    label={t('adminModelCard.Domain')}
                  >
                    <AstryxFormTextInput
                      label={t('adminModelCard.Domain')}
                      disabled
                    />
                  </BAIFormItem>
                }
              >
                <BAIFormItem
                  name="domainName"
                  label={t('adminModelCard.Domain')}
                >
                  <BAIDomainSelect />
                </BAIFormItem>
              </Suspense>
            )}

            <BAIFormItem
              name="author"
              label={t('adminModelCard.Author')}
              tooltip={t('adminModelCard.AuthorTooltip')}
            >
              <AstryxFormTextInput label={t('adminModelCard.Author')} />
            </BAIFormItem>

            <BAIFormItem
              name="title"
              label={t('adminModelCard.Title')}
              tooltip={t('adminModelCard.TitleTooltip')}
            >
              <AstryxFormTextInput label={t('adminModelCard.Title')} />
            </BAIFormItem>

            <BAIFormItem
              name="modelVersion"
              label={t('adminModelCard.ModelVersion')}
              tooltip={t('adminModelCard.ModelVersionTooltip')}
            >
              <AstryxFormTextInput label={t('adminModelCard.ModelVersion')} />
            </BAIFormItem>

            <BAIFormItem
              name="description"
              label={t('adminModelCard.Description')}
              tooltip={t('adminModelCard.DescriptionTooltip')}
            >
              <AstryxFormTextArea
                label={t('adminModelCard.Description')}
                rows={3}
              />
            </BAIFormItem>

            <BAIFormItem
              name="task"
              label={t('adminModelCard.Task')}
              tooltip={t('adminModelCard.TaskTooltip')}
            >
              <AstryxFormTextInput
                label={t('adminModelCard.Task')}
                placeholder={t('adminModelCard.TaskPlaceholder')}
              />
            </BAIFormItem>

            <BAIFormItem
              name="category"
              label={t('adminModelCard.Category')}
              tooltip={t('adminModelCard.CategoryTooltip')}
            >
              <AstryxFormTextInput
                label={t('adminModelCard.Category')}
                placeholder={t('adminModelCard.CategoryPlaceholder')}
              />
            </BAIFormItem>

            <BAIFormItem
              name="architecture"
              label={t('adminModelCard.Architecture')}
              tooltip={t('adminModelCard.ArchitectureTooltip')}
            >
              <AstryxFormTextInput label={t('adminModelCard.Architecture')} />
            </BAIFormItem>

            <BAIFormItem
              name="framework"
              label={t('adminModelCard.Framework')}
              tooltip={t('adminModelCard.FrameworkTooltip')}
            >
              <AstryxFormTagsInput
                tokenSeparators={[',', ' ']}
                label={t('adminModelCard.Framework')}
                placeholder={t('adminModelCard.AddFramework')}
              />
            </BAIFormItem>

            <BAIFormItem
              name="label"
              label={t('adminModelCard.Label')}
              tooltip={t('adminModelCard.LabelTooltip')}
            >
              <AstryxFormTagsInput
                tokenSeparators={[',', ' ']}
                label={t('adminModelCard.Label')}
                placeholder={t('adminModelCard.AddLabel')}
              />
            </BAIFormItem>

            <BAIFormItem
              name="license"
              label={t('adminModelCard.License')}
              tooltip={t('adminModelCard.LicenseTooltip')}
            >
              <AstryxFormTextInput label={t('adminModelCard.License')} />
            </BAIFormItem>

            <BAIFormItem
              name="readme"
              label={t('adminModelCard.Readme')}
              tooltip={t('adminModelCard.ReadmeTooltip')}
            >
              <AstryxFormTextArea label={t('adminModelCard.Readme')} rows={6} />
            </BAIFormItem>

            <BAIFormItem
              name="accessLevel"
              label={t('adminModelCard.AccessLevel')}
              tooltip={t('adminModelCard.AccessLevelTooltip')}
              rules={[
                {
                  required: true,
                  message: t('adminModelCard.AccessLevelRequired'),
                },
              ]}
            >
              <AstryxFormSelector
                label={t('adminModelCard.AccessLevel')}
                options={[
                  {
                    value: 'INTERNAL',
                    label: t('adminModelCard.Private'),
                  },
                  {
                    value: 'PUBLIC',
                    label: t('adminModelCard.Public'),
                  },
                ]}
              />
            </BAIFormItem>
          </Form>
        )}
      </BAIModal>
      {/* Model folders are created in the model-store project, never the
          ambient one. */}
      <FolderCreateModalV2
        open={isOpenCreateFolderModal}
        project={modelStoreProjectContext}
        initialValidate={true}
        folderType="model_project"
        onRequestClose={(result) => {
          setIsOpenCreateFolderModal(false);
          if (result) {
            formRef.current?.setFieldsValue({
              vfolderId: toGlobalId('VirtualFolderNode', toLocalId(result.id)),
            });
            vfolderSelectRef.current?.refetch();
          }
        }}
      />
    </>
  );
};

export default AdminModelCardSettingModal;
