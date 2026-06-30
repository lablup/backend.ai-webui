import BAIGraphQLPropertyFilter, {
  buildNestedFilter,
  type FilterProperty,
  type GraphQLFilter,
} from './BAIGraphQLPropertyFilter';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';

describe('buildNestedFilter', () => {
  it('builds a single-level filter', () => {
    expect(buildNestedFilter('name', { eq: 'test' })).toEqual({
      name: { eq: 'test' },
    });
  });

  it('builds a nested filter from a dot-notation path', () => {
    expect(buildNestedFilter('project.name', { eq: 'test' })).toEqual({
      project: { name: { eq: 'test' } },
    });
  });

  it.each(['__proto__', 'constructor', 'prototype'])(
    'rejects prototype-polluting key "%s" (returns empty filter)',
    (key) => {
      expect(buildNestedFilter(`${key}.polluted`, { eq: 'x' })).toEqual({});
      // Object.prototype must remain untouched.
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    },
  );

  it.each(['a..b', '.a', 'a.', '.', ''])(
    'rejects empty path segment in "%s" (returns empty filter)',
    (path) => {
      expect(buildNestedFilter(path, { eq: 'x' })).toEqual({});
    },
  );
});

const filterProperties: Array<FilterProperty> = [
  {
    key: 'name',
    propertyLabel: 'Name',
    type: 'string',
    fixedOperator: 'iContains',
  },
];

// Controlled wrapper so closing a tag triggers a real re-render with the
// updated filter value (mirrors how consumers pass value/onChange).
const Controlled = ({ initial }: { initial: GraphQLFilter | undefined }) => {
  const [value, setValue] = useState<GraphQLFilter | undefined>(initial);
  return (
    <BAIGraphQLPropertyFilter
      filterProperties={filterProperties}
      value={value}
      onChange={setValue}
    />
  );
};

describe('BAIGraphQLPropertyFilter tag removal', () => {
  const twoFilters: GraphQLFilter = {
    AND: [{ name: { iContains: 'alpha' } }, { name: { iContains: 'beta' } }],
  };

  it('removes only the closed tag and keeps the rest visible (FR-2965)', async () => {
    render(<Controlled initial={twoFilters} />);

    // Both tags are present and visible initially.
    const alphaTag = screen.getByText(/Name.*alpha/);
    const betaTag = screen.getByText(/Name.*beta/);
    expect(alphaTag).toBeVisible();
    expect(betaTag).toBeVisible();

    // Close the FIRST tag.
    const closeIcons = document.querySelectorAll('.ant-tag-close-icon');
    expect(closeIcons.length).toBe(2);
    fireEvent.click(closeIcons[0]);

    // The first filter is gone; the second remains VISIBLE (regression: it
    // previously became `ant-tag-hidden` because antd Tag self-hid and the
    // surviving condition reused that hidden instance).
    await waitFor(() => {
      expect(screen.queryByText(/Name.*alpha/)).not.toBeInTheDocument();
    });
    const remaining = screen.getByText(/Name.*beta/);
    expect(remaining).toBeVisible();
    expect(remaining.closest('.ant-tag')).not.toHaveClass('ant-tag-hidden');
  });

  it('emits the remaining condition via onChange when one of two tags is closed', async () => {
    const onChange = vi.fn();
    render(
      <BAIGraphQLPropertyFilter
        filterProperties={filterProperties}
        value={twoFilters}
        onChange={onChange}
      />,
    );

    const closeIcons = document.querySelectorAll('.ant-tag-close-icon');
    fireEvent.click(closeIcons[0]);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({ name: { iContains: 'beta' } });
    });
  });

  it('clears the filter when the only tag is closed', async () => {
    const onChange = vi.fn();
    render(
      <BAIGraphQLPropertyFilter
        filterProperties={filterProperties}
        value={{ name: { iContains: 'solo' } }}
        onChange={onChange}
      />,
    );

    const closeIcon = document.querySelector('.ant-tag-close-icon');
    expect(closeIcon).toBeInTheDocument();
    fireEvent.click(closeIcon!);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });
});

// FR-3011: a `renderInput` control bound to `value`/`onChange`. Plain buttons
// call `onChange(value)` to exercise auto-commit-on-change without a real picker.
const ownerCustomProperties: Array<FilterProperty> = [
  {
    key: 'owner.id',
    propertyLabel: 'Owner',
    type: 'uuid',
    fixedOperator: 'equals',
    renderInput: ({ onChange }) => (
      <>
        <button type="button" onClick={() => onChange('uuid-alice')}>
          pick-alice
        </button>
        <button type="button" onClick={() => onChange('uuid-bob')}>
          pick-bob
        </button>
      </>
    ),
  },
];

// FR-3011: a `renderInput` control whose committed value is opaque (a UUID)
// but which forwards the selected option (`{ value, label }`) as the second
// `onChange` argument, mirroring `BAIUserSelect` with `valuePropName="id"`.
const ownerLabeledProperties: Array<FilterProperty> = [
  {
    key: 'owner.id',
    propertyLabel: 'Owner',
    type: 'uuid',
    fixedOperator: 'equals',
    singleSelect: true,
    renderInput: ({ onChange }) => (
      <button
        type="button"
        onClick={() =>
          onChange('uuid-alice', {
            value: 'uuid-alice',
            label: 'alice@example.com',
          })
        }
      >
        pick-alice
      </button>
    ),
  },
];

const ControlledCustom = ({
  onFilterChange,
  filterProperties: customProperties = ownerCustomProperties,
}: {
  onFilterChange?: (value: GraphQLFilter | undefined) => void;
  filterProperties?: Array<FilterProperty>;
}) => {
  const [value, setValue] = useState<GraphQLFilter | undefined>();
  return (
    <BAIGraphQLPropertyFilter
      filterProperties={customProperties}
      value={value}
      onChange={(next) => {
        setValue(next);
        onFilterChange?.(next);
      }}
    />
  );
};

describe('BAIGraphQLPropertyFilter custom renderInput', () => {
  it('commits a condition as soon as the controlled input emits a value', async () => {
    const onFilterChange = vi.fn();
    render(<ControlledCustom onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByText('pick-alice'));

    // The emitted value flows into the GraphQL filter under the dot-notation key.
    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({
        owner: { id: { equals: 'uuid-alice' } },
      });
    });
    // The tag shows the committed raw value.
    expect(screen.getByText(/Owner.*uuid-alice/)).toBeVisible();
  });

  it('stacks each emitted value as a separate tag (AND of conditions)', async () => {
    render(<ControlledCustom />);

    fireEvent.click(screen.getByText('pick-alice'));
    await waitFor(() => {
      expect(screen.getByText(/Owner.*uuid-alice/)).toBeVisible();
    });

    fireEvent.click(screen.getByText('pick-bob'));
    await waitFor(() => {
      expect(screen.getByText(/Owner.*uuid-bob/)).toBeVisible();
    });

    // Both conditions are kept as separate tags.
    expect(screen.getByText(/Owner.*uuid-alice/)).toBeVisible();
    expect(document.querySelectorAll('.ant-tag')).toHaveLength(2);
  });

  it('displays the renderInput-supplied label in the tag while keeping the raw value in the filter', async () => {
    const onFilterChange = vi.fn();
    render(
      <ControlledCustom
        onFilterChange={onFilterChange}
        filterProperties={ownerLabeledProperties}
      />,
    );

    fireEvent.click(screen.getByText('pick-alice'));

    // The GraphQL filter still carries the opaque value (UUID), not the label.
    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({
        owner: { id: { equals: 'uuid-alice' } },
      });
    });
    // The tag shows the human-readable label, not the UUID.
    expect(screen.getByText(/Owner.*alice@example\.com/)).toBeVisible();
    expect(screen.queryByText(/uuid-alice/)).not.toBeInTheDocument();
  });
});
