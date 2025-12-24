import { Input, InputProps, InputRef, theme } from 'antd';
import { createStyles } from 'antd-style';
import { CornerDownLeftIcon } from 'lucide-react';
import { useRef, useState } from 'react';

const useStyles = createStyles(({ css }) => ({
  noSpinner: css`
    input[type='number']::-webkit-outer-spin-button,
    input[type='number']::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type='number'] {
      -moz-appearance: textfield;
    }
  `,
}));

export interface BAIUncontrolledInputProps
  extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  defaultValue?: string;
  onCommit?: (value: string) => void;
}

const BAIUncontrolledInput: React.FC<BAIUncontrolledInputProps> = ({
  defaultValue,
  onCommit,
  ...inputProps
}) => {
  const inputRef = useRef<InputRef>(null);
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const [showEnterIcon, setShowEnterIcon] = useState(false);

  return (
    <Input
      key={defaultValue} // to reset internal state when path changes externally
      className={inputProps.type === 'number' ? styles.noSpinner : undefined}
      ref={inputRef}
      defaultValue={defaultValue}
      suffix={
        <CornerDownLeftIcon
          style={{
            fontSize: '0.8em',
            color: token.colorTextTertiary,
            visibility: showEnterIcon ? 'visible' : 'hidden',
          }}
        />
      }
      {...inputProps}
      onFocus={(e) => {
        setShowEnterIcon(true);
        inputProps?.onFocus?.(e);
      }}
      onBlur={(e) => {
        setShowEnterIcon(false);
        onCommit?.(inputRef.current?.input?.value || '');
        inputProps?.onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          inputRef.current?.blur();
        }
      }}
    />
  );
};

export default BAIUncontrolledInput;
