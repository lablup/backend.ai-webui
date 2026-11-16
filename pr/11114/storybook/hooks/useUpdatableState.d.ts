/** A string state whose setter defaults to the current time as ISO text. */
export declare const useDateISOState: (initialValue?: string) => readonly [string, (newValue?: string | undefined) => void];
export declare const useUpdatableState: (initialValue: string) => readonly [string, (newValue?: string | undefined) => void];
