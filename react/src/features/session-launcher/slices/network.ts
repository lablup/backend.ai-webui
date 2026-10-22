/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The network step's field (ADR 0013). N-01 is a `Form.Item` rule, not a
// write, so the slice holds `ports` only so a `restored` event replaces it.
import { defineSlice } from '../model';

export const PORTS = ['ports'];

export const networkSlice = defineSlice({
  name: 'network',
  fields: [PORTS],
  inputs: {},
  intents: {},
  rules: [],
});
