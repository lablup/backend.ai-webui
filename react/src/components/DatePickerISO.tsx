import { useControllableValue } from 'ahooks';
import { DatePicker } from 'antd';
import { PickerDateProps } from 'antd/es/date-picker/generatePicker';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';

interface DatePickerISOProps
  extends Omit<PickerDateProps<Dayjs>, 'value' | 'onChange'> {
  value?: string | undefined | null;
  onChange?: (value: string | undefined) => void;
}
const DatePickerISO: React.FC<DatePickerISOProps> = ({
  value,
  onChange,
  ...pickerProps
}) => {
  const [controllableValue, setControllableValue] = useControllableValue({
    value,
    onChange,
  });

  return (
    <DatePicker
      value={value ? dayjs(value) : undefined}
      onChange={(value) => {
        setControllableValue(value?.toISOString());
      }}
      {...pickerProps}
    />
  );
};

export default DatePickerISO;
