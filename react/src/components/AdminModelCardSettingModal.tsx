/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminModelCardSettingModalCreateMutation } from '../__generated__/AdminModelCardSettingModalCreateMutation.graphql';
import type { AdminModelCardSettingModalFragment$key } from '../__generated__/AdminModelCardSettingModalFragment.graphql';
import type { AdminModelCardSettingModalUpdateMutation } from '../__generated__/AdminModelCardSettingModalUpdateMutation.graphql';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from '../hooks/useCurrentProject';
import FolderCreateModal from './FolderCreateModal';
import FolderLink from './FolderLink';
import { shapes } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import {
  App,
  Button,
  Form,
  type FormInstance,
  Input,
  ModalProps,
  Popconfirm,
  Select,
  Typography,
  theme,
} from 'antd';
import {
  BAIButton,
  BAIDomainSelect,
  BAIFlex,
  BAIModal,
  BAIVFolderSelect,
  BAIVFolderSelectRef,
  convertToUUID,
  mergeFilterValues,
  toGlobalId,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import { PlusIcon } from 'lucide-react';
import { startTransition, Suspense, useRef, useState } from 'react';
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

interface AdminModelCardSettingModalProps extends ModalProps {
  modelCardFrgmt?: AdminModelCardSettingModalFragment$key | null | undefined;
  isModelStoreProject?: boolean;
  modelStoreProject?: {
    id: string | null | undefined;
    name: string | null | undefined;
  } | null;
  onRequestClose?: (success: boolean) => void;
}

const AdminModelCardSettingModal: React.FC<AdminModelCardSettingModalProps> = ({
  modelCardFrgmt,
  isModelStoreProject,
  modelStoreProject,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { token } = theme.useToken();
  const formRef = useRef<FormInstance<FormInputType>>(null);
  const vfolderSelectRef = useRef<BAIVFolderSelectRef>(null);
  const [isOpenCreateFolderModal, setIsOpenCreateFolderModal] = useState(false);

  const currentProject = useCurrentProjectValue();
  const setCurrentProject = useSetCurrentProject();

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
          commitCreateModelCard({
            variables: {
              input: {
                vfolderId: toLocalId(values.vfolderId),
                modelStoreProjectId: currentProject.id!,
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
        title={
          isEditMode
            ? t('adminModelCard.EditModelCard')
            : t('adminModelCard.CreateModelCard')
        }
        onCancel={() => {
          onRequestClose?.(false);
        }}
        okText={isEditMode ? t('button.Update') : t('button.Create')}
        okButtonProps={{
          loading: isCreateInFlight || isUpdateInFlight,
        }}
        onOk={handleOk}
        {...modalProps}
      >
        <Form ref={formRef} layout="vertical" initialValues={initialValues}>
          <Form.Item
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
            <Input />
          </Form.Item>

          {isEditMode ? (
            <Form.Item label={t('adminModelCard.ModelStorageFolder')}>
              <BAIFlex gap="xs" align="center">
                <img
                  src={createAvatar(shapes, {
                    seed: modelCard.vfolderId,
                    shape3: [],
                  })?.toDataUri()}
                  alt="VFolder Identicon"
                  style={{
                    borderRadius: '0.25em',
                    width: '1em',
                    height: '1em',
                    borderWidth: 0.5,
                    borderStyle: 'solid',
                    borderColor: token.colorBorder,
                  }}
                />
                <FolderLink
                  folderId={modelCard.vfolderId}
                  folderName={
                    modelCard.vfolder?.metadata?.name ?? modelCard.vfolderId
                  }
                />
              </BAIFlex>
            </Form.Item>
          ) : (
            <Form.Item label={t('adminModelCard.ModelStorageFolder')} required>
              <BAIFlex gap="xs" align="center">
                <Suspense fallback={<Input disabled style={{ flex: 1 }} />}>
                  <Form.Item
                    name="vfolderId"
                    noStyle
                    rules={[
                      {
                        required: true,
                        message: t('adminModelCard.VFolderRequired'),
                      },
                    ]}
                  >
                    <BAIVFolderSelect
                      ref={vfolderSelectRef}
                      excludeDeleted
                      currentProjectId={currentProject.id ?? undefined}
                      filter={mergeFilterValues(['ownership_type == "group"'])}
                      style={{ flex: 1 }}
                    />
                  </Form.Item>
                </Suspense>
                {isModelStoreProject ? (
                  <BAIButton
                    icon={<PlusIcon size={16} />}
                    onClick={() => setIsOpenCreateFolderModal(true)}
                  />
                ) : (
                  <Popconfirm
                    title={t(
                      'importArtifactRevisionToFolderModal.ModelStoreProjectRequired',
                    )}
                    description={t(
                      'importArtifactRevisionToFolderModal.ModelStoreProjectRequiredDescription',
                    )}
                    okText={t('button.ChangeProject')}
                    cancelText={t('button.Cancel')}
                    onConfirm={() => {
                      if (modelStoreProject?.id && modelStoreProject?.name) {
                        startTransition(() => {
                          setCurrentProject({
                            projectId: modelStoreProject.id!,
                            projectName: modelStoreProject.name!,
                          });
                          message.success(
                            t(
                              'importArtifactRevisionToFolderModal.CurrentProjectChangedSuccessfully',
                            ),
                          );
                          setIsOpenCreateFolderModal(true);
                        });
                      } else {
                        message.error(
                          t(
                            'importArtifactRevisionToFolderModal.FailedToRetrieveModelStoreProject',
                          ),
                        );
                      }
                    }}
                  >
                    <Button icon={<PlusIcon size={16} />} />
                  </Popconfirm>
                )}
              </BAIFlex>
            </Form.Item>
          )}

          {isEditMode ? (
            <Form.Item label={t('adminModelCard.Domain')}>
              <Typography.Text>{modelCard.domainName}</Typography.Text>
            </Form.Item>
          ) : (
            <Suspense
              fallback={
                <Form.Item name="domainName" label={t('adminModelCard.Domain')}>
                  <Input disabled />
                </Form.Item>
              }
            >
              <Form.Item name="domainName" label={t('adminModelCard.Domain')}>
                <BAIDomainSelect />
              </Form.Item>
            </Suspense>
          )}

          <Form.Item
            name="author"
            label={t('adminModelCard.Author')}
            tooltip={t('adminModelCard.AuthorTooltip')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="title"
            label={t('adminModelCard.Title')}
            tooltip={t('adminModelCard.TitleTooltip')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="modelVersion"
            label={t('adminModelCard.ModelVersion')}
            tooltip={t('adminModelCard.ModelVersionTooltip')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('adminModelCard.Description')}
            tooltip={t('adminModelCard.DescriptionTooltip')}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="task"
            label={t('adminModelCard.Task')}
            tooltip={t('adminModelCard.TaskTooltip')}
          >
            <Input placeholder={t('adminModelCard.TaskPlaceholder')} />
          </Form.Item>

          <Form.Item
            name="category"
            label={t('adminModelCard.Category')}
            tooltip={t('adminModelCard.CategoryTooltip')}
          >
            <Input placeholder={t('adminModelCard.CategoryPlaceholder')} />
          </Form.Item>

          <Form.Item
            name="architecture"
            label={t('adminModelCard.Architecture')}
            tooltip={t('adminModelCard.ArchitectureTooltip')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="framework"
            label={t('adminModelCard.Framework')}
            tooltip={t('adminModelCard.FrameworkTooltip')}
          >
            <Select
              mode="tags"
              placeholder={t('adminModelCard.AddFramework')}
              notFoundContent={null}
            />
          </Form.Item>

          <Form.Item
            name="label"
            label={t('adminModelCard.Label')}
            tooltip={t('adminModelCard.LabelTooltip')}
          >
            <Select
              mode="tags"
              placeholder={t('adminModelCard.AddLabel')}
              notFoundContent={null}
            />
          </Form.Item>

          <Form.Item
            name="license"
            label={t('adminModelCard.License')}
            tooltip={t('adminModelCard.LicenseTooltip')}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="readme"
            label="README.md"
            tooltip={t('adminModelCard.ReadmeTooltip')}
          >
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item
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
            <Select
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
          </Form.Item>
        </Form>
      </BAIModal>
      <FolderCreateModal
        open={isOpenCreateFolderModal}
        initialValidate={true}
        initialValues={{
          usage_mode: 'model',
          type: 'project',
          permission: 'ro',
          cloneable: true,
        }}
        hiddenFormItems={[
          'usage_mode_general',
          'usage_mode_automount',
          'type_user',
          'permission_rw',
        ]}
        onRequestClose={(result) => {
          setIsOpenCreateFolderModal(false);
          if (result) {
            formRef.current?.setFieldsValue({
              vfolderId: toGlobalId(
                'VirtualFolderNode',
                convertToUUID(result.id),
              ),
            });
            vfolderSelectRef.current?.refetch();
          }
        }}
      />
    </>
  );
};

export default AdminModelCardSettingModal;
