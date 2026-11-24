/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/** A card table's `scroll`: no `x`, so its columns share the card's width and truncate instead of scrolling sideways. */
export const FIT_CARD_WIDTH: { x?: undefined; y?: undefined } = {};

/** Rows that fit, with the header and the pager, in a table card's default three board rows (96px each). */
export const CARD_TABLE_PAGE_SIZE = 4;
