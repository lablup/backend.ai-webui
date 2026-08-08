import re


def load(p):
    return open(p).read()


def save(p, s):
    open(p, 'w').write(s)


def rep(s, old, new):
    assert old in s, old[:120]
    return s.replace(old, new, 1)


# ---------------------------------------------------------------- ChangePassword
p = 'react/src/components/ChangePasswordView.tsx'
s = load(p)
s = rep(s, """import { Form, Input, Typography } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  ESMClientErrorResponse,
} from 'backend.ai-ui';""", """import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryx-bui/astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
// SHIM (MAPPING §2): the antd Form engine stays until ticket 34.
import { Form } from 'antd';
import { BAIFlex, BAIModal, ESMClientErrorResponse } from 'backend.ai-ui';""")

s = rep(s, """          <BAIButton
            type="primary"
            block
            action={async () => {
              await handleUpdatePassword();
            }}
          >
            {t('webui.menu.Update')}
          </BAIButton>""", """          // BUI `BAIButton.action` is Astryx's native `clickAction`
          // (wrapper policy: BAIButton DISSOLVES); `block` -> `width="100%"`.
          <Button
            variant="primary"
            width="100%"
            clickAction={async () => {
              await handleUpdatePassword();
            }}
            label={t('webui.menu.Update')}
          />""")

s = rep(s, """            <Form.Item
              name="email"
              label={t('data.explorer.EnterEmailAddress')}""", """            <BAIFormItem
              name="email"
              label={t('data.explorer.EnterEmailAddress')}""")
s = rep(s, """            >
              <Input autoFocus maxLength={64} />
            </Form.Item>
            <Form.Item
              name="password1"
              label={t('webui.menu.NewPassword')}""", """            >
              <AstryxFormTextInput
                label={t('data.explorer.EnterEmailAddress')}
                hasAutoFocus
              />
            </BAIFormItem>
            <BAIFormItem
              name="password1"
              label={t('webui.menu.NewPassword')}""")
s = rep(s, """            >
              <Input.Password maxLength={64} />
            </Form.Item>
            <Form.Item
              name="password2"
              label={t('webui.menu.NewPasswordAgain')}""", """            >
              <AstryxFormTextInput
                type="password"
                label={t('webui.menu.NewPassword')}
              />
            </BAIFormItem>
            <BAIFormItem
              name="password2"
              label={t('webui.menu.NewPasswordAgain')}""")
s = rep(s, """            >
              <Input.Password maxLength={64} />
            </Form.Item>
          </Form>""", """            >
              <AstryxFormTextInput
                type="password"
                label={t('webui.menu.NewPasswordAgain')}
              />
            </BAIFormItem>
          </Form>""")

s = s.replace("""          <BAIButton type="primary" block onClick={redirectToLoginPage}>
            {t('button.Close')}
          </BAIButton>""", """          <Button
            variant="primary"
            width="100%"
            onClick={redirectToLoginPage}
            label={t('button.Close')}
          />""")
s = rep(s, """          <Typography.Text>{t('login.PasswordChanged')}</Typography.Text>""",
        """          <Text>{t('login.PasswordChanged')}</Text>""")
save(p, s)

# ------------------------------------------------------------ EmailVerification
p = 'react/src/components/EmailVerificationView.tsx'
s = load(p)
s = rep(s, """import { Form, Input } from 'antd';
import { BAIButton, BAIFlex, BAIModal } from 'backend.ai-ui';""",
        """import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryx-bui/astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
// SHIM (MAPPING §2): the antd Form engine stays until ticket 34.
import { Form } from 'antd';
import { BAIFlex, BAIModal } from 'backend.ai-ui';""")
s = rep(s, """          <BAIButton type="primary" block onClick={redirectToLoginPage}>
            {t('login.Login')}
          </BAIButton>""", """          <Button
            variant="primary"
            width="100%"
            onClick={redirectToLoginPage}
            label={t('login.Login')}
          />""")
s = rep(s, """          <BAIButton
            type="primary"
            block
            action={async () => {
              await handleResendVerification();
            }}
          >
            {t('signUp.SendEmail')}
          </BAIButton>""", """          <Button
            variant="primary"
            width="100%"
            clickAction={async () => {
              await handleResendVerification();
            }}
            label={t('signUp.SendEmail')}
          />""")
s = rep(s, """            <Form.Item
              name="email"
              rules={[""", """            <BAIFormItem
              name="email"
              rules={[""")
s = rep(s, """            >
              <Input
                placeholder={t('data.explorer.EnterEmailAddress')}
                autoFocus
                maxLength={64}
              />
            </Form.Item>""", """            >
              <AstryxFormTextInput
                label={t('data.explorer.EnterEmailAddress')}
                placeholder={t('data.explorer.EnterEmailAddress')}
                hasAutoFocus
              />
            </BAIFormItem>""")
save(p, s)

# ------------------------------------------------------------------ SignoutModal
p = 'react/src/components/SignoutModal.tsx'
s = load(p)
s = rep(s, """import { Form, Input, Alert, type FormInstance } from 'antd';""",
        """import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryx-bui/astryxFormControls';
import { Banner } from '@astryxdesign/core/Banner';
// SHIM (MAPPING §2): the antd Form engine stays until ticket 34.
import { Form, type FormInstance } from 'antd';""")
s = rep(s, """        <Form.Item name="alert">
          <Alert title={t('login.DescConfirmLeave')} type="warning" />
        </Form.Item>""", """        {/* The warning was wrapped in a state-less `Form.Item name="alert"`
            purely for spacing; it holds no field value, so the wrapper goes
            and the `Alert` becomes an Astryx `Banner` (MAPPING §4). */}
        <Banner title={t('login.DescConfirmLeave')} status="warning" />""")
s = rep(s, """        <Form.Item
          name="email"
          label={t('general.E-Mail')}""", """        <BAIFormItem
          name="email"
          label={t('general.E-Mail')}""")
s = rep(s, """        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('general.Password')}""", """        >
          <AstryxFormTextInput label={t('general.E-Mail')} />
        </BAIFormItem>
        <BAIFormItem
          name="password"
          label={t('general.Password')}""")
s = rep(s, """        >
          <Input.Password />
        </Form.Item>
      </Form>""", """        >
          <AstryxFormTextInput type="password" label={t('general.Password')} />
        </BAIFormItem>
      </Form>""")
save(p, s)

print('ok')
