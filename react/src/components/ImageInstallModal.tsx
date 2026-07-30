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
import ProjectSelect from './ProjectSelect';
import { Form, List, Skeleton, Typography } from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAIProjectResourceGroupSelect,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Dispatch, SetStateAction, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageInstallModalInterface extends BAIModalProps {
  onRequestClose: () => void;
  selectedRows: EnvironmentImage[];
  setInstallingImages: Dispatch<SetStateAction<string[]>>;
}

/**
 * Installing an image is NOT "installing into a project". It enqueues a
 * throwaway batch session whose only job is to pull the image
 * (`startupCommand: 'echo "Image is installed"'`, `enqueueOnly: true`). The
 * pull happens on the AGENT the scheduler binds that kernel to
 * (`sokovan/scheduler/launcher/launcher.py` -> agent RPC `check_and_pull`), and
 * the project never reaches agent-selection code at all.
 *
 * So the two axes this modal asks for differ in kind:
 *
 * - **Resource group** - the axis that actually decides WHERE the image lands,
 *   because it decides which agents the kernel can be bound to. This used to be
 *   hardcoded to `'default'`, which made the real target invisible and
 *   hard-failed with `InvalidAPIParameters: Scaling group 'default' is not
 *   accessible` on any deployment with no reachable group by that name.
 * - **Project** - a permission gate on which resource groups are reachable,
 *   plus the session's owner / accounting bucket.
 *
 * Both are explicit, required choices with no silent default: the point of
 * FR-3415 is that an operator-visible action never resolves its target from
 * something the operator cannot see.
 *
 * This modal deliberately does NOT inherit the image list's project filter.
 * The list filter answers "which images am I looking at"; this modal answers
 * "where does the install session run". Coupling them would make the user
 * change a *filter* in order to enable an *action*.
 */
const ImageInstallModal: React.FC<ImageInstallModalInterface> = (props) => {
  'use memo';

  // The body is mounted only while the modal is open. Everything it holds is
  // modal-session state - the project and resource-group choices - so the
  // fresh mount per open is what resets it; no state-syncing effect needed.
  if (!props.open) return null;

  return <ImageInstallModalContent {...props} />;
};

const ImageInstallModalContent: React.FC<ImageInstallModalInterface> = ({
  onRequestClose,
  selectedRows,
  setInstallingImages,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { upsertNotification } = useSetBAINotification();
  const painKiller = usePainKiller();

  const [chosenProject, setChosenProject] =
    useState<ProjectContextOrNull>(null);
  const [chosenResourceGroup, setChosenResourceGroup] = useState<
    string | undefined
  >(undefined);

  const mapImages = () => {
    let hasInstalledImage = false;
    const imagesToInstall = selectedRows.filter((image) => {
      if (image.installed) hasInstalledImage = true;
      return !image.installed;
    });
    return { imagesToInstall, hasInstalledImage };
  };

  const { imagesToInstall, hasInstalledImage } = mapImages();

  const canInstall = !!chosenProject && !!chosenResourceGroup;

  const handleClick = () => {
    if (!chosenProject || !chosenResourceGroup) return;
    const installProjectName = chosenProject.name;
    const installResourceGroup = chosenResourceGroup;
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
          // The agent that pulls the image is picked from this resource
          // group's agents - never a hardcoded `'default'`.
          scaling_group: installResourceGroup,
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
      okButtonProps={{ disabled: !canInstall }}
      onOk={handleClick}
    >
      <BAIFlex direction="column" gap="md" align="start">
        {hasInstalledImage ? t('environment.InstalledImagesAreExcluded') : null}
        <Typography.Text>
          {t('environment.DescInstallRunsSession')}
        </Typography.Text>
        {/* Both selectors are unconditional: the image list's project filter
            says which images are on screen, not where the install session
            runs. */}
        <Form layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            label={t('environment.InstallSessionProject')}
            tooltip={t('environment.InstallSessionProjectTooltip')}
            required
          >
            {/* The Suspense boundary swallows Form.Item's injected props, so
                the values are held in local state instead of the form. */}
            <Suspense fallback={<Skeleton.Input active block />}>
              {/* Deliberately NOT `ProjectSelectForAdminPage`: without
                  `disableDefaultFilter` this lists MEMBER projects only
                  (`ProjectSelect.tsx`). The manager would let a superadmin or
                  domain admin spawn in any active project of the domain
                  (`manager/utils.py` `query_userinfo`), but the session is
                  created as the admin's OWN session and the session list is
                  project-scoped - a project they do not belong to would
                  produce a session they can neither see nor clean up. */}
              <ProjectSelect
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
                  // Resource groups are reachable per project, so a group
                  // picked for the previous project may not be reachable from
                  // the new one. Drop it and make the operator choose again.
                  setChosenResourceGroup(undefined);
                }}
              />
            </Suspense>
          </Form.Item>
          <Form.Item
            label={t('environment.InstallTargetResourceGroup')}
            tooltip={t('environment.InstallTargetResourceGroupTooltip')}
            required
            style={{ marginBottom: 0 }}
          >
            <Suspense fallback={<Skeleton.Input active block />}>
              {/* Project-scoped, so it can only offer groups that pass the
                  manager's `query_allowed_sgroups` check. `autoSelectDefault`
                  is deliberately OFF - silently picking `default` would
                  reintroduce the very invisible choice this change removes. */}
              <BAIProjectResourceGroupSelect
                key={chosenProject?.id ?? 'no-project'}
                data-testid="image-install-resource-group-select"
                projectName={chosenProject?.name ?? ''}
                disabled={!chosenProject}
                value={chosenResourceGroup}
                onChange={(value) => setChosenResourceGroup(value)}
                style={{ width: '100%' }}
              />
            </Suspense>
          </Form.Item>
        </Form>
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
