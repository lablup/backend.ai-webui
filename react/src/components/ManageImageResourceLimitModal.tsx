import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import { useWebComponentInfo } from './DefaultProviders';
import ImageResourceFormItem from './ImageResourceFormItem';
import {
  ManageImageResourceLimitModalMutation,
  ResourceLimitInput,
} from './__generated__/ManageImageResourceLimitModalMutation.graphql';
import { App, Form, FormInstance, message } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useMutation } from 'react-relay';

// TODO: This is not 100% same with Image type of GraphQL.
// This type is modified version based on backend-ai-environment-list.ts
export type ImageFromEnvironment = {
  resource_limits: ResourceLimitInput[];
  registry: string;
  name: string;
  tag: string;
  architecture: string;
  installed: boolean;
  labels: {
    [key: string]: string;
  };
};
const ManageImageResourceLimitModal: React.FC<BAIModalProps> = ({
  ...BAIModalProps
}) => {
  const baiClient = useSuspendedBackendaiClient();
  // Differentiate default max value based on manager version.
  // The difference between validating a variable type as undefined or none for an unsupplied field value.
  // [Associated PR links] : https://github.com/lablup/backend.ai/pull/1941

  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const app = App.useApp();

  const {
    parsedValue: { image, open },
    dispatchEvent,
  } = useWebComponentInfo<{
    image: ImageFromEnvironment; //TODO: This is not 100% same with Image type, after implementing the image list with a relay query, the type should be changed.
    open?: boolean;
  }>();

  const [commitModifyImageInput, isInFlightModifyImageInput] =
    useMutation<ManageImageResourceLimitModalMutation>(graphql`
      mutation ManageImageResourceLimitModalMutation(
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

  const handleOnclick = async () => {
    const fieldsValue = await formRef.current?.getFieldsValue();
    const resource_limits: ResourceLimitInput[] = Object.entries(
      fieldsValue,
    ).map(([key, value]: [string, any]) => ({
      key,
      min: value.toString() ?? '0',
      max:
        image.resource_limits?.find((item) => item?.key === key)?.max ??
        baiClient.isManagerVersionCompatibleWith('23.09.11.*')
          ? undefined
          : null,
    }));

    const commitRequest = () =>
      commitModifyImageInput({
        variables: {
          target: `${image.registry}/${image.name}:${image.tag}`,
          architecture: image.architecture,
          props: {
            resource_limits,
          },
        },
        onCompleted: (res, err) => {
          if (err) {
            message.error(t('dialog.ErrorOccurred'));
          } else {
            message.success(t('environment.DescImageResourceModified'));
            dispatchEvent('ok', null);
          }
        },
        onError: (err) => {
          message.error(t('dialog.ErrorOccurred'));
        },
      });

    if (image?.installed) {
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
      maskClosable={false}
      onOk={handleOnclick}
      onCancel={() => dispatchEvent('cancel', null)}
      confirmLoading={isInFlightModifyImageInput}
      centered
      title={t('environment.ModifyImageResourceLimit')}
      {...BAIModalProps}
    >
      <Form ref={formRef} layout="vertical">
        {image?.resource_limits?.map(({ key, min, max }) => {
          // TODO: After implementing the image list with a relay query, the key transformation should not be needed.
          const keyUsingDot = key?.replace(/_/g, '.');
          return (
            <ImageResourceFormItem
              key={keyUsingDot}
              name={keyUsingDot ?? ''}
              min={min ?? ''}
              max={max ?? ''}
            />
          );
        })}
      </Form>
    </BAIModal>
  );
};

export default ManageImageResourceLimitModal;
