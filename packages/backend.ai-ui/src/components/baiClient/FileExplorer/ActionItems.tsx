import Flex from '../../Flex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import CreateDirectoryModal from './CreateDirectoryModal';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import { FolderAddOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useToggle } from 'ahooks';
import { Button, Grid, theme, Tooltip } from 'antd';
import { PowerOffIcon } from 'lucide-react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

interface ActionItemsProps {
  selectedItems: Array<VFolderFile>;
  onRequestClose: (
    success: boolean,
    modifiedItems?: Array<VFolderFile>,
  ) => void;
}

const ActionItems: React.FC<ActionItemsProps> = ({
  selectedItems,
  onRequestClose,
}) => {
  const baiClient = useConnectedBAIClient();
  const { t } = useTranslation();
  const { lg } = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const { targetFolder } = useContext(FolderInfoContext);
  const [openCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [openDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);

  const { data: vfolderInfo, isFetching } = useQuery({
    queryKey: ['vfolderInfo', targetFolder],
    queryFn: () => baiClient.vfolder.info(targetFolder),
    enabled: !!targetFolder,
    // not using cache, always refetch
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <Flex gap="xs">
      {selectedItems ? (
        <Flex gap={'sm'}>
          {selectedItems.length > 0 && (
            <>
              {t('general.NSelected', {
                count: selectedItems.length,
              })}
              <Tooltip title={t('general.button.Delete')} placement="topLeft">
                <Button
                  icon={<PowerOffIcon color={token.colorError} />}
                  onClick={() => {
                    toggleDeleteModal();
                  }}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title={!lg && t('general.button.Create')}>
            <Button
              disabled={isFetching || !vfolderInfo?.permission.includes('w')}
              icon={<FolderAddOutlined />}
              onClick={() => {
                toggleCreateModal();
              }}
            >
              {lg && t('general.button.Create')}
            </Button>
          </Tooltip>
        </Flex>
      ) : null}
      <DeleteSelectedItemsModal
        destroyOnClose
        open={openDeleteModal}
        selectedItems={selectedItems}
        onRequestClose={(success: boolean) => {
          if (success) {
            onRequestClose(true, selectedItems);
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
    </Flex>
  );
};

export default ActionItems;
