/** Low → high; `zIndexLadder.test.ts` pins the declaration order increasing. */
export declare const BAI_Z_INDEX: {
    readonly appHeader: 100;
    readonly splash: 900;
    readonly loginHost: 950;
    readonly modalBase: 1100;
    readonly loginSideHelp: 1101;
    readonly notification: 11000;
};
/** Each nested portal — dialog or scrimmed drawer — claims one step above `modalBase`. */
export declare const BAI_Z_INDEX_MODAL_LEVEL_STEP = 10;
/** ui-common's modal stack, fitted to this ladder: it stops under `notification`. */
export declare const BAI_MODAL_Z_INDEX_BAND: {
    readonly base: 1100;
    readonly step: 10;
    readonly max: number;
};
