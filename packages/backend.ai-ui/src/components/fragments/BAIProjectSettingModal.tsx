import { BAIProjectResourcePolicySelect, BAIResourceGroupSelect } from '.';
import {
  BAIAllowedHostNamesSelect,
  BAIDynamicUnitInputNumber,
  ResourceSlotName,
} from '..';
import { BAIProjectSettingModalAllowResourceGroupsMutation } from '../../__generated__/BAIProjectSettingModalAllowResourceGroupsMutation.graphql';
import { BAIProjectSettingModalCreateMutation } from '../../__generated__/BAIProjectSettingModalCreateMutation.graphql';
import { BAIProjectSettingModalFragment$key } from '../../__generated__/BAIProjectSettingModalFragment.graphql';
import { BAIProjectSettingModalModifyMutation } from '../../__generated__/BAIProjectSettingModalModifyMutation.graphql';
import { BAIProjectSettingModalQuery } from '../../__generated__/BAIProjectSettingModalQuery.graphql';
import { App } from '../../app-shim';
import { Form, FormInstance } from '../../form-engine';
import { convertToBinaryUnit } from '../../helper';
import { useErrorMessageResolver } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAICheckbox from '../BAICheckbox';
import BAIModal, { BAIModalProps } from '../BAIModal';
import BAINumberInput from '../BAINumberInput';
import BAITextArea from '../BAITextArea';
import BAITextInput from '../BAITextInput';
import { useBAIResourceSlots } from '../provider';
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { HStack } from '@lablup/ui-common/Stack';
import * as _ from 'lodash-es';
import { useDeferredValue, useRef } from 'react';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

export interface BAIProjectSettingModalProps extends Omit<
  BAIModalProps,
  'title' | 'loading'
> {
  projectFragment: BAIProjectSettingModalFragment$key | null;
}

interface FormValues {
  name: string;
  type?: string;
  description?: string;
  is_active?: boolean;
  total_resource_slots?: string;
  allowed_vfolder_hosts?: string;
  integration_id?: string;
  resource_policy?: string;
  container_registry?: string;
  scaling_groups?: string[];
  allowedVfolderHostNames?: string[];
  registry?: string;
  project?: string;
}

export type BAIProjectSettingModalFragmentKey =
  BAIProjectSettingModalFragment$key;

const BAIProjectSettingModal = ({
  projectFragment,
  ...modalProps
}: BAIProjectSettingModalProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const deferredOpen = useDeferredValue(modalProps.open);
  const { resourceSlots, deviceMetaData } = useBAIResourceSlots();
  const form = useRef<FormInstance<FormValues>>(null);
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useConnectedBAIClient();

  const project = useFragment<BAIProjectSettingModalFragment$key>(
    graphql`
      fragment BAIProjectSettingModalFragment on GroupNode {
        id
        row_id
        name
        description
        is_active
        total_resource_slots
        allowed_vfolder_hosts
        integration_id
        resource_policy
        type
        container_registry
        scaling_groups
      }
    `,
    projectFragment,
  );

  const { vfolder_host_permissions } =
    useLazyLoadQuery<BAIProjectSettingModalQuery>(
      graphql`
        query BAIProjectSettingModalQuery {
          vfolder_host_permissions {
            vfolder_host_permission_list
          }
        }
      `,
      {},
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
      },
    );

  // TODO(needs-backend): #11078 Create/UpdateProjectInput lack resource slots,
  // vfolder hosts, registry and is_active; create/edit stay on *_group.
  const [commitCreateProject, isInFlightCreateProject] =
    useMutation<BAIProjectSettingModalCreateMutation>(graphql`
      mutation BAIProjectSettingModalCreateMutation(
        $name: String!
        $props: GroupInput!
      ) {
        create_group(name: $name, props: $props) {
          ok
          msg
          group {
            id
          }
        }
      }
    `);

  const [commitAllowResourceGroups, isInFlightAllowResourceGroups] =
    useMutation<BAIProjectSettingModalAllowResourceGroupsMutation>(graphql`
      mutation BAIProjectSettingModalAllowResourceGroupsMutation(
        $input: UpdateAllowedResourceGroupsForProjectInput!
      ) {
        adminUpdateAllowedResourceGroupsForProjectV2(input: $input) {
          items
        }
      }
    `);

  const [commitModifyProject, isInFlightModifyProject] =
    useMutation<BAIProjectSettingModalModifyMutation>(graphql`
      mutation BAIProjectSettingModalModifyMutation(
        $gid: UUID!
        $props: ModifyGroupInput!
        $resourceGroupsInput: UpdateAllowedResourceGroupsForProjectInput!
        $isResourceGroupsUnchanged: Boolean!
      ) {
        modify_group(gid: $gid, props: $props) {
          ok
          msg
          group {
            id
            scaling_groups
          }
        }
        adminUpdateAllowedResourceGroupsForProjectV2(
          input: $resourceGroupsInput
        ) @skip(if: $isResourceGroupsUnchanged) {
          items
        }
      }
    `);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    form.current
      ?.validateFields()
      .then((values) => {
        const allPermissions =
          vfolder_host_permissions?.vfolder_host_permission_list;
        const allowedVfolderHosts =
          _.fromPairs(
            _.map(values?.allowedVfolderHostNames, (host) => [
              host,
              _.get(
                JSON.parse(project?.allowed_vfolder_hosts || '{}'),
                host,
                allPermissions,
              ),
            ]),
          ) ?? {};
        const containerRegistry =
          !_.isEmpty(values?.registry) && !_.isEmpty(values?.project)
            ? {
                registry: values?.registry,
                project: values?.project,
              }
            : {};
        let totalResourceSlots = _.mapValues(
          values?.total_resource_slots,
          (value, key: string) => {
            if (_.includes(key, 'mem') && value) {
              return convertToBinaryUnit(value, '', 0)?.numberFixed;
            }
            return value;
          },
        );
        // A cleared slot is dropped: the manager replaces the whole JSON, so
        // an absent key removes that limit.
        totalResourceSlots = _.omitBy(totalResourceSlots, _.isNil);

        if (!projectFragment) {
          commitCreateProject({
            variables: {
              name: values.name,
              props: _.omit(
                {
                  ...values,
                  domain_name: baiClient._config.domainName,
                  total_resource_slots: JSON.stringify(totalResourceSlots),
                  allowed_vfolder_hosts: JSON.stringify(allowedVfolderHosts),
                  container_registry: JSON.stringify(containerRegistry),
                  is_active: values.is_active ?? false,
                },
                [
                  'name',
                  'scaling_groups',
                  'allowedVfolderHostNames',
                  'registry',
                  'project',
                ],
              ),
            },
            onCompleted: (response, errors) => {
              if (errors && errors.length > 0) {
                errors.forEach((error) =>
                  message.error(
                    getErrorMessage(
                      error,
                      t('comp:BAIProjectSettingModal.FailedToCreateProject'),
                    ),
                  ),
                );
                return;
              }
              if (!response?.create_group?.ok) {
                message.error(
                  response?.create_group?.msg ||
                    t('comp:BAIProjectSettingModal.FailedToCreateProject'),
                );
                return;
              }
              if (!_.isEmpty(values?.scaling_groups)) {
                commitAllowResourceGroups({
                  variables: {
                    input: {
                      projectId: response?.create_group?.group?.id || '',
                      add: values?.scaling_groups,
                    },
                  },
                  onCompleted: (_response, errors) => {
                    if (errors && errors.length > 0) {
                      errors.forEach((error) =>
                        message.error(
                          getErrorMessage(
                            error,
                            t(
                              'comp:BAIProjectSettingModal.FailedToCreateProject',
                            ),
                          ),
                        ),
                      );
                      return;
                    }
                  },
                  onError: () => {
                    message.error(
                      t('comp:BAIProjectSettingModal.FailedToCreateProject'),
                    );
                  },
                });
              }
              message.success(t('comp:BAIProjectSettingModal.ProjectCreated'));
              modalProps.onOk?.(e);
            },
            onError: () => {
              message.error(
                t('comp:BAIProjectSettingModal.FailedToCreateProject'),
              );
            },
          });
        } else {
          const prevResourceGroups = _.compact(project?.scaling_groups);
          const nextResourceGroups = values.scaling_groups ?? [];
          const addResourceGroups = _.difference(
            nextResourceGroups,
            prevResourceGroups,
          );
          const removeResourceGroups = _.difference(
            prevResourceGroups,
            nextResourceGroups,
          );
          commitModifyProject({
            variables: {
              gid: project?.row_id || project?.id || '',
              props: _.omit(
                {
                  ...values,
                  total_resource_slots: JSON.stringify(totalResourceSlots),
                  allowed_vfolder_hosts: JSON.stringify(allowedVfolderHosts),
                  container_registry: JSON.stringify(containerRegistry),
                },
                [
                  'scaling_groups',
                  'allowedVfolderHostNames',
                  'registry',
                  'project',
                ],
              ),
              resourceGroupsInput: {
                projectId: project?.row_id || '',
                add: addResourceGroups,
                remove: removeResourceGroups,
              },
              isResourceGroupsUnchanged:
                _.isEmpty(addResourceGroups) && _.isEmpty(removeResourceGroups),
            },
            onCompleted: (response, errors) => {
              if (errors && errors.length > 0) {
                errors.forEach((error) =>
                  message.error(
                    getErrorMessage(
                      error,
                      t('comp:BAIProjectSettingModal.FailedToUpdateProject'),
                    ),
                  ),
                );
                return;
              }
              if (!response?.modify_group?.ok) {
                message.error(
                  response?.modify_group?.msg ||
                    t('comp:BAIProjectSettingModal.FailedToUpdateProject'),
                );
                return;
              }
              message.success(t('comp:BAIProjectSettingModal.ProjectUpdated'));
              modalProps.onOk?.(e);
            },
            onError: () => {
              message.error(
                t('comp:BAIProjectSettingModal.FailedToUpdateProject'),
              );
            },
          });
        }
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      title={
        !projectFragment
          ? t('comp:BAIProjectSettingModal.CreateProject')
          : t('comp:BAIProjectSettingModal.UpdateProject')
      }
      loading={deferredOpen !== modalProps.open}
      {...modalProps}
      onOk={(e) => handleSubmit(e)}
      okButtonProps={{
        ...modalProps.okButtonProps,
        loading:
          isInFlightCreateProject ||
          isInFlightModifyProject ||
          isInFlightAllowResourceGroups,
      }}
    >
      <Form
        ref={form}
        preserve={false}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          total_resource_slots: _.mapValues(
            JSON.parse(project?.total_resource_slots || '{}'),
            (value, key) => {
              if (_.includes(key, 'mem') && value) {
                return convertToBinaryUnit(value, 'g', 2, true)?.value;
              }
              return value;
            },
          ),
          allowedVfolderHostNames: _.keys(
            JSON.parse(project?.allowed_vfolder_hosts || '{}'),
          ),
          registry: _.get(
            JSON.parse(project?.container_registry || '{}'),
            'registry',
          ),
          project: _.get(
            JSON.parse(project?.container_registry || '{}'),
            'project',
          ),
          name: project?.name,
          description: project?.description,
          resource_policy: project?.resource_policy,
          scaling_groups: project?.scaling_groups,
          is_active: projectFragment ? project?.is_active : true,
        }}
      >
        <Form.Item
          label={t('comp:BAIProjectSettingModal.Name')}
          name="name"
          rules={[
            { required: true },
            {
              pattern: new RegExp(
                '^[\\p{L}\\p{N}]+(?:[-_.][\\p{L}\\p{N}]+)*$',
                'u',
              ),
              message: t('general.validation.LetterNumber-_dot'),
            },
          ]}
        >
          <BAITextInput aria-label={t('comp:BAIProjectSettingModal.Name')} />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIProjectSettingModal.Description')}
          name="description"
        >
          <BAITextArea
            aria-label={t('comp:BAIProjectSettingModal.Description')}
            rows={1}
          />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIProjectSettingModal.ProjectResourcePolicy')}
          name="resource_policy"
        >
          <BAIProjectResourcePolicySelect />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIProjectSettingModal.AllowedResourceGroups')}
          name="scaling_groups"
        >
          <BAIResourceGroupSelect mode="tags" allowClear />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIProjectSettingModal.AllowedFolderHosts')}
          name="allowedVfolderHostNames"
        >
          <BAIAllowedHostNamesSelect mode="multiple" allowClear />
        </Form.Item>
        {_.map(_.chunk(_.keys(resourceSlots), 2), (resourceSlotKeys) => (
          <>
            {_.map(resourceSlotKeys, (resourceSlotKey) => (
              <Form.Item
                label={t(
                  'comp:BAIProjectSettingModal.MaxAllowedResourceSlots',
                  {
                    resourceKey: _.get(deviceMetaData, resourceSlotKey)
                      ?.description,
                  },
                )}
                name={['total_resource_slots', resourceSlotKey]}
                rules={[
                  {
                    validator(__, value) {
                      if (
                        _.includes(resourceSlotKey, 'mem') &&
                        value &&
                        (convertToBinaryUnit(value, 'p')?.number ?? 0) >
                          (convertToBinaryUnit('300p', 'p')?.number ?? 0)
                      ) {
                        return Promise.reject(
                          new Error(
                            t(
                              'comp:BAIProjectSettingModal.MemorySizeShouldBeLessThan300PiB',
                            ),
                          ),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                {_.includes(resourceSlotKey, 'mem') ? (
                  <BAIDynamicUnitInputNumber
                    defaultUnit="g"
                    max="300p"
                    hasClear
                    style={{ width: '100%' }}
                  />
                ) : (
                  <BAINumberInput
                    width="100%"
                    aria-label={resourceSlotKey}
                    min={0}
                    hasClear
                    units={
                      resourceSlots?.[resourceSlotKey as ResourceSlotName]
                        ?.display_unit ?? undefined
                    }
                  />
                )}
              </Form.Item>
            ))}
          </>
        ))}
        <Form.Item
          label={t(
            'comp:BAIProjectSettingModal.ContainerRegistryForImageCommit',
          )}
          tooltip={t('comp:BAIProjectSettingModal.ContainerMustBeSpecified')}
          name="container_registry"
          rules={[
            ({ getFieldValue }) => ({
              validator() {
                if (
                  (getFieldValue('registry') && !getFieldValue('project')) ||
                  (!getFieldValue('registry') && getFieldValue('project'))
                ) {
                  return Promise.reject(
                    new Error(
                      t(
                        'comp:BAIProjectSettingModal.PleaseEnterBothRegistryAndProject',
                      ),
                    ),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          {/* `TextInput`'s field wrapper is a block, so the two inputs need an
              explicit row to sit side by side (QA-FINDINGS Q-29). */}
          <HStack gap={2} align="start" width="100%">
            <Form.Item
              name="registry"
              noStyle
              rules={[
                {
                  pattern: /^[a-zA-Z0-9.:/_-]*$/,
                  message: t('general.validation.LetterNumber:/-_dot'),
                },
              ]}
            >
              <BAITextInput
                aria-label={t('comp:BAIProjectSettingModal.Registry')}
                placeholder={t('comp:BAIProjectSettingModal.Registry')}
                width="100%"
              />
            </Form.Item>
            <Form.Item
              name="project"
              noStyle
              rules={[
                {
                  pattern: /^[a-zA-Z0-9./_-]*$/,
                  message: t('general.validation.LetterNumber:/-_dot'),
                },
              ]}
            >
              <BAITextInput
                aria-label={t('comp:BAIProjectSettingModal.Project')}
                placeholder={t('comp:BAIProjectSettingModal.Project')}
                width="100%"
              />
            </Form.Item>
          </HStack>
        </Form.Item>
        <Form.Item valuePropName="checked" name="is_active">
          <BAICheckbox>{t('comp:BAIProjectSettingModal.IsActive')}</BAICheckbox>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default BAIProjectSettingModal;
