export type BAIInteractiveLoginFailureReason = 'no_endpoint' | 'invalid_callback' | 'cors_or_mixed' | 'timeout' | 'http_error' | 'invalid_response' | 'no_session' | 'no_session_id' | 'relay_failed';
export interface BAIInteractiveLoginFailure {
    reason: BAIInteractiveLoginFailureReason;
    status?: number;
}
export type BAIInteractiveLoginProbeResult = {
    ok: true;
    sessionId: string;
} | ({
    ok: false;
} & BAIInteractiveLoginFailure);
export declare const BAI_INTERACTIVE_LOGIN_DEFAULT_TIMEOUT_MS = 10000;
/**
 * Returns the webserver base as an absolute URL whose path ends with `/`, so a
 * webserver mounted under a path prefix (`https://host/bai/`) keeps that prefix
 * when relative segments are resolved against it. `null` means the caller has
 * no usable endpoint (`no_endpoint`).
 */
export declare const normalizeWebserverUrl: (raw: string | null | undefined) => string | null;
/**
 * The provider page navigates to the callback with a bare
 * `window.location.href = callback`, so only an absolute http(s) URL is ever
 * forwarded — a `javascript:` or `data:` value would execute there.
 */
export declare const resolveCallbackUrl: (callbackUrl: string | null | undefined, documentUrl?: string | null | undefined) => string | null;
export interface BuildInteractiveLoginUrlOptions {
    webserverUrl: string;
    appName: string;
    callbackUrl?: string;
}
/**
 * `<webserver>/interactive-login?name=…&callback=…`, or `null` when either
 * the webserver URL or the callback is unusable (see `resolveCallbackUrl`).
 */
export declare const buildInteractiveLoginUrl: ({ webserverUrl, appName, callbackUrl, }: BuildInteractiveLoginUrlOptions) => string | null;
export declare const classifyFetchError: (error: unknown) => Extract<BAIInteractiveLoginFailureReason, "timeout" | "cors_or_mixed">;
/**
 * The webserver answers `{ authenticated, data, session_id }`; only
 * `authenticated` and `session_id` are read.
 */
export declare const classifyLoginCheckResponse: (body: unknown) => BAIInteractiveLoginProbeResult;
export interface ProbeLoginCheckOptions {
    webserverUrl: string;
    timeoutMs?: number;
}
export declare const probeLoginCheck: ({ webserverUrl, timeoutMs, }: ProbeLoginCheckOptions) => Promise<BAIInteractiveLoginProbeResult>;
export interface UseBAIInteractiveLoginOptions {
    webserverUrl: string;
    appName: string;
    callbackUrl?: string;
    timeoutMs?: number;
}
export interface UseBAIInteractiveLoginResult {
    probe: () => Promise<BAIInteractiveLoginProbeResult>;
    /** Navigates away, or returns the reason it could not. */
    redirectToInteractiveLogin: () => BAIInteractiveLoginFailureReason | null;
    reportFailure: (reason: BAIInteractiveLoginFailureReason, status?: number) => void;
    isProbing: boolean;
    failure: BAIInteractiveLoginFailure | null;
    interactiveLoginUrl: string | null;
}
declare const useBAIInteractiveLogin: ({ webserverUrl, appName, callbackUrl, timeoutMs, }: UseBAIInteractiveLoginOptions) => UseBAIInteractiveLoginResult;
export default useBAIInteractiveLogin;
