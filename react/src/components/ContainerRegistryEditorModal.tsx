import BAIModal, { BAIModalProps } from './BAIModal';
import HiddenFormItem from './HiddenFormItem';
import { ContainerRegistryEditorModalCreateMutation } from './__generated__/ContainerRegistryEditorModalCreateMutation.graphql';
import { ContainerRegistryEditorModalFragment$key } from './__generated__/ContainerRegistryEditorModalFragment.graphql';
import { ContainerRegistryEditorModalModifyMutation } from './__generated__/ContainerRegistryEditorModalModifyMutation.graphql';
import { ContainerRegistryEditorModalModifyWithoutPasswordMutation } from './__generated__/ContainerRegistryEditorModalModifyWithoutPasswordMutation.graphql';
import { Form, Input, Select, Checkbox, FormInstance, App } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

interface ContainerRegistryEditorModalProps
  extends Omit<BAIModalProps, 'onOk'> {
  onOk: (type: 'create' | 'modify') => void;
  containerRegistryFrgmt?: ContainerRegistryEditorModalFragment$key | null;
}
const ContainerRegistryEditorModal: React.FC<
  ContainerRegistryEditorModalProps
> = ({ containerRegistryFrgmt = null, onOk, ...modalProps }) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);

  const { message, modal } = App.useApp();

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
      }
    `,
    containerRegistryFrgmt,
  );
  const [commitCreateRegistry, isInflightCreateRegistry] =
    useMutation<ContainerRegistryEditorModalCreateMutation>(graphql`
      mutation ContainerRegistryEditorModalCreateMutation(
        $registry_name: String!
        $type: ContainerRegistryTypeField!
        $url: String!
        $is_global: Boolean
        $password: String
        $project: String
        $ssl_verify: Boolean
        $username: String
      ) {
        create_container_registry_node(
          registry_name: $registry_name
          type: $type
          url: $url
          is_global: $is_global
          password: $password
          project: $project
          ssl_verify: $ssl_verify
          username: $username
        ) {
          container_registry {
            id
          }
        }
      }
    `);

  const [commitModifyRegistry, isInflightModifyRegistry] =
    useMutation<ContainerRegistryEditorModalModifyMutation>(graphql`
      mutation ContainerRegistryEditorModalModifyMutation(
        $id: String!
        $registry_name: String
        $type: ContainerRegistryTypeField
        $url: String
        $is_global: Boolean
        $password: String
        $project: String
        $ssl_verify: Boolean
        $username: String
      ) {
        modify_container_registry_node(
          id: $id
          registry_name: $registry_name
          type: $type
          url: $url
          is_global: $is_global
          password: $password
          project: $project
          ssl_verify: $ssl_verify
          username: $username
        ) {
          container_registry {
            id
          }
        }
      }
    `);

  const [
    commitModifyRegistryWithoutPassword,
    isInflightModifyRegistryWithoutPassword,
  ] = useMutation<ContainerRegistryEditorModalModifyWithoutPasswordMutation>(
    graphql`
      mutation ContainerRegistryEditorModalModifyWithoutPasswordMutation(
        $id: String!
        $registry_name: String
        $type: ContainerRegistryTypeField
        $url: String
        $is_global: Boolean
        $project: String
        $ssl_verify: Boolean
        $username: String
      ) {
        modify_container_registry_node(
          id: $id
          registry_name: $registry_name
          type: $type
          url: $url
          is_global: $is_global
          project: $project
          ssl_verify: $ssl_verify
          username: $username
        ) {
          container_registry {
            id
          }
        }
      }
    `,
  );

  const handleSave = async () => {
    return formRef.current
      ?.validateFields()
      .then((values) => {
        let mutationVariables = {
          id: _.isEmpty(values.row_id) ? undefined : values.row_id,
          registry_name: values.registry_name,
          url: values.url,
          type: values.type,
          project: values.type === 'docker' ? 'library' : values.project,
          username: _.isEmpty(values.username) ? null : values.username,
          password:
            values.isChangedPassword || !containerRegistry
              ? _.isEmpty(values.password)
                ? null // unset
                : values.password
              : undefined, // no change
        };
        if (containerRegistry) {
          if (!values.isChangedPassword) {
            delete mutationVariables.password;
            commitModifyRegistryWithoutPassword({
              variables: mutationVariables,
              onCompleted: (res, errors) => {
                if (
                  _.isEmpty(
                    res.modify_container_registry_node?.container_registry,
                  )
                ) {
                  message.error(t('dialog.ErrorOccurred'));
                  return;
                }
                if (errors && errors.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error, 2.5);
                  }
                } else {
                  onOk && onOk('modify');
                }
              },
              onError: (error) => {
                message.error(t('dialog.ErrorOccurred'));
              },
            });
          } else {
            commitModifyRegistry({
              variables: mutationVariables,
              onCompleted: (res, errors) => {
                if (
                  _.isEmpty(
                    res.modify_container_registry_node?.container_registry,
                  )
                ) {
                  message.error(t('dialog.ErrorOccurred'));
                  return;
                }
                if (errors && errors.length > 0) {
                  const errorMsgList = _.map(errors, (error) => error.message);
                  for (const error of errorMsgList) {
                    message.error(error, 2.5);
                  }
                } else {
                  onOk && onOk('modify');
                }
              },
              onError: (error) => {
                message.error(t('dialog.ErrorOccurred'));
              },
            });
          }
        } else {
          mutationVariables = _.omitBy(mutationVariables, _.isNil) as Required<
            typeof mutationVariables
          >;
          commitCreateRegistry({
            variables: mutationVariables,
            onCompleted: (res, errors) => {
              if (
                _.isEmpty(
                  res?.create_container_registry_node?.container_registry,
                )
              ) {
                message.error(t('dialog.ErrorOccurred'));
                return;
              }
              if (errors && errors?.length > 0) {
                const errorMsgList = _.map(errors, (error) => error.message);
                for (const error of errorMsgList) {
                  message.error(error, 2.5);
                }
              } else {
                onOk && onOk('create');
              }
            },
            onError(error) {
              message.error(t('dialog.ErrorOccurred'));
            },
          });
        }
      })
      .catch((error) => {});
  };
  return (
    <BAIModal
      title={
        containerRegistry
          ? t('registry.ModifyRegistry')
          : t('registry.AddRegistry')
      }
      okText={containerRegistry ? t('button.Save') : t('button.Add')}
      confirmLoading={
        isInflightCreateRegistry ||
        isInflightModifyRegistry ||
        isInflightModifyRegistryWithoutPassword
      }
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
      destroyOnClose
    >
      <Form
        ref={formRef}
        layout="vertical"
        requiredMark="optional"
        initialValues={
          containerRegistry
            ? {
                ...containerRegistry,
              }
            : {
                type: 'docker',
                project: 'library',
              }
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
                  } catch (e) {
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
            onChange={(value) => {
              if (value === 'docker') {
                formRef.current?.setFieldValue('project', 'library');
                formRef.current?.validateFields(['project']);
              }
            }}
          ></Select>
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, next) => prev?.type !== next?.type}
          noStyle
        >
          {({ getFieldValue }) => {
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
                <Input
                  disabled={getFieldValue('type') === 'docker'}
                  allowClear
                />
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default ContainerRegistryEditorModal;
