/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserRole } from '../hooks/backendai';
import { useSuspenseGetAnnouncement } from '../hooks/useSuspenseGetAnnouncement';
import AnnouncementEditModal from './AnnouncementEditModal';
import './AnnouncementAlert.css';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { BAIUnmountAfterClose, useToggle } from 'backend.ai-ui';
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
// antd's `description` (BAIAlert forced an empty `message`), and it is the
// `description` again here — see QA-FINDINGS Q-25 below for why the earlier
// "one content block either way" reading was wrong.
interface Props {
  showIcon?: boolean;
  closable?: boolean;
}
const AnnouncementAlert: React.FC<Props> = ({ closable }) => {
  'use memo';

  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const isSuperAdmin = userRole === 'superadmin';
  const [isEditOpen, { toggle: toggleEditModal }] = useToggle(false);
  const { data: announcement } = useSuspenseGetAnnouncement();

  return !_.isEmpty(announcement.message) ? (
    <>
      <div className="bai-announcement-alert">
        <Banner
        status="info"
        isDismissable={closable}
        // QA-FINDINGS Q-25: the markdown body belongs in `description`, not
        // `title`. `Banner` decides its header's cross-axis alignment from the
        // SLOT SHAPE, not from the measured height —
        // `isSingleLine = description == null && hasActions` — and when that is
        // true it swaps the header's `align-items: flex-start` for `center`.
        // An announcement is arbitrary multi-line markdown, so putting all of
        // it in `title` with no `description` told Banner "one line plus
        // actions" about a ~100px block: the icon and the Edit/Dismiss end area
        // were then centred against it, ~38px below the first line of text.
        // Legacy antd rendered this as `ant-alert-with-description`, which is
        // `align-items: flex-start` for icon, content, actions and close alike;
        // moving the body to `description` restores exactly that, because
        // `description != null` is what turns the centring off. `title={null}`
        // renders an empty block box — no line boxes, so no extra height.
        title={null}
        description={
          // POLISH-3 item 2: no styling of the Banner's own boxes. What used
          // to be here was a negative `marginBottom` on a wrapper plus a
          // trailing empty `<p>` — a pair of hacks whose only job was to
          // cancel the bottom margin the markdown paragraphs added inside
          // Banner's header. Zeroing the paragraph margin removes the cause,
          // so the Banner keeps its default padding untouched.
          <Markdown
            options={{
              overrides: { p: { props: { style: { margin: 0 } } } },
            }}
          >
            {announcement.message}
          </Markdown>
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
      </div>
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
