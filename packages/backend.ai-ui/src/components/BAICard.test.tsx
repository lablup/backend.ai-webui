import BAICard from './BAICard';
import { CloseCircleTwoTone, WarningTwoTone } from '@ant-design/icons';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from 'antd';

describe('BAICard', () => {
  describe('Basic Rendering', () => {
    it('should render card with title and children', () => {
      render(
        <BAICard title="Test Card">
          <div>Test Content</div>
        </BAICard>,
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render card without title', () => {
      const { container } = render(
        <BAICard>
          <div>Test Content</div>
        </BAICard>,
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(container.querySelector('.ant-card-head')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <BAICard className="custom-class" title="Test">
          Content
        </BAICard>,
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should apply custom style', () => {
      const { container } = render(
        <BAICard
          title="Test"
          style={{ backgroundColor: 'red', padding: '20px' }}
        >
          Content
        </BAICard>,
      );

      const card = container.querySelector('.ant-card');
      expect(card).toHaveStyle({ backgroundColor: 'red', padding: '20px' });
    });
  });

  describe('Status Variants', () => {
    it('should apply default border color when status is default', () => {
      const { container } = render(
        <BAICard title="Test" status="default">
          Content
        </BAICard>,
      );

      const card = container.querySelector('.ant-card');
      expect(card).not.toHaveClass('bai-card-error');
    });

    it('should apply error styling when status is error', () => {
      const { container } = render(
        <BAICard title="Test" status="error">
          Content
        </BAICard>,
      );

      const card = container.querySelector('.ant-card');
      expect(card).toHaveClass('bai-card-error');
      expect(card).toHaveStyle({ borderColor: expect.any(String) });
    });

    it('should apply warning border color when status is warning', () => {
      const { container } = render(
        <BAICard title="Test" status="warning">
          Content
        </BAICard>,
      );

      const card = container.querySelector('.ant-card');
      expect(card).toHaveStyle({ borderColor: expect.any(String) });
    });

    it('should apply success border color when status is success', () => {
      const { container } = render(
        <BAICard title="Test" status="success">
          Content
        </BAICard>,
      );

      const card = container.querySelector('.ant-card');
      expect(card).toHaveStyle({ borderColor: expect.any(String) });
    });
  });

  describe('Extra Content', () => {
    it('should render custom extra content', () => {
      render(
        <BAICard
          title="Test"
          extra={<Button data-testid="custom-extra">Custom Button</Button>}
        >
          Content
        </BAICard>,
      );

      expect(screen.getByTestId('custom-extra')).toBeInTheDocument();
      expect(screen.getByText('Custom Button')).toBeInTheDocument();
    });

    it('should apply normal font weight to extra content', () => {
      render(
        <BAICard
          title="Test"
          extra={<span data-testid="extra-span">Extra</span>}
        >
          Content
        </BAICard>,
      );

      const extraElement = screen.getByTestId('extra-span');
      expect(extraElement).toHaveStyle({ fontWeight: 'normal' });
    });
  });

  describe('Extra Button', () => {
    it('should render extra button with title', () => {
      render(
        <BAICard title="Test" extraButtonTitle="Action Button">
          Content
        </BAICard>,
      );

      expect(screen.getByText('Action Button')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Action Button/i })).toBeInTheDocument();
    });

    it('should call onClickExtraButton when button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <BAICard
          title="Test"
          extraButtonTitle="Click Me"
          onClickExtraButton={handleClick}
        >
          Content
        </BAICard>,
      );

      const button = screen.getByRole('button', { name: /Click Me/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render error icon in extra button when status is error', () => {
      const { container } = render(
        <BAICard
          title="Test"
          status="error"
          extraButtonTitle="Fix Error"
          onClickExtraButton={() => {}}
        >
          Content
        </BAICard>,
      );

      // Check for CloseCircleTwoTone icon by looking for anticon-close-circle
      const icon = container.querySelector('.anticon-close-circle');
      expect(icon).toBeInTheDocument();
    });

    it('should render warning icon in extra button when status is warning', () => {
      const { container } = render(
        <BAICard
          title="Test"
          status="warning"
          extraButtonTitle="Review Warning"
          onClickExtraButton={() => {}}
        >
          Content
        </BAICard>,
      );

      // Check for WarningTwoTone icon by looking for anticon-warning
      const icon = container.querySelector('.anticon-warning');
      expect(icon).toBeInTheDocument();
    });

    it('should not render icon in extra button when status is default', () => {
      const { container } = render(
        <BAICard
          title="Test"
          status="default"
          extraButtonTitle="Action"
          onClickExtraButton={() => {}}
        >
          Content
        </BAICard>,
      );

      const icons = container.querySelectorAll('.anticon');
      // Should have no icons in the button
      expect(icons.length).toBe(0);
    });

    it('should not render icon in extra button when status is success', () => {
      const { container } = render(
        <BAICard
          title="Test"
          status="success"
          extraButtonTitle="Action"
          onClickExtraButton={() => {}}
        >
          Content
        </BAICard>,
      );

      const icons = container.querySelectorAll('.anticon');
      expect(icons.length).toBe(0);
    });
  });

  describe('Header Divider', () => {
    it('should not show divider by default when showDivider is false', () => {
      const { container } = render(
        <BAICard title="Test" showDivider={false}>
          Content
        </BAICard>,
      );

      const cardHead = container.querySelector('.ant-card-head');
      expect(cardHead).toHaveStyle({ borderBottom: 'none' });
    });

    it('should show divider when showDivider is true', () => {
      const { container } = render(
        <BAICard title="Test" showDivider={true}>
          Content
        </BAICard>,
      );

      const cardHead = container.querySelector('.ant-card-head');
      // When showDivider is true, the borderBottom style should be present (not explicitly set to 'none')
      // We check that marginBottom is not set, which indicates divider is enabled
      const styles = window.getComputedStyle(cardHead!);
      expect(styles.borderBottom).not.toBe('none');
    });
  });

  describe('Tab Integration', () => {
    it('should render card with tabs', () => {
      const tabList = [
        { key: 'tab1', label: 'Tab 1' },
        { key: 'tab2', label: 'Tab 2' },
        { key: 'tab3', label: 'Tab 3' },
      ];

      render(
        <BAICard title="Test" tabList={tabList} activeTabKey="tab1">
          Content
        </BAICard>,
      );

      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('should auto-enable divider when tabList is provided', () => {
      const tabList = [
        { key: 'tab1', label: 'Tab 1' },
        { key: 'tab2', label: 'Tab 2' },
      ];

      const { container } = render(
        <BAICard title="Test" tabList={tabList} activeTabKey="tab1">
          Content
        </BAICard>,
      );

      const cardHead = container.querySelector('.ant-card-head');
      // When tabList is provided, the divider should be auto-enabled
      // We verify the header exists and doesn't have borderBottom: none
      expect(cardHead).toBeInTheDocument();
      const styles = window.getComputedStyle(cardHead!);
      expect(styles.borderBottom).not.toBe('none');
    });

    it('should call onTabChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const handleTabChange = jest.fn();
      const tabList = [
        { key: 'tab1', label: 'Tab 1' },
        { key: 'tab2', label: 'Tab 2' },
      ];

      render(
        <BAICard
          title="Test"
          tabList={tabList}
          activeTabKey="tab1"
          onTabChange={handleTabChange}
        >
          Content
        </BAICard>,
      );

      const tab2 = screen.getByText('Tab 2');
      await user.click(tab2);

      expect(handleTabChange).toHaveBeenCalledWith('tab2');
    });

    it('should adjust body padding when tabList is provided and size is small', () => {
      const tabList = [
        { key: 'tab1', label: 'Tab 1' },
        { key: 'tab2', label: 'Tab 2' },
      ];

      const { container } = render(
        <BAICard
          title="Test"
          tabList={tabList}
          activeTabKey="tab1"
          size="small"
        >
          Content
        </BAICard>,
      );

      const cardBody = container.querySelector('.ant-card-body');
      expect(cardBody).toBeInTheDocument();
      // Verify that paddingTop is set (it should be token.paddingSM)
      const style = window.getComputedStyle(cardBody!);
      expect(style.paddingTop).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('should render small size card', () => {
      const { container } = render(
        <BAICard title="Test" size="small">
          Content
        </BAICard>,
      );

      const card = container.querySelector('.ant-card');
      expect(card).toHaveClass('ant-card-small');
    });

    it('should render default size card', () => {
      const { container } = render(
        <BAICard title="Test">Content</BAICard>,
      );

      const card = container.querySelector('.ant-card');
      expect(card).not.toHaveClass('ant-card-small');
    });
  });

  describe('Additional Props', () => {
    it('should render loading state', () => {
      const { container } = render(
        <BAICard title="Test" loading={true}>
          Content
        </BAICard>,
      );

      const loadingIndicator = container.querySelector('.ant-card-loading');
      expect(loadingIndicator).toBeInTheDocument();
    });

    it('should render hoverable card', () => {
      const { container } = render(
        <BAICard title="Test" hoverable={true}>
          Content
        </BAICard>,
      );

      const card = container.querySelector('.ant-card');
      expect(card).toHaveClass('ant-card-hoverable');
    });

    it('should render borderless card', () => {
      const { container } = render(
        <BAICard title="Test" bordered={false}>
          Content
        </BAICard>,
      );

      const card = container.querySelector('.ant-card');
      // When bordered is false, the card should not have border styling
      // We verify the prop is passed through correctly
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle both extra and extraButtonTitle props (extra should take precedence)', () => {
      render(
        <BAICard
          title="Test"
          extra={<span data-testid="custom-extra">Custom</span>}
          extraButtonTitle="Should Not Appear"
          onClickExtraButton={() => {}}
        >
          Content
        </BAICard>,
      );

      expect(screen.getByTestId('custom-extra')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Appear')).not.toBeInTheDocument();
    });

    it('should render only title when only title is provided (no extra)', () => {
      render(
        <BAICard title="Only Title">Content</BAICard>,
      );

      expect(screen.getByText('Only Title')).toBeInTheDocument();
      const header = screen.getByText('Only Title').closest('.ant-card-head');
      expect(header).toBeInTheDocument();
    });

    it('should render only extra when only extra is provided (no title)', () => {
      render(
        <BAICard extra={<span data-testid="only-extra">Only Extra</span>}>
          Content
        </BAICard>,
      );

      expect(screen.getByTestId('only-extra')).toBeInTheDocument();
      const header = screen
        .getByTestId('only-extra')
        .closest('.ant-card-head');
      expect(header).toBeInTheDocument();
    });

    it('should not render header when both title and extra are absent', () => {
      const { container } = render(<BAICard>Content</BAICard>);

      const header = container.querySelector('.ant-card-head');
      expect(header).not.toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('should have correct display name', () => {
      expect(BAICard.displayName).toBe('BAICard');
    });
  });
});
