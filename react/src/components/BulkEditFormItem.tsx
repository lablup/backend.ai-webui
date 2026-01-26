import { UndoOutlined } from '@ant-design/icons';
import { Form, FormItemProps, Space, Button } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useState, useEffect, ReactElement, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Represents the different edit modes for bulk editing.
 * - 'keep': Maintains the current values without changes
 * - 'edit': Allows modification of the field value
 * - 'clear': Clears/unsets the value for all items (only available for optional fields)
 */
type BulkEditMode = 'keep' | 'edit' | 'clear';

export interface BulkEditFormItemProps extends FormItemProps {
  /**
   * Whether this field is optional (allows clearing)
   */
  optional?: boolean;
  /**
   * Children element to render (typically an input component)
   */
  children?: ReactElement;
}

/**
 * BulkEditFormItem is a custom Form.Item component designed for bulk editing scenarios.
 * 
 * ## Features
 * - **Keep as is**: Maintains current values without changes (default state)
 * - **Clear**: Unsets the value for all items (only available if optional)
 * - **Undo changes**: Reverts to "Keep as is" state (appears when not in "Keep as is")
 * 
 * ## Usage
 * ```tsx
 * <BulkEditFormItem name="domain_name" label="Domain" optional>
 *   <BAISelect options={[...]} />
 * </BulkEditFormItem>
 * ```
 * 
 * @param {BulkEditFormItemProps} props - Component props extending FormItemProps
 * @returns {JSX.Element} A Form.Item with bulk editing controls
 */
const BulkEditFormItem: React.FC<BulkEditFormItemProps> = ({
  name,
  optional = false,
  children,
  ...formItemProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const [mode, setMode] = useState<BulkEditMode>('keep');

  // Reset mode when form is reset or field value changes externally
  useEffect(() => {
    const fieldValue = form.getFieldValue(name);
    if (fieldValue === undefined) {
      setMode('keep');
    }
  }, [form, name]);

  // Handle mode change
  const handleModeChange = (newMode: BulkEditMode) => {
    setMode(newMode);
    
    if (newMode === 'keep') {
      // Reset the field to undefined (don't send in the update)
      form.setFieldValue(name, undefined);
      form.resetFields([name]);
    } else if (newMode === 'clear') {
      // Set to null to explicitly clear the value
      form.setFieldValue(name, null);
    }
    // For 'edit' mode, just enable the field for user input
  };

  // Clone children with disabled state based on mode
  const childrenWithProps = children && mode === 'keep'
    ? cloneElement(children, {
        disabled: true,
        value: undefined,
      } as any)
    : children;

  // Show undo button when not in 'keep' mode
  const showUndo = mode !== 'keep';

  return (
    <BAIFlex direction="column" align="stretch">
      <Form.Item
        {...formItemProps}
        name={name}
        style={{ marginBottom: 8 }}
      >
        {childrenWithProps}
      </Form.Item>
      <Space size="small" style={{ marginBottom: 16 }}>
        {optional && mode === 'keep' && (
          <Button
            size="small"
            onClick={() => handleModeChange('clear')}
          >
            {t('bulkEdit.Clear')}
          </Button>
        )}
        {mode === 'keep' && (
          <Button
            size="small"
            type="primary"
            onClick={() => handleModeChange('edit')}
          >
            {t('bulkEdit.Edit')}
          </Button>
        )}
        {showUndo && (
          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={() => handleModeChange('keep')}
          >
            {t('bulkEdit.UndoChanges')}
          </Button>
        )}
        {mode === 'keep' && (
          <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
            {t('bulkEdit.KeepAsIs')}
          </span>
        )}
      </Space>
    </BAIFlex>
  );
};

export default BulkEditFormItem;
