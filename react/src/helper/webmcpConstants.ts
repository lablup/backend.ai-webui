/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/** Search param marking a launcher URL opened by `bai_prepare_session`. */
export const AGENT_PREFILL_PARAM = 'agentPrefill';

/** A `webui_url` longer than this gets a warning. Below the 8 KB request line of default aiohttp and nginx; not measured on a deployment. */
export const WEBUI_URL_SOFT_LIMIT = 6000;
