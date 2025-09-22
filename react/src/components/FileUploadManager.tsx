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
    }) => Promise<string>
  >;
};
type UploadStatus = {
  vFolderName: string;
  pending: Array<string>;
  completed: Array<string>;
  failed: Array<string>;
};
type UploadStatusMap = {
  [vFolderId: string]: UploadStatus;
};

const uploadRequestAtom = atom<UploadRequest[]>([]);
const uploadStatusAtom = atom<UploadStatusMap>({});
const uploadStatusAtomFamily = atomFamily((vFolderId: string) => {
  return atom(
    (get) => get(uploadStatusAtom)[vFolderId],
    (get, set, newStatus: UploadStatus) => {
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
): [UploadStatus, (newStatus: UploadStatus) => void] => {
  return useAtom(uploadStatusAtomFamily(vFolderId));
};

const FileUploadManager: React.FC = () => {
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const baiClient = useSuspendedBackendaiClient();
  const [uploadRequests, setUploadRequests] = useAtom(uploadRequestAtom);
  const [uploadStatus, setUploadStatus] = useAtom(uploadStatusAtom);
  const queue = new PQueue({ concurrency: 1 });

  useEffect(() => {
    if (uploadRequests.length === 0 || !baiClient) return;

    uploadRequests.forEach((uploadRequest) => {
      const { vFolderId, vFolderName, uploadFilesNames, startFunctions } =
        uploadRequest;

      setUploadStatus((prev) => ({
        ...prev,
        [vFolderId]: {
          vFolderName,
          pending: [...(prev[vFolderId]?.pending || []), ...uploadFilesNames],
          completed: [],
          failed: [],
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
        duration: 3,
      });

      startFunctions.forEach((startFunction) => {
        queue.add(async () => {
          await startFunction({
            onProgress: (bytesUploaded, bytesTotal, fileName) => {
              upsertNotification({
                key: 'upload:' + vFolderId,
                open: false,
                backgroundTask: {
                  status: 'pending',
                  percent: Math.round((bytesUploaded / bytesTotal) * 100) - 1,
                  onChange: {
                    pending: t('explorer.FileInProgress', {
                      fileName: fileName,
                    }),
                  },
                },
              });
            },
          })
            .then((fileName: string) => {
              setUploadStatus((prev) => ({
                ...prev,
                [vFolderId]: {
                  ...prev[vFolderId],
                  pending: prev[vFolderId].pending.filter(
                    (f) => f !== fileName,
                  ),
                  completed: [...prev[vFolderId].completed, fileName],
                },
              }));
            })
            .catch((fileName: string) => {
              setUploadStatus((prev) => ({
                ...prev,
                [vFolderId]: {
                  ...prev[vFolderId],
                  pending: prev[vFolderId].pending.filter(
                    (f) => f !== fileName,
                  ),
                  failed: [...prev[vFolderId].failed, fileName],
                },
              }));
            });
        });
      });
    });
    setUploadRequests([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadRequests]);

  useEffect(() => {
    Object.entries(uploadStatus).forEach(([vFolderId, status]) => {
      if (!_.isEmpty(status?.pending)) return;

      if (!_.isEmpty(status?.failed)) {
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
          extraDescription: _.join(status?.failed, ', '),
        });
      } else if (!_.isEmpty(status?.completed)) {
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
        });
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

    let uploadFileNames: Array<string> = [];
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

        return new Promise<string>((resolve, reject) => {
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
              resolve(file.webkitRelativePath || file.name);
            },
            onError: () => {
              reject(file.webkitRelativePath || file.name);
            },
          });
          upload.start();
        });
      };
    });

    const uploadRequestInfo: UploadRequest = {
      vFolderId: vfolderId,
      vFolderName: vfolder_node?.name ?? '',
      uploadFilesNames: uploadFileNames,
      startFunctions: startUploadFunctionMap,
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
