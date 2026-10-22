/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The session-type step's fields (ADR 0013). The page writes none of them on a
// change (P-06, P-29, P-31 are render-time; H13 has no rule), so the slice holds
// them only so a `restored` event (P-21, P-22) replaces them.
import { defineSlice } from '../model';

export const SESSION_TYPE = ['sessionType'];
export const SESSION_NAME = ['sessionName'];
export const BOOTSTRAP_SCRIPT = ['bootstrap_script'];
export const REUSE_IF_EXISTS = ['reuseIfExists'];

export const sessionSlice = defineSlice({
  name: 'session',
  fields: [SESSION_TYPE, SESSION_NAME, BOOTSTRAP_SCRIPT, REUSE_IF_EXISTS],
  inputs: {},
  intents: {},
  rules: [],
});
