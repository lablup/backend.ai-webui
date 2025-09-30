import { addNumberWithUnits } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { usePainKiller } from '../hooks/usePainKiller';
import { SessionResources } from '../pages/SessionLauncherPage';
import { EnvironmentImage } from './ImageList';
import { List, Typography } from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import _ from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageInstallModalInterface extends BAIModalProps {
  onRequestClose: () => void;
  selectedRows: EnvironmentImage[];
  setInstallingImages: Dispatch<SetStateAction<string[]>>;
}
const ImageInstallModal: React.FC<ImageInstallModalInterface> = ({
  onRequestClose,
  selectedRows,
  setInstallingImages,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { upsertNotification } = useSetBAINotification();
  const painKiller = usePainKiller();
  if (!modalProps.open) return null;

  const mapImages = () => {
    let hasInstalledImage = false;
    const imagesToInstall = selectedRows.filter((image) => {
      if (image.installed) hasInstalledImage = true;
      return !image.installed;
    });
    return { imagesToInstall, hasInstalledImage };
  };

  const { imagesToInstall, hasInstalledImage } = mapImages();

  const handleClick = () => {
    onRequestClose();
    const installPromises = imagesToInstall.map(async (image) => {
      const imageName = `${image?.registry}/${image?.namespace ?? image?.name}:${image?.tag}`;

      const labels = (image?.labels ?? []).reduce<Record<string, string>>(
        (acc, label) => {
          if (label?.key && label?.value) {
            acc[label.key] = label.value;
          }
          return acc;
        },
        {},
      ); // Properly convert labels to a dictionary

      const shmem = labels['ai.backend.resource.preferred.shmem'] || '64m';
      const mem =
        addNumberWithUnits(
          _.get(_.find(image?.resource_limits, { key: 'mem' }), 'min') ??
            '256m',
          shmem,
          'm',
        ) ?? '320m'; // 320m = 256m + 64m

      const imageResource: SessionResources = {
        group_name: baiClient.current_group,
        domain: baiClient._config.domainName,
        type: 'batch',
        cluster_mode: 'single-node',
        cluster_size: 1,
        startupCommand: 'echo "Image is installed"',
        enqueueOnly: true,
        config: {
          resources: {
            ..._.mapValues(_.keyBy(image?.resource_limits, 'key'), 'min'),
            cpu: _.get(
              _.find(image?.resource_limits, { key: 'cpu' }),
              'min',
              1,
            ) as number,
            mem: mem,
          },
          resource_opts: {
            shmem,
          },
        },
      };

      const isGPURequired = _.some(
        ['cuda.device', 'cuda.shares'],
        (key) => key in (imageResource.config?.resources ?? {}),
      );

      if (isGPURequired && imageResource.config) {
        _.assign(imageResource.config.resources, {
          gpu: _.get(imageResource.config.resources, 'cuda.device', 0),
          fgpu: _.get(imageResource.config.resources, 'cuda.shares'),
        });
      }

      const resourceSlots = await baiClient.get_resource_slots();

      const keysToRemove = _.chain([
        'cuda.device',
        'cuda.shares',
        'gpu',
        'fgpu',
      ])
        .filter((key) => !(key in resourceSlots))
        .value();

      // Remove keys that are not available in the resource slots
      if (imageResource.config) {
        imageResource.config.resources = {
          ..._.omit(imageResource.config.resources ?? {}, keysToRemove),
          cpu: imageResource.config.resources?.cpu ?? 1,
          mem: imageResource.config.resources?.mem ?? '320m',
        };
      }

      upsertNotification({
        message: `${t('environment.InstallingImage')}${imageName}${t('environment.TakesTime')}`,
        open: true,
        duration: 2,
      });

      //@ts-ignore
      const indicator = await globalThis.lablupIndicator.start('indeterminate');
      indicator.set(10, t('import.Downloading'));

      try {
        await baiClient.image.install(
          imageName,
          image?.architecture,
          imageResource,
        );
        indicator.end(1000);
        return image?.id;
      } catch (error) {
        // @ts-ignore
        globalThis.lablupNotification.text = painKiller.relieve(error.title);
        // @ts-ignore
        globalThis.lablupNotification.detail = error.message;
        // @ts-ignore
        globalThis.lablupNotification.show(true, error);
        indicator.set(100, t('environment.DescProblemOccurred'));
        indicator.end(1000);
        return null;
      }
    });

    Promise.allSettled(installPromises).then((results) => {
      const installedImages = results
        .filter(
          (result): result is PromiseFulfilledResult<string> =>
            result.status === 'fulfilled' && result.value !== null,
        )
        .map((result) => result.value);

      setInstallingImages(installedImages);
    });
  };

  return (
    <BAIModal
      {...modalProps}
      destroyOnClose
      maskClosable={false}
      onCancel={() => onRequestClose()}
      title={t('environment.CheckImageInstallation')}
      okText={t('environment.Install')}
      onOk={handleClick}
    >
      <BAIFlex direction="column" gap="md" align="start">
        {hasInstalledImage ? t('environment.InstalledImagesAreExcluded') : null}
        <BAIFlex
          direction="column"
          align="start"
          style={{
            width: '100%',
          }}
        >
          <List
            size="small"
            dataSource={imagesToInstall.map(
              (image) =>
                `${image?.registry}/${image?.namespace ?? image?.name}:${image?.tag}`,
            )}
            style={{
              width: '100%',
            }}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text strong>{item}</Typography.Text>
              </List.Item>
            )}
            pagination={{
              pageSize: 5,
              showTotal: (total) => t('general.TotalItems', { total }),
            }}
          />
        </BAIFlex>
        <Typography.Text>
          {t('environment.DescSignificantInstallTime')}&nbsp;
          {t('dialog.ask.DoYouWantToProceed')}
        </Typography.Text>
      </BAIFlex>
    </BAIModal>
  );
};
export default ImageInstallModal;
