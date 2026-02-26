import { BAIHuggingFaceRegistrySettingModalFragment$key } from '../../__generated__/BAIHuggingFaceRegistrySettingModalFragment.graphql';
import { BAIHuggingFaceRegistrySettingModalMutation } from '../../__generated__/BAIHuggingFaceRegistrySettingModalMutation.graphql';
import { toLocalId } from '../../helper';
import BAIModal, { BAIModalProps } from '../BAIModal';
import { App, Form, Input, FormInstance } from 'antd';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

export type BAIHuggingFaceRegistrySettingModalFragmentKey =
  BAIHuggingFaceRegistrySettingModalFragment$key;

export interface BAIHuggingFaceRegistrySettingModalProps extends BAIModalProps {
  huggingFaceRegistryFrgmt?: BAIHuggingFaceRegistrySettingModalFragmentKey | null;
}

interface FormValues {
  token: string;
}

const BAIHuggingFaceRegistrySettingModal: React.FC<
  BAIHuggingFaceRegistrySettingModalProps
> = ({ huggingFaceRegistryFrgmt = null, onOk, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<FormValues>>(null);
  const [isEditing, setIsEditing] = useState(false);

  const huggingFaceRegistry = useFragment(
    graphql`
      fragment BAIHuggingFaceRegistrySettingModalFragment on HuggingFaceRegistry {
        id
        token
      }
    `,
    huggingFaceRegistryFrgmt,
  );

  const [commitUpdateRegistry, isInflightUpdate] =
    useMutation<BAIHuggingFaceRegistrySettingModalMutation>(graphql`
      mutation BAIHuggingFaceRegistrySettingModalMutation(
        $input: UpdateHuggingFaceRegistryInput!
      ) {
        updateHuggingfaceRegistry(input: $input) {
          huggingfaceRegistry {
            id
            token
          }
        }
      }
    `);

  const hasExistingToken = !!huggingFaceRegistry?.token;

  const handleOk = (e: React.MouseEvent<HTMLButtonElement>) => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        if (!huggingFaceRegistry) return;
        commitUpdateRegistry({
          variables: {
            input: {
              id: toLocalId(huggingFaceRegistry.id),
              token: values.token || null,
            },
          },
          onCompleted: () => {
            message.success(
              t(
                'comp:BAIHuggingFaceRegistrySettingModal.TokenUpdatedSuccessfully',
              ),
            );
            setIsEditing(false);
            onOk?.(e);
          },
          onError: (error) => {
            message.error(error.message);
          },
        });
      })
      .catch(() => {
        // validation error
      });
  };

  return (
    <BAIModal
      title={t('comp:BAIHuggingFaceRegistrySettingModal.HuggingFaceSettings')}
      destroyOnHidden
      confirmLoading={isInflightUpdate}
      onOk={handleOk}
      afterClose={() => {
        formRef.current?.resetFields();
        setIsEditing(false);
      }}
      {...modalProps}
    >
      <Form ref={formRef} layout="vertical" preserve={false}>
        <Form.Item
          name="token"
          label={t('comp:BAIHuggingFaceRegistrySettingModal.Token')}
        >
          {hasExistingToken && !isEditing ? (
            <Input.Password
              value="••••••••••••"
              disabled
              addonAfter={
                <a onClick={() => setIsEditing(true)}>
                  {t('general.button.Edit')}
                </a>
              }
            />
          ) : (
            <Input.Password
              placeholder={t(
                'comp:BAIHuggingFaceRegistrySettingModal.EnterToken',
              )}
              autoFocus
            />
          )}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default BAIHuggingFaceRegistrySettingModal;
