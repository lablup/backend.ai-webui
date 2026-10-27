import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** Each item's title-row element, so a `BAIBoardItemTitle` in the body can render into it. */
export interface BAIBoardTitleSlots {
    set: (id: string, element: HTMLElement | null) => void;
    get: (id: string) => HTMLElement | null;
    subscribe: (listener: () => void) => () => void;
}
export declare const useBAIBoardTitleSlots: () => BAIBoardTitleSlots;
export declare const BAIBoardItemProvider: React.Provider<{
    slots: BAIBoardTitleSlots;
    id: string;
    /** Titles below render where they stand: the item's title row is taken. */
    inline?: boolean;
} | null>;
/** Whether the caller renders inside a `BAIBoard` item, whose board pads it. */
export declare const useIsInBAIBoardItem: () => boolean;
/**
 * The item's title-row element when inside a `BAIBoard` item (null until it
 * mounts), or `undefined` outside a board.
 */
export declare const useBAIBoardItemTitleTarget: () => HTMLElement | null | undefined;
/** For a second section in one board item: its `BAIBoardItemTitle` stays in the body. */
export declare const BAIBoardItemInlineTitles: React.FC<{
    children: React.ReactNode;
}>;
/** The node `BAIBoard` passes as an item's `title`. */
export declare const BAIBoardItemTitleSlot: React.FC<{
    slots: BAIBoardTitleSlots;
    id: string;
}>;
