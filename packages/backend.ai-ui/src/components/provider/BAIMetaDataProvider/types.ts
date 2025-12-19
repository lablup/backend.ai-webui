export type DeviceMetaData = {
  [name: string]: ResourceSlotDetail | undefined;
};

export type ResourceSlotDetail = {
  slot_name: string;
  description: string;
  human_readable_name: string;
  display_unit: string;
  number_format: {
    binary: boolean;
    round_length: number;
  };
  display_icon: string;
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
] as const;
export type KnownAcceleratorResourceSlotName =
  (typeof knownAcceleratorResourceSlotNames)[number];

export type ResourceSlotName =
  | BaseResourceSlotName
  | KnownAcceleratorResourceSlotName;
