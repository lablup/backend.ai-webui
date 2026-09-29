import BAITokenRow from './BAITokenRow';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

const itemsOf = (...labels: Array<string>) =>
  labels.map((label) => ({ key: label, label }));

describe('BAITokenRow', () => {
  it('renders every item and no indicator while the list fits', () => {
    render(<BAITokenRow items={itemsOf('alpha', 'beta', 'gamma')} />);

    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('gamma')).toBeInTheDocument();
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it('stops at maxCount and counts the rest', () => {
    render(
      <BAITokenRow items={itemsOf('alpha', 'beta', 'gamma', 'delta', 'eps')} />,
    );

    expect(screen.getByText('gamma')).toBeInTheDocument();
    expect(screen.queryByText('delta')).not.toBeInTheDocument();
    expect(screen.getByText('and 2 more')).toBeInTheDocument();
  });

  it('counts against totalCount when items are only a fetched page', () => {
    // The container-registry case: the connection is capped by `first: 3`, so
    // the row must report what exists, not what arrived.
    render(
      <BAITokenRow items={itemsOf('alpha', 'beta', 'gamma')} totalCount={12} />,
    );

    expect(screen.getByText('and 9 more')).toBeInTheDocument();
  });

  it('never reports a negative remainder when totalCount lags the page', () => {
    render(
      <BAITokenRow items={itemsOf('alpha', 'beta', 'gamma')} totalCount={1} />,
    );

    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it('renders each item as a Token in the given colour', () => {
    const { container } = render(
      <BAITokenRow items={itemsOf('alpha', 'beta')} color="blue" />,
    );
    const tokens = container.querySelectorAll('.astryx-token');
    expect(tokens).toHaveLength(2);
    tokens.forEach((el) => expect(el).toHaveAttribute('data-color', 'blue'));
  });

  it('falls back to emptyText with nothing to show', () => {
    const { container } = render(<BAITokenRow items={[]} emptyText="none" />);

    expect(container).toHaveTextContent('none');
  });
});
