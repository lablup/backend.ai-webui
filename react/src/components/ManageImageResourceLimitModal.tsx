import {
  ManageImageResourceLimitModalMutation,
  ResourceLimitInput,
} from '../__generated__/ManageImageResourceLimitModalMutation.graphql';
import { ManageImageResourceLimitModal_image$key } from '../__generated__/ManageImageResourceLimitModal_image.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import ImageResourceFormItem from './ImageResourceFormItem';
import { App, Form, FormInstance, message } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

interface ManageImageResourceLimitModalProps extends BAIModalProps {
  imageFrgmt: ManageImageResourceLimitModal_image$key | null;
  open: boolean;
  onRequestClose: (success: boolean) => void;
}
const ManageImageResourceLimitModal: React.FC<
  ManageImageResourceLimitModalProps
> = ({ imageFrgmt, open, onRequestClose, ...BAIModalProps }) => {
  const baiClient = useSuspendedBackendaiClient();
  // Differentiate default max value based on manager version.
  // The difference between validating a variable type as undefined or none for an unsupplied field value.
  // [Associated PR links] : https://github.com/lablup/backend.ai/pull/1941

  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const app = App.useApp();

  const image = useFragment(
    graphql`
      fragment ManageImageResourceLimitModal_image on Image {
        resource_limits {
          key
          min
          max
        }
        registry
        name @deprecatedSince(version: "24.12.0")
        namespace @since(version: "24.12.0")
        architecture
        installed
        tag
      }
    `,
    imageFrgmt,
  );

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
        (image?.resource_limits?.find((item) => item?.key === key)?.max ??
        baiClient.isManagerVersionCompatibleWith('24.03.4.*'))
          ? undefined
          : null,
    }));

    const commitRequest = () =>
      commitModifyImageInput({
        variables: {
          target: `${image?.registry}/${image?.name ?? image?.namespace}:${image?.tag}`,
          architecture: image?.architecture,
          props: {
            resource_limits,
          },
        },
        onCompleted: (res, errors) => {
          if (!res?.modify_image?.ok) {
            message.error(res?.modify_image?.msg);
            return;
          }
          if (errors && errors?.length > 0) {
            const errorMsgList = _.map(errors, (error) => error.message);
            for (const error of errorMsgList) {
              message.error(error);
            }
          } else {
            message.success(t('environment.DescImageResourceModified'));
            onRequestClose(true);
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
              i18nKey={'environment.ModifyImageResourceLimitReinstallRequired'}
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
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightModifyImageInput}
      centered
      title={t('environment.ModifyImageResourceLimit')}
      {...BAIModalProps}
    >
      <Form ref={formRef} layout="vertical">
        {image?.resource_limits?.map((resource_limit) => {
          // TODO: After implementing the image list with a relay query, the key transformation should not be needed.
          // @ts-ignore
          const { key, min, max } = resource_limit;
          const keyUsingDot = key.replace(/_/g, '.');
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
