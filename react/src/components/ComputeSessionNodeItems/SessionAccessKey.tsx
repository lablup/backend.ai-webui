/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionAccessKeyFragment$key } from '../../__generated__/SessionAccessKeyFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserInfo } from '../../hooks/backendai';
import { useTheme } from '@astryxdesign/core';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { BAIFlex, BAIText } from 'backend.ai-ui';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SessionAccessKeyProps {
  sessionFrgmt: SessionAccessKeyFragment$key | null | undefined;
  copyable?: boolean;
}

const SessionAccessKey: React.FC<SessionAccessKeyProps> = ({
  sessionFrgmt,
  copyable,
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const { tokens } = useTheme();

  const session = useFragment(
    graphql`
      fragment SessionAccessKeyFragment on ComputeSessionNode {
        access_key
        user_id
      }
    `,
    sessionFrgmt,
  );

  if (!session?.access_key) {
    return <>-</>;
  }

  const currentAccessKey = baiClient._config.accessKey;
  const isMismatchedWithCurrentLogin =
    userInfo.uuid === session.user_id &&
    !!currentAccessKey &&
    session.access_key !== currentAccessKey;

  return (
    <BAIFlex gap="xs" align="baseline">
      {isMismatchedWithCurrentLogin && (
        <Tooltip content={t('session.LaunchedWithDifferentAccessKey')}>
          {/* Astryx Tooltip passes its first child to showPopover({source}),
              which requires an HTMLElement — a bare lucide <svg> throws, so
              keep an HTML wrapper (BAIFlex) as the trigger. The global
              `.lucide { width: 1em !important }` rule makes font-size the
              only size lever. */}
          <BAIFlex
            align="center"
            style={{ fontSize: tokens['--font-size-lg'] }}
          >
            <TriangleAlert
              size="1em"
              style={{ color: tokens['--color-warning'] }}
            />
          </BAIFlex>
        </Tooltip>
      )}
      <BAIText monospace copyable={copyable} ellipsis={{ tooltip: true }}>
        {session.access_key}
      </BAIText>
    </BAIFlex>
  );
};

export default SessionAccessKey;
