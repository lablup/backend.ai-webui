/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Landing the user on the first invalid field after a failed submit (FR-3683).

 Reads the DOM and nothing else. The store owns values and validation state;
 moving the viewport is a view concern, so `<Form>` calls this from
 `onFinishFailed` and the store never learns that scrolling exists.

 Items are found by `data-bai-form-item-id`, the id `FormItem` computes for
 the field, stamped on the item's wrapper. The CONTROL's `id` is not usable
 for this: Astryx inputs overwrite whatever `id` they receive with their own
 `useId()`, so `document.getElementById(fieldId)` never matches one.
 */
const CONTROL_SELECTOR = '[data-bai-form-item-control]';

/** What counts as "the user is editing this" — buttons deliberately excluded. */
const EDITED_CONTROL_SELECTOR = [
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="radio"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="textbox"]',
].join(',');

const FOCUSABLE_SELECTOR = [
  EDITED_CONTROL_SELECTOR,
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface ScrollToFirstErrorOptions extends ScrollIntoViewOptions {
  /** Move focus as well as the viewport. On unless set to `false`. */
  focus?: boolean;
}

/**
 * Never pull focus out of a control the user is already in: a radio group
 * revalidates on every arrow key, and moving focus mid-edit also drops an IME
 * composition. A button is not such a control even when a layout-only
 * `Form.Item` wraps it, so the submit-and-focus-the-bad-field path still works.
 */
function isEditing(active: Element | null | undefined): boolean {
  return !!active && active.matches(EDITED_CONTROL_SELECTOR);
}

function prefersReducedMotion(): boolean {
  return !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The first of the given items in DOCUMENT order. `errorFields` arrives in
 * field REGISTRATION order, which disagrees whenever a group mounts
 * conditionally — `DeploymentAddRevisionModal` hand-rolled a DOM walk for
 * exactly that reason, and this is what lets it stop.
 */
export function findFirstErrorItem(
  root: ParentNode,
  fieldIds: readonly string[],
): HTMLElement | undefined {
  const wanted = new Set(fieldIds);
  for (const item of root.querySelectorAll<HTMLElement>(
    '[data-bai-form-item-id]',
  )) {
    if (wanted.has(item.getAttribute('data-bai-form-item-id')!)) return item;
  }
  return undefined;
}

export function scrollToErrorItem(
  item: HTMLElement,
  { focus = true, ...scrollOptions }: ScrollToFirstErrorOptions = {},
): void {
  // `nearest` (antd's default) does nothing when the item is already fully in
  // view, where `center` would re-centre it for no reason. The target is the
  // whole item, so the label and the message come along with the control.
  // Optional call: jsdom ships no `scrollIntoView`.
  item.scrollIntoView?.({
    behavior: 'smooth',
    block: 'nearest',
    ...scrollOptions,
    // After the caller's options: a stated `behavior` must not out-rank the
    // user's OS-level reduced-motion preference.
    ...(prefersReducedMotion() ? { behavior: 'auto' as const } : null),
  });

  if (!focus || isEditing(item.ownerDocument?.activeElement)) return;
  const scope = item.querySelector<HTMLElement>(CONTROL_SELECTOR) ?? item;
  // `preventScroll` so the browser's own focus scroll does not fight the
  // smooth one above and land the field somewhere else.
  scope.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus?.({
    preventScroll: true,
  });
}
