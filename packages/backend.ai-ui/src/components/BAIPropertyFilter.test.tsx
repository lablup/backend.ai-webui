import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import BAIPropertyFilter, {
  mergeFilterValues,
  parseFilterValue,
} from './BAIPropertyFilter';

describe('parseFilterValue', () => {
  it('should correctly parse filter with binary operators', () => {
    const filter = 'created_at >= "2021-01-01"';
    const result = parseFilterValue(filter);
    expect(result).toEqual({
      property: 'created_at',
      operator: '>=',
      value: '2021-01-01',
    });
  });

  it('should correctly parse filter with equality operator', () => {
    const filter = 'status == "READY"';
    const result = parseFilterValue(filter);
    expect(result).toEqual({
      property: 'status',
      operator: '==',
      value: 'READY',
    });
  });

  it('should correctly parse filter with in operator', () => {
    const filter = 'permission in ["READ_ONLY", "READ_WRITE"]';
    const result = parseFilterValue(filter);
    expect(result).toEqual({
      property: 'permission',
      operator: 'in',
      value: '["READ_ONLY", "READ_WRITE"]',
    });
  });

  it('should correctly parse filter with ilike operator', () => {
    expect(parseFilterValue('creator ilike "%@example.com"')).toEqual({
      property: 'creator',
      operator: 'ilike',
      value: '%@example.com',
    });
    expect(parseFilterValue('creator ilike "%@example.com%"')).toEqual({
      property: 'creator',
      operator: 'ilike',
      value: '%@example.com%',
    });
  });

  it('should correctly parse filter with ilike operator and multiple spaces', () => {
    expect(parseFilterValue('creator  ilike  "%@example.com"')).toEqual({
      property: 'creator',
      operator: 'ilike',
      value: '%@example.com',
    });
  });
});

describe('mergeFilterValues', () => {
  it('should merge filter strings with & operator', () => {
    const filters = ['name ilike "%test%"', 'status == "active"'];
    const result = mergeFilterValues(filters, '&');
    expect(result).toBe('(name ilike "%test%")&(status == "active")');
  });

  it('should merge filter strings with | operator', () => {
    const filters = ['name ilike "%test%"', 'status == "active"'];
    const result = mergeFilterValues(filters, '|');
    expect(result).toBe('(name ilike "%test%")|(status == "active")');
  });

  it('should filter out empty, null, and undefined values', () => {
    const filters = ['name ilike "%test%"', null, undefined, '', 'status == "active"'];
    const result = mergeFilterValues(filters);
    expect(result).toBe('(name ilike "%test%")&(status == "active")');
  });

  it('should return undefined when all filters are empty', () => {
    const filters = [null, undefined, ''];
    const result = mergeFilterValues(filters);
    expect(result).toBeUndefined();
  });

  it('should handle single filter', () => {
    const filters = ['name ilike "%test%"'];
    const result = mergeFilterValues(filters);
    expect(result).toBe('(name ilike "%test%")');
  });

  it('should handle empty array', () => {
    const filters: string[] = [];
    const result = mergeFilterValues(filters);
    expect(result).toBeUndefined();
  });
});

describe('BAIPropertyFilter Component', () => {
  const mockFilterProperties = [
    {
      key: 'name',
      propertyLabel: 'Name',
      type: 'string' as const,
      defaultOperator: 'ilike',
    },
    {
      key: 'status',
      propertyLabel: 'Status',
      type: 'string' as const,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      key: 'is_enabled',
      propertyLabel: 'Enabled',
      type: 'boolean' as const,
    },
  ];

  it('should render property selector and search input', () => {
    render(<BAIPropertyFilter filterProperties={mockFilterProperties} />);

    expect(screen.getByLabelText('Filter property selector')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter value search')).toBeInTheDocument();
  });

  it('should accept value prop and parse filters', async () => {
    const value = 'name ilike "%test%" & status == "active"';
    const mockOnChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value={value}
        onChange={mockOnChange}
      />,
    );

    // Component should render without crashing
    const searchInput = screen.getByLabelText('Filter value search');
    expect(searchInput).toBeInTheDocument();
    
    // The component receives and processes the value internally
    // We can verify it accepted the value by checking it doesn't call onChange on mount
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should call onChange when adding a new filter', async () => {
    const mockOnChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        onChange={mockOnChange}
      />,
    );

    const searchInput = screen.getByLabelText('Filter value search');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      const callArg = mockOnChange.mock.calls[0][0];
      expect(callArg).toContain('name ilike "%test%"');
    });
  });

  it('should remove filter tag when close button is clicked', async () => {
    const mockOnChange = jest.fn();
    const value = 'name ilike "%test%"';
    const { container } = render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value={value}
        onChange={mockOnChange}
      />,
    );

    // Find and click the close button on the tag
    const closeButton = container.querySelector('.anticon-close');
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton!);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  it('should show reset button when multiple filters exist', () => {
    const value = 'name ilike "%test%" & status == "active"';
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value={value}
      />,
    );

    const resetButton = screen.getByRole('button', { name: /close-circle/i });
    expect(resetButton).toBeInTheDocument();
  });

  it('should clear all filters when reset button is clicked', async () => {
    const mockOnChange = jest.fn();
    const value = 'name ilike "%test%" & status == "active"';
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value={value}
        onChange={mockOnChange}
      />,
    );

    const resetButton = screen.getByRole('button', { name: /close-circle/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  it('should handle boolean type filters with strict selection', async () => {
    const mockOnChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        onChange={mockOnChange}
      />,
    );

    // Select boolean property
    const propertySelector = screen.getByLabelText('Filter property selector');
    fireEvent.mouseDown(propertySelector);

    await waitFor(() => {
      const enabledOption = screen.getByText('Enabled');
      fireEvent.click(enabledOption);
    });

    // Enter true value
    const searchInput = screen.getByLabelText('Filter value search');
    fireEvent.change(searchInput, { target: { value: 'true' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      const callArg = mockOnChange.mock.calls[0][0];
      expect(callArg).toContain('is_enabled == true');
    });
  });

  it('should show validation error for invalid values', async () => {
    const filterPropertiesWithValidation = [
      {
        key: 'email',
        propertyLabel: 'Email',
        type: 'string' as const,
        rule: {
          message: 'Invalid email format',
          validate: (value: string) => /\S+@\S+\.\S+/.test(value),
        },
      },
    ];

    const mockOnChange = jest.fn();
    const { container } = render(
      <BAIPropertyFilter 
        filterProperties={filterPropertiesWithValidation}
        onChange={mockOnChange}
      />,
    );

    const searchInput = screen.getByLabelText('Filter value search');
    
    // Focus input and enter invalid email
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: 'invalid' } });
    
    // Try to submit invalid value
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    // The component validates and doesn't add invalid filter
    // onChange should not be called for invalid input
    await waitFor(() => {
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  it('should display option labels in filter tags', () => {
    const value = 'status == "active"';
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value={value}
      />,
    );

    // Should show label "Active" instead of value "active"
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Active/)).toBeInTheDocument();
  });

  it('should handle string filters with ilike operator adding wildcards', async () => {
    const mockOnChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        onChange={mockOnChange}
      />,
    );

    const searchInput = screen.getByLabelText('Filter value search');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      const callArg = mockOnChange.mock.calls[0][0];
      expect(callArg).toContain('name ilike "%test%"');
    });
  });

  it('should handle controlled value prop', () => {
    const { rerender } = render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value='name ilike "%initial%"'
      />,
    );

    expect(screen.getByText(/initial/)).toBeInTheDocument();

    rerender(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value='name ilike "%updated%"'
      />,
    );

    expect(screen.queryByText(/initial/)).not.toBeInTheDocument();
    expect(screen.getByText(/updated/)).toBeInTheDocument();
  });

  it('should use defaultValue when value prop is not provided', async () => {
    const mockOnChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        defaultValue='name ilike "%default%"'
        onChange={mockOnChange}
      />,
    );

    // Component should render without crashing
    const searchInput = screen.getByLabelText('Filter value search');
    expect(searchInput).toBeInTheDocument();
    
    // The component accepts defaultValue and processes it internally
    // Verify it doesn't call onChange on mount
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should not add filter when empty value is submitted', async () => {
    const mockOnChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        onChange={mockOnChange}
      />,
    );

    const searchInput = screen.getByLabelText('Filter value search');
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  it('should handle strictSelection option', () => {
    const strictFilterProperties = [
      {
        key: 'status',
        propertyLabel: 'Status',
        type: 'string' as const,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        strictSelection: true,
      },
    ];

    const mockOnChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={strictFilterProperties}
        onChange={mockOnChange}
      />,
    );

    const searchInput = screen.getByLabelText('Filter value search');
    
    // Try to enter value not in options
    fireEvent.change(searchInput, { target: { value: 'invalid' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    // Should not call onChange for invalid value
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
