import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
 * (`imageInfo[].icon`, falling back to `default.png`). Renders nothing when
 * the host app has not provided an `imagePath` — the package never bundles or
 * resolves app asset paths on its own.
 */
declare const BAIImageMetaIcon: React.FC<BAIImageMetaIconProps>;
export default BAIImageMetaIcon;
