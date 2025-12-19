import {
  BAIDomainSelector,
  BAIProjectResourcePolicySelector,
  BAIResourceGroupSelect,
} from '.';
import {
  BAIAllowedHostNamesSelect,
  BAIDynamicUnitInputNumber,
  ResourceSlotName,
} from '..';
import { BAIProjectSettingModalAssociateMutation } from '../../__generated__/BAIProjectSettingModalAssociateMutation.graphql';
import { BAIProjectSettingModalCreateMutation } from '../../__generated__/BAIProjectSettingModalCreateMutation.graphql';
import { BAIProjectSettingModalFragment$key } from '../../__generated__/BAIProjectSettingModalFragment.graphql';
import { BAIProjectSettingModalModifyMutation } from '../../__generated__/BAIProjectSettingModalModifyMutation.graphql';
import { BAIProjectSettingModalQuery } from '../../__generated__/BAIProjectSettingModalQuery.graphql';
import { convertToBinaryUnit } from '../../helper';
import { useErrorMessageResolver, useResourceSlotsDetails } from '../../hooks';
import BAIModal, { BAIModalProps } from '../BAIModal';
import { App, Checkbox, Form, Input, InputNumber, theme } from 'antd';
import _ from 'lodash';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

export interface BAIProjectSettingModalProps
  extends Omit<BAIModalProps, 'title' | 'loading'> {
  projectFragment: BAIProjectSettingModalFragment$key | null;
}

interface FormValues {
  name: string;
  type?: string;
  description?: string;
  is_active?: boolean;
  domain_name: string;
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
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const deferredOpen = useDeferredValue(modalProps.open);
  const { resourceSlotsInRG, deviceMetaData } = useResourceSlotsDetails();
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const project = useFragment<BAIProjectSettingModalFragment$key>(
    graphql`
      fragment BAIProjectSettingModalFragment on GroupNode {
        id
        row_id
        name
        description
        is_active
        domain_name
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

  const [commitAssociateProjects, isInFlightAssociateProjects] =
    useMutation<BAIProjectSettingModalAssociateMutation>(graphql`
      mutation BAIProjectSettingModalAssociateMutation(
        $scaling_groups: [String]!
        $user_group: UUID!
      ) {
        associate_scaling_groups_with_user_group(
          scaling_groups: $scaling_groups
          user_group: $user_group
        ) {
          ok
          msg
        }
      }
    `);

  const [commitModifyProject, isInFlightModifyProject] =
    useMutation<BAIProjectSettingModalModifyMutation>(graphql`
      mutation BAIProjectSettingModalModifyMutation(
        $gid: UUID!
        $props: ModifyGroupInput!
        $scaling_groups: [String]!
        $isFetchedResourceGroupsEmpty: Boolean!
        $isResourceGroupsEmpty: Boolean!
      ) {
        modify_group(gid: $gid, props: $props) {
          ok
          msg
          group {
            id
            scaling_groups
          }
        }
        disassociate_all_scaling_groups_with_group(user_group: $gid)
          @skip(if: $isFetchedResourceGroupsEmpty) {
          ok
          msg
        }
        associate_scaling_groups_with_user_group(
          scaling_groups: $scaling_groups
          user_group: $gid
        ) @skip(if: $isResourceGroupsEmpty) {
          ok
          msg
        }
      }
    `);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    form
      .validateFields()
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
        // Remove undefined values
        totalResourceSlots = _.pickBy(
          totalResourceSlots,
          _.negate(_.isUndefined),
        );

        if (!projectFragment) {
          commitCreateProject({
            variables: {
              name: values.name,
              props: _.omit(
                {
                  ...values,
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
                commitAssociateProjects({
                  variables: {
                    scaling_groups: values?.scaling_groups || [],
                    user_group: response?.create_group?.group?.id || '',
                  },
                  onCompleted: (response, errors) => {
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
                    if (
                      !response?.associate_scaling_groups_with_user_group?.ok
                    ) {
                      message.error(
                        response?.associate_scaling_groups_with_user_group
                          ?.msg ||
                          t(
                            'comp:BAIProjectSettingModal.FailedToCreateProject',
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
              scaling_groups: values.scaling_groups || [],
              // skip disassociation if project has no resource groups
              isFetchedResourceGroupsEmpty: _.isEmpty(project?.scaling_groups),
              // skip association if no resource groups are provided
              isResourceGroupsEmpty: _.isEmpty(values.scaling_groups),
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
              if (
                !response?.modify_group?.ok ||
                (!_.isEmpty(project?.scaling_groups) &&
                  !response?.disassociate_all_scaling_groups_with_group?.ok) ||
                (!_.isEmpty(values.scaling_groups) &&
                  !response?.associate_scaling_groups_with_user_group?.ok)
              ) {
                // show error message in reverse order of execution to make it more intuitive
                message.error(
                  !_.isEmpty(
                    values.scaling_groups &&
                      response?.associate_scaling_groups_with_user_group?.msg,
                  ) ||
                    (!_.isEmpty(values.scaling_groups) &&
                      response?.disassociate_all_scaling_groups_with_group
                        ?.msg) ||
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
          isInFlightAssociateProjects,
      }}
    >
      <Form
        form={form}
        preserve={false}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          ...(projectFragment ?? {
            is_active: true,
          }),
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
          domain_name: project?.domain_name,
          name: project?.name,
          description: project?.description,
          resource_policy: project?.resource_policy,
          scaling_groups: project?.scaling_groups,
          is_active: project?.is_active,
        }}
      >
        <Form.Item
          label={t('comp:BAIProjectSettingModal.Name')}
          name="name"
          dependencies={['domain_name']}
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
          <Input />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIProjectSettingModal.Description')}
          name="description"
        >
          <Input.TextArea rows={1} />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIProjectSettingModal.Domain')}
          name="domain_name"
          rules={[{ required: true }]}
        >
          <BAIDomainSelector />
        </Form.Item>
        <Form.Item
          label={t('comp:BAIProjectSettingModal.ProjectResourcePolicy')}
          name="resource_policy"
        >
          <BAIProjectResourcePolicySelector />
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
        {_.map(_.chunk(_.keys(resourceSlotsInRG), 2), (resourceSlotKeys) => (
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
                    max="300p"
                    style={{ width: '100%' }}
                  />
                ) : (
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    addonAfter={
                      resourceSlotsInRG?.[resourceSlotKey as ResourceSlotName]
                        ?.display_unit
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
            <Input
              placeholder={t('comp:BAIProjectSettingModal.Registry')}
              style={{
                width: 'calc(50% - 8px)',
                margin: 0,
                marginRight: token.sizeXS,
              }}
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
            <Input
              placeholder={t('comp:BAIProjectSettingModal.Project')}
              style={{ width: 'calc(50% - 8px)' }}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item valuePropName="checked" name="is_active">
          <Checkbox>{t('comp:BAIProjectSettingModal.IsActive')}</Checkbox>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default BAIProjectSettingModal;
