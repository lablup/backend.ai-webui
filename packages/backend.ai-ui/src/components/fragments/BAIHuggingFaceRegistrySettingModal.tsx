import { BAIHuggingFaceRegistrySettingModalFragment$key } from '../../__generated__/BAIHuggingFaceRegistrySettingModalFragment.graphql';
import { toLocalId } from '../../helper';
import BAIFlex from '../BAIFlex';
import BAIModal, { BAIModalProps } from '../BAIModal';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { EditOutlined } from '@ant-design/icons';
import { App, Button, Form, FormInstance, Input } from 'antd';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

export type BAIHuggingFaceRegistrySettingModalFragmentKey =
  BAIHuggingFaceRegistrySettingModalFragment$key;

export interface BAIHuggingFaceRegistrySettingModalProps extends BAIModalProps {
  huggingFaceRegistryFragment?: BAIHuggingFaceRegistrySettingModalFragmentKey;
  onRequestClose?: (success?: boolean) => void;
}

const BAIHuggingFaceRegistrySettingModal = ({
  huggingFaceRegistryFragment,
  onRequestClose,
  ...baiModalProps
}: BAIHuggingFaceRegistrySettingModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const formRef = useRef<FormInstance>(null);

  const huggingFaceRegistry = useFragment(
    graphql`
      fragment BAIHuggingFaceRegistrySettingModalFragment on HuggingFaceRegistry {
        id
        token
      }
    `,
    huggingFaceRegistryFragment,
  );

  const [updateHuggingFaceRegistry, isInflightUpdateHuggingFaceRegistry] =
    useMutation(graphql`
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

  const initialToken = huggingFaceRegistry?.token;
  const [isEditing, setIsEditing] = useState(false);

  const hasToken = initialToken && initialToken.length > 0;

  const executeUpdate = (values: any) => {
    updateHuggingFaceRegistry({
      variables: {
        input: {
          id: toLocalId(huggingFaceRegistry!.id),
          token: values.token,
        },
      },
      onCompleted: (_res, errors) => {
        if (errors && errors.length > 0) {
          errors.forEach((err) =>
            message.error(
              err.message ??
                t('comp:HuggingFaceRegistrySettingModal.FailedToUpdateToken'),
            ),
          );
          return;
        }
        message.success(
          t('comp:HuggingFaceRegistrySettingModal.TokenUpdatedSuccessfully'),
        );
        onRequestClose?.(true);
      },
      onError: (err) => {
        message.error(
          err.message ??
            t('comp:HuggingFaceRegistrySettingModal.FailedToUpdateToken'),
        );
      },
    });
  };

  const handleOk = () => {
    if (!huggingFaceRegistry?.id) {
      message.error(
        t('comp:HuggingFaceRegistrySettingModal.HuggingFaceRegistryNotFound'),
      );
      return;
    }

    formRef.current
      ?.validateFields()
      .then((values) => {
        // Check if current token exists and is empty string, but new token is not empty

        if (hasToken && !values.token) {
          modal.confirm({
            title: t('comp:HuggingFaceRegistrySettingModal.ResetTokenConfirm'),
            content: t(
              'comp:HuggingFaceRegistrySettingModal.ResetTokenConfirmMessage',
            ),
            onOk() {
              executeUpdate(values);
            },
            onCancel() {
              // Don't proceed with update
            },
            okButtonProps: { danger: true },
            okText: t('button.Reset'),
          });
        } else {
          executeUpdate(values);
        }
      })
      .catch(() => {});
  };

  return (
    <BAIUnmountAfterClose>
      <BAIModal
        destroyOnHidden
        afterClose={() => setIsEditing(false)}
        title={t('comp:HuggingFaceRegistrySettingModal.HuggingFaceSettings')}
        centered
        okText={t('button.Save')}
        onOk={handleOk}
        onCancel={() => onRequestClose?.(false)}
        okButtonProps={{
          loading: isInflightUpdateHuggingFaceRegistry,
        }}
        {...baiModalProps}
      >
        <Form ref={formRef} layout="vertical">
          <Form.Item
            label={t('comp:HuggingFaceRegistrySettingModal.Token')}
            name="token"
          >
            {hasToken && !isEditing ? (
              <BAIFlex gap={'xs'}>
                {/* For security, we display a masked token instead of initial value. */}
                <Input type="password" disabled value="••••••••••••••••" />
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsEditing(true);
                  }}
                  type="text"
                />
              </BAIFlex>
            ) : (
              <Input.Password
                placeholder={t(
                  'comp:HuggingFaceRegistrySettingModal.EnterToken',
                )}
                autoFocus={isEditing}
              />
            )}
          </Form.Item>
        </Form>
      </BAIModal>
    </BAIUnmountAfterClose>
  );
};

export default BAIHuggingFaceRegistrySettingModal;
