import BAIFlex from './BAIFlex';
import { DownOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import { Form, FormItemProps, Input, theme, Typography } from 'antd';
import React, {
  cloneElement,
  ReactElement,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Represents the different edit modes for bulk editing.
 * - 'keep': Maintains the current values without changes (value = undefined, excluded from submission)
 * - 'edit': Allows modification of the field value
 * - 'clear': Shows clear placeholder with clearValue (only available if optional)
 */
type BulkEditMode = 'keep' | 'edit' | 'clear';

export interface BAIBulkEditFormItemProps extends FormItemProps {
  /**
   * Whether this field is optional (allows clearing).
   * When true, shows the "Clear" link in keep mode.
   */
  showClear?: boolean;
  /**
   * The label to display in the placeholder when in keep mode.
   * If not provided, defaults to i18n 'comp:BAIBulkEditFormItem.KeepAsIs'.
   */
  keepValueLabel?: string;
  /**
   * The label to display in the placeholder when in clear mode.
   * If not provided, defaults to i18n 'comp:BAIBulkEditFormItem.Clear'.
   */
  clearValueLabel?: string;
  /**
   * Children element to render (typically an input component like Select, Input, etc.)
   */
  children?: ReactElement;
}

/**
 * BAIBulkEditFormItem is a custom Form.Item component designed for bulk editing scenarios.
 *
 * ## Features
 * - **Keep as is**: Maintains current values without changes (default state, value = undefined)
 * - **Edit**: Allows user to modify the field value
 * - **Clear**: Shows placeholder with clearValueLabel (only available when showClear is true)
 * - **Undo changes**: Reverts to "Keep as is" state (appears when not in keep mode)
 *
 * ## Usage
 * ```tsx
 * <BAIBulkEditFormItem
 *   name="domain_name"
 *   label="Domain"
 *   showClear
 *   clearValueLabel="No domain"
 * >
 *   <BAISelect options={[...]} />
 * </BAIBulkEditFormItem>
 * ```
 */
const BAIBulkEditFormItem: React.FC<BAIBulkEditFormItemProps> = ({
  name,
  showClear = false,
  keepValueLabel,
  clearValueLabel,
  children,
  ...formItemProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const [mode, setMode] = useState<BulkEditMode>('keep');

  const controlRef = useRef<ControlWrapperRef>(null);
  const { token } = theme.useToken();

  const focusControl = () => {
    setTimeout(() => {
      controlRef.current?.focus();
      controlRef.current?.open();
    }, 0);
  };

  const handlePlaceholderClick = (e: React.MouseEvent | React.FocusEvent) => {
    e.preventDefault();
    setMode('edit');
    focusControl();
  };

  const handleControlBlur = () => {
    const currentValue = form.getFieldValue(name);
    if (currentValue === undefined) {
      setMode('keep');
    }
    if (currentValue === null && showClear) {
      setMode('clear');
    }
  };

  const handleClear = () => {
    setMode('clear');
    form.setFieldValue(name, null);
  };

  const handleUndo = () => {
    setMode('keep');
    form.setFieldValue(name, undefined);
  };

  const resolvedKeepValueLabel =
    keepValueLabel ?? t('comp:BAIBulkEditFormItem.KeepAsIs');
  const resolvedClearValueLabel =
    clearValueLabel ?? t('comp:BAIBulkEditFormItem.Clear');

  return (
    <Form.Item
      {...formItemProps}
      style={{ marginBottom: 0, ...formItemProps.style }}
      extra={
        <BAIFlex justify="end">
          {mode === 'keep' && showClear && (
            <Typography.Link onClick={handleClear}>
              {t('comp:BAIBulkEditFormItem.Clear')}
            </Typography.Link>
          )}
          <Form.Item noStyle dependencies={[name]}>
            {({ getFieldValue }) =>
              mode !== 'keep' &&
              getFieldValue(name) !== undefined && (
                <Typography.Link onClick={handleUndo}>
                  {t('comp:BAIBulkEditFormItem.UndoChanges')}
                </Typography.Link>
              )
            }
          </Form.Item>
        </BAIFlex>
      }
    >
      {mode === 'keep' ? (
        // Keep as is mode: Show "Keep as is" placeholder
        <Input
          value={resolvedKeepValueLabel}
          onMouseDown={handlePlaceholderClick}
          onFocus={handlePlaceholderClick}
          variant="filled"
          suffix={
            <DownOutlined
              style={{
                color: token.colorTextQuaternary,
                fontSize: token.fontSizeSM,
              }}
            />
          }
        />
      ) : mode === 'clear' ? (
        // Clear mode: Show clear value label as placeholder
        <Input
          value={resolvedClearValueLabel}
          onMouseDown={handlePlaceholderClick}
          onFocus={handlePlaceholderClick}
          variant="filled"
          suffix={
            <DownOutlined
              style={{
                color: token.colorTextQuaternary,
                fontSize: token.fontSizeSM,
              }}
            />
          }
        />
      ) : null}
      <Form.Item
        name={name}
        {...formItemProps}
        noStyle
        hidden={mode !== 'edit'}
      >
        {children && (
          <ControlWrapper ref={controlRef} onBlur={handleControlBlur}>
            {children}
          </ControlWrapper>
        )}
      </Form.Item>
    </Form.Item>
  );
};

BAIBulkEditFormItem.displayName = 'BAIBulkEditFormItem';

export default BAIBulkEditFormItem;

/**
 * ControlWrapper wraps children with ref forwarding for focus control.
 * This component injects a ref into children to enable programmatic focus.
 */

interface ControlWrapperRef {
  open: () => void;
  focus: () => void;
}

interface ControlWrapperProps {
  children: ReactElement;
  open?: boolean;
  onBlur?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}
const ControlWrapper = React.forwardRef<ControlWrapperRef, ControlWrapperProps>(
  ({ children, ...props }, ref) => {
    const innerRef = useRef<any>(null);
    const [open, setOpen] = useControllableValue(props, {
      valuePropName: 'open',
      trigger: 'onOpenChange',
    });

    useImperativeHandle(ref, () => {
      return {
        ...(innerRef.current || {}),
        open: () => {
          setOpen(true);
        },
      };
    });

    // eslint-disable-next-line react-hooks/refs
    const clonedChild = cloneElement(children, {
      ...props,
      // @ts-ignore
      ref: innerRef,
      open,
      onOpenChange: (isOpen: boolean) => {
        setOpen(isOpen);
        const { onOpenChange } = children.props as any;
        if (onOpenChange) {
          onOpenChange(isOpen);
        }
      },
    });

    return clonedChild;
  },
);
ControlWrapper.displayName = 'ControlWrapper';
