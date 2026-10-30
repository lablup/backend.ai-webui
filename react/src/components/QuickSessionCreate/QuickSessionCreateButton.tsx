/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { normalizeLegacyMountFields } from '../../helper/vfolderMounts';
import { useWebUINavigate } from '../../hooks';
import {
  usePinnedSessionHistory,
  useRecentSessionHistory,
} from '../../hooks/useRecentSessionHistory';
import { useProjectPath } from '../../hooks/useRouteScope';
import type { SessionLauncherFormValue } from '../../pages/SessionLauncherPage';
import type { ProjectContext } from '../../types/projectContext';
import QuickSessionCreateModal from './QuickSessionCreateModal';
import { Button } from '@lablup/ui-common/Button';
import { ButtonGroup } from '@lablup/ui-common/ButtonGroup';
import { DropdownMenu } from '@lablup/ui-common/DropdownMenu';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Pinned and recent history entries offered in the `…` menu. */
const MAX_HISTORY_ITEMS = 3;

const parseHistoryFormValues = (
  params: string,
): DeepPartial<SessionLauncherFormValue> | undefined => {
  try {
    const formValues = new URLSearchParams(params).get('formValues');
    return formValues
      ? normalizeLegacyMountFields(
          JSON.parse(formValues) as DeepPartial<SessionLauncherFormValue>,
        )
      : undefined;
  } catch {
    return undefined;
  }
};

interface QuickSessionCreateButtonProps {
  project: ProjectContext;
  onLaunched?: () => void;
}

/** The sessions page's Start button with a `…` menu that opens quick create. */
const QuickSessionCreateButton: React.FC<QuickSessionCreateButtonProps> = ({
  project,
  onLaunched,
}) => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const [recentHistory] = useRecentSessionHistory();
  const [pinnedHistory] = usePinnedSessionHistory();
  const [modalState, setModalState] = useState<{
    open: boolean;
    initialFormValues?: DeepPartial<SessionLauncherFormValue>;
  }>({ open: false });

  const historyItems = _.take(
    _.uniqBy([...(pinnedHistory ?? []), ...(recentHistory ?? [])], 'id'),
    MAX_HISTORY_ITEMS,
  );

  return (
    <>
      <ButtonGroup label={t('start.button.StartSession')}>
        <Button
          variant="primary"
          label={t('start.button.StartSession')}
          onClick={() => webuiNavigate(buildProjectPath('session/start'))}
        />
        <DropdownMenu
          button={{
            label: t('button.More'),
            variant: 'primary',
            isIconOnly: true,
            icon: <Ellipsis size="1em" />,
          }}
          hasChevron={false}
          placement="below"
          alignment="end"
          items={[
            {
              label: t('session.quickCreate.QuickCreate'),
              onClick: () => setModalState({ open: true }),
            },
            ..._.map(historyItems, (history) => ({
              label: t('session.quickCreate.StartFromHistory', {
                name: history.name || history.id,
              }),
              onClick: () =>
                setModalState({
                  open: true,
                  initialFormValues: parseHistoryFormValues(history.params),
                }),
            })),
            {
              label: t('session.quickCreate.OpenLauncher'),
              onClick: () => webuiNavigate(buildProjectPath('session/start')),
            },
          ]}
        />
      </ButtonGroup>
      <BAIUnmountAfterClose>
        <QuickSessionCreateModal
          open={modalState.open}
          project={project}
          initialFormValues={modalState.initialFormValues}
          onRequestClose={(launched) => {
            setModalState((prev) => ({ ...prev, open: false }));
            if (launched) onLaunched?.();
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default QuickSessionCreateButton;
