/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import {
  checkCspConnectSrc,
  checkCspScriptSrc,
  checkCspStyleSrc,
  checkCspWsConnectSrc,
} from '../diagnostics/rules/cspRules';
import type { DiagnosticResult } from '../types/diagnostics';
import { useProxyUrl } from './useWebUIConfig';
import { useMemo } from 'react';

/**
 * Hook that checks CSP directives: connect-src, script-src, style-src.
 * Synchronous — no suspense needed.
 */
export function useCspDiagnostics(): DiagnosticResult[] {
  'use memo';

  const baiClient = useSuspendedBackendaiClient();
  const proxyUrl = useProxyUrl();

  return useMemo(() => {
    const cspMeta = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]',
    );
    const cspContent = cspMeta?.getAttribute('content') ?? null;
    const apiEndpoint: string = baiClient?._config?.endpoint ?? '';

    const results: DiagnosticResult[] = [];

    if (!cspContent) {
      results.push({
        id: 'csp-not-set',
        severity: 'passed',
        titleKey: 'diagnostics.CspNotSet',
        descriptionKey: 'diagnostics.CspNotSetDesc',
      });
      return results;
    }

    const pageOrigin = globalThis.location?.origin;

    // Check connect-src for API endpoint
    const apiCheck = checkCspConnectSrc(cspContent, apiEndpoint, pageOrigin);
    if (apiCheck) {
      results.push(apiCheck);
    } else if (apiEndpoint) {
      results.push({
        id: 'csp-connect-src-api-passed',
        severity: 'passed',
        titleKey: 'diagnostics.CspApiEndpointAllowed',
        descriptionKey: 'diagnostics.CspApiEndpointAllowedDesc',
        interpolationValues: { endpoint: apiEndpoint },
      });
    }

    // Check connect-src for WebSocket proxy
    const wsCheck = checkCspWsConnectSrc(cspContent, proxyUrl, pageOrigin);
    if (wsCheck) {
      results.push(wsCheck);
    } else if (proxyUrl) {
      results.push({
        id: 'csp-connect-src-ws-passed',
        severity: 'passed',
        titleKey: 'diagnostics.CspWsProxyAllowed',
        descriptionKey: 'diagnostics.CspWsProxyAllowedDesc',
        interpolationValues: { proxyUrl },
      });
    }

    // Check script-src allows loading app scripts
    const scriptCheck = checkCspScriptSrc(cspContent);
    if (scriptCheck) {
      results.push(scriptCheck);
    } else {
      results.push({
        id: 'csp-script-src-passed',
        severity: 'passed',
        titleKey: 'diagnostics.CspScriptSrcPassed',
        descriptionKey: 'diagnostics.CspScriptSrcPassedDesc',
      });
    }

    // Check style-src allows inline styles (required by antd)
    const styleCheck = checkCspStyleSrc(cspContent);
    if (styleCheck) {
      results.push(styleCheck);
    } else {
      results.push({
        id: 'csp-style-src-passed',
        severity: 'passed',
        titleKey: 'diagnostics.CspStyleSrcPassed',
        descriptionKey: 'diagnostics.CspStyleSrcPassedDesc',
      });
    }

    return results;
  }, [baiClient?._config?.endpoint, proxyUrl]);
}
