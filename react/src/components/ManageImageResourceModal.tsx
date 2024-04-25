import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import { useWebComponentInfo } from './DefaultProviders';
import ImageResourceFormItem from './ImageResourceFormItem';
import { imageResourceProps } from './ImageResourceFormItem';
import { ManageImageResourceModalMutation } from './__generated__/ManageImageResourceModalMutation.graphql';
import { ResourceLimitInput } from './__generated__/ManageImageResourceModalMutation.graphql';
import { App, Form, message } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation } from 'react-relay';

const ManageImageResourceModal: React.FC<BAIModalProps> = ({
  ...BAIModalProps
}) => {
  const baiClient = useSuspendedBackendaiClient();

  // Differentiate default max value based on manager version.
  // The difference between validating a variable type as undefined or none for an unsupplied field value.
  // [Associated PR links] : https://github.com/lablup/backend.ai/pull/1941
  const MAX_VALUE = baiClient.isManagerVersionCompatibleWith('23.09.11.*')
    ? undefined
    : null;

  const { t } = useTranslation();
  const [form] = Form.useForm();
  const app = App.useApp();

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
    console.log(fieldsValue);
    const INPUT: ResourceLimitInput[] = Object.entries(fieldsValue).map(
      ([key, value]: [string, any]) => ({
        key,
        min: value.toString() ?? '0',
        max:
          image.resource_limits.find(
            (item: imageResourceProps) => item.key === key,
          )?.max ?? MAX_VALUE,
      }),
    );

    const commitRequest = () =>
      commitModifyImageInput({
        variables: {
          target: `${image.registry}/${image.name}:${image.tag}`,
          architecture: image.architecture,
          props: {
            resource_limits: INPUT,
          },
        },
        onCompleted: (res, err) => {
          console.log(res, err);
          message.success(t('environment.DescImageResourceModified'));
          dispatchEvent('ok', null);
          return;
        },
        onError: (err) => {
          console.log(err);
          message.error(t('dialog.ErrorOccurred'));
        },
      });

    if (image.installed) {
      app.modal.confirm({
        title: 'Image reinstallation required',
        content: (
          <>
            <Trans
              i18nKey={'envrionment.ModifyImageResourceLimitReinstallRequired'}
            />
          </>
        ),
        onOk: commitRequest,
        getContainer: () => document.body,
        closable: true,
      });
    } else {
      commitRequest();
    }
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
          <ImageResourceFormItem key={key} name={key} min={min} max={max} />
        ))}
      </Form>
    </BAIModal>
  );
};

export default ManageImageResourceModal;
