import { useSuspendedBackendaiClient } from '../hooks';
import {
  CLOSING_DURATION,
  useSetBAINotification,
} from '../hooks/useBAINotification';
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
        statusDescriptions: {
          pending: t('maintenance.Recalculating'),
          resolved: t('maintenance.RecalculationFinished'),
          rejected: t('maintenance.RecalculationFailed'),
        },
      },
    });
  };

  const rescanImages = () => {
    setIsRescanning(true);
    const notiKey = upsertNotification({
      message: t('maintenance.RescanImages'),
      description: t('maintenance.RescanImageScanning'),
      open: true,
      backgroundTask: {
        status: 'pending',
      },
    });
    // If values can be passed through resolve, please refactor the following function using promises
    baiClient.maintenance
      .rescan_images()
      .then(({ rescan_images }) => {
        if (rescan_images.ok) {
          upsertNotification({
            key: notiKey,
            backgroundTask: {
              status: 'pending',
              percent: 0,
              taskId: rescan_images.task_id,
              statusDescriptions: {
                pending: t('maintenance.RescanImageScanning'),
                resolved: t('maintenance.RescanImageFinished'),
                rejected: t('maintenance.RescanFailed'),
              },
            },
            duration: 0,
          });
        } else {
          throw new Error(t('maintenance.RescanFailed'));
        }
      })
      .catch((err: any) => {
        upsertNotification({
          key: notiKey,
          // description: painKiller.relieve(err?.title),
          backgroundTask: {
            status: 'rejected',
            statusDescriptions: {
              rejected: err?.message || t('maintenance.RescanFailed'),
            },
          },
          open: true,
          duration: CLOSING_DURATION,
        });
      })
      .finally(() => {
        setIsRescanning(false);
      });
  };

  const settingGroupList: SettingGroup = [
    {
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

  return <SettingList settingGroup={settingGroupList} showSearchBar />;
};

export default MaintenanceSettingList;
