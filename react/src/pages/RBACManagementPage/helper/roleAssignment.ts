/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

// `BulkAssignRoleError` carries no reason code, so "already holds the role" is
// recognised by the manager's message; anything unrecognised stays a failure.
const ALREADY_ASSIGNED_MESSAGE = /is already assigned to user/;

/** Whether a `BulkAssignRoleError` only says the user already holds the role. */
export const isAlreadyAssignedFailure = (failure: { message: string }) =>
  ALREADY_ASSIGNED_MESSAGE.test(failure.message);
