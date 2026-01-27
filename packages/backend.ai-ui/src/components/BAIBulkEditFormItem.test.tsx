import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form } from 'antd';
import React from 'react';
import BAIBAIBulkEditFormItem from './BAIBAIBulkEditFormItem';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'comp:BAIBAIBulkEditFormItem.Clear': 'Clear',
        'comp:BAIBAIBulkEditFormItem.Edit': 'Edit',
        'comp:BAIBAIBulkEditFormItem.KeepAsIs': 'Keep as is',
        'comp:BAIBAIBulkEditFormItem.UndoChanges': 'Undo changes',
      };
      return translations[key] || key;
    },
  }),
}));

// Wrapper component to provide Form context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Form>{children}</Form>
);

describe('BAIBulkEditFormItem', () => {
  it('should render in "keep" mode by default', () => {
    render(
      <TestWrapper>
        <BAIBulkEditFormItem name="testField" label="Test Field">
          <input data-testid="test-input" />
        </BAIBulkEditFormItem>
      </TestWrapper>,
    );

    expect(screen.getByText(/Keep as is/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });

  it('should show Clear button for optional fields in keep mode', () => {
    render(
      <TestWrapper>
        <BAIBulkEditFormItem name="testField" label="Test Field" optional>
          <input data-testid="test-input" />
        </BAIBulkEditFormItem>
      </TestWrapper>,
    );

    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
  });

  it('should not show Clear button for non-optional fields', () => {
    render(
      <TestWrapper>
        <BAIBulkEditFormItem name="testField" label="Test Field" optional={false}>
          <input data-testid="test-input" />
        </BAIBulkEditFormItem>
      </TestWrapper>,
    );

    expect(screen.queryByRole('button', { name: /Clear/i })).not.toBeInTheDocument();
  });

  it('should switch to edit mode when Edit button is clicked', async () => {
    render(
      <TestWrapper>
        <BAIBulkEditFormItem name="testField" label="Test Field">
          <input data-testid="test-input" />
        </BAIBulkEditFormItem>
      </TestWrapper>,
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Undo changes/i })).toBeInTheDocument();
    });
  });

  it('should switch to clear mode when Clear button is clicked', async () => {
    render(
      <TestWrapper>
        <BAIBulkEditFormItem name="testField" label="Test Field" optional>
          <input data-testid="test-input" />
        </BAIBulkEditFormItem>
      </TestWrapper>,
    );

    const clearButton = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Undo changes/i })).toBeInTheDocument();
    });
  });

  it('should revert to keep mode when Undo button is clicked', async () => {
    render(
      <TestWrapper>
        <BAIBulkEditFormItem name="testField" label="Test Field">
          <input data-testid="test-input" />
        </BAIBulkEditFormItem>
      </TestWrapper>,
    );

    // Switch to edit mode
    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Undo changes/i })).toBeInTheDocument();
    });

    // Click undo
    const undoButton = screen.getByRole('button', { name: /Undo changes/i });
    fireEvent.click(undoButton);

    await waitFor(() => {
      expect(screen.getByText(/Keep as is/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });
  });

  it('should disable children input in keep mode', () => {
    render(
      <TestWrapper>
        <BAIBulkEditFormItem name="testField" label="Test Field">
          <input data-testid="test-input" />
        </BAIBulkEditFormItem>
      </TestWrapper>,
    );

    const input = screen.getByTestId('test-input');
    expect(input).toBeDisabled();
  });

  it('should enable children input in edit mode', async () => {
    render(
      <TestWrapper>
        <BAIBulkEditFormItem name="testField" label="Test Field">
          <input data-testid="test-input" />
        </BAIBulkEditFormItem>
      </TestWrapper>,
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      const input = screen.getByTestId('test-input');
      expect(input).not.toBeDisabled();
    });
  });
});
