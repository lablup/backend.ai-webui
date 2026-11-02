import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIOverlayScrollbarProps {
    /** The scroll container this thumb tracks. */
    targetRef: React.RefObject<HTMLElement | null>;
}
/**
 * Overlay scrollbar for a scroll column. On pointer-driven platforms the
 * native bar is hidden on the target and this thumb is painted OVER the
 * content instead, so scrollability never changes the content width —
 * `overflow: overlay` is gone from Chromium, and `scrollbar-gutter: stable`
 * leaves a permanently empty strip. The thumb stays visible the whole time the
 * content is scrollable, so its presence is the scrollability cue, and it can
 * be dragged. All updates write straight to the DOM — no React state, so
 * scrolling stays out of the render loop.
 *
 * Contract: render it inside the target's POSITIONED ancestor (the track is
 * `position: absolute`). On touch-primary platforms it renders `null` and
 * leaves the native indicator alone.
 */
declare const BAIOverlayScrollbar: React.FC<BAIOverlayScrollbarProps>;
export default BAIOverlayScrollbar;
