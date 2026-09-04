/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * `checkVisibility` where the browser has it — with the `visibility`
 * property, which the bare call ignores; jsdom falls back to markup.
 */
export declare function isVisible(el: HTMLElement): boolean;
/** `scrollIntoView` with antd's `nearest` default; reduced motion wins over `smooth`. */
export declare function scrollIntoView(el: HTMLElement, options?: ScrollIntoViewOptions): void;
