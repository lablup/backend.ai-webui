/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
/** One component a form-control re-export file exposes. */
interface FormControlEntry {
    /** The BAI name, e.g. `BAITextInput`. */
    name: string;
    /** The ui-common name it re-exports, e.g. `TextInput`. */
    uiCommon: string;
    description: string;
}
/**
 * The catalog doc of a `BAI<X>.tsx` that re-exports a ui-common form control
 * unchanged (ADR 0014). Unstamped, so the `components` list needs no props.
 */
export declare const formControlDoc: (entries: [FormControlEntry, ...FormControlEntry[]], keywords: string[]) => {
    name: string;
    displayName: string;
    category: "Data Input";
    keywords: string[];
    usage: {
        description: string;
        bestPractices: {
            guidance: boolean;
            description: string;
        }[];
    };
    components: {
        name: string;
        displayName: string;
        description: string;
    }[];
};
export {};
