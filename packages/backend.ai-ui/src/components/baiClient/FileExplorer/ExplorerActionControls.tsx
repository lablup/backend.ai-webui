import { BAITrashBinIcon } from '../../../icons';
import BAIFlex from '../../BAIFlex';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import CreateDirectoryModal from './CreateDirectoryModal';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import { useUploadVFolderFiles } from './hooks';
import {
  FileAddOutlined,
  FolderAddOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Button, Dropdown, Grid, theme, Tooltip, Upload } from 'antd';
import { createStyles } from 'antd-style';
import { RcFile } from 'antd/es/upload';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  upload: css`
    .ant-btn,
    .ant-upload,
    .ant-upload-wrapper {
      width: 100% !important;
    }
    .ant-btn {
      justify-content: start;
    }
  `,
}));

interface ExplorerActionControlsProps {
  selectedFiles: Array<VFolderFile>;
  onRequestClose: (
    success: boolean,
    modifiedItems?: Array<VFolderFile>,
  ) => void;
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
  enableDelete?: boolean;
  enableWrite?: boolean;
}

const ExplorerActionControls: React.FC<ExplorerActionControlsProps> = ({
  selectedFiles,
  onRequestClose,
  onUpload,
  enableDelete = false,
  enableWrite = false,
}) => {
  const { t } = useTranslation();
  const { lg } = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const { uploadFiles } = useUploadVFolderFiles();
  const [openCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [openDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const lastFileListRef = useRef<Array<RcFile>>([]);

  return (
    <BAIFlex gap="xs">
      <BAIFlex gap={'sm'}>
        {selectedFiles.length > 0 && (
          <>
            {t('general.NSelected', {
              count: selectedFiles.length,
            })}
            <Tooltip title={t('general.button.Delete')} placement="topLeft">
              <Button
                disabled={!enableDelete}
                icon={<BAITrashBinIcon style={{ color: token.colorError }} />}
                onClick={() => {
                  toggleDeleteModal();
                }}
              />
            </Tooltip>
          </>
        )}
        <Tooltip title={!lg && t('general.button.Create')}>
          <Button
            disabled={!enableWrite}
            icon={<FolderAddOutlined />}
            onClick={() => {
              toggleCreateModal();
            }}
          >
            {lg && t('general.button.Create')}
          </Button>
        </Tooltip>
        <Dropdown
          disabled={!enableWrite}
          dropdownRender={() => {
            return (
              <BAIFlex
                align="start"
                direction="column"
                className={styles.upload}
                style={{
                  padding: 5,
                  backgroundColor: token.colorBgElevated,
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowSecondary,
                }}
              >
                <Upload
                  beforeUpload={(_, fileList) => {
                    if (fileList !== lastFileListRef.current) {
                      uploadFiles(fileList, onUpload);
                    }
                    lastFileListRef.current = fileList;
                    return false; // Prevent default upload behavior
                  }}
                  multiple
                  showUploadList={false}
                >
                  <Button type="text" icon={<FileAddOutlined />}>
                    {t('comp:FileExplorer.UploadFiles')}
                  </Button>
                </Upload>
                <Upload
                  directory
                  beforeUpload={(_, fileList) => {
                    if (fileList !== lastFileListRef.current) {
                      uploadFiles(fileList, onUpload);
                    }
                    lastFileListRef.current = fileList;
                    return false;
                  }}
                  showUploadList={false}
                >
                  <Button type="text" icon={<FolderAddOutlined />}>
                    {t('comp:FileExplorer.UploadFolder')}
                  </Button>
                </Upload>
              </BAIFlex>
            );
          }}
        >
          <Tooltip title={!lg && t('general.button.Upload')}>
            <Button icon={<UploadOutlined />}>
              {lg && t('general.button.Upload')}
            </Button>
          </Tooltip>
        </Dropdown>
      </BAIFlex>
      <DeleteSelectedItemsModal
        destroyOnClose
        open={openDeleteModal}
        selectedFiles={selectedFiles}
        onRequestClose={(success: boolean) => {
          if (success) {
            onRequestClose(true, selectedFiles);
          }
          toggleDeleteModal();
        }}
      />
      <CreateDirectoryModal
        destroyOnClose
        open={openCreateModal}
        onRequestClose={(success: boolean) => {
          if (success) {
            onRequestClose(true);
          }
          toggleCreateModal();
        }}
      />
    </BAIFlex>
  );
};

export default ExplorerActionControls;
