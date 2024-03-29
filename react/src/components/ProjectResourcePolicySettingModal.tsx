import { GBToBytes, bytesToGB } from '../helper';
import BAIModal, { BAIModalProps } from './BAIModal';
import { ProjectResourcePolicySettingModalFragment$key } from './__generated__/ProjectResourcePolicySettingModalFragment.graphql';
// import { ProjectResourcePolicySettingModalCreateMutation } from "./__generated__/ProjectResourcePolicySettingModalCreateMutation.graphql";
import { ProjectResourcePolicySettingModalModifyMutation } from './__generated__/ProjectResourcePolicySettingModalModifyMutation.graphql';
import { Form, Input, message, Alert, FormInstance } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

interface Props extends BAIModalProps {
  projectResourcePolicyFrgmt: ProjectResourcePolicySettingModalFragment$key | null;
  onRequestClose: () => void;
}

const ProjectResourcePolicySettingModal: React.FC<Props> = ({
  projectResourcePolicyFrgmt: resourcePolicyFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();

  const formRef = useRef<FormInstance>(null);

  const projectResourcePolicyInfo = useFragment(
    graphql`
      fragment ProjectResourcePolicySettingModalFragment on ProjectResourcePolicy {
        id
        name
        created_at
        max_quota_scope_size
      }
    `,
    resourcePolicyFrgmt,
  );

  // const [
  //   commitCreateProjectResourcePolicy,
  //   isInFlightCommitCreateProjectResourcePolicy,
  // ] = useMutation<ProjectResourcePolicySettingModalCreateMutation>(graphql`
  //   mutation ProjectResourcePolicySettingModalCreateMutation(
  //     $name: String!
  //     $props: CreateProjectResourcePolicyInput!
  //   ) {
  //     create_project_resource_policy(name: $name, props: $props) {
  //       ok
  //       msg
  //       resource_policy {
  //         max_quota_scope_size
  //       }
  //     }
  //   }
  // `);

  const [
    commitModifyProjectResourcePolicy,
    // isInFlightCommitModifyProjectResourcePolicy,
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

  const _onOk = (e: React.MouseEvent<HTMLElement>) => {
    formRef.current?.validateFields().then((values) => {
      if (
        projectResourcePolicyInfo?.name &&
        projectResourcePolicyInfo?.max_quota_scope_size
      ) {
        commitModifyProjectResourcePolicy({
          variables: {
            name: projectResourcePolicyInfo?.name,
            props: {
              // max_vfolder_count: values?.max_vfolder_count,
              max_quota_scope_size: GBToBytes(values?.max_quota_scope_size),
            },
          },
          onCompleted(response) {
            if (response?.modify_project_resource_policy?.ok) {
              message.success(
                t('storageHost.ResourcePolicySuccessfullyUpdated'),
              );
            } else {
              message.error(response?.modify_project_resource_policy?.msg);
            }
            onRequestClose();
          },
          onError(error) {
            console.log(error);
            message.error(error.message);
          },
        });
      } else {
        //   commitCreateProjectResourcePolicy({
        //     variables: {
        //       // TODO: Apply multiple resource policy
        //       // Create a project resource policy with the same name as the project name
        //       name: projectResourcePolicy || "",
        //       props: {
        //         max_quota_scope_size: GBToBytes(values?.max_quota_scope_size),
        //       },
        //     },
        //     onCompleted(response) {
        //       if (response?.create_project_resource_policy?.ok) {
        //         message.success(
        //           t("storageHost.ResourcePolicySuccessfullyCreated")
        //         );
        //       } else {
        //         message.error(response?.create_project_resource_policy?.msg);
        //       }
        //       onRequestClose();
        //     },
        //     onError(error) {
        //       console.log(error);
        //       message.error(error.message);
        //     },
        //   });
      }
    });
  };

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnClose
      title={t('storageHost.ResourcePolicySettings')}
      onOk={_onOk}
    >
      <Alert
        message={t('storageHost.BeCarefulToSetProjectResourcePolicy')}
        type="warning"
        showIcon
        style={{ marginTop: 20, marginBottom: 25 }}
      />
      <Form
        ref={formRef}
        preserve={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 20 }}
        validateTrigger={['onChange', 'onBlur']}
        initialValues={{
          id: projectResourcePolicyInfo?.id,
          name: projectResourcePolicyInfo?.name,
          created_at: projectResourcePolicyInfo?.created_at,
          max_quota_scope_size:
            projectResourcePolicyInfo?.max_quota_scope_size === -1
              ? null
              : bytesToGB(projectResourcePolicyInfo?.max_quota_scope_size),
        }}
      >
        <Form.Item
          name="max_quota_scope_size"
          label={t('storageHost.MaxFolderSize')}
          rules={[
            {
              pattern: /^\d+(\.\d+)?$/,
              message:
                t('storageHost.quotaSettings.AllowNumberAndDot') ||
                'Allows numbers and .(dot) only',
            },
          ]}
        >
          <Input addonAfter="GB" type="number" step={0.25} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default ProjectResourcePolicySettingModal;
