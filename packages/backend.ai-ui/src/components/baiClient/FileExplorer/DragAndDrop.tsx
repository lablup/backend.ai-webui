import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { FolderInfoContext } from './BAIFileExplorer';
import { InboxOutlined } from '@ant-design/icons';
import { App, theme, Typography, Upload } from 'antd';
import { createStyles } from 'antd-style';
import { RcFile } from 'antd/es/upload';
import _ from 'lodash';
import { use, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  dragger: css`
    height: 100% !important;
  `,
}));

interface DragAndDropProps {
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({ onUpload }) => {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const { targetVFolderId, currentPath } = use(FolderInfoContext);
  const baiClient = useConnectedBAIClient();
  const lastFileListRef = useRef<Array<RcFile>>([]);

  const handleUpload = async (fileList: RcFile[], path: string) => {
    // Currently, backend.ai only supports finding existing files by using list_files API.
    // This API throw an error if the file does not exist in the target vfolder.
    // So, we need to catch the error and return undefined.
    const duplicateCheckResult = await baiClient.vfolder
      .list_files(currentPath, targetVFolderId)
      .then((files) => {
        return _.some(
          files.items,
          (existFiles) =>
            existFiles.name ===
            (fileList[0].webkitRelativePath.split('/')[0] || fileList[0].name),
        );
      });

    if (duplicateCheckResult) {
      modal.confirm({
        title: t('comp:FileExplorer.DuplicatedFiles'),
        content: t('comp:FileExplorer.DuplicatedFilesDesc'),
        onOk: () => {
          onUpload(fileList, path);
        },
      });
    } else {
      onUpload(fileList, path);
    }
  };

  return (
    <Upload.Dragger
      className={styles.dragger}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: token.zIndexPopupBase + 1,
        backdropFilter: 'blur(4px)',
      }}
      multiple
      directory
      showUploadList={false}
      beforeUpload={(_, fileList) => {
        if (fileList !== lastFileListRef.current) {
          handleUpload(fileList, currentPath);
        }
        lastFileListRef.current = fileList;
        return false;
      }}
    >
      <p>
        <InboxOutlined style={{ fontSize: token.fontSizeHeading1 }} />
      </p>
      <Typography.Text style={{ fontSize: token.fontSizeHeading4 }}>
        {t('comp:FileExplorer.DragAndDropDesc')}
      </Typography.Text>
    </Upload.Dragger>
  );
};

export default DragAndDrop;
