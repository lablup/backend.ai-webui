/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { mountableVFolderFilter } from '../../hooks/useMountableVFolders';
import MockVFolderFileProviders from '../../tests/MockVFolderFileProviders';
import {
  MOCK_MOUNTABLE_HOSTS,
  MOCK_MOUNT_SCOPE,
  mockMountFolders,
} from '../../tests/mockVFolderFileTree';
import BAIScopedVFolderSelect, {
  type ScopedVFolderResolution,
} from './BAIScopedVFolderSelect';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// `.config` is reachable but kept out of the options by `optionFilter`, so its
// label has to come from the lookup; `cold-archive` sits on an unmountable host.
const configFolder = mockMountFolders[2];
const coldArchive = mockMountFolders[3];

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });

const renderSelect = async (
  value: Array<string>,
  onResolve: (resolution: ScopedVFolderResolution) => void,
  fallbackLabels?: Record<string, string>,
) => {
  await act(async () => {
    render(
      <MockVFolderFileProviders
        folders={mockMountFolders}
        suspenseFallback="Loading..."
      >
        <BAIScopedVFolderSelect
          multiple
          label="Folders"
          scope={MOCK_MOUNT_SCOPE}
          filter={mountableVFolderFilter(MOCK_MOUNTABLE_HOSTS)}
          optionFilter={{ name: { notStartsWith: '.' } }}
          value={value}
          fallbackLabels={fallbackLabels}
          onResolve={onResolve}
        />
      </MockVFolderFileProviders>,
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  await flush();
};

describe('BAIScopedVFolderSelect value lookup', () => {
  it('labels a selection the options leave out, by its id', async () => {
    const onResolve = vi.fn();

    await renderSelect([configFolder.id], onResolve);

    expect(screen.getByText(configFolder.name)).toBeInTheDocument();
    expect(onResolve).toHaveBeenLastCalledWith({
      resolved: [expect.objectContaining({ entityId: configFolder.id })],
      unresolved: [],
    });
  });

  it('reports a selection outside `filter` as unresolved', async () => {
    const onResolve = vi.fn();

    await renderSelect([coldArchive.id], onResolve, {
      [coldArchive.id]: 'stored-name',
    });

    expect(screen.getByText('stored-name')).toBeInTheDocument();
    expect(onResolve).toHaveBeenLastCalledWith({
      resolved: [],
      unresolved: [coldArchive.id],
    });
  });
});
