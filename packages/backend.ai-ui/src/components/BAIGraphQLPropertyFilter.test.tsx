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
    'rejects prototype-polluting key "%s"',
    (key) => {
      expect(() => buildNestedFilter(`${key}.polluted`, { eq: 'x' })).toThrow();
      // Object.prototype must remain untouched.
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    },
  );

  it.each(['a..b', '.a', 'a.', '.', ''])(
    'rejects empty path segment in "%s"',
    (path) => {
      expect(() => buildNestedFilter(path, { eq: 'x' })).toThrow();
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
