import React, { useState, useMemo, useEffect } from "react";
import { 
  Modal,
  ModalProps,
  Form,
  FormProps,
  Select,
  Input,
  InputNumber,
} from "antd";
import _ from "lodash";
import { useTranslation } from "react-i18next";

type QuotaSettingVar = {
  [key: string]: string;
};
interface Props extends ModalProps {
  settings?: QuotaSettingVar;
  onRequestClose: (settings?: QuotaSettingVar) => void;
}
const StorageHostQuotaSettingModal: React.FC<Props> = ({
  onRequestClose,
  settings = {},
  ...props
}) => {
  const [form] = Form.useForm();
  const value = useMemo(
    () =>
      _.reduce(
        settings,
        (result, value, key) => {
          // eslint-disable-next-line
          // @ts-ignore
          result.settingList.push({ variable: key, value });
          return result;
        },
        { settingList: [] }
      ),
    [JSON.stringify(settings)]
  );

  useEffect(() => {
    if (props.open) {
      form.setFieldsValue(value);
    } else {
      form.resetFields();
    }
  }, [props.open]);

  return (
    <Modal
      {...props}
      style={{
        zIndex: 10000,
      }}
      destroyOnClose
      onOk={(e) => {
        form.submit();
      }}
      onCancel={() => {
        onRequestClose();
      }}
      title={"Quota Settings"}
    >
      <QuotaSettingVarForm
        onRequestClose={onRequestClose}
        form={form}
        initialValues={value}
      />
    </Modal>
  );
};

interface QuotaSettingVarFormProps extends FormProps {
  onRequestClose: (settings?: QuotaSettingVar) => void;
}
const QuotaSettingVarForm: React.FC<QuotaSettingVarFormProps> = ({
  onRequestClose,
  ...props
}) => {
  const { t } = useTranslation();
  const [allowedFolderTypes, setAllowedFolderTypes] = useState<string[]>(['User', 'Project']);
  const [storageHosts, setStorageHosts] = useState<string[]>(['local:volume1']);

  return (
    <Form
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      preserve={false}
      {...props}
      validateTrigger={["onChange", "onBlur"]}
      onFinish={(values) => {
        onRequestClose(
          _.reduce(
            values.envList,
            (acc, i) => {
              return {
                ...acc,
                [i.variable]: i.value,
              };
            },
            {}
          )
        );
      }}
    >
      <Form.Item label={t('storageHost.quotaSettings.Type')} required>
        <Select>
          {_.map(allowedFolderTypes, (type) => {
              return (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              );
            })}
        </Select>
      </Form.Item>
      <Form.Item label={t('storageHost.quotaSettings.Host')} required>
        <Select>
          {_.map(storageHosts, (host) => {
              return (
                <Select.Option key={host} value={host}>
                  {host}
                </Select.Option>
              );
            })}
        </Select>
      </Form.Item>
      <Form.Item label={t('storageHost.MaxFileCount')}>
        <InputNumber min={0}/>
      </Form.Item>
      <Form.Item label={t('storageHost.SoftLimit')}>
        <InputNumber min={0}/>
      </Form.Item>
      <Form.Item label={t('storageHost.HardLimit')}>
        <InputNumber min={0}/>
      </Form.Item>
      <Form.Item label={t('storageHost.VendorOptions')}>
        <Input.TextArea rows={3} />
      </Form.Item>
    </Form>
  );
};

export default StorageHostQuotaSettingModal;
