import {
  ManageImageResourceLimitModalMutation,
  ResourceLimitInput,
} from '../__generated__/ManageImageResourceLimitModalMutation.graphql';
import { ManageImageResourceLimitModal_image$key } from '../__generated__/ManageImageResourceLimitModal_image.graphql';
import { compareNumberWithUnits } from '../helper';
import {
  App,
  Form,
  type FormInstance,
  message,
  InputNumber,
  Row,
  Col,
} from 'antd';
import {
  useResourceSlotsDetails,
  BAIModal,
  BAIModalProps,
  BAIDynamicUnitInputNumber,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { useRef, Fragment } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

const DEFAULT_MIN_MEMORY = '1g'; // Default minimum memory value for resource limits
const DEFAULT_MIN_CPU = 1; // Default minimum CPU value for resource limits
const DEFAULT_MIN_OTHER = 0; // Default minimum value for other resource limits (e.g., Accelerators like GPUs)
interface ManageImageResourceLimitModalProps extends BAIModalProps {
  imageFrgmt: ManageImageResourceLimitModal_image$key | null;
  open: boolean;
  onRequestClose: (success: boolean) => void;
}

const ManageImageResourceLimitModal: React.FC<
  ManageImageResourceLimitModalProps
> = ({ imageFrgmt, open, onRequestClose, ...BAIModalProps }) => {
  // Differentiate default max value based on manager version.
  // The difference between validating a variable type as undefined or none for an unsupplied field value.
  // [Associated PR links] : https://github.com/lablup/backend.ai/pull/1941

  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const app = App.useApp();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const image = useFragment(
    graphql`
      fragment ManageImageResourceLimitModal_image on ImageNode {
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

  const handleOnClick = async () => {
    const isValid = await formRef.current?.validateFields().catch(() => false);
    if (!isValid) {
      return;
    }
    const fieldsValue = await formRef.current?.getFieldsValue();
    const resource_limits: ResourceLimitInput[] = Object.entries(fieldsValue)
      .map(([key, value]: [string, any]) => ({
        key,
        min: _.toString(value) ?? '0',
        max:
          image?.resource_limits?.find((item) => item?.key === key)?.max ??
          undefined,
      }))
      .filter((item) => !_.isEmpty(item?.min));

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
          if (errors?.length) {
            _.forEach(errors, (error) => message.error(error.message));
          } else {
            message.success(t('environment.DescImageResourceModified'));
            onRequestClose(true);
          }
        },
        onError: () => {
          message.error(t('dialog.ErrorOccurred'));
        },
      });

    if (image?.installed) {
      app.modal.confirm({
        title: t('environment.ImageReinstallationRequired'),
        content: (
          <Trans
            i18nKey={'environment.ModifyImageResourceLimitReinstallRequired'}
          />
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
      destroyOnHidden
      open={open}
      maskClosable={false}
      onOk={handleOnClick}
      onCancel={() => onRequestClose(false)}
      confirmLoading={isInFlightModifyImageInput}
      centered
      title={t('environment.ModifyMinimumImageResourceLimit')}
      {...BAIModalProps}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={_.fromPairs(
          _.map(image?.resource_limits ?? [], (item) => [item?.key, item?.min]),
        )}
      >
        <Row gutter={[24, 16]}>
          {_.map(
            _.chunk(image?.resource_limits ?? [], 2),
            (resourceLimitChunk, index) => (
              <Fragment key={index}>
                {_.map(resourceLimitChunk, (resourceLimit) => {
                  const key = _.get(resourceLimit, 'key', '');

                  if (!key) {
                    return null;
                  }

                  return (
                    <Col span={12} key={key} style={{ alignSelf: 'start' }}>
                      <Form.Item
                        label={
                          _.get(mergedResourceSlots, key)?.description ||
                          _.upperCase(key)
                        }
                        name={key}
                        rules={[
                          // Minimum resource values are assumed as 1 CPU core and 1 GiB memory.
                          // Accelerators (e.g., GPUs) have no minimum requirement and can be set arbitrarily.
                          // To preserve the key, the UI marks this field as required to prevent users from submitting an empty value.
                          {
                            required: true,
                          },
                          {
                            validator: (_, value) => {
                              if (
                                key === 'mem' &&
                                value &&
                                compareNumberWithUnits(
                                  value,
                                  DEFAULT_MIN_MEMORY,
                                ) < 0
                              ) {
                                return Promise.reject(
                                  new Error(
                                    t('environment.ErrorMinimumValue', {
                                      value: DEFAULT_MIN_MEMORY,
                                      key: mergedResourceSlots?.[key]
                                        ?.description,
                                    }),
                                  ),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        {key === 'mem' ? (
                          <BAIDynamicUnitInputNumber
                            min={DEFAULT_MIN_MEMORY}
                            style={{ width: '100%' }}
                          />
                        ) : (
                          <InputNumber
                            min={
                              key === 'cpu'
                                ? DEFAULT_MIN_CPU
                                : DEFAULT_MIN_OTHER
                            }
                            step={_.includes(key, '.shares') ? 0.1 : 1}
                            style={{ width: '100%' }}
                            suffix={
                              mergedResourceSlots?.[key]?.display_unit || ''
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                  );
                })}
              </Fragment>
            ),
          )}
        </Row>
      </Form>
    </BAIModal>
  );
};

export default ManageImageResourceLimitModal;
