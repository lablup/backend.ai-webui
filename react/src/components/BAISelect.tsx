import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React, { useLayoutEffect } from 'react';

interface BAISelectProps extends SelectProps {
  autoSelectOption?: boolean | ((options: SelectProps['options']) => any);
}
/**
 * BAISelect component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean | Function} props.autoSelectOption - Determines whether to automatically select an option.
 * @param {any} props.value - The current value of the select.
 * @param {Array} props.options - The available options for the select.
 * @param {Function} props.onChange - The callback function to handle value changes.
 * @returns {JSX.Element} The rendered BAISelect component.
 */
const BAISelect: React.FC<BAISelectProps> = ({
  autoSelectOption,
  ...selectProps
}) => {
  const { value, options, onChange } = selectProps;
  useLayoutEffect(() => {
    if (autoSelectOption && _.isEmpty(value) && options?.[0]) {
      if (_.isBoolean(autoSelectOption)) {
        onChange?.(options?.[0].value || options?.[0], options?.[0]);
      } else if (_.isFunction(autoSelectOption)) {
        onChange?.(autoSelectOption(options), options[0]);
      }
    }
  }, [value, options, onChange, autoSelectOption]);
  return <Select {...selectProps} />;
};

export default BAISelect;
