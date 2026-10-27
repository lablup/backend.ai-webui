/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import React, {
  createContext,
  use,
  useCallback,
  useState,
  useSyncExternalStore,
} from 'react';

/** Each item's title-row element, so a `BAIBoardItemTitle` in the body can render into it. */
export interface BAIBoardTitleSlots {
  set: (id: string, element: HTMLElement | null) => void;
  get: (id: string) => HTMLElement | null;
  subscribe: (listener: () => void) => () => void;
}

const createTitleSlots = (): BAIBoardTitleSlots => {
  const elements = new Map<string, HTMLElement>();
  const listeners = new Set<() => void>();
  return {
    set: (id, element) => {
      if ((elements.get(id) ?? null) === element) return;
      if (element) elements.set(id, element);
      else elements.delete(id);
      listeners.forEach((listener) => listener());
    },
    get: (id) => elements.get(id) ?? null,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const useBAIBoardTitleSlots = () => useState(createTitleSlots)[0];

const BAIBoardItemContext = createContext<{
  slots: BAIBoardTitleSlots;
  id: string;
  /** Titles below render where they stand: the item's title row is taken. */
  inline?: boolean;
} | null>(null);

export const BAIBoardItemProvider = BAIBoardItemContext.Provider;

/** Whether the caller renders inside a `BAIBoard` item, whose board pads it. */
export const useIsInBAIBoardItem = () => use(BAIBoardItemContext) !== null;

const noSubscribe = () => () => {};
const noElement = () => null;

/**
 * The item's title-row element when inside a `BAIBoard` item (null until it
 * mounts), or `undefined` outside a board.
 */
export const useBAIBoardItemTitleTarget = ():
  HTMLElement | null | undefined => {
  const item = use(BAIBoardItemContext);
  const element = useSyncExternalStore(
    item ? item.slots.subscribe : noSubscribe,
    item ? () => item.slots.get(item.id) : noElement,
  );
  return item && !item.inline ? element : undefined;
};

/** For a second section in one board item: its `BAIBoardItemTitle` stays in the body. */
export const BAIBoardItemInlineTitles: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const item = use(BAIBoardItemContext);
  return item ? (
    <BAIBoardItemContext value={{ ...item, inline: true }}>
      {children}
    </BAIBoardItemContext>
  ) : (
    children
  );
};

/** The node `BAIBoard` passes as an item's `title`. */
export const BAIBoardItemTitleSlot: React.FC<{
  slots: BAIBoardTitleSlots;
  id: string;
}> = ({ slots, id }) => {
  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      slots.set(id, element);
      return () => slots.set(id, null);
    },
    [slots, id],
  );
  return <div ref={ref} className="bai-board-item-title-slot" />;
};
