import { baiSignedRequestWithPromise } from '../helper';
import { useAnonymousBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useWebComponentInfo } from './DefaultProviders';
import { WarningTwoTone } from '@ant-design/icons';
import { Button, Form, Modal, Typography, Input, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// src/components/backend-ai-common-utils.ts
export const passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/;

const ResetPasswordRequired = () => {
  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    open: boolean;
    currentPassword: string;
    username: string;
    api_endpoint: string;
  };
  try {
    parsedValue = JSON.parse(value || '');
  } catch (error) {
    parsedValue = {
      open: false,
      currentPassword: '',
      username: '',
      api_endpoint: '',
    };
  }
  const { open, currentPassword, username, api_endpoint } = parsedValue;

  const { token } = theme.useToken();
  const [form] = Form.useForm<{
    newPassword: string;
    confirm: string;
  }>();
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const anonymousBaiClient = useAnonymousBackendaiClient({ api_endpoint });

  const mutation = useTanMutation({
    mutationFn: (body: {
      username: string;
      current_password: string;
      new_password: string;
    }) => {
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/server/update-password-no-auth',
        body,
        client: anonymousBaiClient,
      });
    },
  });

  const onSubmit = () => {
    form.validateFields().then((values) => {
      mutation.mutate(
        {
          username: username,
          current_password: currentPassword,
          new_password: values.newPassword,
        },
        {
          onSuccess(data, variables, context) {
            dispatchEvent('ok', null);
          },
          onError(error, variables, context) {},
        },
      );
    });
  };

  return (
    <Modal
      open={open}
      centered
      mask={false}
      onCancel={() => {
        dispatchEvent('cancel', null);
      }}
      keyboard={false}
      maskClosable={false}
      footer={null}
      width={450}
      destroyOnHidden={true}
      forceRender
    >
      <BAIFlex
        direction="column"
        justify="start"
        align="stretch"
        gap={'md'}
        style={{
          alignSelf: 'stretch',
          paddingTop: token.paddingMD,
          paddingBottom: token.paddingMD,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          <WarningTwoTone twoToneColor={token.colorWarning} />{' '}
          {t('webui.menu.PleaseChangeYourPassword')}
        </Typography.Title>
        {t('webui.menu.YouMushChangeYourPassword')}
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            currentPassword: currentPassword,
          }}
          disabled={mutation.isPending}
        >
          <Form.Item
            name="newPassword"
            label={t('webui.menu.NewPassword')}
            rules={[
              {
                required: true,
              },
              {
                pattern: passwordPattern,
                message: t('webui.menu.InvalidPasswordMessage').toString(),
              },
              () => ({
                validator(_, value) {
                  if (currentPassword === value) {
                    return Promise.reject(
                      new Error(
                        t('webui.menu.NewPasswordCannotBeSame').toString(),
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirm"
            label={t('webui.menu.NewPasswordAgain')}
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              {
                required: true,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('environment.PasswordsDoNotMatch').toString()),
                  );
                },
              }),
            ]}
          >
            <Input.Password onPressEnter={onSubmit} />
          </Form.Item>
        </Form>
        <Button type="primary" onClick={onSubmit} loading={mutation.isPending}>
          {t('webui.menu.Update')}
        </Button>
      </BAIFlex>
    </Modal>
  );
};

export default ResetPasswordRequired;
