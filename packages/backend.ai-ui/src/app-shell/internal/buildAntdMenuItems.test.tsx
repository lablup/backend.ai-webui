import { buildAntdMenuItems } from './buildAntdMenuItems';

describe('buildAntdMenuItems', () => {
  it('groups consecutive items with the same group field', () => {
    const items = buildAntdMenuItems(
      [
        { key: 'a', label: 'A', group: 'X' },
        { key: 'b', label: 'B', group: 'X' },
        { key: 'c', label: 'C', group: 'Y' },
      ],
      false,
    );
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      type: 'group',
      children: [{ key: 'a' }, { key: 'b' }],
    });
    expect(items[1]).toMatchObject({
      type: 'group',
      children: [{ key: 'c' }],
    });
  });

  it('renders ungrouped items directly without a group wrapper', () => {
    const items = buildAntdMenuItems([{ key: 'flat', label: 'Flat' }], false);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ key: 'flat', label: 'Flat' });
    expect(items[0]).not.toHaveProperty('type', 'group');
  });

  it('emits monotonically unique keys when the same group name reappears', () => {
    // Regression test for B4: duplicate "__group:Main" keys would crash antd's reconciler.
    const items = buildAntdMenuItems(
      [
        { key: 'a', label: 'A', group: 'Main' },
        { key: 'b', label: 'B', group: 'Other' },
        { key: 'c', label: 'C', group: 'Main' },
      ],
      false,
    );
    const keys = items.map((i) => i?.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('still groups correctly when collapsed (the label changes but structure stays)', () => {
    const expanded = buildAntdMenuItems(
      [{ key: 'a', label: 'A', group: 'X' }],
      false,
    );
    const collapsed = buildAntdMenuItems(
      [{ key: 'a', label: 'A', group: 'X' }],
      true,
    );
    expect(collapsed).toHaveLength(expanded.length);
    expect((collapsed[0] as { children: unknown[] }).children).toHaveLength(1);
  });

  it('handles an empty menu list', () => {
    expect(buildAntdMenuItems([], false)).toEqual([]);
  });

  it('does not lose icons during the grouping pass', () => {
    const icon = '★' as unknown as React.ReactNode;
    const items = buildAntdMenuItems(
      [{ key: 'a', label: 'A', icon, group: 'X' }],
      false,
    );
    const first = items[0] as { children: Array<{ icon: unknown }> };
    expect(first.children[0]?.icon).toBe(icon);
  });
});
