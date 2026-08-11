/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 antd `App.useApp()` shim — react-app entry (to-astryx ticket 11).

 The shim core moved to `packages/backend.ai-ui/src/app-shim/` so BUI (a
 separate workspace package that cannot import from react/src) shares one
 implementation. This module only re-exports it: react/src files the
 ticket-11 codemod pointed at `../app-shim` keep working unchanged, and the
 codemod keeps targeting this directory for react/src files.
 */
export {
  App,
  useApp,
  message,
  modal,
  BAIAppProvider,
  type AppShimApi,
  type BAIAppProviderProps,
  type MessageApi,
  type ModalApi,
  type AppShimMessageConfig,
  type JointContent,
  type MessageArgsProps,
  type MessageKind,
  type MessageType,
  type ModalKind,
  type ModalShimFuncProps,
  type ModalShimReturn,
} from 'backend.ai-ui';
