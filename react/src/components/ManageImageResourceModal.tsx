import BAIModal, { BAIModalProps } from './BAIModal';
import { useWebComponentInfo } from './DefaultProviders';
import Flex from './Flex';
import ImageResourceFormItem from './ImageResourceFormItem';
import { imageResourceProps } from './ImageResourceFormItem';
import InputNumberWithSlider from './InputNumberWithSlider';
import { ManageImageResourceModalMutation } from './__generated__/ManageImageResourceModalMutation.graphql';
import { Form, Typography, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation } from 'react-relay';

interface ComponentMap {
  [key: string]: JSX.Element | undefined;
}

const ManageImageResourceModal: React.FC<BAIModalProps> = ({
  ...BAIModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  const [open, setOpen] = useState<boolean>(true);
  const { value, dispatchEvent } = useWebComponentInfo();

  const [commitModifyImageInput, isInFlightModifyImageInput] =
    useMutation<ManageImageResourceModalMutation>(graphql`
      mutation ManageImageResourceModalMutation(
        $target: String!
        $architecture: String
        $props: ModifyImageInput!
      ) {
        modify_image(
          target: $target
          architecture: $architecture
          props: $props
        ) {
          ok
          msg
        }
      }
    `);

  let parsedValue: {
    image: any;
  };
  try {
    parsedValue = JSON.parse(value || '');
  } catch (error) {
    parsedValue = {
      image: {},
    };
  }
  const { image } = parsedValue;
  const handleOnclick = async () => {
    console.log(form.getFieldsValue());
  };

  return (
    <BAIModal
      destroyOnClose
      open={open}
      onOk={handleOnclick}
      onCancel={() => setOpen(false)}
      afterClose={() => dispatchEvent('cancel', null)}
      confirmLoading={isInFlightModifyImageInput}
      centered
      title={t('environment.ModifyImageResourceLimit')}
      {...BAIModalProps}
    >
      <Form form={form} layout="vertical">
        {image.resource_limits.map(({ key, min, max }: imageResourceProps) => (
          <ImageResourceFormItem name={key} min={min} max={max} />
        ))}
      </Form>
    </BAIModal>
  );
};

export default ManageImageResourceModal;
