import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { Button, Divider, Form, Input, Radio, theme } from 'antd';
import { createStyles } from 'antd-style';
import { FormInstance } from 'antd/lib';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  modal: css`
    .ant-modal-content {
      padding: 0 !important;
    }
  `,
  form: css`
    .ant-form-item-label {
      display: flex;
      align-items: flex-end;
      padding-left: var(--token-paddingSM);
    }
    .ant-form-item-control {
      padding-right: var(--token-paddingSM);
    }
    .ant-form-item-label > label::after {
      display: none !important;
    }
  `,
}));
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
  const formRef = useRef<FormInstance>(null);

  return (
    <BAIModal
      className={styles.modal}
      title={t('data.CreateANewStorageFolder')}
      footer={
        <Flex justify="between">
          <Button danger>{t('button.Reset')}</Button>
          <Flex gap={token.marginSM}>
            <Button>{t('button.Cancel')}</Button>
            <Button type="primary">{t('data.Create')}</Button>
          </Flex>
        </Flex>
      }
      width={650}
      onCancel={onRequestClose}
      destroyOnClose
      {...modalProps}
    >
      <Form className={styles.form} ref={formRef} labelCol={{ span: 8 }}>
        <Form.Item label={t('data.Foldername')} name={'folderName'}>
          <Input placeholder={t('data.Foldername')} />
        </Form.Item>
        <Divider />
        <Form.Item label={t('data.Host')} name={'host'}>
          <Input placeholder={t('data.Host')} />
        </Form.Item>
        <Divider />
        <Form.Item label={t('data.UsageMode')} name={'usageMode'}>
          <Radio.Group defaultValue={'general'}>
            <Radio value={'general'}>General</Radio>
            <Radio value={'data'}>Data</Radio>
            <Radio value={'model'}>Model</Radio>
          </Radio.Group>
        </Form.Item>
        <Divider />
        <Form.Item label={t('data.Type')} name={'type'}>
          <Radio.Group defaultValue={'user'}>
            <Radio value={'user'}>User</Radio>
            <Radio value={'project'}>Project</Radio>
          </Radio.Group>
        </Form.Item>
        <Divider />
        <Form.Item label={t('data.Permission')} name={'permission'}>
          <Radio.Group defaultValue={'rw'}>
            <Radio value={'rw'}>Read & Write</Radio>
            <Radio value={'ro'}>Read Only</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default FolderCreateModal;
