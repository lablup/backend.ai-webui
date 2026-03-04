/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ActiveAgentsQuery } from '../__generated__/ActiveAgentsQuery.graphql';
import AgentList from './AgentList';
import { theme } from 'antd';
import { BAIBoardItemTitle, BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ActiveAgents: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const queryRef = useLazyLoadQuery<ActiveAgentsQuery>(
    graphql`
      query ActiveAgentsQuery {
        ...AgentListFragment
      }
    `,
    {},
  );

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        height: '100%',
      }}
    >
      <BAIBoardItemTitle
        title={t('activeAgent.ActiveAgents')}
        tooltip={t('activeAgent.ActiveAgentsTooltip', {
          count: 5,
        })}
      />

      {/* Scrollable Content Section */}
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <AgentList
          queryRef={queryRef}
          headerProps={{
            style: { display: 'none' },
          }}
          tableProps={{
            pagination: {
              pageSize: 3,
              showSizeChanger: false,
            },
          }}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default ActiveAgents;
