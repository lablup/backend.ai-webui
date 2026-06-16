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

// FR-3011: first-class `custom` filter type. `renderInput` here exposes plain
// buttons that call `onConfirm(value, label)` so the tag label resolution and
// `singleValue` replacement can be asserted without a real picker.
const ownerCustomProperties: Array<FilterProperty> = [
  {
    key: 'owner.id',
    propertyLabel: 'Owner',
    type: 'custom',
    fixedOperator: 'equals',
    singleValue: true,
    renderInput: ({ onConfirm }) => (
      <>
        <button
          type="button"
          onClick={() => onConfirm('uuid-alice', 'alice@example.com')}
        >
          pick-alice
        </button>
        <button
          type="button"
          onClick={() => onConfirm('uuid-bob', 'bob@example.com')}
        >
          pick-bob
        </button>
      </>
    ),
  },
];

const ControlledCustom = ({
  onFilterChange,
}: {
  onFilterChange?: (value: GraphQLFilter | undefined) => void;
}) => {
  const [value, setValue] = useState<GraphQLFilter | undefined>();
  return (
    <BAIGraphQLPropertyFilter
      filterProperties={ownerCustomProperties}
      value={value}
      onChange={(next) => {
        setValue(next);
        onFilterChange?.(next);
      }}
    />
  );
};

describe('BAIGraphQLPropertyFilter custom type', () => {
  it('commits a custom condition and shows the human-readable label, not the raw value', async () => {
    const onFilterChange = vi.fn();
    render(<ControlledCustom onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByText('pick-alice'));

    // The confirmed value flows into the GraphQL filter under the dot-notation key.
    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({
        owner: { id: { equals: 'uuid-alice' } },
      });
    });
    // The tag shows the label (email), not the raw confirmed value (uuid).
    expect(screen.getByText(/Owner.*alice@example\.com/)).toBeVisible();
    expect(screen.queryByText(/uuid-alice/)).not.toBeInTheDocument();
  });

  it('replaces the existing condition instead of stacking when singleValue is set', async () => {
    render(<ControlledCustom />);

    fireEvent.click(screen.getByText('pick-alice'));
    await waitFor(() => {
      expect(screen.getByText(/Owner.*alice@example\.com/)).toBeVisible();
    });

    fireEvent.click(screen.getByText('pick-bob'));
    await waitFor(() => {
      expect(screen.getByText(/Owner.*bob@example\.com/)).toBeVisible();
    });

    // The earlier condition is replaced, leaving exactly one tag.
    expect(screen.queryByText(/alice@example\.com/)).not.toBeInTheDocument();
    expect(document.querySelectorAll('.ant-tag')).toHaveLength(1);
  });
});
