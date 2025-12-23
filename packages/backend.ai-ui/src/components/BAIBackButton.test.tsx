import BAIBackButton from './BAIBackButton';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('BAIBackButton', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render button with back arrow icon', () => {
      render(
        <MemoryRouter>
          <BAIBackButton to="/previous" />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Button should have the left arrow icon (lucide-react ArrowLeft)
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render as text type button', () => {
      render(
        <MemoryRouter>
          <BAIBackButton to="/previous" />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('ant-btn-text');
    });
  });

  describe('Navigation', () => {
    it('should navigate to specified path when clicked', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BAIBackButton to="/dashboard" />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', undefined);
    });

    it('should navigate with options when provided', async () => {
      const user = userEvent.setup();
      const options = { replace: true, state: { from: 'test' } };

      render(
        <MemoryRouter>
          <BAIBackButton to="/home" options={options} />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/home', options);
    });

    it('should accept relative paths', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BAIBackButton to=".." />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('..', undefined);
    });

    it('should accept object path format', async () => {
      const user = userEvent.setup();
      const toObject = {
        pathname: '/details',
        search: '?id=123',
        hash: '#section',
      };

      render(
        <MemoryRouter>
          <BAIBackButton to={toObject} />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(toObject, undefined);
    });
  });

  describe('Navigation Options', () => {
    it('should navigate with replace option', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BAIBackButton to="/back" options={{ replace: true }} />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/back', { replace: true });
    });

    it('should navigate with state option', async () => {
      const user = userEvent.setup();
      const state = { fromPage: 'settings', timestamp: Date.now() };

      render(
        <MemoryRouter>
          <BAIBackButton to="/previous" options={{ state }} />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/previous', { state });
    });

    it('should navigate with preventScrollReset option', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BAIBackButton to="/list" options={{ preventScrollReset: true }} />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/list', {
        preventScrollReset: true,
      });
    });

    it('should navigate with multiple options combined', async () => {
      const user = userEvent.setup();
      const options = {
        replace: true,
        state: { test: 'data' },
        preventScrollReset: true,
      };

      render(
        <MemoryRouter>
          <BAIBackButton to="/combined" options={options} />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/combined', options);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BAIBackButton to="/back" />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should be accessible with Space key', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BAIBackButton to="/back" />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard(' ');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid clicks', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BAIBackButton to="/rapid" />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should call navigate 3 times (not prevented)
      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });

    it('should handle empty string path', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BAIBackButton to="" />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('', undefined);
    });

    it('should handle root path', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BAIBackButton to="/" />
        </MemoryRouter>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/', undefined);
    });
  });
});
