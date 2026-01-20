import { useBaiSignedRequestWithPromise } from '../helper';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import EnvVarFormList from './EnvVarFormList';
import VFolderSelect from './VFolderSelect';
import VFolderTableFormItem from './VFolderTableFormItem';
import { MinusOutlined } from '@ant-design/icons';
import { Form, FormItemProps, Input, Select, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DeploymentRevisionRuntimeAndMountFormItemProps {
  initialVfolderId?: string;
  formItemProps?: FormItemProps;
}

const DeploymentRevisionRuntimeAndMountFormItem: React.FC<
  DeploymentRevisionRuntimeAndMountFormItemProps
> = ({ initialVfolderId, formItemProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  const { data: availableRuntimes } = useSuspenseTanQuery<{
    runtimes: { name: string; human_readable_name: string }[];
  }>({
    queryKey: ['baiClient.modelService.runtime.list'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/services/_/runtimes`,
      });
    },
    staleTime: 1000,
  });

  return (
    <>
      <Form.Item
        name={[formItemProps?.name, 'modelRuntimeConfig', 'runtimeVariant']}
        required
        label={t('deployment.launcher.RuntimeVariant')}
      >
        <Select
          defaultActiveFirstOption
          showSearch
          options={_.map(availableRuntimes?.runtimes, (runtime) => {
            return {
              value: runtime.name,
              label: runtime.human_readable_name,
            };
          })}
        />
      </Form.Item>
      <Form.Item
        name={[formItemProps?.name, 'modelMountConfig', 'vfolderId']}
        label={t('deployment.launcher.ModelStorageToMount')}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <VFolderSelect
          filter={(vf) => vf.usage_mode === 'model' && vf.status === 'ready'}
          valuePropName="id"
          autoSelectDefault={!initialVfolderId}
          allowFolderExplorer
          allowCreateFolder
        />
      </Form.Item>
      <Form.Item
        dependencies={[
          [formItemProps?.name, 'modelRuntimeConfig', 'runtimeVariant'],
        ]}
        noStyle
      >
        {({ getFieldValue }) =>
          getFieldValue([
            formItemProps?.name,
            'modelRuntimeConfig',
            'runtimeVariant',
          ]) === 'custom' && (
            <BAIFlex
              direction="row"
              gap={'xxs'}
              align="stretch"
              justify="between"
            >
              <Form.Item
                name={[
                  formItemProps?.name,
                  'modelMountConfig',
                  'mountDestination',
                ]}
                label={t('deployment.launcher.MountDestination')}
                style={{ width: '50%' }}
                labelCol={{ style: { flex: 1 } }}
              >
                <Input allowClear placeholder={'/models'} />
              </Form.Item>
              <MinusOutlined
                style={{
                  fontSize: token.fontSizeXL,
                  color: token.colorTextDisabled,
                }}
                rotate={290}
              />
              <Form.Item
                name={[
                  formItemProps?.name,
                  'modelMountConfig',
                  'definitionPath',
                ]}
                label={t('deployment.launcher.DefinitionPath')}
                style={{ width: '50%' }}
                labelCol={{ style: { flex: 1 } }}
              >
                <Input allowClear placeholder={'model-definition.yaml'} />
              </Form.Item>
            </BAIFlex>
          )
        }
      </Form.Item>
      <Form.Item
        noStyle
        dependencies={[[formItemProps?.name, 'modelMountConfig', 'vfolderId']]}
      >
        {({ getFieldValue }) => {
          return (
            <VFolderTableFormItem
              rowKey={'id'}
              label={t('deployment.launcher.AdditionalMounts')}
              rowFilter={(vf) =>
                vf.id !==
                  getFieldValue([
                    formItemProps?.name,
                    'modelMountConfig',
                    'vfolderId',
                  ]) &&
                vf.status === 'ready' &&
                vf.usage_mode !== 'model' &&
                !vf.name?.startsWith('.')
              }
              tableProps={{
                size: 'small',
              }}
            />
          );
        }}
      </Form.Item>
      <Form.Item
        label={t('deployment.launcher.InferenceRuntimeConfig')}
        tooltip={t('deployment.launcher.InferenceRuntimeConfigHelp')}
      >
        {/* TODO: Add auto-complete and validation according to variable types. */}
        <EnvVarFormList
          name={[
            formItemProps?.name,
            'modelRuntimeConfig',
            'inferenceRuntimeConfig',
          ]}
          formItemProps={{
            validateTrigger: ['onChange', 'onBlur'],
          }}
        />
      </Form.Item>
      <Form.Item
        label={t('deployment.launcher.EnvironmentVariables')}
        tooltip={t('deployment.launcher.EnvironmentVariablesHelp')}
      >
        <EnvVarFormList
          name={[formItemProps?.name, 'modelRuntimeConfig', 'environ']}
          formItemProps={{
            validateTrigger: ['onChange', 'onBlur'],
          }}
        />
      </Form.Item>
    </>
  );
};

export default DeploymentRevisionRuntimeAndMountFormItem;
