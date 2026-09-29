/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSyncExternalStore } from 'react';

// API keys for custom (non-Backend.AI) endpoints, keyed by chat panel id.
// Memory only: never written to Web Storage, so a reload asks for the key again.
let keys: Record<string, string> = {};

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCustomEndpointApiKey(chatId: string): string | undefined {
  return keys[chatId] || undefined;
}

export function setCustomEndpointApiKey(chatId: string, apiKey?: string) {
  const next = { ...keys };
  if (apiKey) {
    next[chatId] = apiKey;
  } else {
    delete next[chatId];
  }
  keys = next;
  listeners.forEach((listener) => listener());
}

export function copyCustomEndpointApiKey(fromChatId: string, toChatId: string) {
  const apiKey = getCustomEndpointApiKey(fromChatId);
  if (apiKey) {
    setCustomEndpointApiKey(toChatId, apiKey);
  }
}

export function useCustomEndpointApiKey(chatId: string) {
  return useSyncExternalStore(
    subscribe,
    () => keys[chatId] || undefined,
    () => undefined,
  );
}
