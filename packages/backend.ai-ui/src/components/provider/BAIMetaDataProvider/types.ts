import type { ResourceSlotDetail } from '../../../hooks';

export type DeviceMetaData = {
  [name: string]: ResourceSlotDetail | undefined;
};

export const baseResourceSlotNames = ['cpu', 'mem'] as const;
export type BaseResourceSlotName = (typeof baseResourceSlotNames)[number];
export const knownAcceleratorResourceSlotNames = [
  'cuda.device',
  'cuda.shares',
  'rocm.device',
  'tpu.device',
  'ipu.device',
  'atom.device',
  'atom-plus.device',
  'atom-max.device',
  'gaudi2.device',
  'warboy.device',
  'rngd.device',
  'hyperaccel-lpu.device',
  'tt-n300.device',
] as const;
export type KnownAcceleratorResourceSlotName =
  (typeof knownAcceleratorResourceSlotNames)[number];

export type ResourceSlotName =
  | BaseResourceSlotName
  | KnownAcceleratorResourceSlotName;

/**
 * A single label entry attached to an image in `image_metadata.json`.
 */
export interface ImageMetadataLabel {
  category?: string;
  tag: string;
  color: string;
}

/**
 * Per-image metadata entry keyed by the parsed image key (e.g. `python`,
 * `ngc-pytorch`) inside `image_metadata.json`'s `imageInfo`.
 */
export interface ImageMetadataInfo {
  name: string;
  description: string;
  group: string;
  tags: string[];
  icon?: string;
  label?: ImageMetadataLabel[];
}

/**
 * Shape of `resources/image_metadata.json`. Provided to `backend.ai-ui`
 * components via `BAIMetaDataProvider` so they can resolve image icons and
 * humanized tag/name aliases without a Relay dependency.
 */
export interface ImageMetaData {
  imageInfo: { [key: string]: ImageMetadataInfo | undefined };
  tagAlias: { [key: string]: string };
  tagReplace: { [key: string]: string };
  groupSortKeyMap?: { [key: string]: string };
}
