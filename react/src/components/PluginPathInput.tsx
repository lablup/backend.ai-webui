/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { isValidPluginPath } from '../helper/pluginPath';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAIUncontrolledInput } from 'backend.ai-ui';
import { useState } from 'react';

const PLUGIN_ROOT = '/dist/plugins';
const ROOT_WIDTH = 120;
const PATH_WIDTH = 360;

type SingleProps = {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};
type MultipleProps = {
  multiple: true;
  value: ReadonlyArray<string>;
  onChange: (value: Array<string>) => void;
};
export type PluginPathInputProps = (SingleProps | MultipleProps) & {
  /** Accessible name of the path box (hidden). */
  label: string;
  'data-testid'?: string;
};

const parseList = (raw: string): Array<string> =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * A plugin path under `/dist/plugins/`: the fixed root in a disabled box, a
 * `/`, then the relative path (one, or comma-separated when `multiple`).
 * An invalid entry shows the error state and is not committed.
 */
const PluginPathInput: React.FC<PluginPathInputProps> = (props) => {
  'use memo';
  const text = props.multiple ? props.value.join(', ') : props.value;
  // The value an entry was rejected against; a new value (a reset) clears it.
  const [rejectedFor, setRejectedFor] = useState<string | null>(null);
  const isInvalid = rejectedFor === text;

  const commit = (raw: string) => {
    if (props.multiple) {
      const list = parseList(raw);
      const valid = list.every(isValidPluginPath);
      setRejectedFor(valid ? null : text);
      if (valid) props.onChange(list);
    } else {
      const path = raw.trim();
      const valid = path === '' || isValidPluginPath(path);
      setRejectedFor(valid ? null : text);
      if (valid) props.onChange(path);
    }
  };

  return (
    <BAIFlex direction="row" gap="xs" align="center">
      <BAIUncontrolledInput
        label={PLUGIN_ROOT}
        isLabelHidden
        defaultValue={PLUGIN_ROOT}
        disabled
        style={{ width: ROOT_WIDTH }}
      />
      <Text color="secondary">/</Text>
      <BAIUncontrolledInput
        key={text}
        label={props.label}
        isLabelHidden
        data-testid={props['data-testid']}
        defaultValue={text}
        status={isInvalid ? 'error' : undefined}
        onCommit={commit}
        style={{ width: PATH_WIDTH }}
      />
    </BAIFlex>
  );
};

export default PluginPathInput;
