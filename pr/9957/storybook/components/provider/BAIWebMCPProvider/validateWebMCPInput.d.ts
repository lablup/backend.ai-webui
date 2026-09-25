import { WebMCPErrorResult, WebMCPInputIssue, WebMCPInputSchema } from './types';
export type WebMCPInputValidation = {
    ok: true;
    value: Record<string, unknown>;
} | {
    ok: false;
    issues: Array<WebMCPInputIssue>;
};
/**
 * Checks tool input against a flat `WebMCPInputSchema`. Browsers do not
 * enforce `inputSchema`, so every tool runs its input through this first.
 * `undefined`/`null` input counts as `{}`; a JSON string is parsed.
 */
export declare const validateWebMCPInput: (schema: WebMCPInputSchema, input: unknown) => WebMCPInputValidation;
/** The structured error a tool returns instead of throwing. */
export declare const webMCPError: (code: string, message: string, issues?: ReadonlyArray<WebMCPInputIssue>) => WebMCPErrorResult;
export declare const webMCPInvalidInput: (issues: ReadonlyArray<WebMCPInputIssue>) => WebMCPErrorResult;
