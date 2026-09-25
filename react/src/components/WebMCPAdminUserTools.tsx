/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { WebMCPAdminUserToolsFragment$key } from '../__generated__/WebMCPAdminUserToolsFragment.graphql';
import {
  openedItem,
  usePageReadTools,
  viewStateResult,
  visibleRowsResult,
  type PageToolColumn,
  type PageToolRow,
  type ViewParamValue,
} from '../helper/webmcpPageTools';
import {
  filterOutNullAndUndefined,
  toLocalId,
  useBAIWebMCPActive,
  type BAITableColumnOverrideRecord,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

/** `BAIAdminUserV2Table` columns that render a reported field. */
export const USER_TOOL_COLUMNS: ReadonlyArray<PageToolColumn> = [
  { key: 'email', fields: ['email'], required: true },
  { key: 'username', fields: ['username'] },
  { key: 'full_name', fields: ['fullName'] },
  { key: 'domain_name', fields: ['domainName'] },
  { key: 'system_role', fields: ['role'] },
  { key: 'resource_policy', fields: ['resourcePolicy'] },
  { key: 'main_access_key', fields: ['mainAccessKey'] },
  { key: 'status', fields: ['status'] },
  { key: 'status_info', fields: ['statusInfo'] },
  { key: 'created_at', fields: ['createdAt'] },
  { key: 'modified_at', fields: ['modifiedAt'] },
];

export interface WebMCPAdminUserToolsProps {
  usersFrgmt: WebMCPAdminUserToolsFragment$key;
  columnOverrides?: BAITableColumnOverrideRecord | null;
  page: number;
  pageSize: number;
  total?: number | null;
  /** The Users tab's URL params (`tab`, `status`, `filter`, `order`). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
  /** Relay id of the user whose detail or edit modal is open. */
  openedUserId?: string | null;
}

const AdminUserToolsRegistrar: React.FC<WebMCPAdminUserToolsProps> = ({
  usersFrgmt,
  columnOverrides,
  page,
  pageSize,
  total,
  viewParams,
  openedUserId,
}) => {
  'use memo';
  const { pathname } = useLocation();

  const users = useFragment(
    graphql`
      fragment WebMCPAdminUserToolsFragment on UserV2 @relay(plural: true) {
        id
        basicInfo {
          email
          fullName
          username
        }
        organization {
          domainName
          role
          resourcePolicy
          mainAccessKey
        }
        status {
          status
          statusInfo
        }
        timestamps {
          createdAt
          modifiedAt
        }
      }
    `,
    usersFrgmt,
  );

  const rows: Array<PageToolRow> = _.map(
    filterOutNullAndUndefined(users),
    (user) => ({
      id: toLocalId(user.id) ?? user.id,
      email: user.basicInfo?.email ?? null,
      username: user.basicInfo?.username ?? null,
      fullName: user.basicInfo?.fullName ?? null,
      domainName: user.organization?.domainName ?? null,
      role: user.organization?.role ?? null,
      resourcePolicy: user.organization?.resourcePolicy ?? null,
      mainAccessKey: user.organization?.mainAccessKey ?? null,
      status: user.status?.status ?? null,
      statusInfo: user.status?.statusInfo ?? null,
      createdAt: user.timestamps?.createdAt ?? null,
      modifiedAt: user.timestamps?.modifiedAt ?? null,
    }),
  );
  const list = visibleRowsResult({
    rows,
    columns: USER_TOOL_COLUMNS,
    columnOverrides,
    page,
    pageSize,
    total,
  });
  const openedId = openedUserId
    ? (toLocalId(openedUserId) ?? openedUserId)
    : null;

  usePageReadTools({
    noun: 'user',
    plural: 'users',
    rowFields:
      'Row fields: id (user UUID), email, username, fullName, domainName, role, resourcePolicy, mainAccessKey, status, statusInfo, createdAt, modifiedAt.',
    currentMeaning:
      'the user whose detail or edit modal is open; users have no deep link, so path is null',
    readRows: () => list,
    readViewState: () =>
      viewStateResult(pathname, { ...viewParams, current: page, pageSize }),
    readCurrent: () => openedItem(list.rows, openedId, null),
  });

  return null;
};

/**
 * `bai_list_visible_user`, `bai_get_user_filter` and `bai_get_current_user`
 * for the Users tab of the admin user page (ADR 0009).
 */
export const WebMCPAdminUserTools: React.FC<WebMCPAdminUserToolsProps> = (
  props,
) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <AdminUserToolsRegistrar {...props} /> : null;
};

/** The `keypair_list` item fields the Credentials tab renders. */
export interface KeypairToolSource {
  readonly access_key?: string | null;
  readonly user_id?: string | null;
  readonly full_name?: string | null;
  readonly is_admin?: boolean | null;
  readonly created_at?: string | null;
  readonly last_used?: string | null;
  readonly resource_policy?: string | null;
  readonly rate_limit?: number | null;
  readonly num_queries?: number | null;
  readonly concurrency_used?: number | null;
}

export interface WebMCPAdminKeypairToolsProps {
  keypairs: ReadonlyArray<KeypairToolSource | null | undefined>;
  page: number;
  pageSize: number;
  total?: number | null;
  /** The Credentials tab's URL params (`tab`, `activeType`, `filter`, `order`). */
  viewParams: Readonly<Record<string, ViewParamValue>>;
  /** Access key of the keypair whose info or edit modal is open. */
  openedAccessKey?: string | null;
}

const AdminKeypairToolsRegistrar: React.FC<WebMCPAdminKeypairToolsProps> = ({
  keypairs,
  page,
  pageSize,
  total,
  viewParams,
  openedAccessKey,
}) => {
  'use memo';
  const { pathname } = useLocation();

  // The Credentials table has no column settings: every column is shown.
  const rows: Array<PageToolRow> = _.map(
    filterOutNullAndUndefined(keypairs),
    (keypair) => ({
      id: keypair.access_key ?? '',
      userId: keypair.user_id ?? null,
      fullName: keypair.full_name ?? null,
      isAdmin: keypair.is_admin ?? null,
      createdAt: keypair.created_at ?? null,
      lastUsed: keypair.last_used ?? null,
      resourcePolicy: keypair.resource_policy ?? null,
      rateLimit: keypair.rate_limit ?? null,
      numQueries: keypair.num_queries ?? null,
      concurrencyUsed: keypair.concurrency_used ?? null,
    }),
  );
  const list = visibleRowsResult({ rows, page, pageSize, total });

  usePageReadTools({
    noun: 'keypair',
    plural: 'keypairs',
    rowFields:
      'Row fields: id (access key), userId (the owner email), fullName, isAdmin, createdAt, lastUsed, resourcePolicy, rateLimit, numQueries, concurrencyUsed.',
    currentMeaning:
      'the keypair whose info or edit modal is open; keypairs have no deep link, so path is null',
    readRows: () => list,
    readViewState: () =>
      viewStateResult(pathname, { ...viewParams, current: page, pageSize }),
    readCurrent: () => openedItem(list.rows, openedAccessKey, null),
  });

  return null;
};

/**
 * `bai_list_visible_keypair`, `bai_get_keypair_filter` and
 * `bai_get_current_keypair` for the Credentials tab of the admin user page
 * (ADR 0009).
 */
export const WebMCPAdminKeypairTools: React.FC<WebMCPAdminKeypairToolsProps> = (
  props,
) => {
  'use memo';
  const isActive = useBAIWebMCPActive();
  return isActive ? <AdminKeypairToolsRegistrar {...props} /> : null;
};
