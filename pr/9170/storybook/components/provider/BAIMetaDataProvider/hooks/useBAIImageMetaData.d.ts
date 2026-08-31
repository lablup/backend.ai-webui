/**
 * Access the image metadata (`resources/image_metadata.json`) provided by
 * `BAIMetaDataProvider`, together with a set of helpers for resolving image
 * icons and humanized tag/name aliases.
 *
 * This mirrors the v1 `useBackendAIImageMetaData` hook from the React app, but
 * reads the metadata from React context (provided by the host app) instead of
 * fetching it, so `backend.ai-ui` stays free of a data-fetching dependency.
 *
 * The returned helpers are null-safe: when no metadata has been provided yet
 * they fall back to sensible defaults (`default.png` icon, identity aliasing).
 */
declare const useBAIImageMetaData: () => readonly [import('..').ImageMetaData | undefined, {
    getImageMeta: (imageName: string) => {
        key: string;
        tags: string[];
    };
    /**
     * Full icon URL for the image: the `imagePath` provided via
     * `BAIMetaDataProvider` joined with the icon filename declared in
     * `imageInfo` (falling back to `default.png` for unknown images).
     * Returns `undefined` when no `imagePath` has been provided — the
     * package never resolves an app asset path on its own.
     */
    getImageIcon: (imageName?: string | null) => string | undefined;
    getBaseVersion: (imageName: string) => string;
    getBaseImage: (imageName: string) => string;
    tagAlias: (tag: string) => string;
}];
export default useBAIImageMetaData;
