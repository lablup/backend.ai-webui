import { i18n as buiI18n } from '../locale';
import BAIText from './BAIText';
import { act, fireEvent, render, screen } from '@testing-library/react';

/**
 * jsdom does not lay out, so overflow is faked by pinning the metrics the
 * clamp box reads. Restored after each test.
 */
const setOverflow = (overflowing: boolean) => {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: () => (overflowing ? 200 : 100),
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 100,
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => (overflowing ? 60 : 20),
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 20,
  });
};

afterEach(() => {
  for (const key of [
    'scrollWidth',
    'clientWidth',
    'scrollHeight',
    'clientHeight',
  ]) {
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)[key];
  }
});

// The antd-era DOM contract (FR-3726): a plain BAIText is ONE span; only
// `ellipsis` / `copyable` open the row with the clamp box inside it.
describe('BAIText structure', () => {
  it('renders plain text as a single span', () => {
    render(<BAIText data-testid="t">plain</BAIText>);
    const root = screen.getByTestId('t');
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveClass('bai-text');
    expect(root).not.toHaveClass('bai-text-row');
    expect(root.querySelector('.bai-text-content')).toBeNull();
    expect(root.textContent).toBe('plain');
  });

  it('forwards HTML attributes to the root element', () => {
    render(
      <BAIText data-testid="t" title="native" tabIndex={0}>
        attrs
      </BAIText>,
    );
    const root = screen.getByTestId('t');
    expect(root).toHaveAttribute('title', 'native');
    expect(root).toHaveAttribute('tabindex', '0');
  });

  it.each([
    ['secondary', 'bai-text-secondary'],
    ['success', 'bai-text-success'],
    ['warning', 'bai-text-warning'],
    ['danger', 'bai-text-danger'],
  ] as const)('maps type=%s onto its colour class', (type, className) => {
    render(
      <BAIText data-testid="t" type={type}>
        x
      </BAIText>,
    );
    expect(screen.getByTestId('t')).toHaveClass(className);
  });

  it('lets disabled win over type', () => {
    render(
      <BAIText data-testid="t" type="danger" disabled>
        x
      </BAIText>,
    );
    const root = screen.getByTestId('t');
    expect(root).toHaveClass('bai-text-disabled');
    expect(root).not.toHaveClass('bai-text-danger');
  });

  it('puts the decorations on the root', () => {
    render(
      <BAIText
        data-testid="t"
        strong
        italic
        underline
        delete
        monospace
        size="sm"
      >
        x
      </BAIText>,
    );
    const root = screen.getByTestId('t');
    for (const className of [
      'bai-text-strong',
      'bai-text-italic',
      'bai-text-underline',
      'bai-text-delete',
      'bai-text-monospace',
      'bai-text-size-sm',
    ]) {
      expect(root).toHaveClass(className);
    }
  });

  it('renders keyboard children as an Astryx Kbd shortcut', () => {
    render(
      <BAIText data-testid="t" keyboard>
        shift+F5
      </BAIText>,
    );
    const kbd = screen.getByTestId('t').querySelector('.astryx-kbd');
    expect(kbd).not.toBeNull();
    // Known keys become glyphs (shift -> ⇧); unknown ones render verbatim.
    expect(kbd?.textContent).toMatch(/F5/);
    expect(kbd?.textContent).not.toMatch(/shift/i);
  });

  it.each([
    ['code', 'CODE', 'bai-text-code'],
    ['mark', 'MARK', 'bai-text-mark'],
  ] as const)('wraps the children in a <%s> box', (prop, tag, className) => {
    render(
      <BAIText data-testid="t" {...{ [prop]: true }}>
        boxed
      </BAIText>,
    );
    const box = screen.getByText('boxed');
    expect(box.tagName).toBe(tag);
    expect(box).toHaveClass(className);
    expect(box.parentElement).toBe(screen.getByTestId('t'));
  });

  it('keeps the caller className alongside its own', () => {
    render(
      <BAIText data-testid="t" className="caller">
        x
      </BAIText>,
    );
    expect(screen.getByTestId('t')).toHaveClass('caller', 'bai-text');
  });
});

// FR-3692 — the text colour is painted on the root, so a BAIText nested in a
// coloured owner (a link) needs an opt-out.
describe('BAIText inheritColor', () => {
  it('inherits the surrounding colour when asked', () => {
    render(
      <BAIText data-testid="t" inheritColor>
        linked
      </BAIText>,
    );
    expect(screen.getByTestId('t')).toHaveClass('bai-text-inherit');
  });

  it('does not override an explicit type', () => {
    render(
      <BAIText data-testid="t" inheritColor type="danger">
        danger
      </BAIText>,
    );
    const root = screen.getByTestId('t');
    expect(root).toHaveClass('bai-text-danger');
    expect(root).not.toHaveClass('bai-text-inherit');
  });

  it('does not leak onto the DOM element as an attribute', () => {
    render(
      <BAIText data-testid="t" inheritColor>
        attr
      </BAIText>,
    );
    expect(screen.getByTestId('t')).not.toHaveAttribute('inheritcolor');
  });
});

describe('BAIText ellipsis', () => {
  it('opens the row with a single-line clamp box', () => {
    render(
      <BAIText data-testid="t" ellipsis>
        long
      </BAIText>,
    );
    const root = screen.getByTestId('t');
    expect(root).toHaveClass('bai-text-row');
    const box = screen.getByText('long');
    expect(box).toHaveClass('bai-text-content', 'bai-text-content-clip');
    expect(box.parentElement).toBe(root);
  });

  it('clamps to `rows` lines with -webkit-line-clamp', () => {
    render(<BAIText ellipsis={{ rows: 3 }}>long</BAIText>);
    const box = screen.getByText('long');
    expect(box).toHaveClass('bai-text-content-clamp');
    expect(box).not.toHaveClass('bai-text-content-clip');
    expect(box.style.webkitLineClamp).toBe('3');
  });

  it('makes the code box the clamp box', () => {
    render(
      <BAIText data-testid="t" code ellipsis>
        token
      </BAIText>,
    );
    const box = screen.getByText('token');
    expect(box.tagName).toBe('CODE');
    expect(box).toHaveClass('bai-text-code', 'bai-text-content-clip');
    expect(box.parentElement).toBe(screen.getByTestId('t'));
  });

  it('shows the Expand link only when the text overflows', () => {
    setOverflow(false);
    const { unmount } = render(
      <BAIText ellipsis={{ expandable: true }}>long</BAIText>,
    );
    expect(screen.queryByText('Expand')).toBeNull();
    unmount();

    setOverflow(true);
    render(<BAIText ellipsis={{ expandable: true }}>long</BAIText>);
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });

  it('toggles between Expand and Collapse and reports it', () => {
    setOverflow(true);
    const onExpand = vi.fn();
    render(
      <BAIText ellipsis={{ rows: 2, expandable: true, onExpand }}>
        long
      </BAIText>,
    );
    fireEvent.click(screen.getByText('Expand'));
    expect(onExpand).toHaveBeenLastCalledWith(expect.anything(), {
      expanded: true,
    });
    const box = screen.getByText('long');
    expect(box).toHaveClass('bai-text-content-expanded');
    expect(box).not.toHaveClass('bai-text-content-clamp');
    expect(box.style.webkitLineClamp).toBe('');

    fireEvent.click(screen.getByText('Collapse'));
    expect(onExpand).toHaveBeenLastCalledWith(expect.anything(), {
      expanded: false,
    });
    expect(screen.getByText('long')).toHaveClass('bai-text-content-clamp');
  });

  it('follows BUI i18next for the expand link', async () => {
    setOverflow(true);
    await act(async () => {
      await buiI18n.changeLanguage('ko');
    });
    render(<BAIText ellipsis={{ expandable: true }}>long</BAIText>);
    // ko.json -> general.button.Expand = "펼치기"
    expect(screen.getByText('펼치기')).toBeInTheDocument();
    await act(async () => {
      await buiI18n.changeLanguage('en');
    });
  });

  describe('tooltip', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    // The tooltip repeats the text, so the clamp box is addressed by class.
    const box = (text: string) =>
      screen.getByText(text, { selector: '.bai-text-content' });
    const hover = (node: HTMLElement) => {
      fireEvent.mouseEnter(node);
      act(() => {
        vi.runAllTimers();
      });
    };

    it('shows the full text on hover once it overflows', () => {
      setOverflow(true);
      render(<BAIText ellipsis={{ tooltip: true }}>the full value</BAIText>);
      hover(box('the full value'));
      expect(screen.getByRole('tooltip')).toHaveTextContent('the full value');
    });

    it('shows a custom node, or a `{ title }`, instead of the children', () => {
      setOverflow(true);
      const { unmount } = render(
        <BAIText ellipsis={{ tooltip: 'custom' }}>shown</BAIText>,
      );
      hover(box('shown'));
      expect(screen.getByRole('tooltip')).toHaveTextContent('custom');
      unmount();

      render(
        <BAIText ellipsis={{ tooltip: { title: 'titled' } }}>shown</BAIText>,
      );
      hover(box('shown'));
      expect(screen.getByRole('tooltip')).toHaveTextContent('titled');
    });

    it('stays silent when the text fits, or when tooltip is off', () => {
      setOverflow(false);
      const { unmount } = render(
        <BAIText ellipsis={{ tooltip: true }}>fits</BAIText>,
      );
      hover(box('fits'));
      expect(screen.queryByRole('tooltip')).toBeNull();
      unmount();

      setOverflow(true);
      render(<BAIText ellipsis={{ tooltip: false }}>clipped</BAIText>);
      hover(box('clipped'));
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });
});

// The copy label must come from the bundle. English alone cannot prove it
// (a hardcoded 'Copy' also passes); the Korean cases are the real guard.
describe('BAIText copyable', () => {
  const writeText = vi.fn(() => Promise.resolve());
  beforeEach(() => {
    writeText.mockClear();
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

  const click = async (button: HTMLElement) => {
    await act(async () => {
      fireEvent.click(button);
    });
  };

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

  it('keeps the copy control a sibling of the text box', () => {
    render(
      <BAIText data-testid="t" copyable>
        abc
      </BAIText>,
    );
    const root = screen.getByTestId('t');
    expect(root).toHaveClass('bai-text-row');
    expect(screen.getByText('abc')).toHaveClass('bai-text-content');
    expect(screen.getByRole('button').parentElement).toBe(root);
  });

  it('copies the rendered children by default, through nested elements', async () => {
    render(
      <BAIText copyable>
        <b>full</b>-value
      </BAIText>,
    );
    await click(screen.getByRole('button'));
    expect(writeText).toHaveBeenCalledWith('full-value');
  });

  it('copies `copyable.text` over the visible children and locks out re-entry', async () => {
    render(<BAIText copyable={{ text: 'full-value' }}>truncated…</BAIText>);
    const button = screen.getByRole('button');
    await click(button);
    expect(writeText).toHaveBeenCalledWith('full-value');
    // Astryx `IconButton isDisabled` announces the lock through `aria-disabled`
    // (an href-less/`tabindex=-1` control), not the `disabled` attribute.
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.querySelector('svg')?.getAttribute('class')).toContain(
      'check',
    );
  });

  it('accepts a `text` function', async () => {
    render(<BAIText copyable={{ text: () => 'computed' }}>shown</BAIText>);
    await click(screen.getByRole('button'));
    expect(writeText).toHaveBeenCalledWith('computed');
  });

  it('renders a standalone copy control when given no children', async () => {
    render(<BAIText copyable={{ text: 'bare' }} />);
    await click(screen.getByRole('button'));
    expect(writeText).toHaveBeenCalledWith('bare');
  });

  it('takes antd `[resting, copied]` tuples for icon and tooltips', async () => {
    const onCopy = vi.fn();
    render(
      <BAIText
        copyable={{
          icon: [
            <i key="a" data-testid="resting" />,
            <i key="b" data-testid="copied" />,
          ],
          tooltips: ['Grab it', 'Got it'],
          onCopy,
        }}
      >
        abc
      </BAIText>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Grab it');
    expect(screen.getByTestId('resting')).toBeInTheDocument();
    await click(button);
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-label', 'Got it');
    expect(screen.getByTestId('copied')).toBeInTheDocument();
  });

  it('renders no copy control for copyable={false}', () => {
    render(<BAIText copyable={false}>abc</BAIText>);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
