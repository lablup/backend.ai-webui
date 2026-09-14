/**
 * Resolves an icon filename against the host-provided icon directory
 * (`BAIMetaDataProvider`'s `imagePath`). The package never guesses an app
 * asset URL, so callers must handle the no-`imagePath` case.
 */
declare const useBAIIconPath: () => (fileName?: string | null) => string | undefined;
export default useBAIIconPath;
