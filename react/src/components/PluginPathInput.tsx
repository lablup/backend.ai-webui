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
  'aria-label': string;
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
  const [isInvalid, setIsInvalid] = useState(false);
  const text = props.multiple ? props.value.join(', ') : props.value;

  const commit = (raw: string) => {
    if (props.multiple) {
      const list = parseList(raw);
      const valid = list.every(isValidPluginPath);
      setIsInvalid(!valid);
      if (valid) props.onChange(list);
    } else {
      const path = raw.trim();
      const valid = path === '' || isValidPluginPath(path);
      setIsInvalid(!valid);
      if (valid) props.onChange(path);
    }
  };

  return (
    <BAIFlex direction="row" gap="xs" align="center">
      <BAIUncontrolledInput
        aria-label={PLUGIN_ROOT}
        defaultValue={PLUGIN_ROOT}
        disabled
        style={{ width: ROOT_WIDTH }}
      />
      <Text color="secondary">/</Text>
      <BAIUncontrolledInput
        key={text}
        aria-label={props['aria-label']}
        defaultValue={text}
        status={isInvalid ? 'error' : undefined}
        onCommit={commit}
        style={{ width: PATH_WIDTH }}
      />
    </BAIFlex>
  );
};

export default PluginPathInput;
