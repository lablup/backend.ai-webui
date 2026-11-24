/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../../app-shim';
import BAIFormItem from '../../../components/BAIFormItem';
import { isValidUrl } from '../../../diagnostics/rules/configRules';
import { Form, type Rule } from '../../../form-engine';
import { useSuspendedBackendaiClient } from '../../../hooks';
import { useSuspenseTanQuery } from '../../../hooks/reactQueryAlias';
import {
  buildOpenIDConfigChange,
  OPENID_CLIENT_ASSERTION_ALGS,
  OPENID_HOOK_ROOT,
  OPENID_WEBAPP_ROOT,
  readOpenIDStoredConfig,
  type OpenIDFormValues,
} from '../helper/openidPluginConfig';
import {
  applyPluginConfigChange,
  isPluginConfigChangeEmpty,
  readPluginConfig,
  type PluginSecretStatus,
} from '../helper/pluginEtcdConfig';
import { Banner } from '@lablup/ui-common/Banner';
import { Heading } from '@lablup/ui-common/Heading';
import {
  BAIDynamicList,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAISelect,
  BAITextArea,
  BAITextInput,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PEM_PLACEHOLDER = '-----BEGIN …-----';
let openCount = 0;

interface OpenIDConnectSettingModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

interface OpenIDConnectSettingModalContentProps extends OpenIDConnectSettingModalProps {
  openId: number;
}

const OpenIDConnectSettingModal: React.FC<OpenIDConnectSettingModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  // Held above the Suspense boundary: state in a suspended first render is discarded.
  const [openId] = useState(() => ++openCount);
  return (
    <Suspense
      fallback={
        <BAIModal
          title={t('settings.sso.OpenIDConnect')}
          width={720}
          onCancel={onRequestClose}
          footer={null}
          loading
          {...modalProps}
        />
      }
    >
      <OpenIDConnectSettingModalContent
        openId={openId}
        onRequestClose={onRequestClose}
        {...modalProps}
      />
    </Suspense>
  );
};

const OpenIDConnectSettingModalContent: React.FC<
  OpenIDConnectSettingModalContentProps
> = ({ openId, onRequestClose, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();
  const [form] = Form.useForm<OpenIDFormValues>();
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  // The query keeps only flags for secrets: the raw trees never reach the cache.
  // One key per open: suspense keeps an entry at least 1 s, and a reopen must not diff against it.
  const { data: stored, refetch } = useSuspenseTanQuery({
    queryKey: ['plugin-config', 'openid', openId],
    queryFn: async () => {
      const [webapp, hook] = await Promise.all([
        readPluginConfig(baiClient, OPENID_WEBAPP_ROOT),
        readPluginConfig(baiClient, OPENID_HOOK_ROOT),
      ]);
      return readOpenIDStoredConfig(webapp, hook);
    },
    gcTime: 0,
  });

  const clientAuth =
    Form.useWatch('client_auth', form) ?? stored.values.client_auth;

  const urlRule: Rule = {
    validator: async (_, value?: string) => {
      if (value?.trim() && !isValidUrl(value.trim())) {
        throw new Error(t('settings.sso.InvalidURL'));
      }
    },
  };
  const requiredRule: Rule = {
    required: true,
    whitespace: true,
    message: t('settings.sso.ValueRequired'),
  };
  const requiredWithoutWellKnown: Rule = ({ getFieldValue }) => ({
    validator: async (_, value?: string) => {
      if (!getFieldValue('well_known')?.trim() && !value?.trim()) {
        throw new Error(t('settings.sso.RequiredWithoutWellKnown'));
      }
    },
  });
  // group_order is comma-separated, so a comma would split the ID.
  const groupIdRule: Rule = {
    pattern: /^[^,]*$/,
    message: t('settings.sso.GroupIDNoComma'),
  };
  const secretExtra = (status: PluginSecretStatus | boolean) =>
    status === 'mismatch'
      ? t('settings.sso.SecretMismatch')
      : status === true || status === 'set'
        ? t('settings.sso.SecretIsSet')
        : t('settings.sso.SecretIsNotSet');

  const save = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const values = await form.validateFields().catch(() => null);
      if (!values) return;
      const change = buildOpenIDConfigChange(
        { ...stored.values, ...values },
        stored,
      );
      if (isPluginConfigChangeEmpty(change)) {
        onRequestClose();
        return;
      }
      try {
        await applyPluginConfigChange(baiClient, change);
        message.success(t('notification.SuccessfullyUpdated'));
        onRequestClose();
      } catch (error) {
        message.error(getErrorMessage(error));
        // A partial write leaves etcd ahead of `stored`; the next diff needs the real state.
        await refetch();
      }
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const endpointItem = (
    name: 'authorization_endpoint' | 'token_endpoint' | 'jwks_uri' | 'issuer',
    label: string,
  ) => (
    <BAIFormItem
      name={name}
      label={label}
      dependencies={['well_known']}
      rules={[requiredWithoutWellKnown, urlRule]}
    >
      <BAITextInput type="url" />
    </BAIFormItem>
  );

  return (
    <BAIModal
      title={t('settings.sso.OpenIDConnect')}
      width={720}
      onCancel={onRequestClose}
      onOk={save}
      okText={t('button.Save')}
      cancelText={t('button.Cancel')}
      confirmLoading={isSaving}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Banner
          status="info"
          title={t('settings.sso.PluginRequired')}
          description={t('settings.sso.OpenIDRestartNote')}
        />
        <Form form={form} layout="vertical" initialValues={stored.values}>
          <Heading level={5}>{t('settings.sso.Provider')}</Heading>
          <BAIFormItem
            name="well_known"
            label={t('settings.sso.WellKnownURL')}
            extra={t('settings.sso.WellKnownURLDesc')}
            rules={[urlRule]}
          >
            <BAITextInput type="url" />
          </BAIFormItem>
          {endpointItem('issuer', t('settings.sso.Issuer'))}
          {endpointItem(
            'authorization_endpoint',
            t('settings.sso.AuthorizationEndpoint'),
          )}
          {endpointItem('token_endpoint', t('settings.sso.TokenEndpoint'))}
          {endpointItem('jwks_uri', t('settings.sso.JWKSURI'))}

          <Heading level={5}>{t('settings.sso.Client')}</Heading>
          <BAIFormItem
            name="client_id"
            label={t('settings.sso.ClientID')}
            rules={[requiredRule]}
          >
            <BAITextInput />
          </BAIFormItem>
          <BAIFormItem
            name="client_auth"
            label={t('settings.sso.ClientAuthentication')}
          >
            <BAISegmentedControl
              aria-label={t('settings.sso.ClientAuthentication')}
            >
              <BAISegmentedControlItem
                value="client_secret"
                label={t('settings.sso.ClientSecret')}
              />
              <BAISegmentedControlItem
                value="private_key_jwt"
                label={t('settings.sso.PrivateKeyJWT')}
              />
            </BAISegmentedControl>
          </BAIFormItem>
          {clientAuth === 'private_key_jwt' ? (
            <>
              <BAIFormItem
                name="private_key"
                label={t('settings.sso.PrivateKey')}
                extra={secretExtra(stored.secrets.private_key)}
                rules={stored.secrets.private_key ? [] : [requiredRule]}
              >
                <BAITextArea rows={4} placeholder={PEM_PLACEHOLDER} />
              </BAIFormItem>
              <BAIFormItem
                name="certificate"
                label={t('settings.sso.Certificate')}
                rules={[requiredRule]}
              >
                <BAITextArea rows={4} placeholder={PEM_PLACEHOLDER} />
              </BAIFormItem>
              <BAIFormItem
                name="client_assertion_alg"
                label={t('settings.sso.ClientAssertionAlgorithm')}
              >
                <BAISelect
                  allowClear
                  placeholder="PS256"
                  options={OPENID_CLIENT_ASSERTION_ALGS.map((alg) => ({
                    label: alg,
                    value: alg,
                  }))}
                />
              </BAIFormItem>
            </>
          ) : (
            <BAIFormItem
              name="client_secret"
              label={t('settings.sso.ClientSecret')}
              extra={secretExtra(stored.secrets.client_secret)}
              rules={stored.secrets.client_secret ? [] : [requiredRule]}
            >
              <BAITextInput type="password" autoComplete="new-password" />
            </BAIFormItem>
          )}

          <Heading level={5}>{t('settings.sso.SignIn')}</Heading>
          <BAIFormItem
            name="login_uri"
            label={t('settings.sso.LoginURI')}
            extra={t('settings.sso.LoginURIDesc')}
            rules={[requiredRule, urlRule]}
          >
            <BAITextInput type="url" />
          </BAIFormItem>
          <BAIFormItem
            name="allowed_redirect_hosts"
            label={t('settings.sso.AllowedRedirectHosts')}
            extra={t('settings.sso.AllowedRedirectHostsDesc')}
          >
            <BAITextInput placeholder="webui.example.com, other.example.com" />
          </BAIFormItem>
          <BAIFormItem
            name="secret"
            label={t('settings.sso.TokenSigningSecret')}
            extra={`${t('settings.sso.TokenSigningSecretDesc')} ${secretExtra(stored.secrets.secret)}`}
            rules={stored.secrets.secret === 'set' ? [] : [requiredRule]}
          >
            <BAITextInput type="password" autoComplete="new-password" />
          </BAIFormItem>

          <Heading level={5}>{t('settings.sso.GroupMapping')}</Heading>
          <BAIFormItem extra={t('settings.sso.GroupMappingDesc')}>
            <Form.List name="group_mapping">
              {(fields, { add, remove }) => (
                <BAIDynamicList
                  items={fields}
                  addButton={{
                    onClick: () => add({}),
                    label: t('settings.sso.AddGroup'),
                  }}
                  onRemove={(field) => remove(field.name)}
                  columns={[
                    {
                      key: 'group',
                      header: t('settings.sso.GroupID'),
                      width: 2,
                      render: ({ key: _key, name, ...rest }, index) => (
                        <Form.Item
                          {...rest}
                          name={[name, 'group']}
                          style={{ marginBottom: 0 }}
                          rules={[requiredRule, groupIdRule]}
                        >
                          <BAITextInput
                            aria-label={`${t('settings.sso.GroupID')} ${index + 1}`}
                          />
                        </Form.Item>
                      ),
                    },
                    ...(
                      [
                        ['domain', t('credential.Domain'), true],
                        ['project', t('general.Project'), true],
                        [
                          'user_resource_policy',
                          t('credential.UserResourcePolicy'),
                          false,
                        ],
                        [
                          'keypair_resource_policy',
                          t('resourcePolicy.KeypairResourcePolicy'),
                          false,
                        ],
                      ] as const
                    ).map(([field, header, isRequired]) => ({
                      key: field,
                      header,
                      render: (
                        { key: _key, name, ...rest }: (typeof fields)[number],
                        index: number,
                      ) => (
                        <Form.Item
                          {...rest}
                          name={[name, field]}
                          style={{ marginBottom: 0 }}
                          rules={isRequired ? [requiredRule] : []}
                        >
                          <BAITextInput
                            aria-label={`${header} ${index + 1}`}
                            placeholder={isRequired ? undefined : 'default'}
                          />
                        </Form.Item>
                      ),
                    })),
                  ]}
                />
              )}
            </Form.List>
          </BAIFormItem>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default OpenIDConnectSettingModal;
