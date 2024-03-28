import BAIIntervalText from './BAIIntervalText';
import DatePickerISO, { DatePickerISOProps } from './DatePickerISO';
import { useWebComponentInfo } from './DefaultProviders';
import Flex from './Flex';
import { useToggle } from 'ahooks';
import { Typography, Checkbox, theme } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends DatePickerISOProps {}
const BatchSessionScheduledTimeSetting: React.FC<Props> = ({
  ...datePickerISOProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isChecked, { toggle: toggleChecked }] = useToggle(false);
  const [scheduleTime, setScheduleTime] = React.useState<
    string | undefined | null
  >();
  const { dispatchEvent } = useWebComponentInfo();
  const dispatchAndSetScheduleTime = (value: string | undefined | null) => {
    setScheduleTime(value);
    dispatchEvent('change', value);
  };

  return (
    <>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {t('session.launcher.SessionStartTime')}
      </Typography.Text>
      <Flex align="start" gap="sm">
        <Checkbox
          checked={isChecked}
          onClick={(v) => {
            toggleChecked();
            const newScheduleTime = v
              ? dayjs().add(2, 'minutes').toISOString()
              : undefined;
            dispatchAndSetScheduleTime(newScheduleTime);
          }}
        >
          {t('session.launcher.Enable')}
        </Checkbox>
        <Flex direction="column" align="end">
          <DatePickerISO
            {...datePickerISOProps}
            popupStyle={{ position: 'fixed' }}
            disabledDate={(date) => {
              return date.isBefore(dayjs().startOf('minute'));
            }}
            disabled={!isChecked}
            showTime={{
              hideDisabledOptions: true,
            }}
            value={isChecked ? scheduleTime : undefined}
            onChange={(value) => {
              dispatchAndSetScheduleTime(value);
            }}
            onBlur={() => {
              dispatchAndSetScheduleTime(scheduleTime);
            }}
            status={
              isChecked && !scheduleTime
                ? 'warning'
                : dayjs(scheduleTime).isBefore(dayjs())
                  ? 'error'
                  : undefined
            }
          />
          {isChecked && scheduleTime && (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM - 2 }}
            >
              ({t('session.launcher.StartAfter')}
              <BAIIntervalText
                callback={() => {
                  // Add 2 minutes if the schedule time is in the past
                  const leftTime = dayjs(scheduleTime).diff(dayjs());
                  if (leftTime < 0) {
                    dispatchAndSetScheduleTime(
                      dayjs(scheduleTime).add(2, 'minutes').toISOString(),
                    );
                  }
                  return dayjs(scheduleTime).fromNow();
                }}
                delay={1000}
              />
              )
            </Typography.Text>
          )}
          {isChecked && !scheduleTime && (
            <Typography.Text
              type="warning"
              style={{ fontSize: token.fontSizeSM - 2 }}
            >
              {t('session.launcher.StartTimeDoesNotApply')}
            </Typography.Text>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default BatchSessionScheduledTimeSetting;
