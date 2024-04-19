import BAIModal, { BAIModalProps } from './BAIModal';
import { useWebComponentInfo } from './DefaultProviders';
import ImageResourceFormItem from './ImageResourceFormItem';
import { imageResourceProps } from './ImageResourceFormItem';
import { ManageImageResourceModalMutation } from './__generated__/ManageImageResourceModalMutation.graphql';
import { ResourceLimitInput } from './__generated__/ManageImageResourceModalMutation.graphql';
import { Form, message } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-relay';

const ManageImageResourceModal: React.FC<BAIModalProps> = ({
  ...BAIModalProps
}) => {
  const { t } = useTranslation();
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
    const fieldsValue = await form.getFieldsValue();

    const INPUT: ResourceLimitInput[] = Object.entries(fieldsValue).map(
      ([key, value]: [string, any]) => ({
        key,
        min: value.toString() ?? '0',
        max:
          image.resource_limits.find(
            (item: imageResourceProps) => item.key === key,
          )?.max ?? null,
      }),
    );

    commitModifyImageInput({
      variables: {
        target: `${image.registry}/${image.name}:${image.tag}`,
        props: {
          resource_limits: INPUT,
        },
      },
      onCompleted: (res, err) => {
        message.success(t('environment.DescServicePortModified'));
        dispatchEvent('ok', null);
        return;
      },
      onError: (err) => {
        message.error(t('dialog.ErrorOccurred'));
      },
    });
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
