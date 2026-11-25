/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../../app-shim';
import BAIFormItem from '../../../components/BAIFormItem';
import UserResourcePolicySelect from '../../../components/UserResourcePolicySelect';
import { isValidUrl } from '../../../diagnostics/rules/configRules';
import { Form, type FormInstance, type Rule } from '../../../form-engine';
import { useSuspendedBackendaiClient } from '../../../hooks';
import { useTanQuery } from '../../../hooks/reactQueryAlias';
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
import { Suspense, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const PEM_PLACEHOLDER = '-----BEGIN …-----';

const labelWithHelp = (label: string, help: string) => (
  <BAIFlex gap="xxs" align="center">
    {label}
    <BAIQuestionIconWithTooltip title={help} />
  </BAIFlex>
);
// Keeps the Form.Item outside the boundary: a suspended select stays registered, with its value and rules.
const SuspendedControl = ({
  render,
  ...controlProps
}: {
  render: (controlProps: Record<string, unknown>) => ReactNode;
} & Record<string, unknown>) => (
  <Suspense fallback={<BAISelect loading disabled />}>
    {render(controlProps)}
  </Suspense>
);

interface OpenIDConnectSettingModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const OpenIDConnectSettingModal: React.FC<OpenIDConnectSettingModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance<OpenIDFormValues>>(null);
  const isSavingRef = useRef(false);

  // The query keeps only flags for secrets: the raw trees never reach the cache.
  // gcTime 0 drops it on close, so every open reads etcd before the form is built.
  const {
    data: stored,
    error,
    isLoading,
    refetch,
  } = useTanQuery({
    queryKey: ['plugin-config', 'openid'],
    queryFn: async () => {
      const [webapp, hook] = await Promise.all([
        readPluginConfig(baiClient, OPENID_WEBAPP_ROOT),
        readPluginConfig(baiClient, OPENID_HOOK_ROOT),
      ]);
      return readOpenIDStoredConfig(webapp, hook);
    },
    gcTime: 0,
    staleTime: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

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

  const save = async () => {
    if (!stored || isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const form = formRef.current;
      if (
        !form ||
        !(await form.validateFields().then(
          () => true,
          () => false,
        ))
      )
        return;
      // The whole store, not the validated subset: a field whose control has not mounted keeps its value.
      const change = buildOpenIDConfigChange(
        { ...stored.values, ...form.getFieldsValue(true) },
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
      okButtonProps={{ disabled: !stored }}
      confirmLoading={isSaving}
      loading={isLoading}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Banner
          status="info"
          title={t('settings.sso.PluginRequired')}
          description={t('settings.sso.OpenIDRestartNote')}
        />
        {error ? (
          // A failed read stays inside the modal; reopening it refetches.
          <Banner
            status="error"
            title={t('settings.sso.LoadFailed')}
            description={getErrorMessage(error)}
          />
        ) : stored ? (
          <Form
            ref={formRef}
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
            <Form.Item
              noStyle
              shouldUpdate={(prev, next) =>
                prev.client_auth !== next.client_auth
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('client_auth') === 'private_key_jwt' ? (
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
                )
              }
            </Form.Item>

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
                          <Form.Item
                            {...rest}
                            name={[name, 'domain']}
                            style={{ marginBottom: 0 }}
                            rules={[requiredRule]}
                          >
                            <SuspendedControl
                              render={(controlProps) => (
                                <BAIDomainSelect
                                  {...controlProps}
                                  aria-label={`${t('credential.Domain')} ${index + 1}`}
                                  onChange={(value, option) => {
                                    (
                                      controlProps.onChange as
                                        | ((v: unknown, o?: unknown) => void)
                                        | undefined
                                    )?.(value, option);
                                    formRef.current?.setFieldValue(
                                      ['group_mapping', name, 'project'],
                                      undefined,
                                    );
                                  }}
                                />
                              )}
                            />
                          </Form.Item>
                        ),
                      },
                      {
                        key: 'project',
                        header: t('general.Project'),
                        render: ({ key: _key, name, ...rest }, index) => (
                          <Form.Item
                            noStyle
                            shouldUpdate={(prev, next) =>
                              prev.group_mapping?.[name]?.domain !==
                              next.group_mapping?.[name]?.domain
                            }
                          >
                            {({ getFieldValue }) => {
                              const domain: string | undefined = getFieldValue([
                                'group_mapping',
                                name,
                                'domain',
                              ]);
                              return (
                                <Form.Item
                                  {...rest}
                                  name={[name, 'project']}
                                  style={{ marginBottom: 0 }}
                                  rules={[requiredRule]}
                                >
                                  <SuspendedControl
                                    render={(controlProps) =>
                                      domain ? (
                                        <ProjectNameSelect
                                          {...controlProps}
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
                                      )
                                    }
                                  />
                                </Form.Item>
                              );
                            }}
                          </Form.Item>
                        ),
                      },
                      {
                        key: 'user_resource_policy',
                        header: t('credential.UserResourcePolicy'),
                        render: ({ key: _key, name, ...rest }, index) => (
                          <Form.Item
                            {...rest}
                            name={[name, 'user_resource_policy']}
                            style={{ marginBottom: 0 }}
                          >
                            <SuspendedControl
                              render={(controlProps) => (
                                <UserResourcePolicySelect
                                  {...controlProps}
                                  allowClear
                                  placeholder="default"
                                  aria-label={`${t('credential.UserResourcePolicy')} ${index + 1}`}
                                />
                              )}
                            />
                          </Form.Item>
                        ),
                      },
                      {
                        key: 'keypair_resource_policy',
                        header: t('resourcePolicy.KeypairResourcePolicy'),
                        render: ({ key: _key, name, ...rest }, index) => (
                          <Form.Item
                            {...rest}
                            name={[name, 'keypair_resource_policy']}
                            style={{ marginBottom: 0 }}
                          >
                            <SuspendedControl
                              render={(controlProps) => (
                                <BAIAdminKeypairResourcePolicySelect
                                  {...controlProps}
                                  label={`${t('resourcePolicy.KeypairResourcePolicy')} ${index + 1}`}
                                  isLabelHidden
                                  allowClear
                                  placeholder="default"
                                />
                              )}
                            />
                          </Form.Item>
                        ),
                      },
                    ]}
                  />
                )}
              </Form.List>
            </BAIFormItem>
          </Form>
        ) : null}
      </BAIFlex>
    </BAIModal>
  );
};

export default OpenIDConnectSettingModal;
