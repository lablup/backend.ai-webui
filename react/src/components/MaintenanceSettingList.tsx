import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import SettingList, { SettingGroup } from './SettingList';
import { RedoOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MaintenanceSettingList = () => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);

  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const baiClient = useSuspendedBackendaiClient();

  const recalculateUsage = () => {
    setIsRecalculating(true);

    upsertNotification({
      message: t('maintenance.RecalculateUsage'),
      description: t('maintenance.Recalculating'),
      open: true,
      backgroundTask: {
        status: 'pending',
        promise: baiClient.maintenance
          .recalculate_usage()
          .finally(() => setIsRecalculating(false)),
        onChange: {
          pending: t('maintenance.Recalculating'),
          resolved: t('maintenance.RecalculationFinished'),
          rejected: t('maintenance.RecalculationFailed'),
        },
      },
    });
  };

  const rescanImages = () => {
    setIsRescanning(true);
    upsertNotification({
      message: t('maintenance.RescanImages'),
      open: true,
      backgroundTask: {
        status: 'pending',
        promise: baiClient.maintenance.rescan_images(),
        onChange: {
          pending: t('maintenance.RescanImageScanning'),
          resolved: (data) => {
            const result = data as Awaited<
              ReturnType<typeof baiClient.maintenance.rescan_images>
            >;
            if (result.rescan_images.ok) {
              return {
                backgroundTask: {
                  status: 'pending',
                  taskId: result.rescan_images.task_id,
                  promise: null,
                  percent: 0,
                  onChange: {
                    resolved: (_data, _notification) => {
                      setIsRescanning(false);
                      return t('maintenance.RescanImageFinished');
                    },
                  },
                },
                duration: 0,
              };
            } else {
              throw new Error(t('maintenance.RescanFailed'));
            }
          },
          rejected: (data, _) => {
            const error = data as Error | undefined;
            setIsRescanning(false);
            return error?.message || t('maintenance.RescanFailed');
          },
        },
      },
    });
  };

  const settingGroupList: Array<SettingGroup> = [
    {
      'data-testid': 'maintenance-fix',
      title: t('maintenance.Fix'),
      settingItems: [
        {
          type: 'custom',
          title: t('maintenance.MatchDatabase'),
          description: t('maintenance.DescMatchDatabase'),
          children: (
            <Button
              icon={<RedoOutlined />}
              onClick={recalculateUsage}
              loading={isRecalculating}
            >
              {isRecalculating
                ? t('maintenance.Recalculating')
                : t('maintenance.RecalculateUsage')}
            </Button>
          ),
        },
      ],
    },
    {
      'data-testid': 'maintenance-images',
      title: t('maintenance.ImagesEnvironment'),
      settingItems: [
        {
          type: 'custom',
          title: t('maintenance.RescanImageList'),
          description: t('maintenance.DescRescanImageList'),
          children: (
            <Button
              icon={<RedoOutlined />}
              onClick={rescanImages}
              loading={isRescanning}
            >
              {isRescanning
                ? t('maintenance.RescanImageScanning')
                : t('maintenance.RescanImages')}
            </Button>
          ),
        },
      ],
    },
  ];

  return <SettingList settingGroups={settingGroupList} showSearchBar />;
};

export default MaintenanceSettingList;
