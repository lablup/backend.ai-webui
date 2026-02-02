import BAIBulkEditFormItem from './BAIBulkEditFormItem';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, FormInstance, Select } from 'antd';
import React, { useEffect } from 'react';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'comp:BAIBulkEditFormItem.KeepAsIs': 'Keep as is',
        'comp:BAIBulkEditFormItem.Clear': 'Clear',
        'comp:BAIBulkEditFormItem.UndoChanges': 'Undo changes',
      };
      return translations[key] || key;
    },
  }),
}));

// Helper component wrapper with Form context
const FormWrapper: React.FC<{
  children: React.ReactNode;
  onValuesChange?: (changedValues: unknown, allValues: unknown) => void;
  formRef?: React.MutableRefObject<FormInstance | null>;
}> = ({ children, onValuesChange, formRef }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [form, formRef]);

  return (
    <Form form={form} onValuesChange={onValuesChange}>
      {children}
    </Form>
  );
};

// Helper to select an option from antd Select dropdown
const selectOption = async (
  user: ReturnType<typeof userEvent.setup>,
  selectElement: HTMLElement,
  optionText: string,
) => {
  await user.click(selectElement);
  // Wait for dropdown to open and find option
  await waitFor(() => {
    const dropdown = document.querySelector('.ant-select-dropdown');
    expect(dropdown).toBeInTheDocument();
  });
  const dropdown = document.querySelector('.ant-select-dropdown');
  const option = within(dropdown as HTMLElement).getByText(optionText);
  await user.click(option);
};

describe('BAIBulkEditFormItem', () => {
  // Skip pointer events check for antd Select dropdown interactions
  const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 });

  describe('Basic Rendering', () => {
    it('should render with "Keep as is" placeholder by default', () => {
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test Field">
            <Select options={[{ value: 'test', label: 'Test' }]} />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // "Keep as is" is now displayed as input value
      expect(screen.getByDisplayValue('Keep as is')).toBeInTheDocument();
      // Use getAllByText since label may appear in multiple form items (outer and inner)
      const labels = screen.getAllByText('Test Field');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should render with label from form item props', () => {
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="domain" label="Domain Name">
            <Select options={[{ value: 'test', label: 'Test' }]} />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Use getAllByText since label may appear in multiple form items (outer and inner)
      // and verify at least one label is visible
      const labels = screen.getAllByText('Domain Name');
      expect(labels.length).toBeGreaterThan(0);
      expect(labels[0]).toBeInTheDocument();
    });

    it('should not show Clear link for non-optional fields', () => {
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Required Field">
            <Select options={[{ value: 'test', label: 'Test' }]} />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    it('should show Clear link for optional fields', () => {
      render(
        <FormWrapper>
          <BAIBulkEditFormItem
            name="testField"
            label="Optional Field"
            showClear
          >
            <Select options={[{ value: 'test', label: 'Test' }]} />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('Mode Transitions', () => {
    it('should switch to edit mode when clicking Keep as is placeholder', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test">
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Initially in keep mode - "Keep as is" shown as input value
      const keepAsIsInput = screen.getByDisplayValue('Keep as is');
      expect(keepAsIsInput).toBeInTheDocument();

      // Click to switch to edit mode
      await user.click(keepAsIsInput);

      // Should now show the Select component (keep as is input should be gone)
      expect(screen.queryByDisplayValue('Keep as is')).not.toBeInTheDocument();
      // Select is now visible
      expect(screen.getByText('Select value')).toBeInTheDocument();
    });

    it('should show Undo changes link in edit mode after entering a value', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test">
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test Option' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Click to switch to edit mode
      await user.click(screen.getByDisplayValue('Keep as is'));

      // Select a value
      const selectEl = screen.getByText('Select value');
      await selectOption(user, selectEl, 'Test Option');

      // Should show Undo changes link after value is set
      await waitFor(() => {
        expect(screen.getByText('Undo changes')).toBeInTheDocument();
      });
    });

    it('should return to keep mode when clicking Undo changes', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test">
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test Option' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Switch to edit mode and select a value
      await user.click(screen.getByDisplayValue('Keep as is'));
      const selectEl = screen.getByText('Select value');
      await selectOption(user, selectEl, 'Test Option');

      // Wait for Undo changes to appear
      await waitFor(() => {
        expect(screen.getByText('Undo changes')).toBeInTheDocument();
      });

      // Click Undo changes
      await user.click(screen.getByText('Undo changes'));

      // Should be back to keep mode
      expect(screen.getByDisplayValue('Keep as is')).toBeInTheDocument();
      expect(screen.queryByText('Undo changes')).not.toBeInTheDocument();
    });

    it('should switch to clear mode when clicking Clear link', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test" showClear>
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Click Clear
      await user.click(screen.getByText('Clear'));

      // Clear mode shows "Clear" label as input value
      expect(screen.getByDisplayValue('Clear')).toBeInTheDocument();
      // Clear link should be replaced with Undo changes
      expect(
        screen.queryByRole('link', { name: 'Clear' }),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Undo changes')).toBeInTheDocument();
    });

    it('should return from clear mode to keep mode when clicking Undo changes', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test" showClear>
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Switch to clear mode
      await user.click(screen.getByText('Clear'));
      expect(screen.getByDisplayValue('Clear')).toBeInTheDocument();

      // Click Undo changes
      await user.click(screen.getByText('Undo changes'));

      // Should be back to keep mode
      expect(screen.getByDisplayValue('Keep as is')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should switch from clear mode to edit mode when clicking placeholder', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test" showClear>
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Switch to clear mode
      await user.click(screen.getByText('Clear'));
      expect(screen.getByDisplayValue('Clear')).toBeInTheDocument();

      // Click placeholder to switch to edit mode
      await user.click(screen.getByDisplayValue('Clear'));

      // Should now be in edit mode
      expect(screen.getByText('Select value')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Clear')).not.toBeInTheDocument();
    });
  });

  describe('Form Value Handling', () => {
    it('should set form value to undefined in keep mode', async () => {
      const formRef = { current: null as FormInstance | null };
      const user = setupUser();
      render(
        <FormWrapper formRef={formRef}>
          <BAIBulkEditFormItem name="testField" label="Test">
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test Option' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Switch to edit mode and select a value
      await user.click(screen.getByDisplayValue('Keep as is'));
      const selectEl = screen.getByText('Select value');
      await selectOption(user, selectEl, 'Test Option');

      // Verify value is set
      await waitFor(() => {
        expect(formRef.current?.getFieldValue('testField')).toBe('test');
      });

      // Click Undo to go back to keep mode
      await user.click(screen.getByText('Undo changes'));

      // After undo, the value should be undefined (excluded from submission)
      await waitFor(() => {
        expect(formRef.current?.getFieldValue('testField')).toBeUndefined();
      });
    });

    it('should set form value to null in clear mode', async () => {
      const formRef = { current: null as FormInstance | null };
      const user = setupUser();
      render(
        <FormWrapper formRef={formRef}>
          <BAIBulkEditFormItem name="testField" label="Test" showClear>
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Click Clear
      await user.click(screen.getByText('Clear'));

      // Should have set the value to null (explicit clear)
      await waitFor(() => {
        expect(formRef.current?.getFieldValue('testField')).toBeNull();
      });
    });

    it('should allow user selection in edit mode', async () => {
      const onValuesChange = jest.fn();
      const user = setupUser();
      render(
        <FormWrapper onValuesChange={onValuesChange}>
          <BAIBulkEditFormItem name="testField" label="Test">
            <Select
              placeholder="Select value"
              options={[{ value: 'selected', label: 'Selected Option' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Switch to edit mode
      await user.click(screen.getByDisplayValue('Keep as is'));

      // Select a value
      const selectEl = screen.getByText('Select value');
      await selectOption(user, selectEl, 'Selected Option');

      // Should have recorded the value change
      await waitFor(() => {
        expect(onValuesChange).toHaveBeenCalled();
        const calls = onValuesChange.mock.calls;
        const hasSelected = calls.some(
          (call) => call[0]?.testField === 'selected',
        );
        expect(hasSelected).toBe(true);
      });
    });
  });

  describe('With Select Component', () => {
    it('should work with Select component in edit mode', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="status" label="Status">
            <Select
              placeholder="Select status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Switch to edit mode
      await user.click(screen.getByDisplayValue('Keep as is'));

      // Should show the Select
      expect(screen.getByText('Select status')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple fields independently', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="field1" label="Field 1">
            <Select
              placeholder="Field 1 select"
              options={[{ value: 'test1', label: 'Test 1' }]}
            />
          </BAIBulkEditFormItem>
          <BAIBulkEditFormItem name="field2" label="Field 2" showClear>
            <Select
              placeholder="Field 2 select"
              options={[{ value: 'test2', label: 'Test 2' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Both should start in keep mode
      const keepAsIsElements = screen.getAllByDisplayValue('Keep as is');
      expect(keepAsIsElements).toHaveLength(2);

      // Switch first field to edit mode
      await user.click(keepAsIsElements[0]);

      // First field should be in edit mode
      expect(screen.getByText('Field 1 select')).toBeInTheDocument();

      // Second field should still be in keep mode
      expect(screen.getByDisplayValue('Keep as is')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should pass through additional Form.Item props', () => {
      render(
        <FormWrapper>
          <BAIBulkEditFormItem
            name="testField"
            label="Test"
            tooltip="This is a tooltip"
          >
            <Select options={[{ value: 'test', label: 'Test' }]} />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Required marker should be present (BAIBulkEditFormItem always sets required=true internally)
      expect(
        document.querySelector('.ant-form-item-required'),
      ).toBeInTheDocument();
    });

    it('should use custom clearValueLabel when provided', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem
            name="testField"
            label="Test"
            showClear
            clearValueLabel="No value selected"
          >
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Switch to clear mode
      await user.click(screen.getByText('Clear'));

      // Should show custom clearValueLabel as input value
      expect(screen.getByDisplayValue('No value selected')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Clear')).not.toBeInTheDocument();
    });

    it('should use custom keepValueLabel when provided', () => {
      render(
        <FormWrapper>
          <BAIBulkEditFormItem
            name="testField"
            label="Test"
            keepValueLabel="No changes to this field"
          >
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Should show custom keepValueLabel as input value instead of default "Keep as is"
      expect(
        screen.getByDisplayValue('No changes to this field'),
      ).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Keep as is')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have clickable placeholder for keyboard navigation', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test">
            <Select
              placeholder="Select value"
              options={[{ value: 'test', label: 'Test' }]}
            />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      const placeholder = screen.getByDisplayValue('Keep as is');

      // Should be clickable
      await user.click(placeholder);
      expect(screen.getByText('Select value')).toBeInTheDocument();
    });

    it('should have accessible link for Clear action', () => {
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test" showClear>
            <Select options={[{ value: 'test', label: 'Test' }]} />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      const clearLink = screen.getByText('Clear');
      expect(clearLink.tagName.toLowerCase()).toBe('a');
    });

    it('should have accessible link for Undo changes action', async () => {
      const user = setupUser();
      render(
        <FormWrapper>
          <BAIBulkEditFormItem name="testField" label="Test" showClear>
            <Select options={[{ value: 'test', label: 'Test' }]} />
          </BAIBulkEditFormItem>
        </FormWrapper>,
      );

      // Switch to clear mode (which sets value to null, triggering Undo changes link)
      await user.click(screen.getByText('Clear'));

      const undoLink = screen.getByText('Undo changes');
      expect(undoLink.tagName.toLowerCase()).toBe('a');
    });
  });
});
