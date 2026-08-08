/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx TICKET 25 probe orchestrator — lives under `react/src` (not
 `theme-probe/`) because Relay only compiles `graphql` tags inside the
 configured source roots (`relay.config.js` -> `react/src`). The theme-probe
 harness page (`react/theme-probe/table25.tsx`) mounts these against a
 relay-test-utils mock environment; they render nothing in the app itself.

 Each case exercises a different corner of the Astryx-native `BAITableAstryx`:

   users       BAIUserNodes  — sorting, resize, row selection, column settings,
                               CSV export, pagination bar
   scheduling  BAISchedulingHistoryTable — controlled `expandable` with a
                               nested `BAISubStepNodes` table in the detail row
*/
import type { TableAstryxProbeSchedulingQuery } from '../__generated__/TableAstryxProbeSchedulingQuery.graphql';
import type { TableAstryxProbeUsersQuery } from '../__generated__/TableAstryxProbeUsersQuery.graphql';
import {
  BAISchedulingHistoryTable,
  BAITableColumnOverrideRecord,
  BAIUserNodes,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export const TableProbeUsers: React.FC = () => {
  'use memo';
  const data = useLazyLoadQuery<TableAstryxProbeUsersQuery>(
    graphql`
      query TableAstryxProbeUsersQuery {
        user_nodes(first: 10, offset: 0) {
          edges {
            node {
              ...BAIUserNodesFragment
            }
          }
        }
      }
    `,
    {},
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<React.Key>>([]);
  const [order, setOrder] = useState<string | null>('-created_at');
  const [columnOverrides, setColumnOverrides] =
    useState<BAITableColumnOverrideRecord>({});

  const users = _.compact(_.map(data.user_nodes?.edges, 'node'));

  return (
    <div style={{ padding: 24 }}>
      <BAIUserNodes
        usersFrgmt={users}
        order={order}
        onChangeOrder={(next) => setOrder(next)}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        exportSettings={{
          supportedFields: ['email', 'username'],
          onExport: async () => undefined,
        }}
        pagination={{ current: 1, pageSize: 10, total: 42 }}
      />
    </div>
  );
};

export const TableProbeScheduling: React.FC = () => {
  'use memo';
  const data = useLazyLoadQuery<TableAstryxProbeSchedulingQuery>(
    graphql`
      query TableAstryxProbeSchedulingQuery {
        sessionScopedSchedulingHistories(
          scope: { sessionId: "probe-session" }
          limit: 5
          offset: 0
        ) {
          count
          edges {
            node {
              ...BAISchedulingHistoryTableFragment
            }
          }
        }
      }
    `,
    {},
  );
  const [columnOverrides, setColumnOverrides] =
    useState<BAITableColumnOverrideRecord>({});

  return (
    <div style={{ padding: 24 }}>
      <BAISchedulingHistoryTable
        resizable
        expandMode="expand-all"
        schedulingHistoryFrgmt={_.compact(
          _.map(data.sessionScopedSchedulingHistories?.edges, 'node'),
        )}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        pagination={{
          current: 1,
          pageSize: 10,
          total: data.sessionScopedSchedulingHistories?.count ?? 0,
        }}
      />
    </div>
  );
};
