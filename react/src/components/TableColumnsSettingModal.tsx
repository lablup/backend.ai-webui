import { Endpoint } from '../pages/ServingListPage';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Checkbox, Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ColumnsSettingKeyType = string;

interface TableColumnsSettingProps extends BAIModalProps {
  open: boolean;
  onRequestClose: () => void;
  columns: ColumnsType<Endpoint>;
  selectKeys: ColumnsSettingKeyType[];
  onChangeSelectedKeys: (selectedKeys: ColumnsSettingKeyType[]) => void;
}

const TableColumnsSettingModal: React.FC<TableColumnsSettingProps> = ({
  open,
  onRequestClose,
  columns,
  selectKeys,
  onChangeSelectedKeys,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const optionsList = columns.map((column) => {
    return Object({ label: column.title, value: column.key });
  });
  const handleOk = () => {
    form.validateFields().then((values) => {
      onChangeSelectedKeys(values.columnsSetting);
      onRequestClose();
    });
  };

  return (
    <BAIModal
      title={t('modelService.TableColumnSetting')}
      open={open}
      onOk={handleOk}
      onCancel={onRequestClose}
      {...modalProps}
    >
      <Form
        form={form}
        initialValues={{ columnsSetting: selectKeys }}
        layout="vertical"
      >
        <Form.Item
          name="columnsSetting"
          label={t('modelService.TableColumnSetting')}
        >
          <Checkbox.Group
            options={optionsList}
            style={{ alignItems: 'center', display: 'block' }}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default TableColumnsSettingModal;
