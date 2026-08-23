/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../theme-shim';
import AgentList from './AgentList';
import { BAIBoardItemTitle, BAIFetchKeyButton, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface ActiveAgentsProps {
  fetchKey?: string;
  onChangeFetchKey?: (key: string) => void;
}

// The admin list's nine columns split the card's ~1246px into 138px each,
// which truncates the allocation and utilization cells mid-number ("7.11 / 30.",
// "127.4"). A dashboard card is a health summary, so it carries six columns and
// leaves the rest to the agents page.
// Measured at 1600px: the resource cells need ~200px of content box, a check
// glyph needs almost none. An even split gives every column the same width and
// starves the two that carry numbers.
const DASHBOARD_COLUMNS: Array<{ key: string; width: number }> = [
  { key: 'row_id', width: 220 },
  { key: 'status', width: 150 },
  { key: 'allocated_resources', width: 250 },
  { key: 'live_stat', width: 250 },
  { key: 'disk_pct', width: 200 },
  { key: 'schedulable', width: 120 },
];

// TODO: Refactor this component with agent_nodes.
// ref: https://lablup.atlassian.net/browse/FR-1533
const ActiveAgents: React.FC<ActiveAgentsProps> = ({
  fetchKey,
  onChangeFetchKey,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isPendingRefetch, startRefetchTransition] = useTransition();

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
        extra={
          <BAIFetchKeyButton
            size="small"
            loading={isPendingRefetch}
            value=""
            onChange={(newFetchKey) => {
              startRefetchTransition(() => {
                onChangeFetchKey?.(newFetchKey);
              });
            }}
            type="text"
            style={{
              backgroundColor: 'transparent',
            }}
          />
        }
      />

      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          marginBottom: token.margin,
        }}
      >
        <AgentList
          fetchKey={fetchKey}
          onChangeFetchKey={onChangeFetchKey}
          headerProps={{
            style: { display: 'none' },
          }}
          tableProps={{
            pagination: {
              pageSize: 3,
              showSizeChanger: false,
            },
            customizeColumns: (baseColumns) =>
              _.compact(
                _.map(DASHBOARD_COLUMNS, ({ key, width }) => {
                  const column = _.find(baseColumns, { key });
                  return column ? { ...column, width } : undefined;
                }),
              ),
          }}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default ActiveAgents;
