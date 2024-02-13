import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { ModelServiceSettingModal_endpoint$key } from './__generated__/ModelServiceSettingModal_endpoint.graphql';
import { Form, FormInstance, InputNumber, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface Props extends BAIModalProps {
  endpointFrgmt: ModelServiceSettingModal_endpoint$key | null;
  onRequestClose: (success?: boolean) => void;
}

interface ServiceSettingFormInput {
  desired_session_count: number;
}

const ModelServiceSettingModal: React.FC<Props> = ({
  onRequestClose,
  endpointFrgmt,
  ...baiModalProps
}) => {
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);

  const endpoint = useFragment(
    graphql`
      fragment ModelServiceSettingModal_endpoint on Endpoint {
        endpoint_id
        desired_session_count
      }
    `,
    endpointFrgmt,
  );

  const mutationToUpdateService = useTanMutation({
    mutationFn: (values: ServiceSettingFormInput) => {
      const body = {
        to: values.desired_session_count,
      };
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: `/services/${endpoint?.endpoint_id}/scale`,
        body,
        client: baiClient,
      });
    },
  });

  // Apply any operation after clicking OK button
  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        mutationToUpdateService.mutate(values, {
          onSuccess: () => {
            console.log('service updated');
            onRequestClose(true);
          },
          onError: (error) => {
            console.log(error);
            // TODO: show error message
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Apply any operation after clicking Cancel button
  const handleCancel = () => {
    // console.log("Clicked cancel button");
    onRequestClose();
  };

  return (
    <BAIModal
      destroyOnClose
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{
        loading: mutationToUpdateService.isLoading,
      }}
      title={t('modelService.EditModelService')}
      {...baiModalProps}
    >
      <Flex direction="row" align="stretch" justify="around">
        <Form
          ref={formRef}
          preserve={false}
          validateTrigger={['onChange', 'onBlur']}
          initialValues={{
            desired_session_count: endpoint?.desired_session_count,
          }}
          style={{ marginBottom: token.marginLG, marginTop: token.margin }}
        >
          <Form.Item
            name="desired_session_count"
            label={t('modelService.DesiredSessionCount')}
            rules={[
              {
                pattern: /^[0-9]+$/,
                message: t('modelService.OnlyAllowsNonNegativeIntegers'),
              },
            ]}
          >
            <InputNumber type="number" min={0} />
          </Form.Item>
        </Form>
      </Flex>
    </BAIModal>
  );
};

export default ModelServiceSettingModal;
