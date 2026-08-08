import { theme } from '../theme-shim';
import './BAIUncontrolledInput.css';
import { Input, type InputProps, type InputRef } from 'antd';
import { CornerDownLeftIcon } from 'lucide-react';
import { useRef, useState } from 'react';

export interface BAIUncontrolledInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange'
> {
  /** Initial value. Changing it remounts the input and discards uncommitted edits. */
  defaultValue?: string;
  /** Called with the current value when the user commits by pressing Enter or blurring. */
  onCommit?: (value: string) => void;
}

/**
 * An intentionally uncontrolled Input that commits its value on Enter or
 * blur — not on every keystroke.
 *
 * `value`/`onChange` are removed from the props to steer expensive commit
 * side effects (e.g. persisting to localStorage) toward `onCommit`, which
 * fires only when the user finishes editing. This is the intended commit
 * path rather than an enforced restriction — per-keystroke handlers
 * inherited from `InputProps` (such as `onInput`/`onKeyUp`) still pass
 * through. While focused, an Enter (⏎) icon is shown as an explicit cue
 * that the value is applied on Enter (or blur).
 */
const BAIUncontrolledInput: React.FC<BAIUncontrolledInputProps> = ({
  defaultValue,
  onCommit,
  ...inputProps
}) => {
  const inputRef = useRef<InputRef>(null);
  const { token } = theme.useToken();
  const [showEnterIcon, setShowEnterIcon] = useState(false);

  return (
    <Input
      key={defaultValue} // to reset internal state when path changes externally
      className={
        inputProps.type === 'number'
          ? 'bai-uncontrolled-input-no-spinner'
          : undefined
      }
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
        inputProps?.onKeyDown?.(e);
      }}
    />
  );
};

export default BAIUncontrolledInput;
