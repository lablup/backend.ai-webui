/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * React hooks for accessing the global Backend.AI stores.
 *
 * These hooks provide typed access to the singleton store instances
 * that are created in `global-stores.ts`. They are thin wrappers
 * that return the singleton directly; no Context provider is needed
 * because the underlying objects are module-level singletons.
 *
 * During the migration period the same instances are also available
 * on globalThis, but React code should prefer these hooks for type
 * safety and to make future refactoring easier.
 */
import {
  backendaiOptions,
  backendaiMetadata,
  backendaiTasker,
  backendaiUtils,
} from '../global-stores';

/**
 * Returns the BackendAISettingsStore instance.
 *
 * Wraps localStorage with typed getters/setters for user and general
 * settings (e.g. language, desktop notifications, beta features).
 */
export const useBackendAISettingsStore = () => backendaiOptions;

/**
 * Returns the BackendAIMetadataStore instance.
 *
 * Holds metadata about the connected Backend.AI cluster such as
 * image info, tag aliases, kernel labels and device info.
 */
export const useBackendAIMetadataStore = () => backendaiMetadata;

/**
 * Returns the BackendAITasker instance.
 *
 * Manages background task state: adding, removing and garbage-
 * collecting tasks, and dispatching notification events.
 */
export const useBackendAITasker = () => backendaiTasker;

/**
 * Returns the BackendAICommonUtils instance.
 *
 * Provides utility functions such as reading/writing the recent
 * project group, file-size formatting, string masking, etc.
 */
export const useBackendAICommonUtils = () => backendaiUtils;
