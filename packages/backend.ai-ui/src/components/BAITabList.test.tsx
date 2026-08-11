/*
 QA2-A: `BAITabList` owns the two tab LOOKS and the tab-bar ANATOMY.

 The anatomy assertions are the load-bearing ones. Astryx's tab strip has no
 `width`, so a `<nav>` placed inside a flex ROW hugs its tabs and the
 `hasDivider` rail stops at the last tab instead of spanning the bar — the exact
 regression this component exists to prevent. jsdom does not lay out, so the
 test asserts the STRUCTURE that guarantees the layout: the trailing slot is a
 CHILD of the nav, not a sibling.
*/
import BAITabList from './BAITabList';
import { Tab } from '@astryxdesign/core/TabList';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const renderTabs = (props: Partial<React.ComponentProps<typeof BAITabList>>) =>
  render(
    <BAITabList value="a" onChange={() => {}} {...props}>
      <Tab value="a" label="Alpha" />
      <Tab value="b" label="Beta" />
    </BAITabList>,
  );

describe('BAITabList', () => {
  describe('Tab styles', () => {
    it('should default to the line style', () => {
      const { container } = renderTabs({});
      expect(
        container.querySelector('.bai-tab-list--card'),
      ).not.toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should mark the card style so BAITabList.css can paint it', () => {
      const { container } = renderTabs({ type: 'card' });
      expect(container.querySelector('.bai-tab-list--card')).toBe(
        container.querySelector('nav'),
      );
    });

    it('should keep a consumer className alongside the style class', () => {
      const { container } = renderTabs({ type: 'card', className: 'mine' });
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bai-tab-list--card');
      expect(nav).toHaveClass('mine');
    });

    it('should size card tabs at the lg step and line tabs at md', () => {
      const { container: card } = renderTabs({ type: 'card' });
      expect(card.querySelector('nav')).toHaveAttribute('data-size', 'lg');
      const { container: line } = renderTabs({ type: 'line' });
      expect(line.querySelector('nav')).toHaveAttribute('data-size', 'md');
    });

    it('should let an explicit size win over the style default', () => {
      const { container } = renderTabs({ type: 'card', size: 'sm' });
      expect(container.querySelector('nav')).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('Tab bar anatomy', () => {
    it('should render tabBarExtraContent INSIDE the nav, so the rail spans the whole bar', () => {
      const { container } = renderTabs({
        tabBarExtraContent: <span>Pending</span>,
      });
      const nav = container.querySelector('nav');
      const extra = container.querySelector('.bai-tab-list__extra');
      expect(extra).toBeInTheDocument();
      expect(nav).toContainElement(extra as HTMLElement);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should not render a trailing slot when there is no extra content', () => {
      const { container } = renderTabs({});
      expect(
        container.querySelector('.bai-tab-list__extra'),
      ).not.toBeInTheDocument();
    });

    it('should draw the rail by default', () => {
      // `hasDivider` defaults to false in Astryx; antd always drew the rail, so
      // the wrapper flips the default back.
      const { container } = renderTabs({});
      const nav = container.querySelector('nav') as HTMLElement;
      const withoutDivider = renderTabs({ hasDivider: false });
      expect(nav.className).not.toBe(
        (withoutDivider.container.querySelector('nav') as HTMLElement)
          .className,
      );
    });
  });

  describe('Behaviour', () => {
    it('should report the selected tab', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderTabs({ onChange });
      await user.click(screen.getByRole('button', { name: 'Beta' }));
      expect(onChange).toHaveBeenCalledWith('b');
    });
  });
});
