import {
  CreateProjectResourcePolicyInput,
  ProjectResourcePolicySettingModalCreateMutation,
} from '../__generated__/ProjectResourcePolicySettingModalCreateMutation.graphql';
import { ProjectResourcePolicySettingModalFragment$key } from '../__generated__/ProjectResourcePolicySettingModalFragment.graphql';
import {
  ModifyProjectResourcePolicyInput,
  ProjectResourcePolicySettingModalModifyMutation,
} from '../__generated__/ProjectResourcePolicySettingModalModifyMutation.graphql';
import { GBToBytes, bytesToGB } from '../helper';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { useSuspendedBackendaiClient } from '../hooks';
import FormItemWithUnlimited from './FormItemWithUnlimited';
import {
  Form,
  Input,
  Alert,
  App,
  theme,
  InputNumber,
  FormInstance,
} from 'antd';
import { BAIModal, BAIModalProps, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface Props extends BAIModalProps {
  existingPolicyNames?: string[];
  projectResourcePolicyFrgmt: ProjectResourcePolicySettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const ProjectResourcePolicySettingModal: React.FC<Props> = ({
  existingPolicyNames,
  projectResourcePolicyFrgmt = null,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);

  const baiClient = useSuspendedBackendaiClient();
  const supportMaxNetworkCount = baiClient?.supports('max_network_count');

  const projectResourcePolicy = useFragment(
    graphql`
      fragment ProjectResourcePolicySettingModalFragment on ProjectResourcePolicy {
        id
        name
        created_at
        # follows version of https://github.com/lablup/backend.ai/pull/1993
        # --------------- START --------------------
        max_vfolder_count @since(version: "23.09.6")
        max_quota_scope_size @since(version: "23.09.2")
        # ---------------- END ---------------------
        max_network_count @since(version: "24.12.0")
      }
    `,
    projectResourcePolicyFrgmt,
  );

  const [
    commitCreateProjectResourcePolicy,
    isInFlightCommitCreateProjectResourcePolicy,
  ] = useMutation<ProjectResourcePolicySettingModalCreateMutation>(graphql`
    mutation ProjectResourcePolicySettingModalCreateMutation(
      $name: String!
      $props: CreateProjectResourcePolicyInput!
    ) {
      create_project_resource_policy(name: $name, props: $props) {
        ok
        msg
      }
    }
  `);

  const [
    commitModifyProjectResourcePolicy,
    isInFlightCommitModifyProjectResourcePolicy,
  ] = useMutation<ProjectResourcePolicySettingModalModifyMutation>(graphql`
    mutation ProjectResourcePolicySettingModalModifyMutation(
      $name: String!
      $props: ModifyProjectResourcePolicyInput!
    ) {
      modify_project_resource_policy(name: $name, props: $props) {
        ok
        msg
      }
    }
  `);

  const initialValues = useMemo(() => {
    let unlimitedValues = {};
    if (projectResourcePolicy === null) {
      unlimitedValues = {
        // Initialize unlimited values as a default when creating a new policy.\
        max_vfolder_count: 0,
        max_quota_scope_size: -1,
        max_network_count: -1,
      };
    }
    let maxQuotaScopeSize = projectResourcePolicy?.max_quota_scope_size;
    maxQuotaScopeSize =
      _.isUndefined(maxQuotaScopeSize) || maxQuotaScopeSize === -1
        ? -1
        : bytesToGB(maxQuotaScopeSize);
    return {
      ...unlimitedValues,
      ...projectResourcePolicy,
      max_quota_scope_size: maxQuotaScopeSize,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectResourcePolicy,
    projectResourcePolicy?.max_vfolder_count,
    projectResourcePolicy?.max_quota_scope_size,
  ]);

  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    return formRef?.current
      ?.validateFields()
      .then((values) => {
        const props:
          | CreateProjectResourcePolicyInput
          | ModifyProjectResourcePolicyInput = {
          max_vfolder_count: values?.max_vfolder_count || 0,
          max_quota_scope_size:
            values?.max_quota_scope_size === -1
              ? -1
              : GBToBytes(values?.max_quota_scope_size),
          max_network_count: values?.max_network_count || -1,
        };
        if (!supportMaxNetworkCount) {
          delete props.max_network_count;
        }
        if (projectResourcePolicy === null) {
          commitCreateProjectResourcePolicy({
            variables: {
              name: values?.name,
              props: props as CreateProjectResourcePolicyInput,
            },
            onCompleted(res, errors) {
              if (!res?.create_project_resource_policy?.ok || errors) {
                message.error(
                  res?.create_project_resource_policy?.msg ||
                    t('resourcePolicy.CannotCreateResourcePolicy'),
                );
                onRequestClose();
              } else {
                message.success(
                  t('storageHost.ResourcePolicySuccessfullyUpdated'),
                );
                onRequestClose(true);
              }
            },
            onError(error) {
              message.error(
                error?.message ||
                  t('resourcePolicy.CannotCreateResourcePolicy'),
              );
            },
          });
        } else {
          commitModifyProjectResourcePolicy({
            variables: {
              name: values?.name,
              props: props as ModifyProjectResourcePolicyInput,
            },
            onCompleted(res, errors) {
              if (!res?.modify_project_resource_policy?.ok || errors) {
                message.error(
                  res?.modify_project_resource_policy?.msg ||
                    t('resourcePolicy.CannotUpdateResourcePolicy'),
                );
                onRequestClose();
              } else {
                message.success(
                  t('storageHost.ResourcePolicySuccessfullyUpdated'),
                );
                onRequestClose(true);
              }
            },
            onError(error) {
              message.error(
                error?.message ||
                  t('resourcePolicy.CannotUpdateResourcePolicy'),
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
        projectResourcePolicy === null
          ? t('resourcePolicy.CreateResourcePolicy')
          : t('resourcePolicy.UpdateResourcePolicy')
      }
      onOk={handleOk}
      onCancel={() => onRequestClose()}
      destroyOnHidden
      confirmLoading={
        isInFlightCommitCreateProjectResourcePolicy ||
        isInFlightCommitModifyProjectResourcePolicy
      }
      {...baiModalProps}
    >
      <Alert
        message={t('storageHost.BeCarefulToSetProjectResourcePolicy')}
        type="warning"
        showIcon
        style={{ marginBottom: token.marginMD }}
      />
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={initialValues}
        preserve={false}
      >
        <Form.Item
          label={t('resourcePolicy.Name')}
          name="name"
          required
          rules={[
            {
              required: true,
              message: t('data.explorer.ValueRequired'),
            },
            {
              max: 255,
            },
            {
              validator: (_, value) => {
                if (
                  !projectResourcePolicy &&
                  existingPolicyNames?.includes(value)
                ) {
                  return Promise.reject(
                    t('resourcePolicy.ResourcePolicyNameAlreadyExists'),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input disabled={!!projectResourcePolicy} />
        </Form.Item>
        <BAIFlex
          direction="column"
          align="stretch"
          gap={'md'}
          style={{ marginBottom: token.marginMD }}
        >
          <FormItemWithUnlimited
            name={'max_vfolder_count'}
            unlimitedValue={0}
            label={t('resourcePolicy.MaxFolderCount')}
            style={{ width: '100%', margin: 0 }}
          >
            <InputNumber
              min={0}
              max={SIGNED_32BIT_MAX_INT}
              style={{ width: '100%' }}
            />
          </FormItemWithUnlimited>
          <FormItemWithUnlimited
            name={'max_quota_scope_size'}
            unlimitedValue={-1}
            label={t('storageHost.MaxFolderSize')}
            style={{ width: '100%', margin: 0 }}
          >
            <InputNumber
              min={0}
              // Maximum safe integer divided by 10^9 to prevent overflow when converting GB to bytes
              max={Math.floor(Number.MAX_SAFE_INTEGER / Math.pow(10, 9))}
              addonAfter="GB"
              style={{ width: '100%' }}
            />
          </FormItemWithUnlimited>
          {supportMaxNetworkCount ? (
            <FormItemWithUnlimited
              name={'max_network_count'}
              unlimitedValue={-1}
              label={t('resourcePolicy.MaxNetworkCount')}
              style={{ width: '100%', margin: 0 }}
            >
              <InputNumber
                min={0}
                max={SIGNED_32BIT_MAX_INT}
                style={{ width: '100%' }}
              />
            </FormItemWithUnlimited>
          ) : null}
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default ProjectResourcePolicySettingModal;
