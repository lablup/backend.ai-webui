import { default as Big } from 'big.js';
export * from './astryxTagVariant';
export * from './runtimeVariantPresetUI';
export * from './vfolderHostPermission';
export declare function parseValueWithUnit(str: string): [number, string | undefined];
export declare const GBToBytes: (value?: number) => number;
export declare const bytesToGB: (bytes: number, decimalPoint?: number, nullStr?: string) => string | number;
export type InputSizeUnit = '' | 'k' | 'm' | 'g' | 't' | 'p' | 'e';
export type SizeUnit = InputSizeUnit;
export declare const getDisplayUnitToInputSizeUnit: (displayUnit: string | undefined) => InputSizeUnit;
/**
 * Converts a value with a unit to a different unit or automatically selects the most appropriate unit.
 *
 * @param inputValue - The input string value with or without a unit (e.g., '1024m', '2g', '500').
 * @param targetUnit - The target unit to convert to ('', 'k', 'm', 'g', 't', 'p', 'e') or 'auto' for automatic unit selection.
 * @param options - Additional conversion options.
 * @param options.fixed - Number of decimal places to keep in the result. Defaults to 2.
 * @param options.round - Whether to round the result (true) or floor it (false). Defaults to false.
 * @param options.base - The base for conversion: 1024 (binary) or 1000 (decimal). Defaults to 1024.
 *
 * @returns An object containing the conversion result:
 * - `number`: The converted value as a number
 * - `numberFixed`: The converted value as a string with fixed decimal places
 * - `unit`: The target unit used for conversion
 * - `value`: A formatted string combining the number and unit
 *
 * @throws Error if the input format is invalid or the unit is not recognized
 *
 * @example
 * // Convert 1.5g to mega
 * convertUnitValue('1.5g', 'm')
 * // => { number: 1536, numberFixed: "1536", unit: "m", value: "1536m" }
 *
 * @example
 * // Auto unit selection with custom precision
 * convertUnitValue('1048576', 'auto', { fixed: 1 })
 * // => { number: 1, numberFixed: "1", unit: "m", value: "1m" }
 *
 */
export declare function convertUnitValue(inputValue: string | undefined, targetUnit: InputSizeUnit | 'auto', options?: {
    fixed?: number;
    round?: boolean;
    base?: 1024 | 1000;
}): {
    number: number;
    numberFixed: string;
    unit: InputSizeUnit;
    value: string;
} | undefined;
export declare const generateDisplayValues: <T extends number | Big>(convertedValue: {
    number: T;
    numberFixed: string;
    unit: InputSizeUnit;
    value: string;
} | undefined, { baseDisplayUnit, displayUnitSuffix, }: {
    baseDisplayUnit: string;
    displayUnitSuffix: string;
}) => {
    displayValue: string;
    displayUnit: string;
    number: T;
    numberFixed: string;
    unit: InputSizeUnit;
    value: string;
} | undefined;
/**
 * Converts a binary size value from one unit to another.
 *
 * @param inputValue - The value to convert, can be a string, number, or undefined
 * @param targetUnit - The unit to convert to, or 'auto' for automatic unit selection
 * @param fixed - The number of decimal places to fix the result to (default: 2)
 * @param round - Whether to round the result (default: false)
 * @returns An object containing the converted value information or undefined if conversion fails:
 *          - number: The converted number value
 *          - numberFixed: The formatted number with fixed decimal places
 *          - unit: The resulting unit (lowercase)
 *          - displayValue: Formatted string with value and unit (e.g., "10.24 KiB")
 *          - displayUnit: The formatted unit string (e.g., "KiB")
 */
export declare function convertToBinaryUnit(inputValue: string | number | undefined, targetUnit: InputSizeUnit | 'auto', fixed?: number, round?: boolean): {
    displayValue: string;
    displayUnit: string;
    number: number;
    numberFixed: string;
    unit: InputSizeUnit;
    value: string;
} | undefined;
/**
 * Converts a size value to a different unit in the decimal-based system.
 *
 * @param inputValue - The input size value to convert, can be a string, number or undefined
 * @param targetUnit - The desired unit to convert to, or 'auto' to determine the best unit automatically
 * @param fixed - The number of decimal places to round to, defaults to 2
 * @param round - Whether to round the value (true) or truncate (false), defaults to false
 * @returns An object containing the converted value information, including:
 *          - numberFixed: The converted number with fixed decimal places
 *          - displayValue: The formatted string with value and unit (e.g., "5.25 KB")
 *          - displayUnit: The display unit (e.g., "KB")
 *          - additional properties from convertUnitValue
 *          Returns undefined if the conversion failed
 */
export declare function convertToDecimalUnit(inputValue: string | number | undefined, targetUnit: InputSizeUnit | 'auto', fixed?: number, round?: boolean): {
    displayValue: string;
    displayUnit: string;
    number: number;
    numberFixed: string;
    unit: InputSizeUnit;
    value: string;
} | undefined;
export declare function toFixedFloorWithoutTrailingZeros(num: number | string, fixed: number): string;
export declare function toFixedWithTypeValidation(num: number | string, fixed: number): string;
export declare function compareNumberWithUnits(size1: string | number, size2: string | number): number;
export declare function addNumberWithUnits(size1: string, size2: string, targetUnit?: InputSizeUnit): string | undefined;
export declare function subNumberWithUnits(size1: string, size2: string, targetUnit?: InputSizeUnit): string | undefined;
export declare function divideNumberWithUnits(size1: string, size2: string, targetUnit?: InputSizeUnit): string | undefined;
export declare const localeCompare: (a?: string | null, b?: string | null) => number;
type KnownGlobalIdType = 'VirtualFolderNode' | 'ComputeSessionNode' | 'GroupNode' | 'UserNode' | 'ProjectNode' | 'ModelDeployment' | 'ImageV2';
export declare const toGlobalId: (type: KnownGlobalIdType, id: string) => string;
export declare const toLocalId: (globalId: string) => string;
/**
 * Filters out empty values from an array. An item is considered "empty" if it is:
 * - `undefined`
 * - `null`
 * - an empty string (`''`)
 * - `false`
 * - `true`
 * - any numbers
 * - an empty array (`[]`)
 * - an empty object (`{}`)
 *
 * Uses lodash's `isEmpty` function for the check.
 * Array-like values such as arguments objects, arrays, buffers, strings, or jQuery-like collections are considered empty if they have a length of 0. Similarly, maps and sets are considered empty if they have a
 *
 * @typeParam T - The type of the array elements to retain.
 * @param arr - The array to filter, which may contain empty values.
 * @returns A new array containing only the non-empty values of type `T`.
 */
export declare const filterOutEmpty: <T>(arr: Array<T | undefined | null | "" | false | any[] | object>) => Array<T>;
/**
 * Start-cases a string while preserving dot (`.`) separators, so version-like
 * tokens (e.g. `py3.9`) keep their dots instead of being split into words.
 *
 * Mirrors the v1 `preserveDotStartCase` helper used by the image metadata
 * tag aliasing logic.
 */
export declare function preserveDotStartCase(str?: string): string;
/**
 * Filters out `null` and `undefined` values from an array of objects.
 *
 * @template T - The type of objects in the array.
 * @param arr - The array to filter, which may contain `null` or `undefined` values, or be itself `null` or `undefined`.
 * @returns A new array containing only the non-null and non-undefined objects from the input array.
 */
export declare function filterOutNullAndUndefined<T extends {
    [key: string]: any;
}>(arr: ReadonlyArray<T | null | undefined> | null | undefined): T[];
/**
 * Returns a shallow copy of the input object with all properties whose values are `null` or `undefined` omitted.
 *
 * @typeParam T - The type of the input object.
 * @param input - The object to omit `null` and `undefined` values from.
 * @returns A new object with the same properties as `input`, except those with `null` or `undefined` values.
 */
export declare const omitNullAndUndefinedFields: <T extends Record<string, any>>(input: T) => Partial<T>;
/**
 * Generates a random string of alphabetic characters.
 *
 * @param n - The length of the random string to generate. Defaults to 3.
 * @returns A random string containing uppercase and lowercase letters of the specified length.
 *
 * @example
 * ```typescript
 * generateRandomString(); // Returns a 3-character string like "AbC"
 * generateRandomString(5); // Returns a 5-character string like "XyZaB"
 * ```
 *
 * @remarks
 * The function uses a base-52 number system where:
 * - Characters 0-25 map to uppercase letters A-Z
 * - Characters 26-51 map to lowercase letters a-z
 */
export declare const generateRandomString: (n?: number) => string;
export declare const isValidUUID: (uuid: string) => boolean;
/**
 * Resolve a UUID from either a raw UUID or a Strawberry global id like
 * `ImageV2:<uuid>`. Useful for mutation inputs that are declared as `ID!`
 * but parsed as `UUID!` server-side — callers can pass either form and get
 * a clean UUID back. `toLocalId` calls `atob`, which throws on non-base64
 * input, so we guard with try/catch and verify the decoded value is a UUID.
 */
export declare const safeDecodeUuid: (idOrGlobalId: string) => string | undefined;
export declare const convertToUUID: (id: string) => string;
export * from './newLineToBrElement';
export * from './useDebouncedDeferredValue';
export type SemanticColor = 'success' | 'info' | 'warning' | 'error' | 'default';
export declare const useSemanticColorMap: () => Record<SemanticColor, string>;
/**
 * Initiate a file download from a URL with a custom filename.
 * Handles iOS Safari separately by opening a new window.
 */
export declare const initiateDownload: (downloadURL: string, fileName: string) => Promise<void>;
