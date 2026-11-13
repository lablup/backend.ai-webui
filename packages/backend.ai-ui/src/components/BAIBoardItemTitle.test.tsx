import BAIBoardItemTitle from './BAIBoardItemTitle';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BAIBoardItemTitle', () => {
  it('puts a node title in a block that can shrink, so a row inside wraps in a narrow item', () => {
    render(
      <BAIBoardItemTitle
        title={<span data-testid="node-title">Failures by Entity Type</span>}
      />,
    );
    const block = screen.getByTestId('node-title').parentElement!;
    expect(block.style.minWidth).toBe('0px');
    expect(block.style.flex).toBe('0 1 auto');
  });

  it('renders a string title as it is', () => {
    render(<BAIBoardItemTitle title="Agents" />);
    expect(screen.getByRole('heading', { name: 'Agents' })).toBeTruthy();
  });
});
