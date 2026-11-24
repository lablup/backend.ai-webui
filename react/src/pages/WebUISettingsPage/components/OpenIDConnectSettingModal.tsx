/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../../app-shim';
import BAIFormItem from '../../../components/BAIFormItem';
import UserResourcePolicySelect from '../../../components/UserResourcePolicySelect';
import { isValidUrl } from '../../../diagnostics/rules/configRules';
import { Form, type Rule } from '../../../form-engine';
import { useSuspendedBackendaiClient } from '../../../hooks';
import { useSuspenseTanQuery } from '../../../hooks/reactQueryAlias';
import {
  buildOpenIDConfigChange,
  OPENID_CLIENT_ASSERTION_ALGS,
  OPENID_HOOK_ROOT,
  OPENID_WEBAPP_ROOT,
  openIDFormInitialValues,
  readOpenIDStoredConfig,
  type OpenIDFormValues,
} from '../helper/openidPluginConfig';
import {
  applyPluginConfigChange,
  isPluginConfigChangeEmpty,
  readPluginConfig,
} from '../helper/pluginEtcdConfig';
import ProjectNameSelect from './ProjectNameSelect';
import { Banner } from '@lablup/ui-common/Banner';
import { Heading } from '@lablup/ui-common/Heading';
import {
  BAIAdminKeypairResourcePolicySelect,
  BAIDomainSelect,
  BAIDynamicList,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIQuestionIconWithTooltip,
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAISelect,
  BAITextArea,
  BAITextInput,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { Suspense, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

const PEM_PLACEHOLDER = '-----BEGIN …-----';

const labelWithHelp = (label: string, help: string) => (
  <BAIFlex gap="xxs" align="center">
    {label}
    <BAIQuestionIconWithTooltip title={help} />
  </BAIFlex>
);
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
      {/* A failed read stays inside the modal; reopening it refetches. */}
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <OpenIDConnectSettingLoadError
            error={error}
            onRequestClose={onRequestClose}
            {...modalProps}
          />
        )}
      >
        <OpenIDConnectSettingModalContent
          openId={openId}
          onRequestClose={onRequestClose}
          {...modalProps}
        />
      </ErrorBoundary>
    </Suspense>
  );
};

const OpenIDConnectSettingLoadError: React.FC<
  OpenIDConnectSettingModalProps & { error: unknown }
> = ({ error, onRequestClose, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { getErrorMessage } = useErrorMessageResolver();
  return (
    <BAIModal
      title={t('settings.sso.OpenIDConnect')}
      width={720}
      onCancel={onRequestClose}
      footer={null}
      {...modalProps}
    >
      <Banner
        status="error"
        title={t('settings.sso.LoadFailed')}
        description={getErrorMessage(error)}
      />
    </BAIModal>
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
    message: t('settings.sso.ProviderGroupIDNoComma'),
  };
  const uniqueGroupRule: Rule = ({ getFieldValue }) => ({
    validator: async (_, value?: string) => {
      const id = value?.trim();
      const rows: OpenIDFormValues['group_mapping'] =
        getFieldValue('group_mapping') ?? [];
      if (id && rows.filter((row) => row?.group?.trim() === id).length > 1) {
        throw new Error(t('settings.sso.ProviderGroupIDDuplicate'));
      }
    },
  });
  const mappingRows: OpenIDFormValues['group_mapping'] | undefined =
    Form.useWatch('group_mapping', form);

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
        <Form
          form={form}
          layout="vertical"
          initialValues={openIDFormInitialValues(stored)}
        >
          <Heading level={5}>{t('settings.sso.Provider')}</Heading>
          <BAIFormItem
            name="well_known"
            label={labelWithHelp(
              t('settings.sso.WellKnownURL'),
              t('settings.sso.WellKnownURLDesc'),
            )}
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
                rules={stored.secrets.private_key ? [] : [requiredRule]}
              >
                <BAITextInput
                  type="password"
                  autoComplete="new-password"
                  placeholder={PEM_PLACEHOLDER}
                />
              </BAIFormItem>
              <BAIFormItem
                name="certificate"
                label={labelWithHelp(
                  t('settings.sso.Certificate'),
                  t('settings.sso.CertificateDesc'),
                )}
                rules={[requiredRule]}
              >
                <BAITextArea rows={4} placeholder={PEM_PLACEHOLDER} />
              </BAIFormItem>
              <BAIFormItem
                name="client_assertion_alg"
                label={labelWithHelp(
                  t('settings.sso.ClientAssertionAlgorithm'),
                  t('settings.sso.ClientAssertionAlgorithmDesc'),
                )}
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
              rules={stored.secrets.client_secret ? [] : [requiredRule]}
            >
              <BAITextInput type="password" autoComplete="new-password" />
            </BAIFormItem>
          )}

          <Heading level={5}>{t('settings.sso.SignIn')}</Heading>
          <BAIFormItem
            name="login_uri"
            label={labelWithHelp(
              t('settings.sso.LoginURI'),
              t('settings.sso.LoginURIDesc'),
            )}
            rules={[requiredRule, urlRule]}
          >
            <BAITextInput type="url" />
          </BAIFormItem>
          <BAIFormItem
            name="allowed_redirect_hosts"
            label={labelWithHelp(
              t('settings.sso.AllowedRedirectHosts'),
              t('settings.sso.AllowedRedirectHostsDesc'),
            )}
          >
            <BAITextInput placeholder="webui.example.com, other.example.com" />
          </BAIFormItem>
          <BAIFormItem
            name="secret"
            label={labelWithHelp(
              t('settings.sso.TokenSigningSecret'),
              t('settings.sso.TokenSigningSecretDesc'),
            )}
            extra={
              stored.secrets.secret === 'mismatch'
                ? t('settings.sso.SecretMismatch')
                : undefined
            }
            rules={stored.secrets.secret === 'set' ? [] : [requiredRule]}
          >
            <BAITextInput type="password" autoComplete="new-password" />
          </BAIFormItem>

          <Heading level={5}>
            {labelWithHelp(
              t('settings.sso.ProviderGroupMapping'),
              t('settings.sso.ProviderGroupMappingDesc'),
            )}
          </Heading>
          <BAIFormItem>
            <Form.List name="group_mapping">
              {(fields, { add, remove }) => (
                <BAIDynamicList
                  items={fields}
                  addButton={{
                    onClick: () => add({}),
                    label: t('settings.sso.AddProviderGroup'),
                  }}
                  onRemove={(field) => remove(field.name)}
                  columns={[
                    {
                      key: 'group',
                      header: t('settings.sso.ProviderGroupID'),
                      width: 2,
                      render: ({ key: _key, name, ...rest }, index) => (
                        <Form.Item
                          {...rest}
                          name={[name, 'group']}
                          style={{ marginBottom: 0 }}
                          dependencies={fields
                            .filter((field) => field.name !== name)
                            .map((field) => [
                              'group_mapping',
                              field.name,
                              'group',
                            ])}
                          rules={[requiredRule, groupIdRule, uniqueGroupRule]}
                        >
                          <BAITextInput
                            aria-label={`${t('settings.sso.ProviderGroupID')} ${index + 1}`}
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      key: 'domain',
                      header: t('credential.Domain'),
                      render: ({ key: _key, name, ...rest }, index) => (
                        <Suspense fallback={<BAISelect loading disabled />}>
                          <Form.Item
                            {...rest}
                            name={[name, 'domain']}
                            style={{ marginBottom: 0 }}
                            rules={[requiredRule]}
                          >
                            <BAIDomainSelect
                              aria-label={`${t('credential.Domain')} ${index + 1}`}
                              onChange={() =>
                                form.setFieldValue(
                                  ['group_mapping', name, 'project'],
                                  undefined,
                                )
                              }
                            />
                          </Form.Item>
                        </Suspense>
                      ),
                    },
                    {
                      key: 'project',
                      header: t('general.Project'),
                      render: ({ key: _key, name, ...rest }, index) => {
                        const domain = mappingRows?.[name]?.domain;
                        return (
                          <Suspense fallback={<BAISelect loading disabled />}>
                            <Form.Item
                              {...rest}
                              name={[name, 'project']}
                              style={{ marginBottom: 0 }}
                              rules={[requiredRule]}
                            >
                              {domain ? (
                                <ProjectNameSelect
                                  domain={domain}
                                  aria-label={`${t('general.Project')} ${index + 1}`}
                                />
                              ) : (
                                <BAISelect
                                  disabled
                                  aria-label={`${t('general.Project')} ${index + 1}`}
                                  placeholder={t(
                                    'settings.sso.SelectDomainFirst',
                                  )}
                                />
                              )}
                            </Form.Item>
                          </Suspense>
                        );
                      },
                    },
                    {
                      key: 'user_resource_policy',
                      header: t('credential.UserResourcePolicy'),
                      render: ({ key: _key, name, ...rest }, index) => (
                        <Suspense fallback={<BAISelect loading disabled />}>
                          <Form.Item
                            {...rest}
                            name={[name, 'user_resource_policy']}
                            style={{ marginBottom: 0 }}
                          >
                            <UserResourcePolicySelect
                              allowClear
                              placeholder="default"
                              aria-label={`${t('credential.UserResourcePolicy')} ${index + 1}`}
                            />
                          </Form.Item>
                        </Suspense>
                      ),
                    },
                    {
                      key: 'keypair_resource_policy',
                      header: t('resourcePolicy.KeypairResourcePolicy'),
                      render: ({ key: _key, name, ...rest }, index) => (
                        <Suspense fallback={<BAISelect loading disabled />}>
                          <Form.Item
                            {...rest}
                            name={[name, 'keypair_resource_policy']}
                            style={{ marginBottom: 0 }}
                          >
                            <BAIAdminKeypairResourcePolicySelect
                              label={`${t('resourcePolicy.KeypairResourcePolicy')} ${index + 1}`}
                              isLabelHidden
                              allowClear
                              placeholder="default"
                            />
                          </Form.Item>
                        </Suspense>
                      ),
                    },
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
