import { useControllableValue } from 'ahooks';
import { DatePicker } from 'antd';
import { PickerDateProps } from 'antd/es/date-picker/generatePicker';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';

interface DatePickerISOProps
  extends Omit<PickerDateProps<Dayjs>, 'value' | 'onChange'> {
  value?: string | undefined | null;
  onChange?: (value: string | undefined) => void;
  localFormat?: boolean;
}
const DatePickerISO: React.FC<DatePickerISOProps> = ({
  value,
  onChange,
  localFormat,
  ...pickerProps
}) => {
  const [, setControllableValue] = useControllableValue({
    value,
    onChange,
  });

  return (
    <DatePicker
      value={value ? dayjs(value) : undefined}
      onChange={(value) => {
        const newValue = localFormat
          ? value?.format()
          : value?.tz()?.toISOString();
        // "2023-11-10T18:09:56+08:00"
        setControllableValue(newValue);
      }}
      {...pickerProps}
    />
  );
};

export default DatePickerISO;
