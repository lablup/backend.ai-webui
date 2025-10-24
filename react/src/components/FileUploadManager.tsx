import { useSetBAINotification } from '../hooks/useBAINotification';
import { RcFile } from 'antd/es/upload';
import { toGlobalId, useConnectedBAIClient } from 'backend.ai-ui';
import { atom, useAtom, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import _ from 'lodash';
import PQueue from 'p-queue';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { FileUploadManagerQuery } from 'src/__generated__/FileUploadManagerQuery.graphql';
import { useSuspendedBackendaiClient } from 'src/hooks';
import * as tus from 'tus-js-client';

type UploadRequest = {
  vFolderId: string;
  vFolderName: string;
  uploadFilesNames: Array<string>;
  startFunctions: Array<
    (callbacks?: {
      onProgress?: (
        bytesUploaded: number,
        bytesTotal: number,
        fileName: string,
      ) => void;
    }) => Promise<{ name: string; bytes: number }>
  >;
  totalBytes?: number;
};
type UploadRequestMap = {
  uploadInfo: Array<UploadRequest>;
  totalBytes: number;
};
type UploadStatus = {
  vFolderNames: Array<string>;
  totalSize: number;
};
type UploadStatusInfo = {
  vFolderName: string;
  pending: UploadStatus;
  completed: UploadStatus;
  failed: UploadStatus;
};
type UploadStatusMap = {
  [vFolderId: string]: UploadStatusInfo;
};

const uploadRequestAtom = atom<UploadRequestMap>({
  uploadInfo: [],
  totalBytes: 0,
});
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
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const baiClient = useSuspendedBackendaiClient();
  const [uploadRequests, setUploadRequests] = useAtom(uploadRequestAtom);
  const [uploadStatus, setUploadStatus] = useAtom(uploadStatusAtom);
  const queue = new PQueue({ concurrency: 4 });

  useEffect(() => {
    if (uploadRequests.uploadInfo.length === 0 || !baiClient) return;

    uploadRequests.uploadInfo.forEach((uploadRequest) => {
      const { vFolderId, vFolderName, uploadFilesNames, startFunctions } =
        uploadRequest;

      setUploadStatus((prev) => ({
        ...prev,
        [vFolderId]: {
          vFolderName,
          pending: {
            vFolderNames: [
              ...(prev[vFolderId]?.pending.vFolderNames || []),
              ...uploadFilesNames,
            ],
            totalSize: uploadRequests.totalBytes,
          },
          completed: prev[vFolderId]?.completed || {
            vFolderNames: [],
            totalSize: 0,
          },
          failed: prev[vFolderId]?.failed || {
            vFolderNames: [],
            totalSize: 0,
          },
        },
      }));

      upsertNotification({
        key: 'upload:' + vFolderId,
        open: true,
        message: t('explorer.UploadToFolder', {
          folderName: vFolderName,
        }),
        backgroundTask: {
          status: 'pending',
          percent: 0,
          onChange: {
            pending: t('explorer.ProcessingUpload'),
          },
        },
        duration: 0,
      });

      startFunctions.forEach((startFunction) => {
        queue.add(async () => {
          await startFunction({
            onProgress: (bytesUploaded, _bytesTotal, fileName) => {
              setUploadStatus((prev) => {
                const uploadedFilesCount =
                  prev[vFolderId]?.completed.vFolderNames.length || 0;
                const totalUploadedFilesCount =
                  (prev[vFolderId]?.completed?.vFolderNames.length || 0) +
                  (prev[vFolderId]?.failed?.vFolderNames.length || 0) +
                  (prev[vFolderId]?.pending?.vFolderNames.length || 0);
                upsertNotification({
                  key: 'upload:' + vFolderId,
                  message: `${t('explorer.UploadToFolder', {
                    folderName: vFolderName,
                  })}${` (${uploadedFilesCount} / ${totalUploadedFilesCount})`}`,
                  backgroundTask: {
                    status: 'pending',
                    percent:
                      Math.round(
                        ((prev[vFolderId]?.completed.totalSize +
                          bytesUploaded) /
                          uploadRequests.totalBytes) *
                          100,
                      ) - 1,
                    onChange: {
                      pending: t('explorer.FileInProgress', {
                        fileName: fileName,
                      }),
                    },
                  },
                });

                return prev;
              });
            },
          })
            .then(({ name: fileName, bytes: fileSize }) => {
              setUploadStatus((prev) => ({
                ...prev,
                [vFolderId]: {
                  ...prev[vFolderId],
                  pending: {
                    vFolderNames: prev[vFolderId].pending.vFolderNames.filter(
                      (f) => f !== fileName,
                    ),
                    totalSize: prev[vFolderId]?.pending?.totalSize - fileSize,
                  },
                  completed: {
                    vFolderNames: [
                      ...(prev[vFolderId]?.completed?.vFolderNames || []),
                      fileName,
                    ],
                    totalSize:
                      (prev[vFolderId]?.completed?.totalSize || 0) + fileSize,
                  },
                },
              }));
            })
            .catch(({ name: fileName, bytes: fileSize }) => {
              setUploadStatus((prev) => ({
                ...prev,
                [vFolderId]: {
                  ...prev[vFolderId],
                  pending: {
                    vFolderNames: prev[vFolderId].pending.vFolderNames.filter(
                      (f) => f !== fileName,
                    ),
                    totalSize: prev[vFolderId].pending.totalSize - fileSize,
                  },
                  failed: {
                    vFolderNames: [
                      ...(prev[vFolderId]?.failed?.vFolderNames || []),
                      fileName,
                    ],
                    totalSize:
                      (prev[vFolderId]?.failed?.totalSize || 0) + fileSize,
                  },
                },
              }));
            });
        });
      });
    });
    setUploadRequests({ uploadInfo: [], totalBytes: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadRequests]);

  useEffect(() => {
    Object.entries(uploadStatus).forEach(([vFolderId, status]) => {
      if (!_.isEmpty(status?.pending?.vFolderNames)) return;

      if (!_.isEmpty(status?.failed?.vFolderNames)) {
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
          extraDescription: _.join(status?.failed.vFolderNames, ', '),
        });
      } else if (!_.isEmpty(status?.completed?.vFolderNames)) {
        upsertNotification({
          key: 'upload:' + vFolderId,
          open: true,
          message: t('explorer.SuccessfullyUploadedToFolder', {
            folderName: status?.vFolderName,
          }),
          backgroundTask: {
            status: 'resolved',
            percent: 100,
            onChange: {
              resolved: ' ',
            },
          },
          duration: 3,
        });
        setUploadStatus((prev) => ({
          ...prev,
          [vFolderId]: {
            ...prev[vFolderId],
            completed: {
              vFolderNames: [],
              totalSize: 0,
            },
          },
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadStatus]);

  return null;
};

export default FileUploadManager;

export const useFileUploadManager = (vFolderId: string) => {
  const baiClient = useConnectedBAIClient();
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const [uploadStatus, setUploadStatus] = useUploadStatusAtomStatus(vFolderId);
  const setUploadRequests = useSetAtom(uploadRequestAtom);

  const { vfolder_node } = useLazyLoadQuery<FileUploadManagerQuery>(
    graphql`
      query FileUploadManagerQuery($vfolderGlobalId: String!) {
        vfolder_node(id: $vfolderGlobalId) {
          name @required(action: THROW)
        }
      }
    `,
    {
      vfolderGlobalId: toGlobalId('VirtualFolderNode', vFolderId),
    },
    {
      fetchPolicy: vFolderId ? 'network-only' : 'store-only',
    },
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
          folderName: vfolder_node?.name ?? '',
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

    const uploadFileNames: Array<string> = [];
    const totalBytes = _.sumBy(files, (file) => file.size);
    const startUploadFunctionMap = _.map(files, (file) => {
      uploadFileNames.push(file.webkitRelativePath || file.name);
      return async (callbacks?: {
        onProgress?: (
          bytesUploaded: number,
          bytesTotal: number,
          fileName: string,
        ) => void;
      }) => {
        const uploadPath = [currentPath, file.webkitRelativePath || file.name]
          .filter(Boolean)
          .join('/');
        const uploadUrl: string = await baiClient.vfolder.create_upload_session(
          uploadPath,
          file,
          vfolderId,
        );

        return new Promise<{ name: string; bytes: number }>(
          (resolve, reject) => {
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
                callbacks?.onProgress?.(bytesUploaded, bytesTotal, file.name);
              },
              onSuccess: () => {
                resolve({
                  name: file.webkitRelativePath || file.name,
                  bytes: file.size,
                });
              },
              onError: () => {
                reject({
                  name: file.webkitRelativePath || file.name,
                  bytes: file.size,
                });
              },
            });
            upload.start();
          },
        );
      };
    });

    const uploadRequestInfo: UploadRequest = {
      vFolderId: vfolderId,
      vFolderName: vfolder_node?.name ?? '',
      uploadFilesNames: uploadFileNames,
      startFunctions: startUploadFunctionMap,
    };
    setUploadRequests((prev) => ({
      uploadInfo: [...prev.uploadInfo, uploadRequestInfo],
      totalBytes: prev.totalBytes + totalBytes,
    }));
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
