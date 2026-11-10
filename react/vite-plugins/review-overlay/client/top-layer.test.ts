import { createPicker } from './picker.js';
import { hasOpenPopover, liftAboveTopLayer } from './top-layer.js';
import type { Plugin, PluginHooks, ReactGrabAPI } from 'react-grab';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const realShow = HTMLElement.prototype.showPopover;
const realHide = HTMLElement.prototype.hidePopover;

/** jsdom has no top layer: a set stands in for the browser's open popovers. */
function fakeTopLayer() {
  const open = new Set<Element>();
  const realQuery = Document.prototype.querySelector;
  const realMatches = Element.prototype.matches;
  vi.spyOn(Document.prototype, 'querySelector').mockImplementation(function (
    this: Document,
    selector: string,
  ) {
    if (!selector.startsWith(':popover-open')) {
      return realQuery.call(this, selector);
    }
    const skip = /:not\(\[([^\]]+)\]\)/.exec(selector)?.[1];
    return [...open].find((node) => !skip || !node.hasAttribute(skip)) ?? null;
  } as typeof Document.prototype.querySelector);
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
    this: Element,
    selector: string,
  ) {
    if (selector === ':popover-open') return open.has(this);
    return realMatches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    open.add(this);
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    open.delete(this);
  };
  return open;
}

let open: Set<Element>;

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML =
    '<div id="menu" popover="auto"></div><div id="host" style="position: fixed; inset: 0px;"></div>';
  open = fakeTopLayer();
});

afterEach(() => {
  vi.restoreAllMocks();
  HTMLElement.prototype.showPopover = realShow;
  HTMLElement.prototype.hidePopover = realHide;
  delete window.__REACT_GRAB__;
});

const byId = (id: string) => document.getElementById(id) as HTMLElement;

describe('liftAboveTopLayer', () => {
  it('does nothing while no popover is open', () => {
    const drop = liftAboveTopLayer(byId('host'));
    expect(byId('host').hasAttribute('popover')).toBe(false);
    expect(open.size).toBe(0);
    drop();
    expect(byId('host').getAttribute('style')).toBe(
      'position: fixed; inset: 0px;',
    );
  });

  it('shows the host above an open popover and undoes it exactly', () => {
    open.add(byId('menu'));
    const host = byId('host');
    const drop = liftAboveTopLayer(host);
    expect(host.getAttribute('popover')).toBe('manual');
    expect(open.has(host)).toBe(true);
    // The UA's fit-content popover box would collapse the full-viewport host.
    expect(host.style.width).toBe('auto');
    expect(host.style.margin).toBe('0px');
    expect(document.head.querySelector('style')?.textContent).toContain(
      '::backdrop',
    );
    // The host lifted itself is not a popover that needs lifting over.
    expect(hasOpenPopover()).toBe(true);
    open.delete(byId('menu'));
    expect(hasOpenPopover()).toBe(false);

    drop();
    expect(open.has(host)).toBe(false);
    expect(host.hasAttribute('popover')).toBe(false);
    expect(host.getAttribute('style')).toBe('position: fixed; inset: 0px;');
  });

  it('tolerates a missing host', () => {
    open.add(byId('menu'));
    expect(() => liftAboveTopLayer(null)()).not.toThrow();
  });
});

describe('picker over an open menu', () => {
  it("lifts react-grab's host for the length of a pick", () => {
    const grabHost = document.createElement('div');
    grabHost.setAttribute('data-react-grab', 'true');
    document.body.appendChild(grabHost);
    let hooks: PluginHooks = {};
    let active = false;
    window.__REACT_GRAB__ = {
      activate: () => {
        active = true;
        void hooks.onActivate?.();
      },
      deactivate: () => {
        active = false;
        void hooks.onDeactivate?.();
      },
      isActive: () => active,
      registerPlugin: (plugin: Plugin) => {
        hooks = plugin.hooks ?? {};
      },
    } as unknown as ReactGrabAPI;
    const picker = createPicker({
      onPick: () => undefined,
      onModeChange: () => undefined,
      onHover: () => undefined,
      isOwnEvent: () => false,
      showHint: () => undefined,
      sourceRoot: () => null,
    });
    open.add(byId('menu'));

    picker.start();
    expect(open.has(grabHost)).toBe(true);
    expect(open.has(byId('menu'))).toBe(true);

    picker.stop();
    expect(open.has(grabHost)).toBe(false);
    expect(grabHost.hasAttribute('popover')).toBe(false);
    picker.dispose();
  });
});
