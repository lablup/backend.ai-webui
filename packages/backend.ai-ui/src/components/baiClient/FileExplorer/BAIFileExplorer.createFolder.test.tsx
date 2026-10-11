import {
  createMockVFolderFileClient,
  mockVFolderFile as entry,
  type MockVFolderFileTrees,
} from '../../../tests/mockVFolderFileTree';
import BAIFileExplorer from './BAIFileExplorer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const VFOLDER_ID = '11111111-1111-1111-1111-111111111111';

// `mkdir` mutates the tree in place, so each test gets a fresh one.
const createTrees = (): MockVFolderFileTrees => ({
  [VFOLDER_ID]: {
    '.': [entry('models', 'DIRECTORY', '2026-07-21T14:02:00')],
    models: [],
  },
});

let mockClient = createMockVFolderFileClient(createTrees());

vi.mock('../../provider/BAIClientProvider/hooks/useConnectedBAIClient', () => ({
  default: () => mockClient,
}));

const renderDirectoryPicker = () => {
  mockClient = createMockVFolderFileClient(createTrees());
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onChangeCurrentPath = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <BAIFileExplorer
        mode="directoryPicker"
        targetVFolderId={VFOLDER_ID}
        targetVFolderName="my-workspace"
        onChangeCurrentPath={onChangeCurrentPath}
        enableWrite
      />
    </QueryClientProvider>,
  );
  return { onChangeCurrentPath };
};

describe('BAIFileExplorer directoryPicker: creating a folder', () => {
  it('stays in the current folder and lists the new folder (FR-4000)', async () => {
    const user = userEvent.setup();
    const { onChangeCurrentPath } = renderDirectoryPicker();

    const listing = within(await screen.findByRole('table'));
    await listing.findByText('models');

    await user.click(screen.getByRole('button', { name: 'Create Folder' }));
    await user.type(
      await screen.findByLabelText('Folder Name'),
      'fresh-folder',
    );
    await user.click(screen.getByRole('button', { name: 'Create' }));

    // The listing refreshes in place: the new folder shows up next to the
    // existing one, and the explorer never navigates into it.
    await listing.findByText('fresh-folder');
    expect(listing.getByText('models')).toBeInTheDocument();
    expect(onChangeCurrentPath).toHaveBeenCalledTimes(1);
    expect(onChangeCurrentPath).toHaveBeenCalledWith('.');
  }, 15000);
});
