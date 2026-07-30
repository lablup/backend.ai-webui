/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { addNumberWithUnits } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { usePainKiller } from '../hooks/usePainKiller';
import { SessionResources } from '../pages/SessionLauncherPage';
import { ProjectContextOrNull } from '../types/projectContext';
import { EnvironmentImage } from './ImageList';
import ProjectSelectForAdminPage from './ProjectSelectForAdminPage';
import { Form, List, Skeleton, Typography } from 'antd';
import { BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Dispatch, SetStateAction, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageInstallModalInterface extends BAIModalProps {
  onRequestClose: () => void;
  selectedRows: EnvironmentImage[];
  setInstallingImages: Dispatch<SetStateAction<string[]>>;
  /**
   * Explicit project prop contract (ADR-0001, FR-3415). Installing an image
   * enqueues a batch session, so it MUST land in a project the operator chose
   * deliberately — never in `baiClient.current_group`, which on an admin page
   * is an invisible leftover.
   *
   * MODAL TIER: the image list is domain-wide by default, so a project is not
   * always available to inherit. `null` therefore makes this modal render its
   * OWN required project selector, and the chosen project becomes the install
   * session's project. When a project IS passed (the list's optional filter is
   * active) no selector is shown and the install lands in that project.
   *
   * The install target is deliberately NOT borrowed from the list's filter
   * when unset: making the user change a *filter* to enable an *action* is the
   * implicit coupling this epic removes.
   */
  project: ProjectContextOrNull;
}
const ImageInstallModal: React.FC<ImageInstallModalInterface> = (props) => {
  'use memo';

  // The body is mounted only while the modal is open. Everything it holds is
  // modal-session state — notably the in-modal project choice — so the fresh
  // mount per open is what resets it; no state-syncing effect needed.
  if (!props.open) return null;

  return <ImageInstallModalContent {...props} />;
};

const ImageInstallModalContent: React.FC<ImageInstallModalInterface> = ({
  onRequestClose,
  selectedRows,
  setInstallingImages,
  project,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { upsertNotification } = useSetBAINotification();
  const painKiller = usePainKiller();

  const [chosenProject, setChosenProject] =
    useState<ProjectContextOrNull>(null);

  // The passed project wins; the in-modal choice only fills the `null` case.
  const installProject: ProjectContextOrNull = project ?? chosenProject;

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
    if (!installProject) return;
    const installProjectName = installProject.name;
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
        group_name: installProjectName,
        domain: baiClient._config.domainName,
        type: 'batch',
        cluster_mode: 'single-node',
        cluster_size: 1,
        startupCommand: 'echo "Image is installed"',
        enqueueOnly: true,
        reuseIfExists: false,
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
          scaling_group: 'default',
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

      const keysToRemove = _.filter(
        ['cuda.device', 'cuda.shares', 'gpu', 'fgpu'],
        (key) => !(key in resourceSlots),
      );

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

      try {
        await baiClient.image.install(
          imageName,
          image?.architecture,
          imageResource,
        );
        return image?.id;
      } catch (error) {
        document.dispatchEvent(
          new CustomEvent('add-bai-notification', {
            detail: {
              open: true,
              type: 'error',
              message: painKiller.relieve((error as any).title),
              description: (error as any).message,
            },
          }),
        );
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
      destroyOnHidden
      maskClosable={false}
      onCancel={() => onRequestClose()}
      title={t('environment.CheckImageInstallation')}
      okText={t('environment.Install')}
      okButtonProps={{ disabled: !installProject }}
      onOk={handleClick}
    >
      <BAIFlex direction="column" gap="md" align="start">
        {hasInstalledImage ? t('environment.InstalledImagesAreExcluded') : null}
        {project === null ? (
          // ADR-0001 modal tier: with no project filter active the list is
          // domain-wide, so the install target is this modal's own required
          // decision — same pattern as FolderCreateModalV2 /
          // DeploymentSettingModal.
          <Form layout="vertical" style={{ width: '100%' }}>
            <Form.Item
              label={t('data.folders.TargetProject')}
              required
              style={{ marginBottom: 0 }}
            >
              {/* The Suspense boundary swallows Form.Item's injected props,
                  so the value is held in local state instead of the form. */}
              <Suspense fallback={<Skeleton.Input active block />}>
                <ProjectSelectForAdminPage
                  data-testid="image-install-project-select"
                  domain={baiClient._config.domainName}
                  value={chosenProject?.id ?? undefined}
                  onSelectProject={(projectInfo) => {
                    setChosenProject(
                      projectInfo
                        ? {
                            id: projectInfo.projectId,
                            name: projectInfo.projectName,
                          }
                        : null,
                    );
                  }}
                />
              </Suspense>
            </Form.Item>
          </Form>
        ) : null}
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
