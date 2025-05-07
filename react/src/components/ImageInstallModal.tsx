import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { usePainKiller } from '../hooks/usePainKiller';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { EnvironmentImage } from './ImageList';
import { List, Typography } from 'antd';
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
      const imageName =
        image?.registry +
        '/' +
        (image?.namespace ?? image?.name) +
        ':' +
        image?.tag;
      let isGPURequired = false;
      const imageResource = {} as { [key: string]: any };
      image?.resource_limits?.forEach((resourceLimit) => {
        const key = resourceLimit?.key as string;
        imageResource[key] = resourceLimit?.min;
      });
      if ('cuda.device' in imageResource && ' cuda.shares' in imageResource) {
        isGPURequired = true;
        imageResource.gpu = 0;
        imageResource.fgpu = imageResource['cuda.shares'];
      } else if ('cuda.device' in imageResource) {
        imageResource.gpu = imageResource['cuda.device'];
        isGPURequired = true;
      } else {
        isGPURequired = false;
      }

      // Add 256m to run the image.
      if (imageResource.mem.endsWith('g')) {
        imageResource.mem = imageResource.mem.replace('g', '.5g');
      } else if (imageResource.mem.endsWith('m')) {
        imageResource.mem = Number(imageResource.mem.slice(0, -1)) + 256 + 'm';
      }

      imageResource.domain = baiClient._config.domainName;
      imageResource['group_name'] = baiClient.current_group;

      const resourceSlots = await baiClient.get_resource_slots();

      if (isGPURequired) {
        if (
          !('cuda.device' in resourceSlots) &&
          !('cuda.shares' in resourceSlots)
        ) {
          delete imageResource['gpu'];
          delete imageResource['fgpu'];
          delete imageResource['cuda.shares'];
          delete imageResource['cuda.device'];
        }
      }

      if ('cuda.device' in resourceSlots && 'cuda.shares' in resourceSlots) {
        // Can be possible after 20.03
        if ('fgpu' in imageResource && 'gpu' in imageResource) {
          delete imageResource['gpu'];
          delete imageResource['cuda.device'];
        }
      } else if ('cuda.device' in resourceSlots) {
        delete imageResource['fgpu'];
        delete imageResource['cuda.shares'];
      } else if ('cuda.shares' in resourceSlots) {
        delete imageResource['gpu'];
        delete imageResource['cuda.device'];
      }

      imageResource.enqueueOnly = true;
      imageResource.type = 'batch';
      imageResource.startupCommand = 'echo "Image is installed"';

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
      <Flex direction="column" gap="md" align="start">
        {hasInstalledImage ? t('environment.InstalledImagesAreExcluded') : null}
        <Flex
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
        </Flex>
        <Typography.Text>
          {t('environment.DescSignificantInstallTime')}&nbsp;
          {t('dialog.ask.DoYouWantToProceed')}
        </Typography.Text>
      </Flex>
    </BAIModal>
  );
};
export default ImageInstallModal;
