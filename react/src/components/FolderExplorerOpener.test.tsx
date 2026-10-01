/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import '../../__test__/resizeObserver.mock.js';
import FolderExplorerOpener, {
  useFolderExplorerOpener,
} from './FolderExplorerOpener';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';

// Stands in for the explorer: reports the props the opener hands it.
vi.mock('./FolderExplorerModalV2', () => {
  const FakeExplorer = ({
    vfolderID,
    onRequestClose,
    open,
  }: {
    vfolderID: string;
    onRequestClose: () => void;
    open?: boolean;
  }) => (
    <div data-testid="explorer" data-open={String(!!open)}>
      <span data-testid="explorer-folder">{vfolderID}</span>
      <button onClick={onRequestClose}>close-explorer</button>
    </div>
  );
  return { default: FakeExplorer };
});

const OpenButtons = () => {
  const { open } = useFolderExplorerOpener();
  return (
    <>
      <button onClick={() => open('folder-a')}>open-a</button>
      <button onClick={() => open('folder-b')}>open-b</button>
    </>
  );
};

const renderOpener = () =>
  render(
    <MemoryRouter>
      <NuqsTestingAdapter
        searchParams=""
        hasMemory
        resetUrlUpdateQueueOnMount={false}
      >
        <OpenButtons />
        <Suspense fallback={null}>
          <FolderExplorerOpener />
        </Suspense>
      </NuqsTestingAdapter>
    </MemoryRouter>,
  );

describe('FolderExplorerOpener', () => {
  it('keeps the explorer mounted while closed, so its lazy chunk is resolved before the first open', async () => {
    renderOpener();

    expect(await screen.findByTestId('explorer')).toHaveAttribute(
      'data-open',
      'false',
    );
  });

  it('opens the explorer on the requested folder and closes it on request', async () => {
    renderOpener();
    await screen.findByTestId('explorer');

    fireEvent.click(screen.getByText('open-a'));
    await waitFor(() =>
      expect(screen.getByTestId('explorer')).toHaveAttribute(
        'data-open',
        'true',
      ),
    );
    // Dashes are stripped for the explorer's id form.
    expect(screen.getByTestId('explorer-folder')).toHaveTextContent('foldera');

    fireEvent.click(screen.getByText('close-explorer'));
    await waitFor(() =>
      expect(screen.getByTestId('explorer')).toHaveAttribute(
        'data-open',
        'false',
      ),
    );

    fireEvent.click(screen.getByText('open-b'));
    await waitFor(() =>
      expect(screen.getByTestId('explorer-folder')).toHaveTextContent(
        'folderb',
      ),
    );
  });
});
