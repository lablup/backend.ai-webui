/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';

export type StatusDataPredicate = {
  name: string;
  msg: string;
};

export type StatusDataErrorCollection = {
  name: string;
  repr: string;
  src: string;
  agent_id?: string;
  traceback?: string;
};

export type SessionStatusData = {
  kernel?: {
    exit_code: number | string;
  };
  session?: {
    status: string;
  };
  scheduler?: {
    failed_predicates: Array<StatusDataPredicate>;
    passed_predicates: Array<StatusDataPredicate>;
    retries: number;
    last_try: string;
    msg?: string;
  };
  error?: {
    name: string;
    repr: string;
    src: string;
    collection: Array<StatusDataErrorCollection>;
  };
};

/**
 * `status_data` is a JSON-encoded string the manager may also send as an empty
 * or `null` sentinel. Returns `null` for anything that carries no object.
 */
export const parseSessionStatusData = (
  rawStatusData?: string | null,
): SessionStatusData | null => {
  const raw = rawStatusData?.trim();
  if (!raw || raw === 'null' || raw === '{}') {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!_.isPlainObject(parsed) || _.isEmpty(parsed)) {
    return null;
  }
  return parsed as SessionStatusData;
};

/**
 * The modal renders a scheduler section only through `last_try`, `retries`,
 * `msg` and the two predicate lists, so a payload carrying none of them (e.g.
 * `{"scheduler":{"foo":"bar"}}`) would emit a bogus date and empty rows.
 */
export const hasRenderableScheduler = (
  scheduler: SessionStatusData['scheduler'],
): boolean => {
  if (_.isEmpty(scheduler)) {
    return false;
  }
  return (
    !_.isEmpty(scheduler.last_try) ||
    // `retries: 0` is real information, so nil rather than falsy.
    !_.isNil(scheduler.retries) ||
    !_.isEmpty(scheduler.msg) ||
    !_.isEmpty(scheduler.failed_predicates) ||
    !_.isEmpty(scheduler.passed_predicates)
  );
};

const hasRenderableError = (error: SessionStatusData['error']): boolean => {
  if (_.isEmpty(error)) {
    return false;
  }
  // The modal falls back to the payload itself when `collection` is absent,
  // so only an explicitly empty collection means "nothing to show".
  return _.isArray(error.collection)
    ? !_.isEmpty(error.collection)
    : !_.isEmpty(error.name) || !_.isEmpty(error.repr);
};

/**
 * Whether `status_data` holds at least one section `SessionStatusDetailModal`
 * can render. A payload that parses but renders nothing (e.g.
 * `{"error":{"collection":[]}}`) would otherwise open an empty modal.
 */
export const hasRenderableSessionStatusData = (
  rawStatusData?: string | null,
): boolean => {
  const statusData = parseSessionStatusData(rawStatusData);
  if (!statusData) {
    return false;
  }
  return (
    !_.isNil(statusData.kernel?.exit_code) ||
    !_.isEmpty(statusData.session?.status) ||
    hasRenderableScheduler(statusData.scheduler) ||
    hasRenderableError(statusData.error)
  );
};
