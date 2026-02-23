/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import FolderCreateModal from './FolderCreateModal';
import { useToggle } from 'ahooks';
import {
  Alert,
  App,
  Button,
  Form,
  FormInstance,
  Popconfirm,
  theme,
} from 'antd';
import {
  BAIModalProps,
  BAIVFolderSelectRef,
  BAIModal,
  BAIFlex,
  BAIVFolderSelect,
  toGlobalId,
  convertToUUID,
  useBAILogger,
  toLocalId,
  mergeFilterValues,
} from 'backend.ai-ui';
import _ from 'lodash';
import { PlusIcon } from 'lucide-react';
import { startTransition, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation, useFragment } from 'react-relay';
import { ImportArtifactRevisionToFolderModalArtifactRevisionFragment$key } from 'src/__generated__/ImportArtifactRevisionToFolderModalArtifactRevisionFragment.graphql';
import { ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$key } from 'src/__generated__/ImportArtifactRevisionToFolderModalModelStoreProjectsFragment.graphql';
import { ImportArtifactRevisionToFolderModalMutation } from 'src/__generated__/ImportArtifactRevisionToFolderModalMutation.graphql';
import {
  useCurrentProjectValue,
  useSetCurrentProject,
} from 'src/hooks/useCurrentProject';

export interface ImportArtifactRevisionToFolderModalProps extends Omit<
  BAIModalProps,
  'onOk'
> {
  selectedArtifactRevisionFrgmt: ImportArtifactRevisionToFolderModalArtifactRevisionFragment$key;
  modelStoreProjectsFrgmt?: ImportArtifactRevisionToFolderModalModelStoreProjectsFragment$key;
  onOk?: (
    e: React.MouseEvent<HTMLElement>,
    tasks: {
      taskId: string;
      version: string;
      artifact: {
        id: string;
        name: string;
      };
    }[],
    vfolderId: string,
  ) => void;
}

type ImportArtifactRevisionToFolderModalInput = {
  vfolderId: string;
};

const ImportArtifactRevisionToFolderModal = ({
  selectedArtifactRevisionFrgmt,
  modelStoreProjectsFrgmt,
  onOk,
  ...modalProps
}: ImportArtifactRevisionToFolderModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const formRef =
    useRef<FormInstance<ImportArtifactRevisionToFolderModalInput>>(null);
  const vfolderSelectRef = useRef<BAIVFolderSelectRef>(null);
  const [isOpenCreateModal, { toggle: toggleIsOpenCreateModal }] =
    useToggle(false);

  const { logger } = useBAILogger();
  const currentProject = useCurrentProjectValue();
  const setCurrentProject = useSetCurrentProject();

  const selectedArtifactRevisions = useFragment(
    graphql`
      fragment ImportArtifactRevisionToFolderModalArtifactRevisionFragment on ArtifactRevision
      @relay(plural: true) {
        id @required(action: THROW)
      }
    `,
    selectedArtifactRevisionFrgmt,
  );

  const modelStoreProject = useFragment(
    graphql`
      fragment ImportArtifactRevisionToFolderModalModelStoreProjectsFragment on Group {
        id
        name
      }
    `,
    modelStoreProjectsFrgmt,
  );

  const [importArtifacts, isInflightImportArtifacts] =
    useMutation<ImportArtifactRevisionToFolderModalMutation>(graphql`
      mutation ImportArtifactRevisionToFolderModalMutation(
        $input: ImportArtifactsInput!
      ) {
        importArtifacts(input: $input) {
          artifactRevisions {
            count
          }
          tasks {
            taskId
            artifactRevision {
              id
              version
              size
              artifact {
                id
                name
              }
            }
          }
        }
      }
    `);

  const selectedArtifactRevisionIds = _.map(
    selectedArtifactRevisions,
    (revision) => revision.id,
  );

  return (
    <>
      <BAIModal
        title={t('importArtifactRevisionToFolderModal.ImportToFolder')}
        okText={t('importArtifactRevisionToFolderModal.Import')}
        centered
        destroyOnHidden
        {...modalProps}
        okButtonProps={{
          loading: isInflightImportArtifacts,
          disabled:
            isInflightImportArtifacts || _.isEmpty(selectedArtifactRevisions),
        }}
        onOk={(e) => {
          formRef.current
            ?.validateFields()
            .then((values) => {
              if (_.isEmpty(selectedArtifactRevisions)) {
                message.error(
                  t('importArtifactRevisionToFolderModal.NoArtifactsSelected'),
                );
                return;
              }

              importArtifacts({
                variables: {
                  input: {
                    artifactRevisionIds: _.map(
                      selectedArtifactRevisionIds,
                      (id) => toLocalId(id),
                    ),
                    vfolderId: values.vfolderId
                      ? toLocalId(values.vfolderId)
                      : null,
                    options: {
                      force: true,
                    },
                  },
                },
                onCompleted: (res, errors) => {
                  if (errors && errors.length > 0) {
                    errors.forEach((err) =>
                      message.error(
                        err.message ??
                          t(
                            'importArtifactRevisionToFolderModal.FailedToImport',
                          ),
                      ),
                    );
                    return;
                  }

                  if (
                    res.importArtifacts.artifactRevisions?.count > 0 &&
                    !_.some(
                      res.importArtifacts.tasks,
                      (task) => _.toNumber(task?.artifactRevision?.size) === 0,
                    )
                  ) {
                    message.success(
                      t(
                        'importArtifactRevisionToFolderModal.SuccessfullyImported',
                      ),
                    );

                    const tasks = res.importArtifacts.tasks
                      .filter((task) => task.taskId != null)
                      .map((task) => ({
                        taskId: task.taskId!,
                        version: task.artifactRevision.version,
                        artifact: {
                          id: toLocalId(task.artifactRevision.artifact.id),
                          name: task.artifactRevision.artifact.name,
                        },
                      }));

                    onOk?.(e, tasks, values.vfolderId);
                  } else {
                    message.error(
                      t('importArtifactRevisionToFolderModal.FailedToImport'),
                    );
                  }
                },
                onError: (error) => {
                  message.error(
                    error.message ??
                      t('importArtifactRevisionToFolderModal.FailedToImport'),
                  );
                },
              });
            })
            .catch((error) => {
              logger.error(
                'ImportArtifactRevisionToFolderModal: Form validation failed',
                {
                  error,
                },
              );
            });
        }}
      >
        <Form
          ref={formRef}
          layout="vertical"
          preserve={false}
          validateTrigger={['onChange', 'onBlur']}
        >
          <BAIFlex direction="column" align="stretch">
            <Alert
              type="warning"
              title={t('importArtifactRevisionToFolderModal.OverwriteWarning')}
              showIcon
              style={{ marginBottom: token.marginMD }}
            />
            <Form.Item
              label={t(
                'importArtifactRevisionToFolderModal.FolderMountForModelStore',
              )}
              name="vfolderId"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <BAIFlex gap="xs" align="center">
                <Form.Item name="vfolderId" noStyle>
                  <BAIVFolderSelect
                    ref={vfolderSelectRef}
                    excludeDeleted
                    // model-store-exclusive project folders only
                    filter={mergeFilterValues([
                      'ownership_type == "group"',
                      modelStoreProject?.id
                        ? `group == "${modelStoreProject.id}"`
                        : null,
                    ])}
                  />
                </Form.Item>
                {currentProject.id === modelStoreProject?.id ? (
                  <Button
                    icon={<PlusIcon />}
                    onClick={() => {
                      toggleIsOpenCreateModal();
                    }}
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
                      if (
                        modelStoreProject &&
                        modelStoreProject.id &&
                        modelStoreProject.name
                      ) {
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
                          toggleIsOpenCreateModal();
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
                    <Button icon={<PlusIcon />} />
                  </Popconfirm>
                )}
              </BAIFlex>
            </Form.Item>
          </BAIFlex>
        </Form>
      </BAIModal>
      <FolderCreateModal
        open={isOpenCreateModal}
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
          toggleIsOpenCreateModal();
          if (result) {
            // Set the created folder as the selected value in the vfolderId
            // TODO: FolderCreateModal returns id without '-'.
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

export default ImportArtifactRevisionToFolderModal;
