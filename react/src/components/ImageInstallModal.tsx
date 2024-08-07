import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { EnvironmentImage } from './ImageList';
import { App, List } from 'antd';
import _ from 'lodash';
import { Key } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageInstallModalInterface extends BAIModalProps {
  open: boolean;
  onRequestClose: (success: boolean) => void;
  selectedRowKeys: Key[];
  images: EnvironmentImage[];
}
export default function ImageInstallModal({
  open,
  onRequestClose,
  selectedRowKeys,
  images,
}: ImageInstallModalInterface) {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { message } = App.useApp();

  if (!open) return null;

  if (selectedRowKeys.length === 0) {
    message.warning(t('environment.NoImagesAreSelected'));
    onRequestClose(false);
    return null;
  }

  const mapImages = () => {
    const imagesMappedToid = _.keyBy(images, 'id');
    let hasInstalledImage = false;

    const imagesToInstall = selectedRowKeys
      .map((id) => imagesMappedToid[_.toString(id)])
      .filter((image) => {
        if (image?.installed && !hasInstalledImage) hasInstalledImage = true;
        return !image?.installed;
      });

    return { hasInstalledImage, imagesToInstall };
  };
  const { hasInstalledImage, imagesToInstall } = mapImages();

  if (imagesToInstall.length === 0) {
    message.warning(t('environment.AlreadyInstalledImage'));
    onRequestClose(false);
    return null;
  }

  const handleClick = () => {
    imagesToInstall.forEach(async (image) => {
      const selectedImageLabel =
        '[id="' +
        image?.registry?.replace(/\./gi, '-') +
        '-' +
        image?.name?.replace('/', '-') +
        '-' +
        image?.tag?.replace(/\./gi, '-') +
        '"]';
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

      // const imageInstallPromise = baiClient.image.install(imageName,image?.architecture,imageResource);
    });
  };

  return (
    <BAIModal
      destroyOnClose
      open={open}
      maskClosable={false}
      onCancel={() => onRequestClose(false)}
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
}
