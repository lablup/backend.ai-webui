/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIAppProvider, message } from '../../app-shim';
import { convertToUUID } from '../../helper';
import MockVFolderFileProviders from '../../tests/MockVFolderFileProviders';
import {
  MOCK_LEGACY_PROJECT_ID,
  MOCK_MOUNTABLE_HOSTS,
  mockLegacyVFolders,
} from '../../tests/mockVFolderFileTree';
import BAIVFolderMountConfigInput, {
  type VFolderMountConfigValue,
} from './BAIVFolderMountConfigInput';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// `my-project-data` sits on a host granting mount-in-session; `cold-archive`
// is on `archive:cold`, which is not in MOCK_MOUNTABLE_HOSTS.
const mountableId = convertToUUID(mockLegacyVFolders[0].id);
const unmountableId = convertToUUID(mockLegacyVFolders[3].id);

const mountableEntry: VFolderMountConfigValue = {
  vfolderId: mountableId,
  name: 'my-project-data',
  mountDestination: '',
};
const unmountableEntry: VFolderMountConfigValue = {
  vfolderId: unmountableId,
  name: 'cold-archive',
  mountDestination: '',
};

// Each suspension only retries once the act scope it started in is awaited,
// so the render goes inside one scope and the mock client's 250ms
// `GET /folders` is settled by a second.
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });

const renderWithFolders = async (
  value: Array<VFolderMountConfigValue>,
  onChange: (next: Array<VFolderMountConfigValue>) => void,
) => {
  await act(async () => {
    render(
      <BAIAppProvider>
        <MockVFolderFileProviders
          folders={mockLegacyVFolders}
          suspenseFallback="Loading..."
        >
          <BAIVFolderMountConfigInput
            currentProjectId={MOCK_LEGACY_PROJECT_ID}
            mountableHosts={MOCK_MOUNTABLE_HOSTS}
            value={value}
            onChange={onChange}
          />
        </MockVFolderFileProviders>
      </BAIAppProvider>,
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  await flush();
};

describe('BAIVFolderMountConfigInput prune', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('drops an entry no mountable host can serve and warns once', async () => {
    const warning = vi.spyOn(message, 'warning').mockImplementation(vi.fn());
    const onChange = vi.fn();

    await renderWithFolders([mountableEntry, unmountableEntry], onChange);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([mountableEntry]);
    expect(warning).toHaveBeenCalledTimes(1);
  });

  it('keeps a fully mountable selection and stays silent', async () => {
    const warning = vi.spyOn(message, 'warning').mockImplementation(vi.fn());
    const onChange = vi.fn();

    await renderWithFolders([mountableEntry], onChange);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });
});
