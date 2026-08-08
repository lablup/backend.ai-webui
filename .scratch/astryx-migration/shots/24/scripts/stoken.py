p = 'react/src/components/STokenLoginBoundary.tsx'
s = open(p).read()


def rep(old, new):
    global s
    assert old in s, old[:120]
    s = s.replace(old, new, 1)


rep("""import { Form, Input, Spin, Typography } from 'antd';
import { BAIButton, BAICard, BAIFlex, useBAILogger } from 'backend.ai-ui';""",
    """import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryx-bui/astryxFormControls';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Spinner } from '@astryxdesign/core/Spinner';
import { Text } from '@astryxdesign/core/Text';
// SHIM (MAPPING §2): the antd Form engine stays until ticket 34.
import { Form } from 'antd';
import { BAICard, BAIFlex, useBAILogger } from 'backend.ai-ui';""")

rep("""          <Spin size="large" />
          <Typography.Title level={5} style={{ margin: 0 }}>
            {t('sTokenLoginBoundary.AuthenticatingTitle')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t(descriptionKey)}
          </Typography.Text>""",
    """          <Spinner size="lg" />
          <Heading level={5} style={{ margin: 0 }}>
            {t('sTokenLoginBoundary.AuthenticatingTitle')}
          </Heading>
          <Text color="secondary">{t(descriptionKey)}</Text>""")

rep("""          <Typography.Paragraph style={{ margin: 0 }}>
            {description}
          </Typography.Paragraph>
          {causeDetail && error.kind !== 'totp-required' && (
            <Typography.Paragraph
              type="secondary"
              style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}
            >
              {causeDetail}
            </Typography.Paragraph>
          )}""",
    """          <Text as="p" display="block" style={{ margin: 0 }}>
            {description}
          </Text>
          {causeDetail && error.kind !== 'totp-required' && (
            <Text
              as="div"
              display="block"
              type="supporting"
              style={{ margin: 0, whiteSpace: 'pre-wrap' }}
            >
              {causeDetail}
            </Text>
          )}""")

rep("""              <BAIButton action={handleCopy} disabled={isInlineRetrying}>
                {t('sTokenLoginBoundary.CopyErrorDetails')}
              </BAIButton>
              <BAIButton
                type="primary"
                loading={isInlineRetrying}
                disabled={isInlineRetrying}
                onClick={onConfirmForce}
              >
                {t('login.Login')}
              </BAIButton>""",
    """              <Button
                clickAction={handleCopy}
                isDisabled={isInlineRetrying}
                label={t('sTokenLoginBoundary.CopyErrorDetails')}
              />
              <Button
                variant="primary"
                isLoading={isInlineRetrying}
                isDisabled={isInlineRetrying}
                onClick={onConfirmForce}
                label={t('login.Login')}
              />""")

rep("""              <BAIButton action={handleCopy}>
                {t('sTokenLoginBoundary.CopyErrorDetails')}
              </BAIButton>
              <BAIButton type="primary" action={handleRetry}>
                {t('sTokenLoginBoundary.Retry')}
              </BAIButton>""",
    """              <Button
                clickAction={handleCopy}
                label={t('sTokenLoginBoundary.CopyErrorDetails')}
              />
              <Button
                variant="primary"
                clickAction={handleRetry}
                label={t('sTokenLoginBoundary.Retry')}
              />""")

rep("""      <Form.Item
        name="otp"
        label={t('sTokenLoginBoundary.TotpPlaceholder')}""",
    """      {/* PILOT-DECISION: antd `Input.OTP` (six segmented boxes) is MAPPING
          §3.6's explicit NONE — "self-build". Per the simplicity policy the
          segmented widget is DROPPED rather than rebuilt: the field becomes a
          plain `TextInput`, keeping the same `^\\d{6}$` rule, the same
          required message and the same submit path. */}
      <BAIFormItem
        name="otp"
        label={t('sTokenLoginBoundary.TotpPlaceholder')}""")

rep("""        <Input.OTP
          length={6}
          size="large"
          disabled={isSubmitting}
          aria-label={t('sTokenLoginBoundary.TotpPlaceholder')}
        />
      </Form.Item>
      <BAIFlex direction="row" gap="sm" justify="end">
        <BAIButton
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {t('sTokenLoginBoundary.SubmitOtp')}
        </BAIButton>
      </BAIFlex>""",
    """        <AstryxFormTextInput
          label={t('sTokenLoginBoundary.TotpPlaceholder')}
          disabled={isSubmitting}
        />
      </BAIFormItem>
      <BAIFlex direction="row" gap="sm" justify="end">
        <Button
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          label={t('sTokenLoginBoundary.SubmitOtp')}
        />
      </BAIFlex>""")

open(p, 'w').write(s)
print('ok')
