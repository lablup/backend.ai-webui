import BAIModal, { BAIModalProps } from './BAIModal';
import DeploymentRevisionRuntimeAndMountFormItem from './DeploymentRevisionRuntimeAndMountFormItem';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import ResourceAllocationFormItems, {
  AUTOMATIC_DEFAULT_SHMEM,
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
} from './ResourceAllocationFormItems';
import { VFolderTableFormValues } from './VFolderTableFormItem';
import { Form, Input, FormInstance, App } from 'antd';
import { compareNumberWithUnits, convertToBinaryUnit } from 'backend.ai-ui';
import _ from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';
import { RevisionCreationModalFragment$key } from 'src/__generated__/RevisionCreationModalFragment.graphql';
import {
  RevisionCreationModalMutation$variables,
  RevisionCreationModalMutation,
} from 'src/__generated__/RevisionCreationModalMutation.graphql';
import {
  getAIAcceleratorWithStringifiedKey,
  getImageFullName,
  parseModelRuntimeConfig,
  serializeModelRuntimeConfig,
} from 'src/helper';
import { useSuspendedBackendaiClient } from 'src/hooks';
import {
  DEFAULT_ENVIRONMENTS,
  DEFAULT_INITIAL_REVISION,
} from 'src/pages/DeploymentLauncherPage';

interface RevisionCreationModalProps extends BAIModalProps {
  open: boolean;
  deploymentId: string;
  revisionFrgmt?: RevisionCreationModalFragment$key | null;
  onRequestClose(success?: boolean): void;
}

type RevisionCreationFormValue =
  RevisionCreationModalMutation$variables['input'] &
    ImageEnvironmentFormInput &
    ResourceAllocationFormValue &
    VFolderTableFormValues;

const RevisionCreationModal: React.FC<RevisionCreationModalProps> = ({
  open,
  deploymentId,
  revisionFrgmt = null,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<RevisionCreationFormValue>>(null);
  const baiClient = useSuspendedBackendaiClient();

  const revision = useFragment<RevisionCreationModalFragment$key>(
    graphql`
      fragment RevisionCreationModalFragment on ModelRevision {
        id
        name
        clusterConfig {
          mode
          size
        }
        resourceConfig {
          resourceSlots
          resourceOpts
          resourceGroup {
            name
          }
        }
        modelRuntimeConfig {
          runtimeVariant
          inferenceRuntimeConfig
          environ
        }
        modelMountConfig {
          vfolder {
            id
            name
          }
          mountDestination
          definitionPath
        }
        extraMounts {
          edges {
            node {
              id
              mountDestination
            }
          }
        }
        image {
          id
          name
          namespace
          tag
          version
          architecture
          registry
        }
      }
    `,
    revisionFrgmt,
  );

  const INITIAL_FORM_VALUES = revision
    ? {
        ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
        ...revision,
        resourceGroup: revision.resourceConfig?.resourceGroup?.name,
        cluster_mode:
          revision.clusterConfig?.mode === 'MULTI_NODE'
            ? 'multi-node'
            : 'single-node',
        cluster_size: revision.clusterConfig?.size || 1,
        resource: {
          cpu:
            parseInt(
              JSON.parse(revision?.resourceConfig?.resourceSlots || '{}')
                ?.cpu || '0',
            ) || 0,
          mem:
            convertToBinaryUnit(
              JSON.parse(revision?.resourceConfig?.resourceSlots || '{}')
                ?.mem || '0g',
              'g',
              3,
              true,
            )?.value || '0g',
          shmem:
            convertToBinaryUnit(
              JSON.parse(revision?.resourceConfig?.resourceOpts || '{}')
                ?.shmem || AUTOMATIC_DEFAULT_SHMEM,
              'g',
              3,
              true,
            )?.value || AUTOMATIC_DEFAULT_SHMEM,
          ...getAIAcceleratorWithStringifiedKey(
            _.omit(
              JSON.parse(revision?.resourceConfig?.resourceSlots || '{}'),
              ['cpu', 'mem'],
            ),
          ),
        },
        mount_ids: [],
        mount_id_map: {},
        environments: revision?.image
          ? {
              environment:
                revision?.image?.namespace || revision?.image?.name || '',
              version: `${revision.image.registry}/${
                revision.image.namespace || revision.image.name
              }:${revision.image.tag || revision.image.version}@${
                revision.image.architecture
              }`,
              image: revision.image,
              manual: '',
              customizedTag: '',
            }
          : DEFAULT_ENVIRONMENTS,
        initialRevision: revision
          ? _.merge({}, DEFAULT_INITIAL_REVISION, {
              name: revision.name || '',
              image: revision.image,
              modelRuntimeConfig: {
                // ...revision.modelRuntimeConfig,
                inferenceRuntimeConfig: parseModelRuntimeConfig(
                  revision?.modelRuntimeConfig?.inferenceRuntimeConfig,
                ),
                environ: serializeModelRuntimeConfig(
                  revision?.modelRuntimeConfig?.environ,
                ),
              },
              modelMountConfig: revision.modelMountConfig,
            })
          : DEFAULT_INITIAL_REVISION,
        // ...revision,
      }
    : {
        metadata: { name: '', tags: [] },
        networkAccess: { openToPublic: false },
        deploymentStrategy: { type: 'ROLLING' },
        desiredReplicaCount: 1,
        mount_ids: [],
        mount_id_map: {},
        ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
        environments: baiClient?._config?.default_session_environment
          ? _.assign({}, DEFAULT_ENVIRONMENTS, {
              environment: baiClient._config.default_session_environment,
            })
          : DEFAULT_ENVIRONMENTS,
      };

  const [commitAddRevision, isInFlightAddRevision] =
    useMutation<RevisionCreationModalMutation>(graphql`
      mutation RevisionCreationModalMutation($input: AddModelRevisionInput!) {
        addModelRevision(input: $input) {
          revision {
            id
          }
        }
      }
    `);

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        commitAddRevision({
          variables: {
            input: {
              name: values.name,
              deploymentId: deploymentId,
              image: {
                name:
                  values.environments.manual ||
                  getImageFullName(values.environments.image) ||
                  values.image.name,
                architecture:
                  values.environments.image?.architecture ||
                  values.image.architecture ||
                  'x86_64',
              },
              modelRuntimeConfig: {
                runtimeVariant: values.modelRuntimeConfig.runtimeVariant,
                inferenceRuntimeConfig: serializeModelRuntimeConfig(
                  values.modelRuntimeConfig?.inferenceRuntimeConfig,
                ),
                environ: serializeModelRuntimeConfig(
                  values.modelRuntimeConfig?.environ,
                ),
              },
              modelMountConfig: {
                ...values.modelMountConfig,
                mountDestination:
                  values.modelMountConfig.mountDestination || '/models',
                definitionPath:
                  values.modelMountConfig.definitionPath ||
                  'model-definition.yaml',
              },
              extraMounts:
                values.mount_ids?.map((vfolderId) => ({
                  vfolderId: vfolderId,
                  mountDestination:
                    values.mount_id_map?.[vfolderId] ||
                    `/home/work/${vfolderId}`,
                })) || [],
              clusterConfig: {
                mode:
                  values.cluster_mode === 'single-node'
                    ? 'SINGLE_NODE'
                    : 'MULTI_NODE',
                size: values.cluster_size,
              },
              resourceConfig: {
                resourceGroup: {
                  name: values.resourceGroup,
                },
                resourceSlots: JSON.stringify({
                  cpu: values.resource.cpu,
                  mem: values.resource.mem,
                  ...(values.resource.accelerator > 0
                    ? {
                        [values.resource.acceleratorType]:
                          values.resource.accelerator,
                      }
                    : undefined),
                }),
                resourceOpts: values.resource.shmem
                  ? JSON.stringify({
                      shmem:
                        compareNumberWithUnits(values.resource.mem, '4g') > 0 &&
                        compareNumberWithUnits(values.resource.shmem, '1g') < 0
                          ? '1g'
                          : values.resource.shmem,
                    })
                  : undefined,
              },
            },
          },
          onCompleted: (res, errors) => {
            if (_.isEmpty(res?.addModelRevision?.revision?.id)) {
              message.error(t('deployment.launcher.DeploymentCreationFailed'));
              return;
            }
            if (errors && errors.length > 0) {
              const errorMsgList = _.map(errors, (error) => error.message);
              for (const error of errorMsgList) {
                message.error(error);
              }
            } else {
              message.success(t('deployment.launcher.DeploymentCreated'));
              onRequestClose(true);
            }
          },
          onError: (err) => {
            message.error(
              err.message || t('deployment.launcher.DeploymentCreationFailed'),
            );
          },
        });
      })
      .catch((error) => {
        console.error('Validation failed:', error);
      });
  };

  return (
    <BAIModal
      title={
        !revisionFrgmt
          ? t('deployment.CreateNewRevision')
          : t('deployment.CreateRevisionFromSelected')
      }
      open={open}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      okText={t('button.Create')}
      cancelText={t('button.Cancel')}
      confirmLoading={isInFlightAddRevision}
      width={600}
      destroyOnClose
      {...baiModalProps}
    >
      <Form ref={formRef} layout="vertical" initialValues={INITIAL_FORM_VALUES}>
        <Form.Item name="name" label={t('deployment.launcher.RevisionName')}>
          <Input
            placeholder={t('deployment.launcher.RevisionNamePlaceholder')}
          />
        </Form.Item>
        <ImageEnvironmentSelectFormItems showPrivate />
        <DeploymentRevisionRuntimeAndMountFormItem
          initialVfolderId={revision?.modelMountConfig.vfolder.id}
        />
        <ResourceAllocationFormItems enableResourcePresets />
      </Form>
    </BAIModal>
  );
};

export default RevisionCreationModal;
