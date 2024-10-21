import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentDomainValue } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import ProjectSelect from './ProjectSelect';
import StorageSelect from './StorageSelect';
import { App, Button, Divider, Form, Input, Radio, Switch, theme } from 'antd';
import { createStyles } from 'antd-style';
import { FormInstance } from 'antd/lib';
import { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  modal: css`
    .ant-modal-body {
      padding-top: 24px !important;
      padding-bottom: 0 !important;
    }
  `,
  form: css`
    .ant-form-item-label {
      display: flex;
      align-items: start;
      padding-left: var(--token-paddingSM);
    }
    .ant-form-item .ant-form-item-label > label {
      flex-direction: row-reverse !important;
      gap: var(--token-paddingXS);
    }
    .ant-form-item-control {
      padding-right: var(--token-paddingSM);
    }
    .ant-form-item-label > label::after {
      display: none !important;
    }
  `,
}));
interface FolderCreateFormItemsType {
  name: string;
  host: string | undefined;
  group: string | undefined;
  usage_mode: 'general' | 'model';
  type: 'user' | 'project';
  permission: 'rw' | 'ro' | 'wd';
  cloneable: boolean;
}

interface FolderCreateModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const FolderCreateModal: React.FC<FolderCreateModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const formRef = useRef<FormInstance>(null);
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();

  const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  const mutationToCreateFolder = useTanMutation<
    unknown,
    { message?: string },
    FolderCreateFormItemsType
  >({
    mutationFn: (values) => {
      const body = {
        name: values.name,
        host: values.host,
        group: values.group,
        usage_mode: values.usage_mode,
        permission: values.permission,
        cloneable: values.cloneable ?? false,
      };
      return baiRequestWithPromise({
        method: 'POST',
        url: '/folders',
        body: body,
      });
    },
  });

  const INITIAL_FORM_VALUES: FolderCreateFormItemsType = {
    name: '',
    host: undefined,
    group: currentProject.name,
    usage_mode: 'general',
    type: 'user',
    permission: 'rw',
    cloneable: false,
  };

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        mutationToCreateFolder.mutate(values, {
          onSuccess: () => {
            message.success(t('data.folders.FolderCreated'));
            document.dispatchEvent(
              new CustomEvent('backend-ai-folder-list-changed'),
            );
            onRequestClose();
          },
          onError: (error) => {
            message.error(error.message);
          },
        });
      })
      .catch((error) => console.log(error));
  };

  return (
    <BAIModal
      className={styles.modal}
      title={t('data.CreateANewStorageFolder')}
      footer={
        <Flex justify="between">
          <Button
            danger
            onClick={() => {
              formRef.current?.setFieldsValue(INITIAL_FORM_VALUES);
            }}
          >
            {t('button.Reset')}
          </Button>
          <Flex gap={token.marginSM}>
            <Button
              onClick={() => {
                onRequestClose();
              }}
            >
              {t('button.Cancel')}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleOk();
              }}
            >
              {t('data.Create')}
            </Button>
          </Flex>
        </Flex>
      }
      width={650}
      onCancel={() => {
        onRequestClose();
      }}
      destroyOnClose
      {...modalProps}
    >
      <Form
        className={styles.form}
        ref={formRef}
        initialValues={INITIAL_FORM_VALUES}
        labelCol={{ span: 8 }}
      >
        <Form.Item
          label={t('data.Foldername')}
          name={'name'}
          rules={[
            { required: true },
            {
              pattern: /^[a-zA-Z0-9-_.]+$/,
              message: t('data.Allowslettersnumbersand-_dot'),
            },
            {
              max: 64,
              message: t('data.FolderNameTooLong'),
            },
          ]}
        >
          <Input placeholder={t('maxLength.64chars')} />
        </Form.Item>
        <Divider />

        <Form.Item label={t('data.Host')} name={'host'}>
          <StorageSelect
            onChange={(value) => {
              formRef.current?.setFieldValue('host', value);
            }}
            showUsageStatus
            autoSelectType="usage"
            showSearch
          />
        </Form.Item>
        <Divider />

        <Form.Item label={t('data.UsageMode')} name={'usage_mode'}>
          <Radio.Group>
            <Radio value={'general'}>General</Radio>
            <Radio value={'model'}>Model</Radio>
          </Radio.Group>
        </Form.Item>
        <Divider />

        <Form.Item
          label={t('data.Type')}
          name={'type'}
          style={{ flex: 1, marginBottom: 0 }}
        >
          <Radio.Group>
            <Radio value={'user'}>User</Radio>
            <Radio value={'project'}>Project</Radio>
          </Radio.Group>
        </Form.Item>
        <Divider />

        <Suspense>
          <Form.Item dependencies={['type']} noStyle>
            {({ getFieldValue }) => {
              return (
                getFieldValue('type') === 'project' && (
                  <>
                    <Form.Item label={t('data.Project')} name={'group'}>
                      <ProjectSelect domain={currentDomain} />
                    </Form.Item>
                    <Divider />
                  </>
                )
              );
            }}
          </Form.Item>
        </Suspense>

        <Form.Item label={t('data.Permission')} name={'permission'}>
          <Radio.Group>
            <Radio value={'rw'}>Read & Write</Radio>
            <Radio value={'ro'}>Read Only</Radio>
            <Radio value={'wd'}>Delete</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item dependencies={['usage_mode']} noStyle>
          {({ getFieldValue }) => {
            return (
              getFieldValue('usage_mode') === 'model' && (
                <>
                  <Divider />
                  <Form.Item
                    label={t('data.folders.Cloneable')}
                    name={'cloneable'}
                  >
                    <Switch defaultChecked={false} />
                  </Form.Item>
                </>
              )
            );
          }}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default FolderCreateModal;
