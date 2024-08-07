import BAIModal, { BAIModalProps } from './BAIModal';
import { ContainerRegistryEditorModalCreateMutation } from './__generated__/ContainerRegistryEditorModalCreateMutation.graphql';
import { ContainerRegistryEditorModalFragment$key } from './__generated__/ContainerRegistryEditorModalFragment.graphql';
import { ContainerRegistryEditorModalModifyMutation } from './__generated__/ContainerRegistryEditorModalModifyMutation.graphql';
import { Form, Input, Select, Checkbox, FormInstance, App } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

interface ContainerRegistryEditorModalProps
  extends Omit<BAIModalProps, 'onOk'> {
  existingHostnames?: string[];
  onOk: (type: 'create' | 'modify') => void;
  containerRegistryFrgmt?: ContainerRegistryEditorModalFragment$key | null;
}
const ContainerRegistryEditorModal: React.FC<
  ContainerRegistryEditorModalProps
> = ({
  existingHostnames,
  containerRegistryFrgmt = null,
  onOk,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);

  const { message, modal } = App.useApp();

  const containerRegistry = useFragment(
    graphql`
      fragment ContainerRegistryEditorModalFragment on ContainerRegistry {
        id
        hostname
        config {
          url
          type
          project
          username
          ssl_verify
        }
      }
    `,
    containerRegistryFrgmt,
  );
  const [commitCreateRegistry, isInflightCreateRegistry] =
    useMutation<ContainerRegistryEditorModalCreateMutation>(graphql`
      mutation ContainerRegistryEditorModalCreateMutation(
        $hostname: String!
        $props: CreateContainerRegistryInput!
      ) {
        create_container_registry(hostname: $hostname, props: $props) {
          container_registry {
            id
            hostname
            config {
              url
              type
              project
              username
              password
              ssl_verify
            }
          }
        }
      }
    `);

  const [commitModifyRegistry, isInflightModifyRegistry] =
    useMutation<ContainerRegistryEditorModalModifyMutation>(graphql`
      mutation ContainerRegistryEditorModalModifyMutation(
        $hostname: String!
        $props: ModifyContainerRegistryInput!
      ) {
        modify_container_registry(hostname: $hostname, props: $props) {
          container_registry {
            id
            hostname
            config {
              url
              type
              project
              username
              password
              ssl_verify
            }
          }
        }
      }
    `);

  const handleSave = async () => {
    return formRef.current
      ?.validateFields()
      .then((values) => {
        const mutationVariables = {
          hostname: values.hostname,
          props: {
            url: values.config.url,
            type: values.config.type,
            project:
              values.config.project === 'docker'
                ? undefined
                : values.config.project,
            username: _.isEmpty(values.config.username)
              ? null
              : values.config.username,
            password: values.isChangedPassword
              ? _.isEmpty(values.config.password)
                ? null // unset
                : values.config.password
              : undefined, // no change
          },
        };
        if (containerRegistry) {
          if (!values.isChangedPassword) {
            delete mutationVariables.props.password;
          }
          commitModifyRegistry({
            variables: mutationVariables,
            onCompleted: (res, errors) => {
              if (
                _.isEmpty(res.modify_container_registry?.container_registry)
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
          commitCreateRegistry({
            variables: mutationVariables,
            onCompleted: (res, errors) => {
              if (
                _.isEmpty(res?.create_container_registry?.container_registry)
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
      confirmLoading={isInflightCreateRegistry || isInflightModifyRegistry}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            if (
              _.includes(values.config?.type, 'harbor') &&
              (_.isEmpty(values.config.username) ||
                (containerRegistry
                  ? values.isChangedPassword &&
                    _.isEmpty(values.config.password)
                  : _.isEmpty(values.config.password)))
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
                config: {
                  ...containerRegistry.config,
                  project: containerRegistry.config?.project || undefined,
                },
              }
            : {
                config: {
                  type: 'docker',
                },
              }
        }
        preserve={false}
      >
        <Form.Item
          label={t('registry.Hostname')}
          name="hostname"
          required
          rules={[
            {
              required: true,
              message: t('registry.DescHostnameIsEmpty'),
              pattern: new RegExp('^.+$'),
            },
            {
              validator: (_, value) => {
                if (!containerRegistry && existingHostnames?.includes(value)) {
                  return Promise.reject(
                    t('registry.RegistryHostnameAlreadyExists'),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            disabled={!!containerRegistry}
            // placeholder={t('registry.Hostname')}
            value={containerRegistry?.hostname || undefined}
          />
        </Form.Item>
        <Form.Item
          name={['config', 'url']}
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
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, next) =>
            _.isEmpty(prev.config?.password) !==
            _.isEmpty(next.config?.password)
          }
        >
          {({ validateFields, getFieldValue }) => {
            validateFields([['config', 'username']]);
            return (
              <Form.Item
                name={['config', 'username']}
                label={t('registry.Username')}
                rules={[
                  {
                    required: !_.isEmpty(getFieldValue(['config', 'password'])),
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
              <Form.Item noStyle name={['config', 'password']}>
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
                    formRef.current?.setFieldValue(['config', 'password'], '');
                  }
                }}
              >
                {t('webui.menu.ChangePassword')}
              </Checkbox>
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item
          name={['config', 'type']}
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
            ]}
            onChange={() => {
              // form.validateFields();
            }}
          ></Select>
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, next) =>
            prev?.config?.type !== next?.config?.type
          }
          noStyle
        >
          {({ getFieldValue }) => {
            return (
              getFieldValue(['config', 'type']) !== 'docker' && (
                <Form.Item
                  name={['config', 'project']}
                  label={t('registry.ProjectName')}
                  required
                  rules={[
                    {
                      required: true,
                      message: t('registry.ProjectNameIsRequired'),
                    },
                  ]}
                >
                  {/* <Input
                  // disabled={
                  //   form.getFieldValue(['config', 'type']) === 'docker'
                  // }
                  /> */}
                  <Select
                    mode="tags"
                    open={false}
                    tokenSeparators={[',', ' ']}
                    suffixIcon={null}
                  />
                </Form.Item>
              )
            );
          }}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default ContainerRegistryEditorModal;
