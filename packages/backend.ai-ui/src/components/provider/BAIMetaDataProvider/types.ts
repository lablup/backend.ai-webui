import { ResourceSlotDetail } from '../../../hooks';

export type DeviceMetaData = {
  [name: string]: ResourceSlotDetail | undefined;
};

export const baseResourceSlotNames = ['cpu', 'mem'] as const;
export type BaseResourceSlotName = (typeof baseResourceSlotNames)[number];
export const knownAcceleratorResourceSlotNames = [
  'cuda.device',
  'cuda.shares',
  'cuda.mem',
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
] as const;
export type KnownAcceleratorResourceSlotName =
  (typeof knownAcceleratorResourceSlotNames)[number];

export type ResourceSlotName =
  | BaseResourceSlotName
  | KnownAcceleratorResourceSlotName;
