/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCallback, useState } from 'react';

interface PromiseStatus<TData, TError> {
  pending: number;
  resolved: number;
  rejected: number;
  results: {
    resolved: TData[];
    rejected: TError[];
  };
}

const initialStatus = {
  pending: 0,
  resolved: 0,
  rejected: 0,
  results: {
    resolved: [],
    rejected: [],
  },
};

export function usePromiseTracker<TData = any, TError = Error>() {
  const [status, setStatus] =
    useState<PromiseStatus<TData, TError>>(initialStatus);

  const reset = useCallback(() => {
    setStatus(initialStatus);
  }, []);

  const trackPromise = useCallback(
    <T extends TData>(promise: Promise<T>): Promise<T> => {
      setStatus((prev) => ({
        ...prev,
        pending: prev.pending + 1,
      }));

      return promise
        .then((result) => {
          setStatus((prev) => ({
            ...prev,
            pending: prev.pending - 1,
            resolved: prev.resolved + 1,
            results: {
              ...prev.results,
              resolved: [...prev.results.resolved, result],
            },
          }));
          return result;
        })
        .catch((error: TError) => {
          setStatus((prev) => ({
            ...prev,
            pending: prev.pending - 1,
            rejected: prev.rejected + 1,
            results: {
              ...prev.results,
              rejected: [...prev.results.rejected, error],
            },
          }));
          throw error;
        });
    },
    [],
  );

  return {
    pendingCount: status.pending,
    resolvedCount: status.resolved,
    rejectedCount: status.rejected,
    results: status.results,
    trackPromise,
    reset,
  };
}
