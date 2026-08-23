/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionCountDashboardItemFragment$key } from '../__generated__/SessionCountDashboardItemFragment.graphql';
import { theme } from '../theme-shim';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIBoardItemTitle,
  BAIFlex,
  BAIFlexProps,
  BAIShareBar,
  BAIFetchKeyButton,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface SessionCountDashboardItemProps extends BAIFlexProps {
  queryRef: SessionCountDashboardItemFragment$key;
  isRefetching?: boolean;
  title?: string;
}

const SessionCountDashboardItem: React.FC<SessionCountDashboardItemProps> = ({
  queryRef,
  isRefetching,
  title,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [data, refetch] = useRefetchableFragment(
    graphql`
        fragment  SessionCountDashboardItemFragment on Query
        @argumentDefinitions(
          scopeId: { type: "ScopeField" }
        ) 
        @refetchable(queryName: "SessionCountDashboardItemRefetchQuery") {
          myInteractive: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
            scope_id: $scopeId
          ) {
            count
          }
          myBatch: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
            scope_id: $scopeId
          ) {
            count
          }
          myInference: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
            scope_id: $scopeId
          ) {
            count
          }
          myUpload: compute_session_nodes(
            first: 0
            filter: "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\""
            scope_id: $scopeId
          ) {
            count
          }
        }
      `,
    queryRef,
  );

  const { myInteractive, myBatch, myInference, myUpload } = data || {};

  // Astryx's named hue ramp, one per session type — categorical, so no
  // semantic (success/warning/error) token belongs here.
  const segments = [
    {
      key: 'interactive',
      label: t('session.Interactive'),
      value: myInteractive?.count || 0,
      color: 'var(--color-icon-blue)',
    },
    {
      key: 'batch',
      label: t('session.Batch'),
      value: myBatch?.count || 0,
      color: 'var(--color-icon-purple)',
    },
    {
      key: 'inference',
      label: t('session.Inference'),
      value: myInference?.count || 0,
      color: 'var(--color-icon-teal)',
    },
    {
      key: 'system',
      label: t('session.System'),
      value: myUpload?.count || 0,
      color: 'var(--color-icon-gray)',
    },
  ];
  const total = _.sumBy(segments, 'value');

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        ...props.style,
      }}
      {..._.omit(props, ['style'])}
    >
      {/* Fixed Title Section */}
      <BAIBoardItemTitle
        title={title}
        extra={
          <BAIFetchKeyButton
            size="small"
            loading={isPendingRefetch || isRefetching}
            value=""
            onChange={() => {
              startRefetchTransition(() => {
                refetch(
                  {},
                  {
                    fetchPolicy: 'network-only',
                  },
                );
              });
            }}
            type="text"
            style={{
              backgroundColor: 'transparent',
            }}
          />
        }
      />
      <BAIFlex direction="column" align="stretch" gap={'sm'}>
        <Text type="display-3" hasTabularNumbers>
          {total}
        </Text>
        <BAIShareBar segments={segments} />
      </BAIFlex>
    </BAIFlex>
  );
};

export default SessionCountDashboardItem;
