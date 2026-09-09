/**
 * Custom hook that executes a callback function at a specified interval.
 *
 * @param callback The function to be executed at the specified interval.
 * @param delay The delay (in milliseconds) between each execution of the callback function. If `null`, the interval is cleared(pause).
 * @param pauseWhenHidden Whether to pause the interval when the page becomes hidden. Defaults to true.
 * @param resetKey When this value changes identity, the interval's schedule restarts from that moment (as if just mounted) instead of continuing on its prior schedule. Use it to re-anchor the countdown to an out-of-band trigger, e.g. a manual refresh that should push back the next automatic tick.
 */
export declare function useInterval(callback: () => void, delay: number | null, pauseWhenHidden?: boolean, resetKey?: unknown): void;
/**
 * Custom hook that provides a value updated at a specified interval.
 *
 * @param calculator - A function that calculates the value.
 * @param delay - The delay in milliseconds between updates.
 * @param triggerKey - An optional key that triggers an immediate update when changed.
 * @param pauseWhenHidden - Whether to pause the interval when the page becomes hidden. Defaults to true.
 * @returns The updated value.
 */
export declare function useIntervalValue<T>(calculator: () => T, delay: number | null, triggerKey?: string, pauseWhenHidden?: boolean): T;
