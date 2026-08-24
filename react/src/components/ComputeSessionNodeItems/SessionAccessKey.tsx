/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionAccessKeyFragment$key } from '../../__generated__/SessionAccessKeyFragment.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useCurrentUserInfo } from '../../hooks/backendai';
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
    <BAIFlex gap="xxs" align="center">
      <BAIText monospace copyable={copyable} ellipsis={{ tooltip: true }}>
        {session.access_key}
      </BAIText>
      {isMismatchedWithCurrentLogin && (
        <Tooltip content={t('session.LaunchedWithDifferentAccessKey')}>
          <TriangleAlert size="1em" style={{ color: 'var(--color-warning)' }} />
        </Tooltip>
      )}
    </BAIFlex>
  );
};

export default SessionAccessKey;
