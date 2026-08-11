import re

p = 'react/src/components/LoginFormPanel.tsx'
s = open(p).read()


def rep(old, new, count=1):
    global s
    assert old in s, old[:80]
    s = s.replace(old, new, count)


rep("""import {
  Alert,
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Segmented,
  Typography,
  type FormInstance,
  type MenuProps,
} from 'antd';""", """import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryx-bui/astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import {
  DropdownMenu,
  type DropdownMenuOption,
} from '@astryxdesign/core/DropdownMenu';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Link } from '@astryxdesign/core/Link';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Text } from '@astryxdesign/core/Text';
// SHIM (MAPPING §2): the antd Form ENGINE stays until ticket 34; only its
// visual layer moves (`Form.Item` -> `BAIFormItem`, antd controls -> the
// Astryx form-control adapters).
import { Form, type FormInstance } from 'antd';""")

rep("""  endpointMenuItems: MenuProps['items'];
  onEndpointMenuClick: MenuProps['onClick'];""",
    """  endpointMenuItems: DropdownMenuOption[];""")

rep("""            <Segmented
              value={connectionMode}
              options={[
                { label: t('login.SessionMode'), value: 'SESSION' },
                { label: t('login.APIMode'), value: 'API' },
              ]}
              onChange={(value) =>
                onConnectionModeChange(value as ConnectionMode)
              }
              block
            />""", """            <SegmentedControl
              value={connectionMode}
              onChange={(value) =>
                onConnectionModeChange(value as ConnectionMode)
              }
              layout="fill"
              label={t('login.SessionMode')}
              isLabelHidden
            >
              <SegmentedControlItem
                value="SESSION"
                label={t('login.SessionMode')}
              />
              <SegmentedControlItem value="API" label={t('login.APIMode')} />
            </SegmentedControl>""")

rep("""              <Form.Item
                name="user_id"
                style={{ marginBottom: token.marginSM }}
              >
                <Input
                  prefix={<Mail size="1em" />}
                  placeholder={t('login.E-mailOrUsername', { postProcess: [] })}
                  aria-label={t('login.E-mailOrUsername', { postProcess: [] })}
                  maxLength={64}
                  autoComplete="username"
                  // Focus the first field when the login form opens. When OTP is
                  // later required, the OTP input mounts with its own autoFocus
                  // and takes over.
                  autoFocus={!otpRequired}
                  disabled={isLoading}
                />
              </Form.Item>
              <Form.Item
                name="password"
                style={{ marginBottom: token.marginSM }}
              >
                <Input.Password
                  prefix={<KeyRound size="1em" />}
                  placeholder={t('login.Password', { postProcess: [] })}
                  aria-label={t('login.Password', { postProcess: [] })}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </Form.Item>
              {otpRequired && (
                <Form.Item name="otp" style={{ marginBottom: token.marginSM }}>
                  <Input
                    prefix={<Lock size="1em" />}
                    placeholder={t('totp.OTP', { postProcess: [] })}
                    disabled={isLoading}
                    autoFocus
                  />
                </Form.Item>
              )}""", """              {/* PILOT-DECISION: antd `Input prefix={<icon/>}` (MAPPING
                  §3.6) -> `TextInput startIcon`; the adapters do not expose
                  `startIcon`, and `maxLength` / `autoComplete` have no
                  destination on the Astryx control either, so the leading
                  glyphs and both attributes are dropped. The placeholder
                  already carries the field meaning, and the `label` (hidden,
                  supplied for a11y) carries the accessible name that antd's
                  `aria-label` used to. */}
              <BAIFormItem
                name="user_id"
                style={{ marginBottom: token.marginSM }}
              >
                <AstryxFormTextInput
                  label={t('login.E-mailOrUsername', { postProcess: [] })}
                  placeholder={t('login.E-mailOrUsername', { postProcess: [] })}
                  // Focus the first field when the login form opens. When OTP is
                  // later required, the OTP input mounts with its own autoFocus
                  // and takes over.
                  hasAutoFocus={!otpRequired}
                  disabled={isLoading}
                />
              </BAIFormItem>
              <BAIFormItem
                name="password"
                style={{ marginBottom: token.marginSM }}
              >
                <AstryxFormTextInput
                  type="password"
                  label={t('login.Password', { postProcess: [] })}
                  placeholder={t('login.Password', { postProcess: [] })}
                  disabled={isLoading}
                />
              </BAIFormItem>
              {otpRequired && (
                <BAIFormItem
                  name="otp"
                  style={{ marginBottom: token.marginSM }}
                >
                  <AstryxFormTextInput
                    label={t('totp.OTP', { postProcess: [] })}
                    placeholder={t('totp.OTP', { postProcess: [] })}
                    disabled={isLoading}
                    hasAutoFocus
                  />
                </BAIFormItem>
              )}""")

rep("""              <Form.Item
                name="api_key"
                style={{ marginBottom: token.marginSM }}
              >
                <Input
                  prefix={<Lock size="1em" />}
                  placeholder={t('login.APIKey', { postProcess: [] })}
                  maxLength={20}
                  autoFocus
                  disabled={isLoading}
                />
              </Form.Item>
              <Form.Item
                name="secret_key"
                style={{ marginBottom: token.marginSM }}
              >
                <Input.Password
                  prefix={<KeyRound size="1em" />}
                  placeholder={t('login.SecretKey', { postProcess: [] })}
                  maxLength={40}
                  disabled={isLoading}
                />
              </Form.Item>""", """              <BAIFormItem
                name="api_key"
                style={{ marginBottom: token.marginSM }}
              >
                <AstryxFormTextInput
                  label={t('login.APIKey', { postProcess: [] })}
                  placeholder={t('login.APIKey', { postProcess: [] })}
                  hasAutoFocus
                  disabled={isLoading}
                />
              </BAIFormItem>
              <BAIFormItem
                name="secret_key"
                style={{ marginBottom: token.marginSM }}
              >
                <AstryxFormTextInput
                  type="password"
                  label={t('login.SecretKey', { postProcess: [] })}
                  placeholder={t('login.SecretKey', { postProcess: [] })}
                  disabled={isLoading}
                />
              </BAIFormItem>""")

rep("""            <Alert
              type="error"
              showIcon
              title={loginError.message}
              description={loginError.description}
              style={{ marginBottom: token.marginSM }}
              closable={{
                closeIcon: true,
                onClose: onClearLoginError,
              }}
            />""", """            <Banner
              status="error"
              title={loginError.message}
              description={loginError.description}
              style={{ marginBottom: token.marginSM }}
              isDismissable
              onDismiss={onClearLoginError}
            />""")

rep("""          <Form.Item style={{ marginBottom: token.marginSM }}>
            <Button
              type="primary"
              block
              onClick={onLogin}
              loading={isLoading}
              aria-label={t('login.Login', { postProcess: [] })}
            >
              {t('login.Login')}
            </Button>
          </Form.Item>""", """          <BAIFormItem style={{ marginBottom: token.marginSM }}>
            <Button
              variant="primary"
              width="100%"
              onClick={onLogin}
              isLoading={isLoading}
              label={t('login.Login')}
            />
          </BAIFormItem>""")

rep("""            <Form.Item style={{ marginBottom: token.marginSM }}>
              <Button block onClick={onSAMLLogin}>
                {t('login.singleSignOn.LoginWithSAML')}
              </Button>
            </Form.Item>""", """            <BAIFormItem style={{ marginBottom: token.marginSM }}>
              <Button
                width="100%"
                onClick={onSAMLLogin}
                label={t('login.singleSignOn.LoginWithSAML')}
              />
            </BAIFormItem>""")

rep("""            <Form.Item style={{ marginBottom: token.marginSM }}>
              <Button block onClick={onOpenIDLogin}>
                {t('login.singleSignOn.LoginWithRealm', {
                  realmName: loginConfig.ssoRealmName || 'OpenID',
                })}
              </Button>
            </Form.Item>""", """            <BAIFormItem style={{ marginBottom: token.marginSM }}>
              <Button
                width="100%"
                onClick={onOpenIDLogin}
                label={t('login.singleSignOn.LoginWithRealm', {
                  realmName: loginConfig.ssoRealmName || 'OpenID',
                })}
              />
            </BAIFormItem>""")

rep("""              <Typography.Link
                onClick={() => setIsEndpointExpanded((prev) => !prev)}
                style={{ fontSize: 13, userSelect: 'none' }}
              >
                {isEndpointExpanded ? (
                  <ChevronDown
                    style={{ fontSize: 10, marginRight: 4 }}
                    size="1em"
                  />
                ) : (
                  <ChevronRight
                    style={{ fontSize: 10, marginRight: 4 }}
                    size="1em"
                  />
                )}
                {t('login.AdvancedSettings')}
              </Typography.Link>""", """              {/* `Typography.Link onClick` with no href -> Astryx `Link`
                  is anchor-first (MAPPING §3.16), so the router-less toggle
                  uses `href="#"` + `preventDefault` (the pilot's fallback).
                  The hand-set 13px/10px sizes are dropped (closed type
                  scale). */}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEndpointExpanded((prev) => !prev);
                }}
                startIcon={
                  isEndpointExpanded ? (
                    <ChevronDown size="1em" />
                  ) : (
                    <ChevronRight size="1em" />
                  )
                }
                style={{ userSelect: 'none' }}
              >
                {t('login.AdvancedSettings')}
              </Link>""")

rep("""                  <Dropdown
                    menu={{
                      items: endpointMenuItems,
                      onClick: onEndpointMenuClick,
                    }}
                    trigger={['click']}
                    overlayStyle={{ zIndex: 10001 }}
                  >
                    <Button
                      icon={<Cloud size="1em" />}
                      type="text"
                      style={{ color: token.colorInfo }}
                    />
                  </Dropdown>""", """                  {/* antd `Dropdown` wrapped an arbitrary trigger element;
                      Astryx `DropdownMenu` renders its own trigger from
                      `button` props and binds `onClick` per ITEM, so the
                      endpoint-select handler is attached where the items are
                      built (LoginView). The `overlayStyle` z-index and the
                      hand-painted info-blue icon tint have no destination
                      (P5). */}
                  <DropdownMenu
                    hasChevron={false}
                    menuWidth={340}
                    button={{
                      variant: 'ghost',
                      isIconOnly: true,
                      icon: <Cloud size="1em" />,
                      label: t('login.EndpointHistory'),
                    }}
                    items={endpointMenuItems}
                  />""")

rep("""                  <Form.Item
                    name="api_endpoint"
                    style={{ flex: 1, marginBottom: 0 }}
                    rules={[
                      {
                        pattern: /^https?:\\/\\/(.*)/,
                        message: t('login.EndpointStartWith'),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t('login.Endpoint', { postProcess: [] })}
                      aria-label={t('login.Endpoint', { postProcess: [] })}
                      maxLength={2048}
                      disabled={isEndpointDisabled || isLoading}
                      onChange={(e) => onSetApiEndpoint(e.target.value)}
                    />
                  </Form.Item>
                  <Button
                    icon={<Info size="1em" />}
                    type="text"
                    onClick={() =>
                      setHelpPanel({
                        title: t('login.EndpointInfo'),
                        content: t('login.DescEndpoint'),
                      })
                    }
                  />""", """                  <BAIFormItem
                    name="api_endpoint"
                    style={{ flex: 1, marginBottom: 0 }}
                    rules={[
                      {
                        pattern: /^https?:\\/\\/(.*)/,
                        message: t('login.EndpointStartWith'),
                      },
                    ]}
                  >
                    <AstryxFormTextInput
                      label={t('login.Endpoint', { postProcess: [] })}
                      placeholder={t('login.Endpoint', { postProcess: [] })}
                      disabled={isEndpointDisabled || isLoading}
                      onChange={(value) => onSetApiEndpoint(value)}
                    />
                  </BAIFormItem>
                  <IconButton
                    icon={<Info size="1em" />}
                    variant="ghost"
                    label={t('login.EndpointInfo')}
                    onClick={() =>
                      setHelpPanel({
                        title: t('login.EndpointInfo'),
                        content: t('login.DescEndpoint'),
                      })
                    }
                  />""")

rep("""              {loginConfig.signup_support && (
                <Typography.Link
                  style={{ fontSize: 'inherit' }}
                  onClick={() => onShowSignupDialog()}
                >
                  {t('login.SignUp')}
                </Typography.Link>
              )}
              {loginConfig.signup_support &&
                loginConfig.allowAnonymousChangePassword && (
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 'inherit' }}
                  >
                    |
                  </Typography.Text>
                )}
              {loginConfig.allowAnonymousChangePassword && (
                <>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 'inherit' }}
                  >
                    {t('login.ForgotPassword')}
                  </Typography.Text>
                  <Typography.Link
                    style={{ fontSize: 'inherit' }}
                    onClick={() => setShowChangePasswordEmailModal(true)}
                  >
                    {t('login.ChangePassword')}
                  </Typography.Link>
                </>
              )}""", """              {loginConfig.signup_support && (
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onShowSignupDialog();
                  }}
                >
                  {t('login.SignUp')}
                </Link>
              )}
              {loginConfig.signup_support &&
                loginConfig.allowAnonymousChangePassword && (
                  <Text color="secondary">|</Text>
                )}
              {loginConfig.allowAnonymousChangePassword && (
                <>
                  <Text color="secondary">{t('login.ForgotPassword')}</Text>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowChangePasswordEmailModal(true);
                    }}
                  >
                    {t('login.ChangePassword')}
                  </Link>
                </>
              )}""")

rep("""            <Typography.Text strong>{effectiveHelpPanel.title}</Typography.Text>
            <Button
              type="text"
              size="small"
              icon={<X size="1em" />}
              onClick={() => setHelpPanel(null)}
            />""", """            <Text weight="semibold">{effectiveHelpPanel.title}</Text>
            <IconButton
              variant="ghost"
              size="sm"
              icon={<X size="1em" />}
              label={t('button.Close')}
              onClick={() => setHelpPanel(null)}
            />""")

rep("""    <Modal
      open={open}
      centered""", """    // PILOT-DECISION: the bare antd `Modal` becomes BUI `BAIModal` — the
    // frontier wrapper this file already uses everywhere else — rather than a
    // second dialog vocabulary. `BAIModal` is rebased on Astryx `Dialog` by
    // ticket 30; converting this one call site to `BAIModalAstryx` now would
    // split the login screen across two dialog implementations.
    <BAIModal
      open={open}
      centered""")

rep("""      </BAIFlex>
    </Modal>
  );
};""", """      </BAIFlex>
    </BAIModal>
  );
};""")

rep("""        <Typography.Title level={3} style={{ margin: 0 }}>""",
    """        <Heading level={3} style={{ margin: 0 }}>""")
rep("""          {t('webui.menu.PleaseChangeYourPassword')}
        </Typography.Title>""", """          {t('webui.menu.PleaseChangeYourPassword')}
        </Heading>""")

rep("""          <Form.Item
            name="newPassword"
            label={t('webui.menu.NewPassword')}""", """          <BAIFormItem
            name="newPassword"
            label={t('webui.menu.NewPassword')}""")

rep("""            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label={t('webui.menu.NewPasswordAgain')}
            dependencies={['newPassword']}
            hasFeedback""", """            hasFeedback
          >
            <AstryxFormTextInput
              type="password"
              label={t('webui.menu.NewPassword')}
            />
          </BAIFormItem>
          <BAIFormItem
            name="confirm"
            label={t('webui.menu.NewPasswordAgain')}
            dependencies={['newPassword']}
            hasFeedback""")

rep("""          >
            <Input.Password onPressEnter={onSubmit} />
          </Form.Item>
        </Form>
        <Button type="primary" onClick={onSubmit} loading={mutation.isPending}>
          {t('webui.menu.Update')}
        </Button>""", """          >
            {/* antd `Input.Password onPressEnter` -> dropped: the Astryx
                adapter exposes no Enter hook, and the visible Update button
                below is the submit affordance. */}
            <AstryxFormTextInput
              type="password"
              label={t('webui.menu.NewPasswordAgain')}
            />
          </BAIFormItem>
        </Form>
        <Button
          variant="primary"
          onClick={onSubmit}
          isLoading={mutation.isPending}
          label={t('webui.menu.Update')}
        />""")

rep("""      <Typography.Paragraph>
        {t('login.DescChangePasswordEmail')}
      </Typography.Paragraph>""", """      <Text as="p" display="block">
        {t('login.DescChangePasswordEmail')}
      </Text>""")

rep("""        <Form.Item
          name="email"
          label={t('signUp.E-mail')}
          rules={[
            { required: true, message: t('signUp.EmailInputRequired') },
            {
              pattern: /^[A-Z0-9a-z#\\-_]+@.+\\..+$/,
              message: t('signUp.InvalidEmail'),
            },
          ]}
        >
          <Input
            type="email"
            maxLength={64}
            autoFocus
            onPressEnter={handleSend}
          />
        </Form.Item>""", """        <BAIFormItem
          name="email"
          label={t('signUp.E-mail')}
          rules={[
            { required: true, message: t('signUp.EmailInputRequired') },
            {
              pattern: /^[A-Z0-9a-z#\\-_]+@.+\\..+$/,
              message: t('signUp.InvalidEmail'),
            },
          ]}
        >
          <AstryxFormTextInput
            type="email"
            label={t('signUp.E-mail')}
            hasAutoFocus
          />
        </BAIFormItem>""")

open(p, 'w').write(s)
print('ok')
