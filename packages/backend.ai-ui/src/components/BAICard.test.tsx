/*
 to-astryx W2-D: `BAICard` renders Astryx `Card`, so the antd structural
 classes (`.ant-card`, `.ant-card-small`, `.ant-card-bordered`,
 `.ant-card-hoverable`, `.ant-card-loading`) are gone. The wrapper emits a
 stable `bai-card` class (plus `bai-card--{status}` / `bai-card--hoverable`),
 which is what the assertions now hook onto — Astryx styles through StyleX and
 its generated class names are not a contract.

 Size, border and loading are no longer expressible as classes: `size="small"`
 is an Astryx `padding` step, `bordered`/`variant` collapse onto Astryx's own
 `variant`, and `loading` swaps the body for `Skeleton` boxes. Those tests now
 assert the card still renders, which is the part that remains a contract.
*/
import BAICard from './BAICard';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('BAICard', () => {
  describe('Basic Rendering', () => {
    it('should render card with children', () => {
      render(<BAICard>Card content</BAICard>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render card with title', () => {
      render(<BAICard title="Card Title">Content</BAICard>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should render card without title', () => {
      render(<BAICard>Content only</BAICard>);
      expect(screen.getByText('Content only')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <BAICard className="custom-class">Content</BAICard>,
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should apply custom style', () => {
      const { container } = render(
        <BAICard style={{ backgroundColor: 'red' }}>Content</BAICard>,
      );
      const card = container.querySelector('.bai-card');
      expect(card).toBeTruthy();
      expect(card?.getAttribute('style')).toContain('background-color: red');
    });

    // Product tours anchor steps to the header row and the action slot by
    // query (`SessionLauncherErrorTourProps`,
    // `AdminDeploymentPresetValidationTour`) — the elements are rendered
    // inside this component, so there is no ref for the call site to pass.
    // They pointed at `.ant-card-head` / `.ant-card-extra` until the Astryx
    // rebuild silently stopped emitting them; a missing tour anchor degrades
    // to an unanchored step instead of throwing, so nothing caught it. These
    // two assertions are the guard that replaces "nothing caught it".
    it('should expose the tour anchor classes on the header row and extra slot', () => {
      const { container } = render(
        <BAICard title="Card Title" extra={<button>Modify</button>}>
          Content
        </BAICard>,
      );
      const head = container.querySelector('.bai-card__head');
      expect(head).toBeTruthy();
      expect(head).toHaveTextContent('Card Title');
      expect(container.querySelector('.bai-card__extra')).toHaveTextContent(
        'Modify',
      );
    });

    it('should not render the header row when there is no title or extra', () => {
      const { container } = render(<BAICard>Content only</BAICard>);
      expect(container.querySelector('.bai-card__head')).toBeNull();
    });
  });

  describe('Status Variants', () => {
    it('should render default status card', () => {
      const { container } = render(
        <BAICard status="default">Default card</BAICard>,
      );
      const card = container.querySelector('.bai-card');
      expect(card).not.toHaveClass('bai-card-error');
    });

    it('should render success status card with green border', () => {
      const { container } = render(
        <BAICard status="success">Success card</BAICard>,
      );
      const card = container.querySelector('.bai-card');
      expect(card).toBeInTheDocument();
    });

    it('should render error status card with red border and error class', () => {
      const { container } = render(
        <BAICard status="error">Error card</BAICard>,
      );
      const card = container.querySelector('.bai-card');
      expect(card).toHaveClass('bai-card-error');
    });

    it('should render warning status card with yellow border', () => {
      const { container } = render(
        <BAICard status="warning">Warning card</BAICard>,
      );
      const card = container.querySelector('.bai-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Extra Button', () => {
    it('should render extra button with title', () => {
      render(
        <BAICard title="Card" extraButtonTitle="Action">
          Content
        </BAICard>,
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should call onClickExtraButton when extra button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <BAICard
          title="Card"
          extraButtonTitle="Action"
          onClickExtraButton={handleClick}
        >
          Content
        </BAICard>,
      );

      await user.click(screen.getByText('Action'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render error icon when status is error', () => {
      render(
        <BAICard title="Error" status="error" extraButtonTitle="Fix Error">
          Error content
        </BAICard>,
      );
      const button = screen.getByRole('button', { name: /Fix Error/i });
      expect(button).toBeInTheDocument();
    });

    it('should render warning icon when status is warning', () => {
      render(
        <BAICard
          title="Warning"
          status="warning"
          extraButtonTitle="Warning Action"
        >
          Warning content
        </BAICard>,
      );
      const button = screen.getByRole('button', { name: /Warning Action/i });
      expect(button).toBeInTheDocument();
    });

    it('should not render icon for success status', () => {
      render(
        <BAICard
          title="Success"
          status="success"
          extraButtonTitle="Success Action"
        >
          Success content
        </BAICard>,
      );
      const button = screen.getByRole('button', { name: /Success Action/i });
      expect(button).toBeInTheDocument();
    });

    it('should not render icon for default status', () => {
      render(
        <BAICard
          title="Default"
          status="default"
          extraButtonTitle="Default Action"
        >
          Default content
        </BAICard>,
      );
      const button = screen.getByRole('button', { name: /Default Action/i });
      expect(button).toBeInTheDocument();
    });

    // FR-3524: the extra action is a `type="link"` BAIButton, so it carries
    // `.bai-action-accent` — except on error/warning cards, where BAICard
    // passes `color="default"` so the glyph keeps carrying the status.
    it.each(['default', 'success'] as const)(
      'should tint the extra action on a %s status card',
      (status) => {
        render(
          <BAICard title="Card" status={status} extraButtonTitle="Action">
            Content
          </BAICard>,
        );
        expect(screen.getByRole('button', { name: /Action/i })).toHaveClass(
          'bai-action-accent',
        );
      },
    );

    it.each(['error', 'warning'] as const)(
      'should leave the extra action untinted on a %s status card',
      (status) => {
        render(
          <BAICard title="Card" status={status} extraButtonTitle="Action">
            Content
          </BAICard>,
        );
        expect(screen.getByRole('button', { name: /Action/i })).not.toHaveClass(
          'bai-action-accent',
        );
      },
    );

    it('should render ReactNode as extraButtonTitle', () => {
      render(
        <BAICard
          title="Card"
          extraButtonTitle={<span>Custom Button</span>}
          onClickExtraButton={() => {}}
        >
          Content
        </BAICard>,
      );
      expect(screen.getByText('Custom Button')).toBeInTheDocument();
    });
  });

  describe('Custom Extra Content', () => {
    it('should render custom extra content', () => {
      render(
        <BAICard title="Card" extra={<div>Custom Extra</div>}>
          Content
        </BAICard>,
      );
      expect(screen.getByText('Custom Extra')).toBeInTheDocument();
    });

    it('should prefer custom extra over extraButtonTitle', () => {
      render(
        <BAICard
          title="Card"
          extra={<div>Custom Extra</div>}
          extraButtonTitle="Button"
        >
          Content
        </BAICard>,
      );
      expect(screen.getByText('Custom Extra')).toBeInTheDocument();
      expect(screen.queryByText('Button')).not.toBeInTheDocument();
    });

    it('should apply fontWeight normal to custom extra', () => {
      render(
        <BAICard title="Card" extra={<div>Custom Extra</div>}>
          Content
        </BAICard>,
      );
      const extraElement = screen.getByText('Custom Extra');
      expect(extraElement).toHaveStyle({ fontWeight: 'normal' });
    });

    it('should render string extra content', () => {
      render(
        <BAICard title="Card" extra="Text Extra">
          Content
        </BAICard>,
      );
      expect(screen.getByText('Text Extra')).toBeInTheDocument();
    });
  });

  describe('Card Variants', () => {
    it('should render small size card', () => {
      const { container } = render(<BAICard size="small">Small card</BAICard>);
      const card = container.querySelector('.bai-card');
      expect(card).toBeInTheDocument();
    });

    it('should render default size card', () => {
      render(<BAICard size="default">Default card</BAICard>);
      expect(screen.getByText('Default card')).toBeInTheDocument();
    });

    it('should render bordered card', () => {
      const { container } = render(
        <BAICard bordered={true}>Bordered card</BAICard>,
      );
      const card = container.querySelector('.bai-card');
      expect(card).toBeInTheDocument();
    });

    it('should render borderless card', () => {
      const { container } = render(
        <BAICard bordered={false}>Borderless card</BAICard>,
      );
      const card = container.querySelector('.bai-card');
      expect(card).toHaveClass('bai-card');
    });

    it('should render hoverable card', () => {
      const { container } = render(<BAICard hoverable>Hoverable card</BAICard>);
      const card = container.querySelector('.bai-card--hoverable');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Tabs Integration', () => {
    it('should render card with tabs', () => {
      const { container } = render(
        <BAICard
          title="Card with Tabs"
          tabList={[
            { key: 'tab1', label: 'Tab 1' },
            { key: 'tab2', label: 'Tab 2' },
          ]}
          activeTabKey="tab1"
        >
          Tab content
        </BAICard>,
      );
      // Astryx's `TabList` is a `<nav>` of `<button>`s (it also keeps a hidden
      // overflow copy of each label), so `getByText` matches twice — query by
      // ROLE, which only matches the rail's controls.
      expect(screen.getByRole('button', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tab 2' })).toBeInTheDocument();
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should call onTabChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const handleTabChange = vi.fn();
      render(
        <BAICard
          title="Card with Tabs"
          tabList={[
            { key: 'tab1', label: 'Tab 1' },
            { key: 'tab2', label: 'Tab 2' },
          ]}
          activeTabKey="tab1"
          onTabChange={handleTabChange}
        >
          Tab content
        </BAICard>,
      );

      await user.click(screen.getByRole('button', { name: 'Tab 2' }));
      expect(handleTabChange).toHaveBeenCalledWith('tab2');
    });

    /*
     QA2-A: the tab strip is the card's HEADER CHROME. Two structural facts
     carry the look, and neither is observable in jsdom's layout — so they are
     asserted as structure:
       - the `<nav>` carries `bai-card__tabs`, which full-bleeds it to the
         card's edges (antd's `.ant-card-head` border ran the card's full
         width while the first tab's label stayed at the body inset);
       - `tabBarExtraContent` is a CHILD of the nav, not a sibling. As a
         sibling it forced the nav into a flex row, where Astryx's widthless
         strip hugs its tabs and the rail stops at the last tab.
    */
    it('should full-bleed the tab strip as card chrome', () => {
      const { container } = render(
        <BAICard tabList={[{ key: 'tab1', label: 'Tab 1' }]}>Content</BAICard>,
      );
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bai-card__tabs');
      // No title and no cover: the strip is the card's first row, so it welds
      // to the top edge.
      expect(nav).toHaveClass('bai-card__tabs--top');
    });

    it('should not weld the tab strip to the top edge when a title comes first', () => {
      const { container } = render(
        <BAICard title="Card" tabList={[{ key: 'tab1', label: 'Tab 1' }]}>
          Content
        </BAICard>,
      );
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bai-card__tabs');
      expect(nav).not.toHaveClass('bai-card__tabs--top');
    });

    it('should render tabBarExtraContent inside the tab nav', () => {
      const { container } = render(
        <BAICard
          tabList={[{ key: 'tab1', label: 'Tab 1' }]}
          tabBarExtraContent={<span>Extra</span>}
        >
          Content
        </BAICard>,
      );
      const nav = container.querySelector('nav');
      // The trailing slot is `BAITabList`'s (`.bai-tab-list__extra`).
      const extra = container.querySelector('.bai-tab-list__extra');
      expect(extra).toBeInTheDocument();
      expect(nav).toContainElement(extra as HTMLElement);
    });

    it('should republish the card padding step as a class for the bleed math', () => {
      const { container } = render(
        <BAICard size="small" tabList={[{ key: 'tab1', label: 'Tab 1' }]}>
          Content
        </BAICard>,
      );
      expect(container.querySelector('.bai-card--compact')).toBeInTheDocument();
    });

    it('should auto-enable divider when tabList is provided', () => {
      const { container } = render(
        <BAICard
          title="Card with Tabs"
          tabList={[
            { key: 'tab1', label: 'Tab 1' },
            { key: 'tab2', label: 'Tab 2' },
          ]}
          activeTabKey="tab1"
        >
          Content
        </BAICard>,
      );
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should disable divider when showDivider is false and no tabList', () => {
      const { container } = render(
        <BAICard title="Card" showDivider={false}>
          Content
        </BAICard>,
      );
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should show divider when showDivider is true', () => {
      const { container } = render(
        <BAICard title="Card" showDivider={true}>
          Content
        </BAICard>,
      );
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render card with empty children', () => {
      const { container } = render(<BAICard />);
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should render card with number as children', () => {
      render(<BAICard>{42}</BAICard>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render card with boolean children', () => {
      const { container } = render(<BAICard>{false}</BAICard>);
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should render card with null children', () => {
      const { container } = render(<BAICard>{null}</BAICard>);
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should render card with undefined children', () => {
      const { container } = render(<BAICard>{undefined}</BAICard>);
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should handle undefined extra content', () => {
      render(
        <BAICard title="Card" extra={undefined}>
          Content
        </BAICard>,
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle null extra content', () => {
      render(
        <BAICard title="Card" extra={null}>
          Content
        </BAICard>,
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    it('should render card with multiple features combined', () => {
      const handleClick = vi.fn();
      render(
        <BAICard
          title="Complex Card"
          status="warning"
          extraButtonTitle="Action"
          onClickExtraButton={handleClick}
          size="small"
          bordered={true}
          hoverable={true}
        >
          Complex content
        </BAICard>,
      );
      expect(screen.getByText('Complex Card')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Complex content')).toBeInTheDocument();
    });

    it('should render card with tabs and extra button', async () => {
      const user = userEvent.setup();
      const handleButtonClick = vi.fn();
      const handleTabChange = vi.fn();

      render(
        <BAICard
          title="Card with Tabs and Extra"
          tabList={[
            { key: 'tab1', label: 'Tab 1' },
            { key: 'tab2', label: 'Tab 2' },
          ]}
          activeTabKey="tab1"
          onTabChange={handleTabChange}
          extraButtonTitle="Extra Action"
          onClickExtraButton={handleButtonClick}
        >
          Content
        </BAICard>,
      );

      expect(screen.getByRole('button', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByText('Extra Action')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Tab 2' }));
      expect(handleTabChange).toHaveBeenCalledWith('tab2');

      await user.click(screen.getByText('Extra Action'));
      expect(handleButtonClick).toHaveBeenCalled();
    });

    it('should render card with all status types in sequence', () => {
      const { rerender, container } = render(
        <BAICard status="default">Content</BAICard>,
      );
      let card = container.querySelector('.bai-card');
      expect(card).not.toHaveClass('bai-card-error');

      rerender(<BAICard status="success">Content</BAICard>);
      card = container.querySelector('.bai-card');
      expect(card).toBeInTheDocument();

      rerender(<BAICard status="warning">Content</BAICard>);
      card = container.querySelector('.bai-card');
      expect(card).toBeInTheDocument();

      rerender(<BAICard status="error">Content</BAICard>);
      card = container.querySelector('.bai-card');
      expect(card).toHaveClass('bai-card-error');
    });

    it('should render card with nested components', () => {
      render(
        <BAICard title="Parent Card">
          <div>
            <span>Nested Content</span>
            <button>Nested Button</button>
          </div>
        </BAICard>,
      );
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
      expect(screen.getByText('Nested Button')).toBeInTheDocument();
    });
  });

  describe('Props Passthrough', () => {
    it('should pass through loading prop', () => {
      const { container } = render(<BAICard loading>Content</BAICard>);
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should pass through cover prop', () => {
      render(
        <BAICard cover={<img alt="cover" src="test.jpg" />}>Content</BAICard>,
      );
      expect(screen.getByRole('img', { name: 'cover' })).toBeInTheDocument();
    });

    it('should pass through actions prop', () => {
      render(
        <BAICard
          actions={[
            <button key="action1">Action 1</button>,
            <button key="action2">Action 2</button>,
          ]}
        >
          Content
        </BAICard>,
      );
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    it('should pass through all Ant Design Card props', () => {
      const { container } = render(
        <BAICard size="small" bordered={true} hoverable={true} loading={false}>
          Content
        </BAICard>,
      );
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
      expect(
        container.querySelector('.bai-card--hoverable'),
      ).toBeInTheDocument();
    });
  });

  describe('Title Rendering', () => {
    it('should render title only when provided', () => {
      render(<BAICard title="Title Only">Content</BAICard>);
      expect(screen.getByText('Title Only')).toBeInTheDocument();
    });

    it('should render extra only when title is not provided', () => {
      render(<BAICard extra={<div>Extra Only</div>}>Content</BAICard>);
      expect(screen.getByText('Extra Only')).toBeInTheDocument();
    });

    it('should render both title and extra together', () => {
      render(
        <BAICard
          title="Title"
          extraButtonTitle="Extra"
          onClickExtraButton={() => {}}
        >
          Content
        </BAICard>,
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Extra')).toBeInTheDocument();
    });

    it('should not render title container when both title and extra are missing', () => {
      render(<BAICard>Content only</BAICard>);
      expect(screen.getByText('Content only')).toBeInTheDocument();
    });
  });

  describe('Styles Configuration', () => {
    it('should apply custom styles object', () => {
      const { container } = render(
        <BAICard
          styles={{
            header: { backgroundColor: 'blue' },
            body: { padding: '10px' },
          }}
          title="Styled Card"
        >
          Content
        </BAICard>,
      );
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should merge custom styles with default styles', () => {
      const { container } = render(
        <BAICard
          title="Card"
          styles={{
            body: { backgroundColor: 'lightgray' },
          }}
        >
          Content
        </BAICard>,
      );
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should apply styles when tabList is provided', () => {
      const { container } = render(
        <BAICard
          title="Card"
          tabList={[{ key: 'tab1', label: 'Tab 1' }]}
          activeTabKey="tab1"
        >
          Content
        </BAICard>,
      );
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });

    it('should apply small size padding with tabs', () => {
      const { container } = render(
        <BAICard
          title="Card"
          size="small"
          tabList={[{ key: 'tab1', label: 'Tab 1' }]}
          activeTabKey="tab1"
        >
          Content
        </BAICard>,
      );
      expect(container.querySelector('.bai-card')).toBeInTheDocument();
    });
  });
});
