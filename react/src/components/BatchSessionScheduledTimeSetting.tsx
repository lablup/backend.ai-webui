import DatePickerISO, { DatePickerISOProps } from './DatePickerISO';
import Flex from './Flex';
import { useToggle } from 'ahooks';
import { Typography, Checkbox, Form, FormInstance, theme } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends DatePickerISOProps {}
const BatchSessionScheduledTimeSetting: React.FC<Props> = ({
  ...datePickerISOProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isChecked, { toggle: toggleChecked }] = useToggle(false);
  // const [form] = Form.useForm();

  return (
    <>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {t('session.launcher.SessionStartTime')}
      </Typography.Text>
      <Flex>
        <Checkbox checked={isChecked} onClick={toggleChecked}>
          {t('session.launcher.Enable')}
        </Checkbox>
        <DatePickerISO
          {...datePickerISOProps}
          popupStyle={{ position: 'fixed' }}
          disabledDate={(date) => {
            return date.isBefore(dayjs().startOf('minute'));
          }}
          disabled={!isChecked}
          showTime={{
            hideDisabledOptions: true,
            defaultValue: dayjs().add(2, 'minutes'),
          }}
        />
      </Flex>
    </>
    // <Form form={form} layout="vertical" requiredMark="optional">
    //   <Form.Item label={t('session.launcher.SessionStartTime')}>
    //     <Flex direction="row" gap={'xs'}>
    //       <Form.Item
    //         noStyle
    //         name={['batch', 'enabled']}
    //         valuePropName="checked"
    //       >
    //         <Checkbox
    //           onChange={(e) => {
    //             if (e.target.checked) {
    //               form.setFieldValue(
    //                 ['batch', 'scheduleDate'],
    //                 dayjs().add(2, 'minutes').toISOString(),
    //               );
    //             } else if (e.target.checked === false) {
    //               form.setFieldValue(['batch', 'scheduleDate'], undefined);
    //             }
    //           }}
    //         >
    //           {t('session.launcher.Enable')}
    //         </Checkbox>
    //       </Form.Item>
    //       <Form.Item
    //         noStyle
    //         name={['batch', 'scheduleDate']}
    //         rules={[
    //           {
    //             validator: async (__, value) => {
    //               if (value && dayjs(value).isBefore(dayjs())) {
    //                 return Promise.reject(
    //                   t('session.launcher.StartTimeMustBeInTheFuture'),
    //                 );
    //               }
    //               return Promise.resolve();
    //             },
    //           },
    //         ]}
    //       >
    //         <DatePickerISO
    //           showTime
    //           popupStyle={{ position: 'fixed' }}
    //           disabledDate={(date) => {
    //             return date.isBefore(dayjs());
    //           }}
    //           {...datePickerISOProps}
    //         />
    //       </Form.Item>
    //     </Flex>
    //   </Form.Item>
    // </Form>
  );
};

export default BatchSessionScheduledTimeSetting;
