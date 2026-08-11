import { BAIHuggingFaceRegistrySettingModalFragment$key } from '../../__generated__/BAIHuggingFaceRegistrySettingModalFragment.graphql';
import { BAIHuggingFaceRegistrySettingModalMutation } from '../../__generated__/BAIHuggingFaceRegistrySettingModalMutation.graphql';
import { App } from '../../app-shim';
import { Form, FormInstance } from '../../form-engine';
import { toLocalId } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAIModal, { BAIModalProps } from '../BAIModal';
import { AstryxFormTextInput } from '../astryxFormControls';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import { Link } from '@astryxdesign/core/Link';
import { useRef, useState } from 'react';
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
  const { t } = useBAIi18n();
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
          {/* PILOT-DECISION (to-astryx W2-D): `Input.Password addonAfter` ->
              an `InputGroup` with the Edit action as a sibling. Astryx's
              `TextInput` has no addon slot at all (MAPPING §3.6 routes
              `addonAfter` to `InputGroup`), and the affordance was an `<a>`
              with an `onClick` and no `href` — i.e. a button wearing a link,
              with no keyboard access. It is now an Astryx `Link`, which
              renders a real button when it has no `href` (the same call
              `BAILink` made in wave 1, decision D3). */}
          {hasExistingToken && !isEditing ? (
            <InputGroup
              label={t('comp:BAIHuggingFaceRegistrySettingModal.Token')}
              isLabelHidden
            >
              <AstryxFormTextInput
                label={t('comp:BAIHuggingFaceRegistrySettingModal.Token')}
                type="password"
                value="••••••••••••"
                disabled
              />
              <Link onClick={() => setIsEditing(true)}>
                {t('general.button.Edit')}
              </Link>
            </InputGroup>
          ) : (
            <AstryxFormTextInput
              label={t('comp:BAIHuggingFaceRegistrySettingModal.Token')}
              type="password"
              placeholder={t(
                'comp:BAIHuggingFaceRegistrySettingModal.EnterToken',
              )}
              hasAutoFocus
            />
          )}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default BAIHuggingFaceRegistrySettingModal;
