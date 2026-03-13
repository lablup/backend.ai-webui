/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '.';
import { isPlaceholder } from '../diagnostics/rules/configRules';
import {
  checkCspConnectSrc,
  checkCspFrameSrc,
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
        category: 'csp',
        titleKey: 'diagnostics.CspNotSet',
        descriptionKey: 'diagnostics.CspNotSetDesc',
      });
      return results;
    }

    const pageOrigin = globalThis.location?.origin;

    // Check connect-src for API endpoint (skip placeholders)
    if (!isPlaceholder(apiEndpoint)) {
      const apiCheck = checkCspConnectSrc(cspContent, apiEndpoint, pageOrigin);
      if (apiCheck) {
        results.push(apiCheck);
      } else if (apiEndpoint) {
        results.push({
          id: 'csp-connect-src-api-passed',
          severity: 'passed',
          category: 'csp',
          titleKey: 'diagnostics.CspApiEndpointAllowed',
          descriptionKey: 'diagnostics.CspApiEndpointAllowedDesc',
          interpolationValues: { endpoint: apiEndpoint },
        });
      }
    }

    // Check connect-src for WebSocket proxy (skip placeholders)
    if (!isPlaceholder(proxyUrl)) {
      const wsCheck = checkCspWsConnectSrc(cspContent, proxyUrl, pageOrigin);
      if (wsCheck) {
        results.push(wsCheck);
      } else if (proxyUrl) {
        results.push({
          id: 'csp-connect-src-ws-passed',
          severity: 'passed',
          category: 'csp',
          titleKey: 'diagnostics.CspWsProxyAllowed',
          descriptionKey: 'diagnostics.CspWsProxyAllowedDesc',
          interpolationValues: { proxyUrl },
        });
      }
    }

    // Check script-src allows loading app scripts
    const scriptCheck = checkCspScriptSrc(cspContent);
    if (scriptCheck) {
      results.push(scriptCheck);
    } else {
      results.push({
        id: 'csp-script-src-passed',
        severity: 'passed',
        category: 'csp',
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
        category: 'csp',
        titleKey: 'diagnostics.CspStyleSrcPassed',
        descriptionKey: 'diagnostics.CspStyleSrcPassedDesc',
      });
    }

    // Check frame-src allows API endpoint for iframe embedding (skip placeholders)
    if (!isPlaceholder(apiEndpoint)) {
      const frameSrcCheck = checkCspFrameSrc(
        cspContent,
        apiEndpoint,
        pageOrigin,
      );
      if (frameSrcCheck) {
        results.push(frameSrcCheck);
      } else if (apiEndpoint) {
        results.push({
          id: 'csp-frame-src-passed',
          severity: 'passed',
          category: 'csp',
          titleKey: 'diagnostics.CspFrameSrcPassed',
          descriptionKey: 'diagnostics.CspFrameSrcPassedDesc',
          interpolationValues: { endpoint: apiEndpoint },
        });
      }
    }

    return results;
  }, [baiClient?._config?.endpoint, proxyUrl]);
}
