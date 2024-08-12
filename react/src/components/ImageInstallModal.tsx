import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { usePainKiller } from '../hooks/usePainKiller';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { EnvironmentImage } from './ImageList';
import { List } from 'antd';
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
    imagesToInstall.forEach(async (image) => {
      const imageName = image?.registry + '/' + image?.name + ':' + image?.tag;
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
      baiClient.image
        .install(imageName, image?.architecture, imageResource)
        .then(() => {
          indicator.end(1000);
        })
        .catch((error: any) => {
          setInstallingImages(
            imagesToInstall
              .map((item) => item?.id)
              .filter(
                (id): id is string =>
                  id !== null && id !== undefined && id !== image?.id,
              ),
          );
          // @ts-ignore
          globalThis.lablupNotification.text = painKiller.relieve(error.title);
          // @ts-ignore
          globalThis.lablupNotification.detail = error.message;
          // @ts-ignore
          globalThis.lablupNotification.show(true, error);
          indicator.set(100, t('environment.DescProblemOccurred'));
          indicator.end(1000);
        });
    });
    setInstallingImages(
      imagesToInstall
        .map((item) => item?.id)
        .filter((id): id is string => id !== null && id !== undefined),
    );
  };

  return (
    <BAIModal
      {...modalProps}
      destroyOnClose
      maskClosable={false}
      onCancel={() => onRequestClose()}
      title={t('dialog.title.LetsDouble-Check')}
      okText={t('environment.Install')}
      onOk={handleClick}
    >
      <Flex direction="column" gap="md" align="start">
        <Flex>
          {t('environment.DescDownloadImage')}
          {hasInstalledImage
            ? t('environment.ExcludesImagesThatAreAlreadyInstalled')
            : null}
        </Flex>
        <Flex direction="column" align="start">
          <List
            size="small"
            bordered
            dataSource={imagesToInstall.map(
              (image) => `${image?.registry}/${image?.name}/${image?.tag}`,
            )}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Flex>
      </Flex>
    </BAIModal>
  );
};
export default ImageInstallModal;
