import type { VFolderFile } from '../../provider/BAIClientProvider/types';
import type { RcFile } from './hooks';
import { useUploadVFolderFiles } from './hooks';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const listFiles = vi.fn();

vi.mock('../../provider/BAIClientProvider/hooks/useConnectedBAIClient', () => ({
  default: () => ({ vfolder: { list_files: listFiles } }),
}));

const makeFile = (name: string, relativePath = ''): RcFile => {
  const file = new File(['content'], name) as RcFile;
  Object.defineProperty(file, 'webkitRelativePath', { value: relativePath });
  return file;
};

const existing = (name: string, type: VFolderFile['type'] = 'FILE') =>
  ({
    name,
    type,
    size: 10,
    mode: 0,
    created: '2026-01-01T00:00:00Z',
    modified: '2026-01-01T00:00:00Z',
  }) as VFolderFile;

const renderUploadHook = (onUpload = vi.fn()) => {
  const { result } = renderHook(() =>
    useUploadVFolderFiles({
      targetVFolderId: 'vfolder-1',
      currentPath: 'data',
      onUpload,
    }),
  );
  const request = async (files: Array<RcFile>) => {
    await act(async () => {
      await result.current.requestUpload(files);
    });
  };
  return { result, onUpload, request };
};

const uploadedNames = (onUpload: ReturnType<typeof vi.fn>) =>
  onUpload.mock.calls[0][0].map((file: RcFile) => file.name);

describe('useUploadVFolderFiles', () => {
  beforeEach(() => {
    listFiles.mockReset();
  });

  it('uploads straight away when no name collides', async () => {
    listFiles.mockResolvedValue({ items: [existing('other.txt')] });
    const { result, onUpload, request } = renderUploadHook();

    await request([makeFile('a.txt'), makeFile('b.txt')]);

    expect(onUpload).toHaveBeenCalledWith(expect.any(Array), 'data');
    expect(uploadedNames(onUpload)).toEqual(['a.txt', 'b.txt']);
    expect(result.current.overwriteConfirmModalProps.open).toBe(false);
  });

  it('detects a collision on any file in the pick, not only the first', async () => {
    listFiles.mockResolvedValue({ items: [existing('c.txt')] });
    const { result, onUpload, request } = renderUploadHook();

    await request([makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')]);

    expect(onUpload).not.toHaveBeenCalled();
    const modalProps = result.current.overwriteConfirmModalProps;
    expect(modalProps.open).toBe(true);
    expect(modalProps.duplicatedEntries.map((entry) => entry.name)).toEqual([
      'c.txt',
    ]);
    expect(modalProps.newEntryCount).toBe(2);
  });

  it('drops the entries left unselected and keeps the rest', async () => {
    listFiles.mockResolvedValue({
      items: [existing('a.txt'), existing('c.txt')],
    });
    const { result, onUpload, request } = renderUploadHook();

    await request([makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')]);
    act(() => {
      result.current.overwriteConfirmModalProps.onRequestClose(true, ['c.txt']);
    });

    expect(uploadedNames(onUpload)).toEqual(['b.txt', 'c.txt']);
    expect(result.current.overwriteConfirmModalProps.open).toBe(false);
  });

  it('uploads nothing when every colliding entry is deselected and no entry is new', async () => {
    listFiles.mockResolvedValue({ items: [existing('a.txt')] });
    const { result, onUpload, request } = renderUploadHook();

    await request([makeFile('a.txt')]);
    act(() => {
      result.current.overwriteConfirmModalProps.onRequestClose(true, []);
    });

    expect(onUpload).not.toHaveBeenCalled();
  });

  it('uploads nothing when the decision is cancelled', async () => {
    listFiles.mockResolvedValue({ items: [existing('a.txt')] });
    const { result, onUpload, request } = renderUploadHook();

    await request([makeFile('a.txt'), makeFile('b.txt')]);
    act(() => {
      result.current.overwriteConfirmModalProps.onRequestClose(false);
    });

    expect(onUpload).not.toHaveBeenCalled();
    expect(result.current.overwriteConfirmModalProps.open).toBe(false);
  });

  it('treats a folder pick as one entry named after its root directory', async () => {
    listFiles.mockResolvedValue({ items: [existing('docs', 'DIRECTORY')] });
    const { result, onUpload, request } = renderUploadHook();

    await request([
      makeFile('a.txt', 'docs/a.txt'),
      makeFile('b.txt', 'docs/nested/b.txt'),
      makeFile('loose.txt'),
    ]);

    const modalProps = result.current.overwriteConfirmModalProps;
    expect(modalProps.duplicatedEntries).toHaveLength(1);
    expect(modalProps.duplicatedEntries[0]).toMatchObject({
      name: 'docs',
      isDirectory: true,
    });
    expect(modalProps.duplicatedEntries[0].files).toHaveLength(2);

    act(() => {
      modalProps.onRequestClose(true, []);
    });
    expect(uploadedNames(onUpload)).toEqual(['loose.txt']);
  });

  it('uploads as-is when the target directory cannot be listed', async () => {
    listFiles.mockRejectedValue(new Error('not found'));
    const { result, onUpload, request } = renderUploadHook();

    await request([makeFile('a.txt')]);

    expect(uploadedNames(onUpload)).toEqual(['a.txt']);
    expect(result.current.overwriteConfirmModalProps.open).toBe(false);
  });
});
