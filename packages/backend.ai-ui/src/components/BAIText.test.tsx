import { i18n as buiI18n } from '../locale';
import BAIText from './BAIText';
import { act, fireEvent, render, screen } from '@testing-library/react';

// The copy label must come from the bundle. English alone cannot prove it
// (a hardcoded 'Copy' also passes); the Korean cases are the real guard.
describe('BAIText copyable', () => {
  const writeText = vi.fn();
  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(async () => {
    await act(async () => {
      await buiI18n.changeLanguage('en');
    });
  });

  it('names the copy control from the i18n bundle, not a raw key', () => {
    render(<BAIText copyable>abc</BAIText>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Copy');
  });

  it('follows BUI i18next into Korean', async () => {
    await act(async () => {
      await buiI18n.changeLanguage('ko');
    });
    render(<BAIText copyable>abc</BAIText>);
    // ko.json -> general.button.Copy = "복사"
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', '복사');
  });

  it('copies `copyable.text` over the visible children and locks out re-entry', () => {
    render(<BAIText copyable={{ text: 'full-value' }}>truncated…</BAIText>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(writeText).toHaveBeenCalledWith('full-value');
    // Astryx `IconButton isDisabled` announces the lock through `aria-disabled`
    // (an href-less/`tabindex=-1` control), not the `disabled` attribute.
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.querySelector('svg')?.getAttribute('class')).toContain(
      'check',
    );
  });

  it('renders a standalone copy control when given no children', () => {
    render(<BAIText copyable={{ text: 'bare' }} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(writeText).toHaveBeenCalledWith('bare');
  });
});

// FR-3692 — Astryx `Text` defaults to `primary` and paints it on its OWN
// element, so a `BAIText` nested in a coloured owner (a link) needs an opt-out.
describe('BAIText inheritColor', () => {
  const colorOf = (node: HTMLElement) =>
    node.closest('.astryx-text')?.getAttribute('data-color');

  it('defaults to Astryx primary', () => {
    render(<BAIText>plain</BAIText>);
    expect(colorOf(screen.getByText('plain'))).toBe('primary');
  });

  it('inherits the surrounding colour when asked', () => {
    render(<BAIText inheritColor>linked</BAIText>);
    expect(colorOf(screen.getByText('linked'))).toBe('inherit');
  });

  it('does not override an explicit type', () => {
    render(
      <BAIText inheritColor type="danger">
        danger
      </BAIText>,
    );
    expect(colorOf(screen.getByText('danger'))).toBe('danger');
  });

  it('does not leak onto the DOM element as an attribute', () => {
    render(<BAIText inheritColor>attr</BAIText>);
    expect(
      screen.getByText('attr').closest('.astryx-text'),
    ).not.toHaveAttribute('inheritcolor');
  });
});
