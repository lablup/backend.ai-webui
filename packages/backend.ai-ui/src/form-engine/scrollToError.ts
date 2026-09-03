/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Landing the user on the first invalid field after a failed submit (FR-3683).

 Reads the DOM and nothing else. The store owns values and validation state;
 moving the viewport is a view concern, so `<Form>` calls this from
 `onFinishFailed` and the store never learns that scrolling exists.

 The anchor is the item's own `data-status="error"`, not the failing field's
 name: `FormItem` merges a `noStyle` child's errors into its parent's status
 (FormItem.tsx), so a child that renders no wrapper of its own is still
 reachable through the wrapper that shows its message.
 */
const ERROR_ITEM_SELECTOR = '[data-bai-form-item][data-status="error"]';
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
 * A wizard keeps every step MOUNTED and hides the inactive ones (the session
 * launcher's `StepCard` is `display: none`), so an unreachable field would
 * otherwise win "first" and the scroll would silently do nothing.
 */
function isHidden(el: HTMLElement): boolean {
  if (typeof el.checkVisibility === 'function') return !el.checkVisibility();
  // No layout engine (jsdom): trust what the markup says.
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (node.hidden || node.style.display === 'none') return true;
  }
  return false;
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

/** The first invalid item in DOM order that the user can actually reach. */
export function findFirstErrorItem(root: ParentNode): HTMLElement | undefined {
  // `querySelectorAll` yields document order, which is what "first" means
  // here — `errorFields` is field REGISTRATION order and disagrees whenever a
  // group mounts conditionally.
  for (const item of root.querySelectorAll<HTMLElement>(ERROR_ITEM_SELECTOR)) {
    if (!isHidden(item)) return item;
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

/**
 * `data-status` only says "error" once the rejected validation has re-rendered
 * the items, so the read waits for the next frame.
 */
export function scrollToFirstErrorAfterRender(
  getRoot: () => ParentNode | null,
  options: ScrollToFirstErrorOptions = {},
): void {
  if (typeof requestAnimationFrame !== 'function') return;
  requestAnimationFrame(() => {
    const root = getRoot();
    const item = root && findFirstErrorItem(root);
    if (item) scrollToErrorItem(item, options);
  });
}
