import { DatePicker } from 'antd';
import { PickerDateProps } from 'antd/es/date-picker/generatePicker';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';

interface DatePickerISOProps
  extends Omit<PickerDateProps<Dayjs>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string | undefined) => void;
}
const DatePickerISO: React.FC<DatePickerISOProps> = ({
  value,
  onChange,
  ...pickerProps
}) => {
  return (
    <DatePicker
      value={value ? dayjs(value) : undefined}
      onChange={(value, dateString) => {
        onChange && onChange(value?.toISOString());
      }}
      {...pickerProps}
    />
  );
};

export default DatePickerISO;
