/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSyncExternalStore } from 'react';

// API keys for custom (non-Backend.AI) endpoints live here, keyed by chat
// panel id, and never in the localStorage chat history. sessionStorage
// survives a reload but not the tab, so a persisted history entry comes back
// with its URL and asks for the key again.
const STORAGE_KEY = 'backendaiwebui.session.chat_custom_endpoint_keys';

type KeyMap = Record<string, string>;

const listeners = new Set<() => void>();

function read(): KeyMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

let snapshot: KeyMap = read();

function write(next: KeyMap) {
  snapshot = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode, quota); keep the in-memory copy.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCustomEndpointApiKey(chatId: string): string | undefined {
  return snapshot[chatId] || undefined;
}

export function setCustomEndpointApiKey(chatId: string, apiKey?: string) {
  const next = { ...snapshot };
  if (apiKey) {
    next[chatId] = apiKey;
  } else {
    delete next[chatId];
  }
  write(next);
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
    () => snapshot[chatId] || undefined,
    () => undefined,
  );
}
