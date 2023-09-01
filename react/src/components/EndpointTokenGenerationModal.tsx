import BAIModal, { BAIModalProps } from "./BAIModal";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DescriptionsProps, Form, Select, Space, Tag, theme } from 'antd';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSuspendedBackendaiClient } from "../hooks";
import Flex from "./Flex";
import TimeContainer from "./TimeContainer";
import { baiSignedRequestWithPromise } from "../helper";
import { graphql, useFragment } from "react-relay";
import { time } from "console";

interface EndpointTokenGenerationModalProps extends Omit<BAIModalProps, 'onOK' | 'onClose'> {
  endpoint_id: string;
  onRequestClose: (success?: boolean) => void;
}

interface EndpointTokenGenerationInput {
  valid_until?: number; // set second as unit
}

const unitPerTime = {
  second: {
    range: Array.from(Array(60).keys()),
    toSecond: 1,
  },
  minute: {
    range: Array.from(Array(60).keys()),
    toSecond: 60,
  },
  hour: {
    range: Array.from(Array(12).keys()),
    toSecond: 60 * 60,
  },
  day: {
    range: Array.from(Array(30).keys()),
    toSecond: 60 * 60 * 24,
  }, // FIXME: temporally hardcode for a month at maximum
};

const EndpointTokenGenerationModal: React.FC<EndpointTokenGenerationModalProps> = ({
  onRequestClose,
  onCancel,
  endpoint_id,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const [form] = Form.useForm();

  const mutationToGenerateToken = useTanMutation({
    mutationFn: (values: EndpointTokenGenerationInput) => {
      const currentTime = new Date();
      const body = {
        valid_until: Math.round((currentTime.getTime() / 1000) + (values.valid_until as number)),
      }
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: `/services/${endpoint_id}/token`,
        body,
        client: baiClient,
      });
    }
  })

  // Apply any operation after clicking OK button
  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    form.validateFields().then((values) => {
      const validUntil = 
        values.day * unitPerTime.day.toSecond +
        values.hour * unitPerTime.hour.toSecond +
        values.minute * unitPerTime.minute.toSecond +
        values.second * unitPerTime.second.toSecond;
      console.log(validUntil)
      mutationToGenerateToken.mutate(
        {
          valid_until: validUntil
        },
        {
          onSuccess: () => {
            onRequestClose(true);
          },
          onError: (err) => {
            console.log(err);
          },
        }
      )
    });
  };

  // Apply any operation after clicking Cancel button
  const handleCancel = () => {
    onRequestClose(true);
  };

  return (
    <BAIModal
      {...baiModalProps}
      style={{
        zIndex: 10000,
      }}
      destroyOnClose
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('modelService.Generate')}
      centered
      title={t('modelService.GenerateNewToken')}
    >
      <h3>Expired time from now</h3>
        <Form
          preserve={false}
          labelCol={{ span: 10 }}
          wrapperCol= {{ span: 20 }}
          initialValues={{
            second: unitPerTime.second.range[0],
            minute: unitPerTime.minute.range[0],
            hour: unitPerTime.hour.range[0],
            day: unitPerTime.day.range[0],
          }}
          validateTrigger={['onChange', 'onBlur']}
          style={{}}
          form={form}
        >
        <Flex direction="row" align="stretch" justify="around">
          <Form.Item name="day">
            <Select 
                  options={unitPerTime.day.range.map((day) => ({label: day, value: day, title: "day"}))}
                  style={{ width: 60 }}></Select>
          </Form.Item>
          Days
          <Form.Item name="hour">
            <Select
                  options={unitPerTime.hour.range.map((hour) => ({label: hour, value: hour, title: "hour"}))}
                  style={{ width: 60 }}></Select>
          </Form.Item>
          Hour(s)
          <Form.Item name="minute">
            <Select
                options={unitPerTime.minute.range.map((minute) => ({label: minute, value: minute, title: "minute"}))}
                style={{ width: 60 }}></Select>
          </Form.Item>
          Minute(s)
        <Form.Item name="second">
        <Select 
            options={unitPerTime.second.range.map((second) => ({label: second, value: second, title: "second"}))}
            style={{ width: 60 }}></Select>
        </Form.Item>
        Second(s)
        </Flex>
        </Form>
      <Space wrap>
        <Tag>{t('modelService.CurrentTime')}</Tag>
        <TimeContainer></TimeContainer>
      </Space>
    </BAIModal>
  );
}

export default EndpointTokenGenerationModal;