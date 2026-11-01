/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ProjectContext } from '../../types/projectContext';
import QuickSessionCreateModal from './QuickSessionCreateModal';
import { formatQuickAmount } from './QuickSessionResourceCards';
import './ResourceGridLaunchBar.css';
import {
  isEmptyResourceGridSelection,
  resourceGridSelectionAtom,
  toQuickCreateInitialValues,
} from './resourceGridSelection';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import * as _ from 'lodash-es';
import { PlayIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ResourceGridLaunchBarProps {
  project: ProjectContext;
  onLaunched?: () => void;
}

/** Floats over the sessions page while resources are selected on the grid. */
const ResourceGridLaunchBar: React.FC<ResourceGridLaunchBarProps> = ({
  project,
  onLaunched,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [selection, setSelection] = useAtom(resourceGridSelectionAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const summary = selection
    ? _.compact([
        selection.cpu > 0 && `${selection.cpu} Core`,
        selection.memGiB > 0 && formatQuickAmount('mem', selection.memGiB),
        selection.accelerator > 0 &&
          `${_.round(selection.accelerator, 2)} ${selection.acceleratorType}`,
      ]).join(' · ')
    : '';

  return (
    <>
      {!isEmptyResourceGridSelection(selection) && !isModalOpen && (
        <div
          className="resource-grid-launch-bar"
          role="region"
          aria-label={t('session.quickCreate.StartWithSelection')}
          data-testid="resource-grid-launch-bar"
        >
          <Text weight="medium">{summary}</Text>
          <Button
            variant="primary"
            icon={<PlayIcon size="1em" />}
            label={t('session.quickCreate.StartWithSelection')}
            onClick={() => setIsModalOpen(true)}
          />
          <IconButton
            variant="ghost"
            icon={<XIcon size="1em" />}
            label={t('session.quickCreate.ClearSelection')}
            onClick={() => setSelection(null)}
          />
        </div>
      )}
      <BAIUnmountAfterClose>
        <QuickSessionCreateModal
          open={isModalOpen}
          project={project}
          initialFormValues={
            selection ? toQuickCreateInitialValues(selection) : undefined
          }
          onRequestClose={(launched) => {
            setIsModalOpen(false);
            if (launched) {
              setSelection(null);
              onLaunched?.();
            }
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default ResourceGridLaunchBar;
