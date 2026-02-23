/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import { theme, Typography } from 'antd';
import { RcFile } from 'antd/es/upload';
import {
  BAIFlex,
  BAILink,
  toLocalId,
  useConnectedBAIClient,
} from 'backend.ai-ui';
import { atom, useAtom, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai-family';
import _ from 'lodash';
import PQueue from 'p-queue';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSuspendedBackendaiClient } from 'src/hooks';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';
import * as tus from 'tus-js-client';

type uploadStartFunction = (callbacks?: {
  onProgress?: (
    bytesUploaded: number,
    bytesTotal: number,
    fileName: string,
  ) => void;
}) => Promise<{ name: string; bytes: number }>;

type UploadRequest = {
  vFolderId: string;
  vFolderName: string;
  uploadFileInfo: Array<{ file: RcFile; startFunction: uploadStartFunction }>;
};

type UploadStatusInfo = {
  vFolderName: string;
  pendingFiles: Array<string>;
  completedFiles: Array<string>;
  failedFiles: Array<string>;
  completedBytes: number;
  totalExpectedSize: number;
};
type UploadStatusMap = {
  [vFolderId: string]: UploadStatusInfo;
};

const uploadRequestAtom = atom<Array<UploadRequest>>([]);
const uploadStatusAtom = atom<UploadStatusMap>({});
const uploadStatusAtomFamily = atomFamily((vFolderId: string) => {
  return atom(
    (get) => get(uploadStatusAtom)[vFolderId],
    (get, set, newStatus: UploadStatusInfo) => {
      const prev = get(uploadStatusAtom);
      set(uploadStatusAtom, {
        ...prev,
        [vFolderId]: newStatus,
      });
    },
  );
});

const useUploadStatusAtomStatus = (
  vFolderId: string,
): [UploadStatusInfo, (newStatus: UploadStatusInfo) => void] => {
  return useAtom(uploadStatusAtomFamily(vFolderId));
};

const FileUploadManager: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const { upsertNotification, closeNotification } = useSetBAINotification();
  const { generateFolderPath } = useFolderExplorerOpener();
  const [uploadRequests, setUploadRequests] = useAtom(uploadRequestAtom);
  const [uploadStatus, setUploadStatus] = useAtom(uploadStatusAtom);
  const [maxConcurrentUploads] = useBAISettingUserState(
    'max_concurrent_uploads',
  );
  const queue = new PQueue({ concurrency: maxConcurrentUploads || 2 });

  const pendingDeltaBytesRef = useRef<Record<string, number>>({});
  const throttledUploadRequests = _.throttle(
    (vFolderId: string, fileName: string) => {
      const accumulatedDelta = pendingDeltaBytesRef.current[vFolderId] || 0;
      pendingDeltaBytesRef.current[vFolderId] = 0;

      setUploadStatus((prev) => {
        const uploadedFilesCount = prev[vFolderId]?.completedFiles?.length || 0;
        const totalUploadedFilesCount =
          (prev[vFolderId]?.completedFiles?.length || 0) +
          (prev[vFolderId]?.failedFiles?.length || 0) +
          (prev[vFolderId]?.pendingFiles?.length || 0);

        const totalExpectedSize = prev[vFolderId]?.totalExpectedSize || 0;
        const currentCompletedBytes =
          (prev[vFolderId]?.completedBytes || 0) + accumulatedDelta;

        upsertNotification({
          key: 'upload:' + vFolderId,
          backgroundTask: {
            status: 'pending',
            percent:
              totalExpectedSize > 0
                ? (currentCompletedBytes / totalExpectedSize) * 100
                : 0,
            onChange: {
              pending: {
                description: (
                  <BAIFlex direction="column" align="start">
                    <Typography.Text>
                      {t('explorer.UploadingFiles')} ( {uploadedFilesCount} /{' '}
                      {totalUploadedFilesCount} )
                    </Typography.Text>
                    <Typography.Text
                      ellipsis
                      type="secondary"
                      style={{
                        fontSize: token.fontSizeSM,
                        maxWidth: '300px',
                      }}
                    >
                      {fileName}
                    </Typography.Text>
                  </BAIFlex>
                ),
              },
            },
          },
        });

        return {
          ...prev,
          [vFolderId]: {
            ...prev[vFolderId],
            completedBytes: currentCompletedBytes,
          },
        };
      });
    },
    200,
    { leading: true, trailing: true },
  );

  useEffect(() => {
    if (uploadRequests.length === 0 || !baiClient) return;

    uploadRequests.forEach((uploadRequest) => {
      const { vFolderId, vFolderName, uploadFileInfo } = uploadRequest;
      const currUploadTotalSize = _.sumBy(
        uploadFileInfo,
        (info) => info.file.size,
      );

      setUploadStatus((prev) => {
        const isFirstUpload = !prev[vFolderId];
        const newTotalExpectedSize =
          (prev[vFolderId]?.totalExpectedSize || 0) + currUploadTotalSize;
        const currPct = isFirstUpload
          ? 0
          : ((prev[vFolderId]?.completedBytes || 0) / newTotalExpectedSize) *
            100;

        upsertNotification({
          key: 'upload:' + vFolderId,
          open: true,
          message: (
            <span>
              {t('explorer.VFolder')}:&nbsp;
              <BAILink
                style={{
                  fontWeight: 'normal',
                }}
                to={generateFolderPath(vFolderId)}
                onClick={() => {
                  closeNotification('upload:' + vFolderId);
                }}
              >{`${vFolderName}`}</BAILink>
            </span>
          ),
          backgroundTask: {
            status: 'pending',
            percent: currPct,
            onChange: {
              pending: t('explorer.ProcessingUpload'),
            },
          },
          duration: 0,
        });

        return {
          ...prev,
          [vFolderId]: {
            vFolderName,
            pendingFiles: [
              ...(prev[vFolderId]?.pendingFiles || []),
              ...uploadFileInfo.map(
                (info) => info.file.webkitRelativePath || info.file.name,
              ),
            ],
            completedFiles: prev[vFolderId]?.completedFiles || [],
            failedFiles: prev[vFolderId]?.failedFiles || [],
            completedBytes: prev[vFolderId]?.completedBytes || 0,
            totalExpectedSize: newTotalExpectedSize,
          },
        };
      });

      uploadFileInfo.forEach(({ file, startFunction }) => {
        queue.add(async () => {
          // Capture fileName before any async operations
          const fileName = file.webkitRelativePath || file.name;
          let previousBytesUploaded = 0;

          try {
            await startFunction({
              onProgress: (bytesUploaded, _bytesTotal, fileName) => {
                // Since bytesUploaded is cumulative, calculate delta from previous value
                const deltaBytes = bytesUploaded - previousBytesUploaded;
                previousBytesUploaded = bytesUploaded;
                pendingDeltaBytesRef.current[vFolderId] =
                  (pendingDeltaBytesRef.current[vFolderId] || 0) + deltaBytes;

                throttledUploadRequests(vFolderId, fileName);
              },
            });

            // Success case
            throttledUploadRequests.flush();
            delete pendingDeltaBytesRef.current[vFolderId];

            setUploadStatus((prev) => ({
              ...prev,
              [vFolderId]: {
                ...prev[vFolderId],
                pendingFiles: prev[vFolderId].pendingFiles.filter(
                  (f: string) => f !== fileName,
                ),
                completedFiles: [
                  ...(prev[vFolderId]?.completedFiles || []),
                  fileName,
                ],
              },
            }));
          } catch {
            // Error case - use the captured fileName regardless of error structure
            throttledUploadRequests.flush();
            delete pendingDeltaBytesRef.current[vFolderId];

            setUploadStatus((prev) => ({
              ...prev,
              [vFolderId]: {
                ...prev[vFolderId],
                pendingFiles: prev[vFolderId].pendingFiles.filter(
                  (f: string) => f !== fileName,
                ),
                failedFiles: [
                  ...(prev[vFolderId]?.failedFiles || []),
                  fileName,
                ],
              },
            }));
          }
        });
      });
    });
    setUploadRequests([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadRequests]);

  useEffect(() => {
    Object.entries(uploadStatus).forEach(([vFolderId, status]) => {
      if (!_.isEmpty(status?.pendingFiles)) return;

      if (!_.isEmpty(status?.failedFiles)) {
        upsertNotification({
          key: 'upload:' + vFolderId,
          open: true,
          message: t('explorer.UploadFailed', {
            folderName: status?.vFolderName,
          }),
          backgroundTask: {
            status: 'rejected',
            percent: 0,
            onChange: {
              rejected: t('explorer.FileUploadFailed', {
                folderName: status?.vFolderName,
              }),
            },
          },
          extraDescription: _.join(status?.failedFiles, ', '),
        });
      } else if (!_.isEmpty(status?.completedFiles)) {
        upsertNotification({
          key: 'upload:' + vFolderId,
          open: true,
          message: (
            <span>
              {t('explorer.VFolder')}:&nbsp;
              <BAILink
                style={{
                  fontWeight: 'normal',
                }}
                to={generateFolderPath(vFolderId)}
                onClick={() => {
                  closeNotification('upload:' + vFolderId);
                }}
              >{`${status?.vFolderName}`}</BAILink>
            </span>
          ),
          backgroundTask: {
            status: 'resolved',
            percent: 100,
            onChange: {
              resolved: t('explorer.SuccessfullyUploadedToFolder'),
            },
          },
          duration: 3,
        });
        setUploadStatus((prev) => ({
          ...prev,
          [vFolderId]: {
            ...prev[vFolderId],
            completedFiles: [],
            completedBytes: 0,
            totalExpectedSize: 0,
          },
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadStatus]);

  return null;
};

export default FileUploadManager;

export const useFileUploadManager = (id?: string, folderName?: string) => {
  'use memo';

  const baiClient = useConnectedBAIClient();
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();

  const setUploadRequests = useSetAtom(uploadRequestAtom);

  const [uploadStatus, setUploadStatus] = useUploadStatusAtomStatus(
    id ? toLocalId(id).replace(/-/g, '') : '', // since jotai atom doesn't use '-' in key, we need to replace it
  );

  const validateUploadRequest = (
    requestedFiles: Array<RcFile>,
    vfolderId: string,
  ) => {
    const maxPossibleFileSize = baiClient._config.maxFileUploadSize;
    const maxRequestFileSize = _.map(
      requestedFiles,
      (file) => file.size,
    ).reduce((max, size) => Math.max(max, size), 0);

    if (maxPossibleFileSize > 0 && maxRequestFileSize > maxPossibleFileSize) {
      upsertNotification({
        open: true,
        key: 'upload:' + vfolderId,
        message: t('explorer.UploadFailed', {
          folderName: folderName ?? '',
        }),
        description: t('data.explorer.FileUploadSizeLimit'),
        duration: 3,
        toText: t('data.folders.OpenAFolder'),
        to: {
          search: new URLSearchParams({
            folder: vfolderId,
          }).toString(),
        },
      });
      return false;
    }
    return true;
  };

  const uploadFiles = async (
    files: RcFile[],
    vfolderId: string,
    currentPath: string,
  ) => {
    if (!validateUploadRequest(files, vfolderId)) return;

    const fileToUpload: Array<RcFile> = [];
    const startUploadFunctionMap = _.map(files, (file) => {
      fileToUpload.push(file);
      return async (callbacks?: {
        onProgress?: (
          bytesUploaded: number,
          bytesTotal: number,
          fileName: string,
        ) => void;
      }) => {
        const fileName = file.webkitRelativePath || file.name;

        try {
          const uploadPath = [currentPath, fileName].filter(Boolean).join('/');

          const uploadUrl: string =
            await baiClient.vfolder.create_upload_session(
              uploadPath,
              file,
              vfolderId,
            );

          return await new Promise<{ name: string; bytes: number }>(
            (resolve, reject) => {
              try {
                const upload = new tus.Upload(file, {
                  endpoint: uploadUrl,
                  uploadUrl: uploadUrl,
                  retryDelays: [0, 3000, 5000, 10000, 20000],
                  chunkSize: getOptimalChunkSize(file.size),
                  storeFingerprintForResuming: false, // Disable localStorage storage
                  metadata: {
                    filename: file.name,
                    filetype: file.type,
                  },
                  onProgress: (bytesUploaded, bytesTotal) => {
                    callbacks?.onProgress?.(
                      bytesUploaded,
                      bytesTotal,
                      fileName,
                    );
                  },
                  onSuccess: () => {
                    resolve({
                      name: fileName,
                      bytes: file.size,
                    });
                  },
                  onError: (_error) => {
                    // Always reject with consistent structure
                    reject(new Error(`Upload failed for ${fileName}`));
                  },
                });
                upload.start();
              } catch {
                // Handle synchronous errors from tus.Upload constructor or start()
                reject(
                  new Error(`Failed to initialize upload for ${fileName}`),
                );
              }
            },
          );
        } catch {
          // Handle API errors or any other errors
          // Always throw with a consistent error message
          throw new Error(`Failed to prepare upload for ${fileName}`);
        }
      };
    });

    const uploadRequestInfo: UploadRequest = {
      vFolderId: vfolderId,
      vFolderName: folderName ?? '',
      uploadFileInfo: _.zipWith(
        fileToUpload,
        startUploadFunctionMap,
        (file, startFunction) => ({
          file,
          startFunction,
        }),
      ),
    };
    setUploadRequests((prev) => [...prev, uploadRequestInfo]);
  };

  return {
    uploadStatus,
    setUploadStatus,
    uploadFiles,
  };
};

const getOptimalChunkSize = (fileSize: number): number => {
  const MB = 1024 * 1024;

  if (fileSize >= 5 * 1024 * MB) {
    return 200 * MB;
  } else if (fileSize >= 1 * 1024 * MB) {
    return 100 * MB;
  } else if (fileSize >= 100 * MB) {
    return 50 * MB;
  } else {
    return 15 * MB;
  }
};
