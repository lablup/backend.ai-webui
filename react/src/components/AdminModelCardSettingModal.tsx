/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminModelCardSettingModalCreateMutation } from '../__generated__/AdminModelCardSettingModalCreateMutation.graphql';
import { AdminModelCardSettingModalUpdateMutation } from '../__generated__/AdminModelCardSettingModalUpdateMutation.graphql';
import type { ModelCardNode } from '../pages/AdminModelCardListPage';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
import { App, Form, type FormInstance, Input, Select } from 'antd';
import type { ModalProps } from 'antd/es/modal';
import {
  BAIDomainSelect,
  BAIModal,
  BAIVFolderSelect,
  toLocalId,
} from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';

interface AdminModelCardSettingModalProps extends ModalProps {
  modelCardNode?: ModelCardNode | null;
  onRequestClose?: (success: boolean) => void;
}

interface CreateFormValues {
  name: string;
  domainName: string;
  projectId: string;
  vfolderId: string;
}

interface EditFormValues {
  name: string;
  description?: string;
}

const AdminModelCardSettingModal: React.FC<AdminModelCardSettingModalProps> = ({
  modelCardNode,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);

  const isEditMode = !!modelCardNode;

  const [commitCreate, isInFlightCreate] =
    useMutation<AdminModelCardSettingModalCreateMutation>(graphql`
      mutation AdminModelCardSettingModalCreateMutation(
        $input: CreateModelCardV2Input!
      ) {
        adminCreateModelCardV2(input: $input) {
          modelCard {
            id
            name
          }
        }
      }
    `);

  const [commitUpdate, isInFlightUpdate] =
    useMutation<AdminModelCardSettingModalUpdateMutation>(graphql`
      mutation AdminModelCardSettingModalUpdateMutation(
        $input: UpdateModelCardV2Input!
      ) {
        adminUpdateModelCardV2(input: $input) {
          modelCard {
            id
            name
          }
        }
      }
    `);

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        if (isEditMode) {
          const editValues = values as EditFormValues;
          commitUpdate({
            variables: {
              input: {
                id: toLocalId(modelCardNode.id),
                name: editValues.name,
                description: editValues.description || null,
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                message.error(errors[0]?.message);
                return;
              }
              message.success(t('adminModelCard.ModelCardUpdated'));
              onRequestClose?.(true);
            },
            onError: (error) => {
              message.error(error?.message);
            },
          });
        } else {
          const createValues = values as CreateFormValues;
          commitCreate({
            variables: {
              input: {
                name: createValues.name,
                domainName: createValues.domainName,
                projectId: createValues.projectId,
                vfolderId: toLocalId(createValues.vfolderId),
              },
            },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                message.error(errors[0]?.message);
                return;
              }
              message.success(t('adminModelCard.ModelCardCreated'));
              onRequestClose?.(true);
            },
            onError: (error) => {
              message.error(error?.message);
            },
          });
        }
      })
      .catch(() => {
        // Validation failed — Ant Design Form shows field errors automatically
      });
  };

  const initialValues = isEditMode
    ? {
        name: modelCardNode.name,
        description: modelCardNode.metadata.description ?? undefined,
        title: modelCardNode.metadata.title ?? undefined,
        author: modelCardNode.metadata.author ?? undefined,
        task: modelCardNode.metadata.task ?? undefined,
        category: modelCardNode.metadata.category ?? undefined,
        architecture: modelCardNode.metadata.architecture ?? undefined,
        framework: modelCardNode.metadata.framework ?? [],
        label: modelCardNode.metadata.label ?? [],
      }
    : {};

  return (
    <BAIModal
      destroyOnHidden
      title={
        isEditMode
          ? t('adminModelCard.EditModelCard')
          : t('adminModelCard.CreateModelCard')
      }
      okText={isEditMode ? t('button.Update') : t('button.Create')}
      okButtonProps={{
        loading: isInFlightCreate || isInFlightUpdate,
      }}
      onOk={handleOk}
      onCancel={() => onRequestClose?.(false)}
      {...modalProps}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={initialValues}
        requiredMark="optional"
      >
        <Form.Item
          label={t('adminModelCard.Name')}
          name="name"
          rules={[{ required: true }, { max: 512 }]}
        >
          <Input />
        </Form.Item>

        {!isEditMode && (
          <>
            <Form.Item
              label={t('adminModelCard.Domain')}
              name="domainName"
              rules={[{ required: true }]}
            >
              <BAIDomainSelect
                onChange={() => {
                  formRef.current?.setFieldsValue({
                    projectId: undefined,
                    vfolderId: undefined,
                  });
                }}
              />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, cur) => prev.domainName !== cur.domainName}
            >
              {({ getFieldValue }) => {
                const domainName = getFieldValue('domainName');
                return (
                  <Form.Item
                    label={t('adminModelCard.Project')}
                    name="projectId"
                    rules={[{ required: true }]}
                    extra={
                      !domainName
                        ? t('adminModelCard.SelectDomainFirst')
                        : undefined
                    }
                  >
                    <ProjectSelectForAdminPage
                      domain={domainName ?? ''}
                      disabled={!domainName}
                      onChange={() => {
                        formRef.current?.setFieldValue('vfolderId', undefined);
                      }}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, cur) =>
                prev.projectId !== cur.projectId ||
                prev.domainName !== cur.domainName
              }
            >
              {({ getFieldValue }) => {
                const projectId = getFieldValue('projectId');
                return (
                  <Form.Item
                    label={t('adminModelCard.VFolder')}
                    name="vfolderId"
                    rules={[{ required: true }]}
                    extra={
                      !projectId
                        ? t('adminModelCard.SelectProjectFirst')
                        : undefined
                    }
                  >
                    <BAIVFolderSelect
                      currentProjectId={projectId}
                      disabled={!projectId}
                      filter={'usage_mode == "model"'}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </>
        )}

        <Form.Item label={t('adminModelCard.Title')} name="title">
          <Input />
        </Form.Item>

        <Form.Item label={t('adminModelCard.Description')} name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label={t('adminModelCard.Author')} name="author">
          <Input />
        </Form.Item>

        <Form.Item label={t('adminModelCard.Task')} name="task">
          <Input />
        </Form.Item>

        <Form.Item label={t('adminModelCard.Category')} name="category">
          <Input />
        </Form.Item>

        <Form.Item label={t('adminModelCard.Architecture')} name="architecture">
          <Input />
        </Form.Item>

        <Form.Item label={t('adminModelCard.Framework')} name="framework">
          <Select mode="tags" placeholder={t('adminModelCard.Framework')} />
        </Form.Item>

        <Form.Item label={t('adminModelCard.Label')} name="label">
          <Select mode="tags" placeholder={t('adminModelCard.Label')} />
        </Form.Item>

        {/* TODO(needs-backend): Add visibility toggle when backend adds visibility field */}
        {/* TODO(needs-backend): Add service definition fields when backend implements it */}
      </Form>
    </BAIModal>
  );
};

export default AdminModelCardSettingModal;
