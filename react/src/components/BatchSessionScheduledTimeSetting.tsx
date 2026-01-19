import DatePickerISO, { DatePickerISOProps } from './DatePickerISO';
import { useWebComponentInfo } from './DefaultProviders';
import { useToggle } from 'ahooks';
import { Typography, Checkbox, theme } from 'antd';
import { GetRef } from 'antd/lib';
import { BAIFlex, BAIIntervalView } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
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

  const datePickerRef = useRef<GetRef<typeof DatePickerISO>>(null);

  return (
    <>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {t('session.launcher.SessionStartTime')}
      </Typography.Text>
      <BAIFlex align="start" gap="sm">
        <Checkbox
          checked={isChecked}
          onChange={(v) => {
            toggleChecked();
            const newScheduleTime = v
              ? dayjs().add(2, 'minutes').toISOString()
              : undefined;
            dispatchAndSetScheduleTime(newScheduleTime);
          }}
        >
          {t('session.launcher.Enable')}
        </Checkbox>
        <BAIFlex direction="column" align="end">
          <DatePickerISO
            ref={datePickerRef}
            {...datePickerISOProps}
            popupStyle={{ position: 'fixed' }}
            disabledDate={(date) => {
              return date.isBefore(dayjs().startOf('day'));
            }}
            localFormat
            disabled={!isChecked}
            showTime={{
              hideDisabledOptions: true,
            }}
            value={isChecked ? scheduleTime : undefined}
            onChange={(value) => {
              dispatchAndSetScheduleTime(value);
            }}
            onCalendarChange={() => {
              datePickerRef.current?.focus();
            }}
            onPanelChange={() => {
              datePickerRef.current?.focus();
            }}
            status={
              isChecked && !scheduleTime
                ? 'warning'
                : dayjs(scheduleTime).isBefore(dayjs())
                  ? 'error'
                  : undefined
            }
            needConfirm={false}
            showNow={false}
          />
          {isChecked &&
            scheduleTime &&
            !dayjs(scheduleTime).isBefore(dayjs()) && (
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM - 2 }}
              >
                ({t('session.launcher.StartAfter')}
                <BAIIntervalView
                  callback={() => {
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
          {isChecked &&
            scheduleTime &&
            dayjs(scheduleTime).isBefore(dayjs()) && (
              <Typography.Text
                type="danger"
                style={{ fontSize: token.fontSizeSM - 2 }}
              >
                {t('session.launcher.StartTimeMustBeInTheFuture')}
              </Typography.Text>
            )}
        </BAIFlex>
      </BAIFlex>
    </>
  );
};

export default BatchSessionScheduledTimeSetting;
