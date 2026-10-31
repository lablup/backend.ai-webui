/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import SettingList, { SettingGroup } from './SettingList';
import { Button } from '@lablup/ui-common/Button';
import { Redo2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MaintenanceSettingList = () => {
  'use memo';
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
              icon={<Redo2 size="1em" />}
              onClick={recalculateUsage}
              isLoading={isRecalculating}
              label={
                isRecalculating
                  ? t('maintenance.Recalculating')
                  : t('maintenance.RecalculateUsage')
              }
            />
          ),
          showResetButton: false,
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
              icon={<Redo2 size="1em" />}
              onClick={rescanImages}
              isLoading={isRescanning}
              label={
                isRescanning
                  ? t('maintenance.RescanImageScanning')
                  : t('maintenance.RescanImages')
              }
            />
          ),
          showResetButton: false,
        },
      ],
    },
  ];

  return <SettingList settingGroups={settingGroupList} showSearchBar />;
};

export default MaintenanceSettingList;
