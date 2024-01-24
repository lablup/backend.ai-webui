import { baiSignedRequestWithPromise, iSizeToSize } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import ImageEnvironmentSelectFormItems from './ImageEnvironmentSelectFormItems';
import ResourceAllocationFormItems, {
  AUTOMATIC_DEFAULT_SHMEM,
  RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
} from './ResourceAllocationFormItems';
import SliderInputFormItem from './SliderInputFormItem';
import { ModelServiceSettingModalModifyMutation } from './__generated__/ModelServiceSettingModalModifyMutation.graphql';
import { ModelServiceSettingModal_endpoint$key } from './__generated__/ModelServiceSettingModal_endpoint.graphql';
import { Form, InputNumber, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

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
  const [form] = Form.useForm();

  const endpoint = useFragment(
    graphql`
      fragment ModelServiceSettingModal_endpoint on Endpoint {
        endpoint_id
        desired_session_count
        resource_slots
        resource_opts
        cluster_mode
        cluster_size
        image
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

  const [
    commitModifyEndpoint,
    // inInFlightCommitModifyEndpoint
  ] = useMutation<ModelServiceSettingModalModifyMutation>(graphql`
    mutation ModelServiceSettingModalModifyMutation(
      $endpoint_id: UUID!
      $props: ModifyEndpointInput!
    ) {
      modify_endpoint(endpoint_id: $endpoint_id, props: $props) {
        ok
        msg
      }
    }
  `);

  // Apply any operation after clicking OK button
  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    form
      .validateFields()
      .then((values) => {
        commitModifyEndpoint({
          variables: {
            // @ts-ignore
            endpoint_id: endpoint?.endpoint_id,
            props: {
              // TODO: setting resource_slots based on form values
              resource_slots: JSON.stringify({
                cpu: 2,
                mem: '4g',
              }),
            },
          },
          onCompleted(response) {
            if (response?.modify_endpoint?.ok) {
              console.log('successfully modified');
            } else {
              console.log('error occurred');
            }
            onRequestClose(true);
          },
          onError: (err) => {
            // console.log(err);
            throw err;
          },
        });
        // mutationToUpdateService.mutate(values, {
        //   onSuccess: () => {
        //     console.log('service updated');
        //     onRequestClose(true);
        //   },
        //   onError: (error) => {
        //     console.log(error);
        //     // TODO: show error message
        //   },
        // });
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
      style={{
        zIndex: 10000,
      }}
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
          form={form}
          preserve={false}
          validateTrigger={['onChange', 'onBlur']}
          layout="vertical"
          labelCol={{ span: 12 }}
          initialValues={
            endpoint
              ? {
                  desired_session_count: endpoint?.desired_session_count,
                  // FIXME: memory doesn't applied to resource allocation
                  resource: {
                    cpu: JSON.parse(endpoint?.resource_slots)?.cpu,
                    mem: iSizeToSize(
                      JSON.parse(endpoint?.resource_slots)?.mem + 'b',
                      'g',
                      2,
                    )?.numberUnit,
                    shmem: iSizeToSize(
                      JSON.parse(endpoint?.resource_opts)?.shmem ||
                        AUTOMATIC_DEFAULT_SHMEM,
                      'g',
                      2,
                    )?.numberUnit,
                  },
                  cluster_mode: endpoint?.cluster_mode,
                  cluster_size: endpoint?.cluster_size,
                }
              : {
                  desired_session_count: 0,
                  ...RESOURCE_ALLOCATION_INITIAL_FORM_VALUES,
                }
          }
          requiredMark="optional"
          style={{ marginBottom: token.marginLG, marginTop: token.margin }}
        >
          <SliderInputFormItem
            label={t('modelService.DesiredRoutingCount')}
            name="desiredRoutingCount"
            rules={[
              {
                required: true,
                pattern: /^[0-9]+$/,
                message: t('modelService.OnlyAllowsNonNegativeIntegers'),
              },
            ]}
            inputNumberProps={{
              //TODO: change unit based on resource limit
              addonAfter: '#',
            }}
            required
          />
          <ImageEnvironmentSelectFormItems
          // //TODO: test with real inference images
          // filter={(image) => {
          //   return !!_.find(image?.labels, (label) => {
          //     return (
          //       label?.key === "ai.backend.role" &&
          //       label.value === "INFERENCE" //['COMPUTE', 'INFERENCE', 'SYSTEM']
          //     );
          //   });
          // }}
          />
          <ResourceAllocationFormItems />
        </Form>
      </Flex>
    </BAIModal>
  );
};

export default ModelServiceSettingModal;
