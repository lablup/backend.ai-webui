/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { manualSectionURL, type ManualSection } from './manualSearch';

/** The built-in profile in `resources/ai-agents.json`; its system prompt is the assistant's. */
export const WEBUI_ASSISTANT_AGENT_ID = 'webui-assistant';
/** `userConfig` key holding each user's own connection. */
export const WEBUI_ASSISTANT_CONFIG_KEY = 'webuiAssistant';
/** `customEndpointKeyStore` id of the assistant's API key, which stays in memory. */
export const WEBUI_ASSISTANT_KEY_ID = 'webui-assistant';
/** Where the user manual's Markdown is served (`scripts/copy-manual.mjs`). */
export const MANUAL_RESOURCE_BASE = 'resources/manual/';

/** An OpenAI-compatible endpoint, picked from a deployment or typed in; the key is not saved. */
export interface WebUIAssistantConnection {
  /** OpenAI base URL, ending in `/v1` for a deployment. */
  baseURL: string;
  /** Set when the endpoint is a Backend.AI deployment. */
  deploymentId?: string;
  /** The endpoint needs a key, so after a reload the user connects again. */
  hasApiKey?: boolean;
}

export const WEBUI_ASSISTANT_EXCERPT_COUNT = 5;
// ~1,800 chars ≈ 450–900 tokens per excerpt keeps five excerpts inside an 8k window.
const MAX_EXCERPT_CHARS = 1800;

export interface AssistantPageContext {
  /** WebUI route path, e.g. `/project/default/session`. */
  path: string;
  /** Manual page the help button opens for this route. */
  manualURL: string;
}

export function buildAssistantSystemPrompt({
  basePrompt,
  page,
  excerpts,
  manualBaseURL,
}: {
  basePrompt: string;
  page?: AssistantPageContext;
  /** `null` when the manual could not be loaded. */
  excerpts: ManualSection[] | null;
  manualBaseURL: string;
}): string {
  const parts = [basePrompt.trim()];
  if (page) {
    parts.push(
      `## Current page\nWebUI path: ${page.path}\nManual page: ${page.manualURL}`,
    );
  }
  parts.push(
    excerpts === null
      ? '## Manual excerpts\n(The manual is not available right now. Answer without manual references and do not claim the manual lacks the topic.)'
      : excerpts.length === 0
        ? '## Manual excerpts\n(No manual section matched this question.)'
        : [
            '## Manual excerpts',
            ...excerpts.map((section, i) => {
              const text =
                section.text.length > MAX_EXCERPT_CHARS
                  ? `${section.text.slice(0, MAX_EXCERPT_CHARS)}…`
                  : section.text;
              return `### [${i + 1}] ${section.pageTitle} › ${section.heading}\nURL: ${manualSectionURL(manualBaseURL, section)}\n\n${text}`;
            }),
          ].join('\n\n'),
  );
  return parts.join('\n\n');
}

/** Splits `https://…/<lang>/<page>.html#<anchor>` into the section key it points at. */
export function parseManualTarget(
  url: string,
): { page: string; anchor?: string } | null {
  const match = /\/([^/#?]+)\.html(?:#([^?]*))?$/.exec(url);
  return match ? { page: match[1], anchor: match[2] || undefined } : null;
}
