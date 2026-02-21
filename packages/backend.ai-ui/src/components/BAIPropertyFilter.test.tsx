import BAIPropertyFilter, {
  mergeFilterValues,
  parseFilterValue,
} from './BAIPropertyFilter';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

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
  it('should merge multiple filter strings with default & operator', () => {
    const result = mergeFilterValues([
      'name ilike "test"',
      'status == "READY"',
    ]);
    expect(result).toBe('(name ilike "test")&(status == "READY")');
  });

  it('should merge filter strings with custom | operator', () => {
    const result = mergeFilterValues(
      ['name ilike "test"', 'name ilike "prod"'],
      '|',
    );
    expect(result).toBe('(name ilike "test")|(name ilike "prod")');
  });

  it('should filter out empty and null values', () => {
    const result = mergeFilterValues([
      'name ilike "test"',
      '',
      null,
      undefined,
    ]);
    expect(result).toBe('(name ilike "test")');
  });

  it('should return undefined when no valid filters', () => {
    const result = mergeFilterValues(['', null, undefined]);
    expect(result).toBeUndefined();
  });
});

describe('BAIPropertyFilter Component', () => {
  const mockFilterProperties = [
    {
      key: 'name',
      propertyLabel: 'Name',
      type: 'string' as const,
    },
    {
      key: 'status',
      propertyLabel: 'Status',
      type: 'string' as const,
      options: [
        { label: 'Ready', value: 'READY' },
        { label: 'Running', value: 'RUNNING' },
      ],
      strictSelection: true,
    },
    {
      key: 'active',
      propertyLabel: 'Active',
      type: 'boolean' as const,
    },
  ];

  it('should render with filter properties', () => {
    render(<BAIPropertyFilter filterProperties={mockFilterProperties} />);
    expect(
      screen.getByLabelText('Filter property selector'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Filter value search')).toBeInTheDocument();
  });

  it('should add a filter when user searches', async () => {
    const onChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        onChange={onChange}
      />,
    );

    const searchInput = screen.getByLabelText('Filter value search');
    await userEvent.type(searchInput, 'test{Enter}');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining('name ilike "%test%"'),
      );
    });
  });

  it('should display filter tags after adding', async () => {
    const { container } = render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value='name ilike "%test%"'
      />,
    );

    await waitFor(() => {
      const tag = container.querySelector('.ant-tag');
      expect(tag).toBeInTheDocument();
    });
  });

  it('should remove filter when tag close button is clicked', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value='name ilike "%test%"'
        onChange={onChange}
      />,
    );

    await waitFor(() => {
      const closeButton = container.querySelector('.ant-tag-close-icon');
      if (closeButton) {
        fireEvent.click(closeButton);
      }
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });

  it('should switch property when selector changes', async () => {
    render(<BAIPropertyFilter filterProperties={mockFilterProperties} />);

    const selector = screen.getByLabelText('Filter property selector');
    fireEvent.mouseDown(selector);

    await waitFor(() => {
      const statusOption = screen.getByText('Status');
      fireEvent.click(statusOption);
    });

    expect(selector).toBeInTheDocument();
  });

  it('should handle boolean type filters', async () => {
    const onChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        onChange={onChange}
      />,
    );

    // Switch to boolean property
    const selector = screen.getByLabelText('Filter property selector');
    fireEvent.mouseDown(selector);

    await waitFor(() => {
      const activeOption = screen.getByText('Active');
      fireEvent.click(activeOption);
    });

    // Add a boolean filter
    const searchInput = screen.getByLabelText('Filter value search');
    fireEvent.mouseDown(searchInput);

    await waitFor(() => {
      const trueOption = screen.getByText('True');
      fireEvent.click(trueOption);
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining('active == true'),
      );
    });
  });

  it('should handle multiple filters', async () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        onChange={onChange}
      />,
    );

    // Add first filter
    const searchInput = screen.getByLabelText('Filter value search');
    await userEvent.type(searchInput, 'first{Enter}');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('name ilike "%first%"');
    });

    // Rerender with updated value
    rerender(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        value='name ilike "%first%"'
        onChange={onChange}
      />,
    );

    // Add second filter
    await userEvent.type(searchInput, 'second{Enter}');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        'name ilike "%first%" & name ilike "%second%"',
      );
    });
  });

  it('should enforce strict selection for specified properties', async () => {
    const onChange = jest.fn();
    render(
      <BAIPropertyFilter
        filterProperties={mockFilterProperties}
        onChange={onChange}
      />,
    );

    // Switch to status property with strict selection
    const selector = screen.getByLabelText('Filter property selector');
    fireEvent.mouseDown(selector);

    await waitFor(() => {
      const statusOption = screen.getByText('Status');
      fireEvent.click(statusOption);
    });

    // Try to add invalid value (not in options)
    const searchInput = screen.getByLabelText('Filter value search');
    await userEvent.type(searchInput, 'INVALID{Enter}');

    // Should not add filter for invalid option
    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('should validate input with custom validation rule', async () => {
    const onChange = jest.fn();
    const filterPropertiesWithValidation = [
      {
        key: 'email',
        propertyLabel: 'Email',
        type: 'string' as const,
        rule: {
          message: 'Invalid email format',
          validate: (value: string) =>
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
        },
      },
    ];

    render(
      <BAIPropertyFilter
        filterProperties={filterPropertiesWithValidation}
        onChange={onChange}
      />,
    );

    const searchInput = screen.getByLabelText('Filter value search');

    // Try invalid email
    await userEvent.type(searchInput, 'invalid-email{Enter}');

    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalled();
    });

    // Clear and try valid email
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'test@example.com{Enter}');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('email ilike "%test@example.com%"');
    });
  });
});
