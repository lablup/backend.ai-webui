import BAIModal, { BAIModalProps } from './BAIModal';
import { ContainerRegistryEditorModalCreateMutation } from './__generated__/ContainerRegistryEditorModalCreateMutation.graphql';
import { ContainerRegistryEditorModalFragment$key } from './__generated__/ContainerRegistryEditorModalFragment.graphql';
import { ContainerRegistryEditorModalModifyMutation } from './__generated__/ContainerRegistryEditorModalModifyMutation.graphql';
import { App, Form, Input, Select } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
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
  const [form] = Form.useForm();

  const { message } = App.useApp();

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
              ssl_verify
            }
          }
        }
      }
    `);
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
        form
          .validateFields()
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
                username: values.config.username,
                password: values.config.password,
              },
            };
            if (containerRegistry) {
              commitModifyRegistry({
                variables: mutationVariables,
                onCompleted: (res, error) => {
                  if (error) {
                    message.error(t('dialog.ErrorOccurred'));
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
                onCompleted: (res, error) => {
                  if (error) {
                    message.error(t('dialog.ErrorOccurred'));
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
      }}
      {...modalProps}
      destroyOnClose
    >
      <Form
        form={form}
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
              type: 'url',
            },
            {
              validator: (_, value) => {
                if (
                  value &&
                  !value.startsWith('http://') &&
                  !value.startsWith('https://')
                ) {
                  return Promise.reject(t('registry.DescURLStartString'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name={['config', 'username']} label={t('registry.Username')}>
          <Input />
        </Form.Item>
        <Form.Item name={['config', 'password']} label={t('registry.Password')}>
          <Input.Password />
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
          {() => {
            return (
              form.getFieldValue(['config', 'type']) !== 'docker' && (
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
