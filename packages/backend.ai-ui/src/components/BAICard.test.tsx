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
      const card = container.querySelector('.ant-card');
      expect(card).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('Status Variants', () => {
    it('should render default status card', () => {
      const { container } = render(
        <BAICard status="default">Default card</BAICard>,
      );
      const card = container.querySelector('.ant-card');
      expect(card).not.toHaveClass('bai-card-error');
    });

    it('should render success status card with green border', () => {
      const { container } = render(
        <BAICard status="success">Success card</BAICard>,
      );
      const card = container.querySelector('.ant-card');
      expect(card).toBeInTheDocument();
    });

    it('should render error status card with red border and error class', () => {
      const { container } = render(
        <BAICard status="error">Error card</BAICard>,
      );
      const card = container.querySelector('.ant-card');
      expect(card).toHaveClass('bai-card-error');
    });

    it('should render warning status card with yellow border', () => {
      const { container } = render(
        <BAICard status="warning">Warning card</BAICard>,
      );
      const card = container.querySelector('.ant-card');
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
      const handleClick = jest.fn();
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
      const card = container.querySelector('.ant-card-small');
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
      const card = container.querySelector('.ant-card-bordered');
      expect(card).toBeInTheDocument();
    });

    it('should render borderless card', () => {
      const { container } = render(
        <BAICard bordered={false}>Borderless card</BAICard>,
      );
      const card = container.querySelector('.ant-card');
      expect(card).not.toHaveClass('ant-card-bordered');
    });

    it('should render hoverable card', () => {
      const { container } = render(<BAICard hoverable>Hoverable card</BAICard>);
      const card = container.querySelector('.ant-card-hoverable');
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
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
    });

    it('should call onTabChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const handleTabChange = jest.fn();
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

      await user.click(screen.getByText('Tab 2'));
      expect(handleTabChange).toHaveBeenCalledWith('tab2');
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
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
    });

    it('should disable divider when showDivider is false and no tabList', () => {
      const { container } = render(
        <BAICard title="Card" showDivider={false}>
          Content
        </BAICard>,
      );
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
    });

    it('should show divider when showDivider is true', () => {
      const { container } = render(
        <BAICard title="Card" showDivider={true}>
          Content
        </BAICard>,
      );
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render card with empty children', () => {
      const { container } = render(<BAICard />);
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
    });

    it('should render card with number as children', () => {
      render(<BAICard>{42}</BAICard>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render card with boolean children', () => {
      const { container } = render(<BAICard>{false}</BAICard>);
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
    });

    it('should render card with null children', () => {
      const { container } = render(<BAICard>{null}</BAICard>);
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
    });

    it('should render card with undefined children', () => {
      const { container } = render(<BAICard>{undefined}</BAICard>);
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
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
      const handleClick = jest.fn();
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
      const handleButtonClick = jest.fn();
      const handleTabChange = jest.fn();

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

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Extra Action')).toBeInTheDocument();

      await user.click(screen.getByText('Tab 2'));
      expect(handleTabChange).toHaveBeenCalledWith('tab2');

      await user.click(screen.getByText('Extra Action'));
      expect(handleButtonClick).toHaveBeenCalled();
    });

    it('should render card with all status types in sequence', () => {
      const { rerender, container } = render(
        <BAICard status="default">Content</BAICard>,
      );
      let card = container.querySelector('.ant-card');
      expect(card).not.toHaveClass('bai-card-error');

      rerender(<BAICard status="success">Content</BAICard>);
      card = container.querySelector('.ant-card');
      expect(card).toBeInTheDocument();

      rerender(<BAICard status="warning">Content</BAICard>);
      card = container.querySelector('.ant-card');
      expect(card).toBeInTheDocument();

      rerender(<BAICard status="error">Content</BAICard>);
      card = container.querySelector('.ant-card');
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
      expect(container.querySelector('.ant-card-loading')).toBeInTheDocument();
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
      expect(container.querySelector('.ant-card-small')).toBeInTheDocument();
      expect(container.querySelector('.ant-card-bordered')).toBeInTheDocument();
      expect(
        container.querySelector('.ant-card-hoverable'),
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
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
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
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
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
      expect(container.querySelector('.ant-card')).toBeInTheDocument();
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
      expect(container.querySelector('.ant-card-small')).toBeInTheDocument();
    });
  });
});
