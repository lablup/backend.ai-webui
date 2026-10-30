import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIImageMetaIconProps {
    /** Full image name (e.g. `cr.backend.ai/multiarch/python:3.9-ubuntu20.04@x86_64`). */
    image?: string | null;
    style?: React.CSSProperties;
    alt?: string;
}
/**
 * v2/package counterpart of the React app's `ImageMetaIcon`. Resolves the
 * framework icon URL for an image by joining the `imagePath` provided via
 * `BAIMetaDataProvider` with the icon filename declared in the image metadata
 * (`imageInfo[].icon`). Images with no declared icon get a themed inline glyph
 * instead. Renders nothing when the host app has not provided an `imagePath` —
 * the package never bundles or resolves app asset paths on its own.
 */
declare const BAIImageMetaIcon: React.FC<BAIImageMetaIconProps>;
export default BAIImageMetaIcon;
