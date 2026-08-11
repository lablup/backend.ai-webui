p = 'react/src/components/SignupModal.tsx'
s = open(p).read()


def rep(old, new):
    global s
    assert old in s, old[:80]
    s = s.replace(old, new, 1)


rep("""import { Checkbox, Form, Input, Typography } from 'antd';
import { BAIButton, BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';""",
    """import BAIFormItem from './BAIFormItem';
import {
  AstryxFormCheckbox,
  AstryxFormTextInput,
} from './astryx-bui/astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
// SHIM (MAPPING §2): the antd Form engine stays until ticket 34.
import { Form } from 'antd';
import { BAIModal, BAIModalProps } from 'backend.ai-ui';""")

rep("""        footer={
          <BAIFlex justify="end" gap="sm">
            <BAIButton onClick={onRequestClose}>{t('button.Cancel')}</BAIButton>
            <BAIButton type="primary" action={handleSubmit}>
              {t('signUp.SignUp')}
            </BAIButton>
          </BAIFlex>
        }""", """        footer={
          // BUI `BAIButton.action` (async click + auto loading) IS Astryx's
          // native `clickAction` (SKILL.md wrapper policy: BAIButton
          // DISSOLVES), so the footer drops the wrapper entirely.
          <HStack justify="end" gap={2}>
            <Button onClick={onRequestClose} label={t('button.Cancel')} />
            <Button
              variant="primary"
              clickAction={handleSubmit}
              label={t('signUp.SignUp')}
            />
          </HStack>
        }""")

rep("""          <Form.Item
            name="email"
            label={t('signUp.E-mail')}
            rules={[
              {
                required: true,
                message: t('signUp.EmailInputRequired'),
              },
              {
                type: 'email',
                message: t('signUp.InvalidEmail'),
              },
            ]}
          >
            <Input
              type="email"
              maxLength={64}
              placeholder={t('maxLength.64chars')}
              autoFocus
            />
          </Form.Item>
          <Form.Item name="user_name" label={t('signUp.UserName')}>
            <Input maxLength={64} placeholder={t('maxLength.64chars')} />
          </Form.Item>""", """          {/* `Input maxLength` has no destination on Astryx `TextInput`
              (MAPPING §3.6) — dropped everywhere in this form; the server
              still validates length and the placeholder still states it. */}
          <BAIFormItem
            name="email"
            label={t('signUp.E-mail')}
            rules={[
              {
                required: true,
                message: t('signUp.EmailInputRequired'),
              },
              {
                type: 'email',
                message: t('signUp.InvalidEmail'),
              },
            ]}
          >
            <AstryxFormTextInput
              type="email"
              label={t('signUp.E-mail')}
              placeholder={t('maxLength.64chars')}
              hasAutoFocus
            />
          </BAIFormItem>
          <BAIFormItem name="user_name" label={t('signUp.UserName')}>
            <AstryxFormTextInput
              label={t('signUp.UserName')}
              placeholder={t('maxLength.64chars')}
            />
          </BAIFormItem>""")

rep("""            <Form.Item
              name="token"
              label={t('signUp.InvitationToken')}
              rules={[
                {
                  required: true,
                  message: t('signUp.TokenInputRequired'),
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>""", """            <BAIFormItem
              name="token"
              label={t('signUp.InvitationToken')}
              rules={[
                {
                  required: true,
                  message: t('signUp.TokenInputRequired'),
                },
              ]}
            >
              <AstryxFormTextInput label={t('signUp.InvitationToken')} />
            </BAIFormItem>""")

rep("""          <Form.Item
            name="password"
            label={t('signUp.Password')}
            rules={[
              {
                required: true,
                message: t('signUp.PasswordInputRequired'),
              },
              {
                pattern: passwordPattern,
                message: t('signUp.PasswordInvalid'),
              },
            ]}
            hasFeedback
          >
            <Input.Password maxLength={64} />
          </Form.Item>""", """          <BAIFormItem
            name="password"
            label={t('signUp.Password')}
            rules={[
              {
                required: true,
                message: t('signUp.PasswordInputRequired'),
              },
              {
                pattern: passwordPattern,
                message: t('signUp.PasswordInvalid'),
              },
            ]}
            hasFeedback
          >
            <AstryxFormTextInput
              type="password"
              label={t('signUp.Password')}
            />
          </BAIFormItem>""")

rep("""          >
            <Input.Password maxLength={64} />
          </Form.Item>
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[""", """          >
            <AstryxFormTextInput
              type="password"
              label={t('signUp.PasswordAgain')}
            />
          </BAIFormItem>
          <BAIFormItem
            name="agreement"
            valuePropName="checked"
            rules={[""")

rep("""          >
            <Checkbox>
              <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                {t('signUp.PolicyAgreement_1')}
                <Typography.Link
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTOS(true);
                  }}
                >
                  {t('signUp.TermsOfService')}
                </Typography.Link>
                {t('signUp.PolicyAgreement_2')}
                <Typography.Link
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPrivacyPolicy(true);
                  }}
                >
                  {t('signUp.PrivacyPolicy')}
                </Typography.Link>
                {t('signUp.PolicyAgreement_3')}
              </Typography.Text>
            </Checkbox>
          </Form.Item>""", """          >
            {/* PILOT-DECISION: antd let a `Checkbox` take arbitrary JSX
                children, which is how the policy sentence carried two inline
                links. Astryx `CheckboxInput` has a required STRING `label`
                (§1 contract 1), so the sentence moves OUT of the control and
                sits beside it: the checkbox keeps the accessible name, and
                the links stay reachable as real links instead of being
                nested inside a label (which also swallowed their clicks). */}
            <AstryxFormCheckbox
              label={t('signUp.RequestAgreementTermsOfService')}
              isLabelHidden
              endContent={
                <Text type="supporting">
                  {t('signUp.PolicyAgreement_1')}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTOS(true);
                    }}
                  >
                    {t('signUp.TermsOfService')}
                  </Link>
                  {t('signUp.PolicyAgreement_2')}
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacyPolicy(true);
                    }}
                  >
                    {t('signUp.PrivacyPolicy')}
                  </Link>
                  {t('signUp.PolicyAgreement_3')}
                </Text>
              }
            />
          </BAIFormItem>""")

rep("""        footer={
          <BAIButton
            type="primary"
            onClick={() => setShowEmailSentDialog(false)}
          >
            {t('button.Okay')}
          </BAIButton>
        }""", """        footer={
          <Button
            variant="primary"
            onClick={() => setShowEmailSentDialog(false)}
            label={t('button.Okay')}
          />
        }""")

rep("""        <Typography.Paragraph style={{ maxWidth: 350 }}>
          {t('signUp.VerificationMessage')}
        </Typography.Paragraph>""", """        <Text as="p" display="block" style={{ maxWidth: 350 }}>
          {t('signUp.VerificationMessage')}
        </Text>""")

open(p, 'w').write(s)
print('ok')
