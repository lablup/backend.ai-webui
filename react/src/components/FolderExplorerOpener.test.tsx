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
import { fireEvent, render, screen } from '@testing-library/react';
import { BAIModal } from 'backend.ai-ui';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { Suspense, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';

// Stands in for the explorer: local state that must not survive a close, and a
// real `BAIModal` so the close lifecycle reaches `BAIUnmountAfterClose`.
vi.mock('./FolderExplorerModalV2', () => {
  const FakeExplorer = ({
    vfolderID,
    onRequestClose,
    ...modalProps
  }: {
    vfolderID: string;
    onRequestClose: () => void;
    open?: boolean;
  }) => {
    const [tab, setTab] = useState<'metadata' | 'auditLog'>('metadata');
    return (
      <BAIModal {...modalProps} title={vfolderID} onCancel={onRequestClose}>
        <span data-testid="active-tab">{tab}</span>
        <button onClick={() => setTab('auditLog')}>select-audit-log</button>
        <button onClick={onRequestClose}>close-explorer</button>
      </BAIModal>
    );
  };
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
      <NuqsTestingAdapter searchParams="" hasMemory>
        <OpenButtons />
        <Suspense fallback={null}>
          <FolderExplorerOpener />
        </Suspense>
      </NuqsTestingAdapter>
    </MemoryRouter>,
  );

describe('FolderExplorerOpener (FR-4005)', () => {
  it('starts every explorer session with fresh state', async () => {
    renderOpener();

    fireEvent.click(screen.getByText('open-a'));
    expect(await screen.findByTestId('active-tab')).toHaveTextContent(
      'metadata',
    );
    fireEvent.click(screen.getByText('select-audit-log'));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('auditLog');

    fireEvent.click(screen.getByText('close-explorer'));
    fireEvent.click(screen.getByText('open-b'));

    expect(await screen.findByTestId('active-tab')).toHaveTextContent(
      'metadata',
    );
  });
});
