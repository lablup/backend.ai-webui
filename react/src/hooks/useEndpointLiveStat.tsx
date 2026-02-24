/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAILogger } from 'backend.ai-ui';
import _ from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

export interface GaugeMetric {
  __type: 'GAUGE';
  current: string;
  capacity: string | null;
  pct: string;
  unit_hint: string;
}

export interface CounterMetric {
  __type: 'COUNTER' | 'ACCUMULATION';
  current: string;
  capacity: string | null;
  pct: string;
  unit_hint: string;
}

export interface HistogramMetric {
  __type: 'HISTOGRAM';
  current: Record<string, string>;
  threshold_unit: string;
  count?: number;
  sum?: string;
}

export type InferenceMetric = GaugeMetric | CounterMetric | HistogramMetric;
export type EndpointLiveStat = Record<string, InferenceMetric>;

export interface TimeSeriesDataPoint {
  timestamp: number;
  metrics: EndpointLiveStat;
}

const useEndpointLiveStatQuery = graphql`
  query useEndpointLiveStatQuery($endpointId: UUID!) {
    endpoint(endpoint_id: $endpointId) {
      live_stat @since(version: "24.12.0")
    }
  }
`;

export const useEndpointLiveStat = (
  endpointId: string,
  enabled: boolean,
  pollingInterval: number = 3000,
) => {
  'use memo';
  const { logger } = useBAILogger();
  const environment = useRelayEnvironment();
  const [currentStat, setCurrentStat] = useState<EndpointLiveStat | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStat = useCallback(() => {
    if (!endpointId || !enabled) return;

    setIsLoading(true);
    fetchQuery(environment, useEndpointLiveStatQuery, {
      endpointId,
    }).subscribe({
      next: (data: any) => {
        try {
          const liveStatStr = data?.endpoint?.live_stat;
          if (!liveStatStr) {
            setIsLoading(false);
            return;
          }
          const parsed: EndpointLiveStat = JSON.parse(liveStatStr);
          setCurrentStat(parsed);
          setTimeSeries((prev) => {
            const newPoint: TimeSeriesDataPoint = {
              timestamp: Date.now(),
              metrics: parsed,
            };
            const updated = [...prev, newPoint];
            // Keep last 30 data points
            return updated.slice(-30);
          });
        } catch (e) {
          logger.error('Failed to parse endpoint live_stat:', e);
        }
        setIsLoading(false);
      },
      error: (error: any) => {
        logger.error('Failed to fetch endpoint live_stat:', error);
        setIsLoading(false);
      },
    });
  }, [endpointId, enabled, environment, logger]);

  useEffect(() => {
    if (!enabled || !endpointId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up polling (first tick triggers the initial fetch)
    intervalRef.current = setInterval(fetchStat, pollingInterval);
    // Schedule initial fetch outside of the synchronous effect body
    const initialTimeout = setTimeout(fetchStat, 0);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, endpointId, pollingInterval, fetchStat]);

  const metricNames = _.keys(currentStat ?? {});

  return { currentStat, timeSeries, metricNames, isLoading };
};
