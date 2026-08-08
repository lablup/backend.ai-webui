/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { KeypairSettingModalCreateMutation } from '../__generated__/KeypairSettingModalCreateMutation.graphql';
import { KeypairSettingModalFragment$key } from '../__generated__/KeypairSettingModalFragment.graphql';
import { KeypairSettingModalModifyMutation } from '../__generated__/KeypairSettingModalModifyMutation.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import BAIFormItem from './BAIFormItem';
import KeypairResourcePolicySelect from './KeypairResourcePolicySelect';
import { AstryxFormNumberInput } from './astryx-bui/astryxFormControls';
import { Grid, GridSpan } from '@astryxdesign/core/Grid';
import {
  BAIModal,
  type BAIModalProps,
  BAISelect,
  BAIUserSelectAstryx,
} from 'backend.ai-ui';
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type KeypairSettingModalFormInput = {
  user_id?: string;
  rate_limit: number;
  resource_policy: string;
};

interface KeypairSettingModalProps extends BAIModalProps {
  keypairSettingModalFrgmt?: KeypairSettingModalFragment$key | null;
  onRequestClose: (success: boolean) => void;
}

const KeypairSettingModal: React.FC<KeypairSettingModalProps> = ({
  keypairSettingModalFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<KeypairSettingModalFormInput>>(null);

  const keypair = useFragment(
    graphql`
      fragment KeypairSettingModalFragment on KeyPair {
        rate_limit
        access_key
        resource_policy
      }
    `,
    keypairSettingModalFrgmt,
  );

  const [commitCreateKeypair, isInFlightCommitCreateKeypair] =
    useMutation<KeypairSettingModalCreateMutation>(graphql`
      mutation KeypairSettingModalCreateMutation(
        $user_id: String!
        $props: KeyPairInput!
      ) {
        create_keypair(user_id: $user_id, props: $props) {
          ok
          msg
        }
      }
    `);

  const [commitModifyKeypair, isInFlightCommitModifyKeypair] =
    useMutation<KeypairSettingModalModifyMutation>(graphql`
      mutation KeypairSettingModalModifyMutation(
        $access_key: String!
        $props: ModifyKeyPairInput!
      ) {
        modify_keypair(access_key: $access_key, props: $props) {
          ok
          msg
        }
      }
    `);

  return (
    <BAIModal
      title={
        keypair
          ? t('credential.ModifyKeypairResourcePolicy')
          : t('credential.AddCredential')
      }
      okText={keypair ? t('button.Save') : t('button.Create')}
      width={500}
      destroyOnHidden
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            keypair
              ? commitModifyKeypair({
                  variables: {
                    access_key: keypair.access_key ?? '',
                    props: {
                      rate_limit: values.rate_limit,
                      resource_policy: values.resource_policy,
                    },
                  },
                  onCompleted: (res, errors) => {
                    if (!res.modify_keypair?.ok || errors) {
                      message.error(res?.modify_keypair?.msg);
                      onRequestClose(false);
                      return;
                    }
                    message.success(t('notification.SuccessfullyUpdated'));
                    onRequestClose(true);
                  },
                  onError: (error) => {
                    message.error(error.message);
                    onRequestClose(false);
                  },
                })
              : commitCreateKeypair({
                  variables: {
                    user_id: values.user_id ?? '',
                    props: {
                      rate_limit: values.rate_limit,
                      resource_policy: values.resource_policy,
                    },
                  },
                  onCompleted: (res, errors) => {
                    if (!res.create_keypair?.ok || errors) {
                      message.error(res?.create_keypair?.msg);
                      onRequestClose(false);
                      return;
                    }
                    message.success(t('credential.KeypairCreated'));
                    onRequestClose(true);
                  },
                  onError: (error) => {
                    message.error(error.message);
                    onRequestClose(false);
                  },
                });
          })
          .catch(() => {});
      }}
      okButtonProps={{
        loading: isInFlightCommitCreateKeypair || isInFlightCommitModifyKeypair,
      }}
      onCancel={() => onRequestClose(false)}
      {...modalProps}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={keypair ? { ...keypair } : {}}
      >
        {!keypair && (
          // `BAIUserSelectAstryx` is the direct child of `BAIFormItem` so antd binds
          // its value/onChange automatically. The fallback mirrors the same
          // `BAIFormItem` to keep the field and its required rule registered
          // while the select fetches. Same shape as `ProjectAdminSettingModal`.
          <Suspense
            fallback={
              <BAIFormItem
                name="user_id"
                label={t('general.User')}
                rules={[
                  {
                    required: true,
                    message: t('credential.UserIDRequired'),
                  },
                ]}
              >
                <BAISelect loading style={{ width: '100%' }} />
              </BAIFormItem>
            }
          >
            <BAIFormItem
              name="user_id"
              label={t('general.User')}
              rules={[
                {
                  required: true,
                  message: t('credential.UserIDRequired'),
                },
              ]}
            >
              <BAIUserSelectAstryx
                label={t('general.User')}
                isLabelHidden
                placeholder={t('credential.SelectUser')}
              />
            </BAIFormItem>
          </Suspense>
        )}
        {/* PILOT-DECISION: antd `Row gutter={16}` + `Col span={12}` (no
            breakpoint props) → `Grid columns={24}` + `GridSpan columns={12}`
            per MAPPING.md §3.9 (gutter 16px = spacing step 4). */}
        <Grid columns={24} gap={4}>
          <GridSpan columns={12}>
            {/* Same Suspense shape as the user field: `KeypairResourcePolicySelect`
                is the direct child of `BAIFormItem` (auto value/onChange binding),
                and the fallback mirrors the same `BAIFormItem` so the field and its
                required rule stay registered while the query loads. */}
            <Suspense
              fallback={
                <BAIFormItem
                  name="resource_policy"
                  label={t('credential.ResourcePolicy')}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <BAISelect loading style={{ width: '100%' }} />
                </BAIFormItem>
              }
            >
              <BAIFormItem
                name="resource_policy"
                label={t('credential.ResourcePolicy')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <KeypairResourcePolicySelect />
              </BAIFormItem>
            </Suspense>
          </GridSpan>
          <GridSpan columns={12}>
            <BAIFormItem
              name="rate_limit"
              label={t('credential.RateLimitFor15min')}
              rules={[
                {
                  required: true,
                },
                {
                  type: 'number',
                  min: 0,
                  max: 50000,
                  message: t('credential.RateLimitValidation'),
                },
                {
                  validator(_rule, value) {
                    if (value <= 100) {
                      return Promise.reject(
                        t('credential.WarningLessRateLimit'),
                      );
                    }
                    return Promise.resolve();
                  },
                  warningOnly: true,
                },
              ]}
            >
              <AstryxFormNumberInput
                label={t('credential.RateLimitFor15min')}
              />
            </BAIFormItem>
          </GridSpan>
        </Grid>
      </Form>
    </BAIModal>
  );
};

export default KeypairSettingModal;
