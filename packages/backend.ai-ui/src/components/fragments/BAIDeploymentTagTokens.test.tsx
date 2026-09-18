import BAIDeploymentTagTokens from './BAIDeploymentTagTokens';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('react-relay', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-relay')>()),
  useFragment: (_fragment: unknown, ref: unknown) => ref,
}));

const metadata = (tags: Array<string>) => ({ tags }) as never;

describe('BAIDeploymentTagTokens', () => {
  it('splits comma-joined tags into one token each', () => {
    const { container } = render(
      <BAIDeploymentTagTokens metadataFrgmt={metadata(['a, b', 'c'])} />,
    );

    expect(container.querySelectorAll('.astryx-token')).toHaveLength(3);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the fallback when there is no tag', () => {
    render(
      <BAIDeploymentTagTokens metadataFrgmt={metadata([])} fallback="-" />,
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('fires onTagClick without reaching the row when stopRowClick is set', () => {
    const onTagClick = vi.fn();
    const onRowClick = vi.fn();
    render(
      <div onClick={onRowClick}>
        <BAIDeploymentTagTokens
          metadataFrgmt={metadata(['llm'])}
          onTagClick={onTagClick}
          stopRowClick
        />
      </div>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onTagClick).toHaveBeenCalledWith('llm');
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
