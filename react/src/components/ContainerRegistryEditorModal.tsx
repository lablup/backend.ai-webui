import { ContainerRegistryEditorModalCreateMutation } from '../__generated__/ContainerRegistryEditorModalCreateMutation.graphql';
import { ContainerRegistryEditorModalFragment$key } from '../__generated__/ContainerRegistryEditorModalFragment.graphql';
import { ContainerRegistryEditorModalModifyRegistryMutation } from '../__generated__/ContainerRegistryEditorModalModifyRegistryMutation.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useThemeMode } from '../hooks/useThemeMode';
import BAICodeEditor from './BAICodeEditor';
import HiddenFormItem from './HiddenFormItem';
import {
  Form,
  Input,
  Select,
  Checkbox,
  type FormInstance,
  App,
  theme,
} from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useRef } from 'react';
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
};

interface ContainerRegistryEditorModalProps
  extends Omit<BAIModalProps, 'onOk'> {
  onOk: (type: 'create' | 'modify') => void;
  containerRegistryFrgmt?: ContainerRegistryEditorModalFragment$key | null;
}
const ContainerRegistryEditorModal: React.FC<
  ContainerRegistryEditorModalProps
> = ({ containerRegistryFrgmt = null, onOk, ...modalProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
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
              }
            : {}
        }
        preserve={false}
      >
        {containerRegistry && (
          <HiddenFormItem name="row_id" value={containerRegistry.row_id} />
        )}
        <Form.Item
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
          <Input
            disabled={!!containerRegistry}
            value={containerRegistry?.registry_name || undefined}
          />
        </Form.Item>
        <Form.Item
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
          <Input />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, next) =>
            _.isEmpty(prev?.password) !== _.isEmpty(next?.password)
          }
        >
          {({ validateFields, getFieldValue }) => {
            validateFields(['username']);
            return (
              <Form.Item
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
                <Input />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item label={t('registry.Password')}>
          <Form.Item
            noStyle
            shouldUpdate={(prev, next) =>
              prev.isChangedPassword !== next.isChangedPassword
            }
          >
            {({ getFieldValue }) => (
              <Form.Item noStyle name={'password'}>
                <Input.Password
                  disabled={
                    !_.isEmpty(containerRegistry) &&
                    !getFieldValue('isChangedPassword')
                  }
                />
              </Form.Item>
            )}
          </Form.Item>
          {!_.isEmpty(containerRegistry) && (
            <Form.Item noStyle name="isChangedPassword" valuePropName="checked">
              <Checkbox
                onChange={(e) => {
                  if (!e.target.checked) {
                    formRef.current?.setFieldValue('password', '');
                  }
                }}
              >
                {t('webui.menu.ChangePassword')}
              </Checkbox>
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item
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
          <Select
            options={[
              {
                value: 'docker',
              },
              {
                value: 'harbor',
              },
              {
                value: 'harbor2',
              },
              {
                value: 'github',
              },
              {
                value: 'gitlab',
              },
              {
                value: 'ecr',
              },
              {
                value: 'ecr-public',
              },
            ]}
          ></Select>
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, next) => prev?.type !== next?.type}
          noStyle
        >
          {() => {
            return (
              <Form.Item
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
                <Input allowClear />
              </Form.Item>
            );
          }}
        </Form.Item>
        {isSupportExtraField && (
          <Form.Item label={t('registry.ExtraInformation')}>
            <BAIFlex
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                overflow: 'hidden',
              }}
            >
              <Form.Item
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
                  theme={isDarkMode ? 'dark' : 'light'}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </BAIFlex>
          </Form.Item>
        )}
      </Form>
    </BAIModal>
  );
};

export default ContainerRegistryEditorModal;
