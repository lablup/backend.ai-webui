import {
  createMockVFolderFileClient,
  mockVFolderFile as entry,
  type MockVFolderFileTrees,
} from '../../../tests/mockVFolderFileTree';
import BAIFileExplorer from './BAIFileExplorer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const VFOLDER_ID = '11111111-1111-1111-1111-111111111111';

const trees: MockVFolderFileTrees = {
  [VFOLDER_ID]: {
    '.': [entry('models', 'DIRECTORY', '2026-07-21T14:02:00')],
    models: [],
  },
};
const mockClient = createMockVFolderFileClient(trees);

vi.mock('../../provider/BAIClientProvider/hooks/useConnectedBAIClient', () => ({
  default: () => mockClient,
}));

const renderDirectoryPicker = () => {
  const onChangeCurrentPath = vi.fn();
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
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

    await screen.findByText('models', undefined, { timeout: 5000 });

    await user.click(screen.getByRole('button', { name: 'Create Folder' }));
    await user.type(
      await screen.findByLabelText('Folder Name'),
      'fresh-folder',
    );
    await user.click(screen.getByRole('button', { name: 'Create' }));

    // The listing refreshes in place: the new folder shows up next to the
    // existing one, and the explorer never navigates into it.
    await screen.findByText('fresh-folder', undefined, { timeout: 5000 });
    expect(screen.getByText('models')).toBeInTheDocument();
    expect(onChangeCurrentPath).toHaveBeenCalledTimes(1);
    expect(onChangeCurrentPath).toHaveBeenCalledWith('.');
  }, 30000);
});
