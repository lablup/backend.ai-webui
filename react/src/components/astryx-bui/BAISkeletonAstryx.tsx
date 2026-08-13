/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Moved into backend.ai-ui as `BAISkeleton` (FR-3513) so BUI components — e.g.
 `BAIModal`'s loading body — can share it. This alias keeps the existing
 astryx-bui call sites compiling; new code imports `BAISkeleton` from
 'backend.ai-ui' directly.
*/
export type {
  BAISkeletonProps as BAISkeletonAstryxProps,
  BAISkeletonSize,
  BAISkeletonVariant,
} from 'backend.ai-ui';
export { BAISkeleton as default } from 'backend.ai-ui';
