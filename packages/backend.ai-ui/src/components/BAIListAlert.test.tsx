import BAIListAlert from './BAIListAlert';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('BAIListAlert', () => {
  it('should render title and list items', () => {
    render(
      <BAIListAlert
        type="warning"
        title="Following users will be updated"
        items={[
          { key: '1', content: 'a@example.com' },
          { key: '2', content: 'b@example.com' },
        ]}
      />,
    );
    expect(
      screen.getByText('Following users will be updated'),
    ).toBeInTheDocument();
    expect(screen.getByText('a@example.com')).toBeInTheDocument();
    expect(screen.getByText('b@example.com')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('should apply the default maxHeight with vertical scroll', () => {
    render(<BAIListAlert items={[{ content: 'item' }]} />);
    const list = screen.getByRole('list');
    expect(list).toHaveStyle({ maxHeight: '165px', overflowY: 'auto' });
  });

  it('should apply a custom maxHeight', () => {
    render(<BAIListAlert maxHeight={80} items={[{ content: 'item' }]} />);
    expect(screen.getByRole('list')).toHaveStyle({ maxHeight: '80px' });
  });

  it('should render items without explicit keys (index fallback)', () => {
    render(
      <BAIListAlert items={[{ content: 'first' }, { content: 'second' }]} />,
    );
    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });
});
