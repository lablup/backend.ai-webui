import DeploymentRevisionRuntimeAndMountFormItem from './DeploymentRevisionRuntimeAndMountFormItem';
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from './ImageEnvironmentSelectFormItems';
import ResourceAllocationFormItems, {
  AUTOMATIC_DEFAULT_SHMEM,
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
  ResourceAllocationFormValue,
} from './SessionFormItems/ResourceAllocationFormItems';
import { VFolderTableFormValues } from './VFolderTableFormItem';
import { Form, Input, FormInstance, App } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  compareNumberWithUnits,
  convertToBinaryUnit,
} from 'backend.ai-ui';
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
          resourceSlots {
            entries {
              resourceType
              quantity
            }
          }
          resourceOpts {
            entries {
              name
              value
            }
          }
          resourceGroup {
            name
          }
        }
        modelRuntimeConfig {
          runtimeVariant
          inferenceRuntimeConfig
          environ {
            entries {
              name
              value
            }
          }
        }
        modelMountConfig {
          vfolder {
            id
            name
          }
          mountDestination
          definitionPath
        }
        extraMounts @since(version: "25.19.0") {
          vfolderId
          mountDestination
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
        resource: (() => {
          // Convert entries arrays to key-value objects for compatibility
          const slotsObj = _.fromPairs(
            _.map(revision?.resourceConfig?.resourceSlots?.entries, (e) => [
              e.resourceType,
              e.quantity,
            ]),
          );
          const optsObj = _.fromPairs(
            _.map(revision?.resourceConfig?.resourceOpts?.entries, (e) => [
              e.name,
              e.value,
            ]),
          );
          return {
            cpu: parseInt(slotsObj?.cpu || '0') || 0,
            mem:
              convertToBinaryUnit(slotsObj?.mem || '0g', 'g', 3, true)?.value ||
              '0g',
            shmem:
              convertToBinaryUnit(
                optsObj?.shmem || AUTOMATIC_DEFAULT_SHMEM,
                'g',
                3,
                true,
              )?.value || AUTOMATIC_DEFAULT_SHMEM,
            ...getAIAcceleratorWithStringifiedKey(
              _.omit(slotsObj, ['cpu', 'mem']),
            ),
          };
        })(),
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
                  // Convert EnvironmentVariables entries to key-value object
                  _.fromPairs(
                    _.map(
                      revision?.modelRuntimeConfig?.environ?.entries,
                      (e) => [e.name, e.value],
                    ),
                  ) as any,
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
      mutation RevisionCreationModalMutation($input: AddRevisionInput!) {
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
                id: values.environments.image?.id || '',
              },
              modelRuntimeConfig: {
                runtimeVariant: values.modelRuntimeConfig.runtimeVariant,
                inferenceRuntimeConfig: serializeModelRuntimeConfig(
                  values.modelRuntimeConfig?.inferenceRuntimeConfig,
                ),
                environ: (() => {
                  const environValue = values.modelRuntimeConfig?.environ;
                  if (!environValue) return undefined;
                  const rawEntries = environValue as unknown as Array<{
                    variable: string;
                    value: string;
                  }>;
                  if (!_.isArray(rawEntries)) return undefined;
                  const entries = _.map(rawEntries, (v) => ({
                    name: v.variable,
                    value: v.value,
                  }));
                  return entries.length > 0 ? { entries } : undefined;
                })(),
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
                resourceSlots: {
                  entries: [
                    {
                      resourceType: 'cpu',
                      quantity: String(values.resource.cpu),
                    },
                    {
                      resourceType: 'mem',
                      quantity: String(values.resource.mem),
                    },
                    ...((values.resource.accelerator ?? 0) > 0
                      ? [
                          {
                            resourceType: String(
                              values.resource.acceleratorType,
                            ),
                            quantity: String(values.resource.accelerator),
                          },
                        ]
                      : []),
                  ],
                },
                resourceOpts: values.resource.shmem
                  ? {
                      entries: [
                        {
                          name: 'shmem',
                          value:
                            compareNumberWithUnits(values.resource.mem, '4g') >
                              0 &&
                            compareNumberWithUnits(
                              values.resource.shmem,
                              '1g',
                            ) < 0
                              ? '1g'
                              : values.resource.shmem,
                        },
                      ],
                    }
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
      .catch(() => {});
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
          initialVfolderId={revision?.modelMountConfig?.vfolder?.id}
        />
        <ResourceAllocationFormItems enableResourcePresets />
      </Form>
    </BAIModal>
  );
};

export default RevisionCreationModal;
