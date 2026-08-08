/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseGetAnnouncement } from '../hooks/useSuspenseGetAnnouncement';
import { theme } from '../theme-shim';
import AnnouncementEditModal from './AnnouncementEditModal';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { useToggle } from 'ahooks';
import { BAIUnmountAfterClose } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

// PILOT-DECISION: BUI `BAIAlert` (an antd `Alert` wrapper) → Astryx `Banner`
// at the call site (MAPPING §4 / §8 DISSOLVES; same treatment as ticket 20's
// Banner conversions). P1 grep: the only consumer, StartPage, passes
// `showIcon closable` — `showIcon` is dropped (Banner always shows its status
// icon) and `closable` becomes `isDismissable`, so the interface declares
// exactly that surface instead of `extends BAIAlertProps`.
// The announcement has no severity in the data model; antd's untyped Alert
// defaulted to `info`, which is the status kept here. The markdown body was
// antd's `description` (BAIAlert forced an empty `message`); Banner requires
// a `title`, so the body moves there — one content block either way.
interface Props {
  showIcon?: boolean;
  closable?: boolean;
}
const AnnouncementAlert: React.FC<Props> = ({ closable }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const userRole = useCurrentUserRole();
  const isSuperAdmin = userRole === 'superadmin';
  const [isEditOpen, { toggle: toggleEditModal }] = useToggle(false);
  const { data: announcement } = useSuspenseGetAnnouncement();

  return !_.isEmpty(announcement.message) ? (
    <>
      <Banner
        status="info"
        isDismissable={closable}
        title={
          <div style={{ marginBottom: token.marginSM * -1 }}>
            <Markdown
              options={{
                overrides: {
                  p: {
                    props: {
                      style: { marginTop: 0, marginBottom: token.marginSM },
                    },
                  },
                },
              }}
            >
              {/* trailing <p> collapses the last paragraph's bottom margin */}
              {announcement.message + '<p></p>'}
            </Markdown>
          </div>
        }
        endContent={
          isSuperAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<SquarePenIcon size="1em" />}
              label={t('button.Edit')}
              onClick={toggleEditModal}
            />
          ) : undefined
        }
      />
      {isSuperAdmin && (
        <BAIUnmountAfterClose>
          <AnnouncementEditModal
            open={isEditOpen}
            onRequestClose={toggleEditModal}
          />
        </BAIUnmountAfterClose>
      )}
    </>
  ) : (
    ''
  );
};

export default AnnouncementAlert;
