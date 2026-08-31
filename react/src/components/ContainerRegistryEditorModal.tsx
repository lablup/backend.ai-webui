/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ContainerRegistryEditorModalCreateMutation } from '../__generated__/ContainerRegistryEditorModalCreateMutation.graphql';
import { ContainerRegistryEditorModalFragment$key } from '../__generated__/ContainerRegistryEditorModalFragment.graphql';
import { ContainerRegistryEditorModalModifyRegistryMutation } from '../__generated__/ContainerRegistryEditorModalModifyRegistryMutation.graphql';
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { theme } from '../theme-shim';
import BAICodeEditor from './BAICodeEditor';
import BAIFormItem from './BAIFormItem';
import HiddenFormItem from './HiddenFormItem';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
import {
  AstryxFormCheckbox,
  AstryxFormSelector,
  AstryxFormTextInput,
} from './astryxFormControls';
import { Selector } from '@astryxdesign/core/Selector';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type RegistryFormInput = {
  row_id?: string;
  registry_name: string;
  url: string;
  type: string;
  project: string;
  username?: string;
  password?: string;
  isChangedPassword?: boolean;
  extra?: string;
  is_global?: boolean;
  ssl_verify?: boolean;
  allowed_group_ids?: string[];
};

interface ContainerRegistryEditorModalProps extends Omit<
  BAIModalProps,
  'onOk'
> {
  onOk: (type: 'create' | 'modify') => void;
  containerRegistryFrgmt?: ContainerRegistryEditorModalFragment$key | null;
}
const ContainerRegistryEditorModal: React.FC<
  ContainerRegistryEditorModalProps
> = ({ containerRegistryFrgmt = null, onOk, ...modalProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();

  const baiClient = useSuspendedBackendaiClient();
  const isSupportExtraField = baiClient.supports('extra-field');

  const formRef = useRef<FormInstance<RegistryFormInput>>(null);

  const containerRegistry = useFragment(
    graphql`
      fragment ContainerRegistryEditorModalFragment on ContainerRegistryNode {
        id
        row_id
        name
        registry_name
        url
        type
        project
        username
        ssl_verify
        extra @since(version: "24.09.3")
        is_global @since(version: "24.09.0")
        allowed_groups @since(version: "25.3.0") {
          edges {
            node {
              id
              row_id
              name
            }
          }
        }
      }
    `,
    containerRegistryFrgmt,
  );

  const [commitCreateRegistry, isInflightCreateRegistry] =
    useMutation<ContainerRegistryEditorModalCreateMutation>(graphql`
      mutation ContainerRegistryEditorModalCreateMutation(
        $props: CreateContainerRegistryNodeInputV2!
      ) {
        create_container_registry_node_v2(props: $props) {
          container_registry {
            id
          }
        }
      }
    `);

  const [commitModifyRegistry, isInflightModifyRegistry] =
    useMutation<ContainerRegistryEditorModalModifyRegistryMutation>(graphql`
      mutation ContainerRegistryEditorModalModifyRegistryMutation(
        $id: String!
        $props: ModifyContainerRegistryNodeInputV2!
      ) {
        modify_container_registry_node_v2(id: $id, props: $props) {
          container_registry {
            id
          }
        }
      }
    `);

  const handleSave = async () => {
    return formRef.current
      ?.validateFields()
      .then((values) => {
        let mutationVariables = {
          id: values.row_id,
          registry_name: values.registry_name,
          url: values.url,
          type: values.type,
          project: values.project,
          username: _.isEmpty(values.username) ? null : values.username,
          password:
            values.isChangedPassword || !containerRegistry
              ? _.isEmpty(values.password)
                ? null // unset
                : values.password
              : undefined, // no change
          extra: _.isEmpty(values.extra)
            ? null
            : JSON.stringify(JSON.parse(values.extra ?? '{}')),
          is_global: values.is_global,
          ssl_verify: values.ssl_verify,
          allowed_groups: values.is_global
            ? undefined
            : (() => {
                const selected = values.allowed_group_ids ?? [];
                // When fetched is_global was true, no real assoc records exist,
                // so treat original as empty to avoid removing non-existent associations
                const original = containerRegistry?.is_global
                  ? []
                  : (containerRegistry?.allowed_groups?.edges
                      ?.map((edge) => edge?.node?.row_id)
                      .filter(Boolean) ?? []);
                return {
                  add: _.difference(selected, original),
                  remove: _.difference(original, selected),
                };
              })(),
        };

        if (containerRegistry) {
          commitModifyRegistry({
            variables: {
              id: mutationVariables.id ?? '',
              props: _.omit(mutationVariables, 'id'),
            },
            onCompleted: (res, errors) => {
              if (
                _.isEmpty(
                  res.modify_container_registry_node_v2?.container_registry,
                )
              ) {
                message.error(t('dialog.ErrorOccurred'));
                return;
              }
              if (errors && errors.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
              } else {
                onOk && onOk('modify');
              }
            },
            onError: () => {
              message.error(t('dialog.ErrorOccurred'));
            },
          });
        } else {
          mutationVariables = _.omitBy(mutationVariables, _.isNil) as Required<
            typeof mutationVariables
          >;
          commitCreateRegistry({
            variables: {
              props: mutationVariables,
            },
            onCompleted: (res, errors) => {
              if (
                _.isEmpty(
                  res?.create_container_registry_node_v2?.container_registry,
                )
              ) {
                message.error(t('dialog.ErrorOccurred'));
                return;
              }
              if (errors && errors?.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error);
                }
              } else {
                onOk && onOk('create');
              }
            },
            onError() {
              message.error(t('dialog.ErrorOccurred'));
            },
          });
        }
      })
      .catch(() => {});
  };
  return (
    <BAIModal
      title={
        containerRegistry
          ? t('registry.ModifyRegistry')
          : t('registry.AddRegistry')
      }
      okText={containerRegistry ? t('button.Save') : t('button.Add')}
      confirmLoading={isInflightCreateRegistry || isInflightModifyRegistry}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            if (
              _.includes(values?.type, 'harbor') &&
              (_.isEmpty(values.username) ||
                (containerRegistry
                  ? values.isChangedPassword && _.isEmpty(values.password)
                  : _.isEmpty(values.password)))
            ) {
              modal.confirm({
                title: t('button.Confirm'),
                content: t('registry.ConfirmNoUserName'),
                onOk: () => {
                  handleSave();
                },
              });
            } else {
              handleSave();
            }
          })
          .catch(() => {});
      }}
      {...modalProps}
      destroyOnHidden
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={
          containerRegistry
            ? {
                ...containerRegistry,
                extra: containerRegistry?.extra
                  ? JSON.stringify(
                      JSON.parse(containerRegistry?.extra),
                      null,
                      2,
                    )
                  : '',
                is_global: containerRegistry?.is_global ?? true,
                ssl_verify: containerRegistry?.ssl_verify === true,
                allowed_group_ids:
                  containerRegistry?.allowed_groups?.edges
                    ?.map((edge) => edge?.node?.row_id)
                    .filter(Boolean) ?? [],
              }
            : { is_global: true, ssl_verify: true }
        }
        preserve={false}
      >
        {containerRegistry && (
          <HiddenFormItem name="row_id" value={containerRegistry.row_id} />
        )}
        <BAIFormItem
          label={t('registry.RegistryName')}
          name="registry_name"
          required
          rules={[
            {
              required: true,
              message: t('registry.DescRegistryNameIsEmpty'),
              pattern: new RegExp('^.+$'),
            },
            {
              type: 'string',
              max: 50,
              message: t('maxLength.50chars'),
            },
          ]}
        >
          <AstryxFormTextInput
            label={t('registry.RegistryName')}
            disabled={!!containerRegistry}
          />
        </BAIFormItem>
        <BAIFormItem
          name={'url'}
          label={t('registry.RegistryURL')}
          required
          rules={[
            {
              required: true,
            },
            {
              validator: (_, value) => {
                if (value) {
                  if (
                    !value.startsWith('http://') &&
                    !value.startsWith('https://')
                  )
                    return Promise.reject(t('registry.DescURLStartString'));
                  try {
                    new URL(value);
                  } catch {
                    return Promise.reject(t('registry.DescURLFormat'));
                  }
                }
                return Promise.resolve();
              },
            },
            {
              type: 'string',
              max: 512,
              message: t('maxLength.512chars'),
            },
          ]}
        >
          <AstryxFormTextInput label={t('registry.RegistryURL')} />
        </BAIFormItem>

        <BAIFormItem
          noStyle
          shouldUpdate={(prev, next) =>
            _.isEmpty(prev?.password) !== _.isEmpty(next?.password)
          }
        >
          {(form) => {
            const { validateFields, getFieldValue } =
              form as FormInstance<RegistryFormInput>;
            validateFields(['username']);
            return (
              <BAIFormItem
                name={'username'}
                label={t('registry.Username')}
                rules={[
                  {
                    required: !_.isEmpty(getFieldValue('password')),
                  },
                  {
                    type: 'string',
                    max: 255,
                    message: t('maxLength.255chars'),
                  },
                ]}
              >
                <AstryxFormTextInput label={t('registry.Username')} />
              </BAIFormItem>
            );
          }}
        </BAIFormItem>

        <BAIFormItem label={t('registry.Password')}>
          <BAIFormItem
            noStyle
            shouldUpdate={(prev, next) =>
              prev.isChangedPassword !== next.isChangedPassword
            }
          >
            {(form) => (
              <BAIFormItem noStyle name={'password'}>
                {/* antd Input.Password -> Astryx TextInput type="password"
                    (MAPPING.md §3.6). PILOT-DECISION: the visibility-toggle
                    eye affordance is antd sugar with no TextInput
                    counterpart; dropped (simplicity policy). */}
                <AstryxFormTextInput
                  label={t('registry.Password')}
                  type="password"
                  disabled={
                    !_.isEmpty(containerRegistry) &&
                    !(form as FormInstance<RegistryFormInput>).getFieldValue(
                      'isChangedPassword',
                    )
                  }
                />
              </BAIFormItem>
            )}
          </BAIFormItem>
          {!_.isEmpty(containerRegistry) && (
            <BAIFormItem noStyle name="isChangedPassword">
              <AstryxFormCheckbox
                label={t('webui.menu.ChangePassword')}
                onValueChange={(checked) => {
                  if (!checked) {
                    formRef.current?.setFieldValue('password', '');
                  }
                }}
              />
            </BAIFormItem>
          )}
        </BAIFormItem>
        <BAIFormItem
          name={'type'}
          label={t('registry.RegistryType')}
          required
          rules={[
            {
              required: true,
              message: t('registry.PleaseSelectOption'),
            },
          ]}
        >
          <AstryxFormSelector
            label={t('registry.RegistryType')}
            options={[
              'docker',
              'harbor',
              'harbor2',
              'github',
              'gitlab',
              'ecr',
              'ecr-public',
            ]}
          />
        </BAIFormItem>
        <BAIFormItem
          shouldUpdate={(prev, next) => prev?.type !== next?.type}
          noStyle
        >
          {() => {
            return (
              <BAIFormItem
                name={'project'}
                label={t('registry.ProjectName')}
                required
                rules={[
                  {
                    required: true,
                    message: t('registry.ProjectNameIsRequired'),
                  },
                  {
                    type: 'string',
                    max: 255,
                    message: t('maxLength.255chars'),
                  },
                ]}
              >
                <AstryxFormTextInput
                  label={t('registry.ProjectName')}
                  allowClear
                />
              </BAIFormItem>
            );
          }}
        </BAIFormItem>
        <BAIFormItem name="ssl_verify" label={t('registry.SSLVerify')}>
          <AstryxFormCheckbox label={t('registry.SSLVerifyDescription')} />
        </BAIFormItem>
        <BAIFormItem name="is_global" label={t('registry.IsGlobal')}>
          <AstryxFormCheckbox
            label={t('registry.IsGlobalDescription')}
            onValueChange={(checked) => {
              if (!checked) {
                // Restore original allowed groups from fragment data on uncheck
                const originalGroupIds =
                  containerRegistry?.allowed_groups?.edges
                    ?.map((edge) => edge?.node?.row_id)
                    .filter(Boolean) ?? [];
                formRef.current?.setFieldValue(
                  'allowed_group_ids',
                  originalGroupIds,
                );
              }
            }}
          />
        </BAIFormItem>
        <BAIFormItem
          noStyle
          shouldUpdate={(prev, next) => prev?.is_global !== next?.is_global}
        >
          {(form) =>
            !(form as FormInstance<RegistryFormInput>).getFieldValue(
              'is_global',
            ) && (
              // Suspense must sit INSIDE the form: if the project select
              // suspends above it, the hide/show cycle unregisters every
              // preserve={false} field and resets it to initial (FR-3705).
              <Suspense
                fallback={
                  <BAIFormItem label={t('registry.AllowedProjects')}>
                    {/* Suspense placeholder only — an inert, loading Selector. */}
                    <Selector
                      label={t('registry.AllowedProjects')}
                      isLabelHidden
                      isLoading
                      options={[]}
                      width="100%"
                    />
                  </BAIFormItem>
                }
              >
                <BAIFormItem
                  name="allowed_group_ids"
                  label={t('registry.AllowedProjects')}
                >
                  <ProjectSelectForAdminPage
                    domain={baiClient._config.domainName}
                    mode="multiple"
                    allowClear
                  />
                </BAIFormItem>
              </Suspense>
            )
          }
        </BAIFormItem>
        {isSupportExtraField && (
          <BAIFormItem label={t('registry.ExtraInformation')}>
            <BAIFlex
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                overflow: 'hidden',
              }}
            >
              <BAIFormItem
                name="extra"
                noStyle
                rules={[
                  {
                    validator: (_, value) => {
                      if (value) {
                        try {
                          JSON.parse(value);
                        } catch {
                          return Promise.reject(
                            t('registry.DescExtraJsonFormat'),
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <BAICodeEditor
                  editable
                  language="json"
                  style={{ width: '100%' }}
                />
              </BAIFormItem>
            </BAIFlex>
          </BAIFormItem>
        )}
      </Form>
    </BAIModal>
  );
};

export default ContainerRegistryEditorModal;
