/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The permission cap an entity share carries — `permissions` on
 `createEntityShare`, a list of `PermissionBit`s. Three presets, a divider and
 a Custom flyout with one checkbox per bit, drawn as a DropdownMenu so the
 flyout opens on hover and on the Right arrow like Figma's share menu. The
 value is always the bit list; the preset is derived from it.
*/
import { useControllableValue } from '../hooks';
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAIEntitySharePermissionSelector.css';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuDivider,
  DropdownMenuItem,
  DropdownMenuSubMenu,
} from '@lablup/ui-common/DropdownMenu';
import { Field, type FieldProps } from '@lablup/ui-common/Field';
import * as _ from 'lodash-es';
import React, { useId } from 'react';

/** One `PermissionBit` of the manager's permission mask. */
export type BAIEntitySharePermissionBit =
  'CREATE' | 'READ' | 'UPDATE' | 'SOFT_DELETE' | 'HARD_DELETE';

export type BAIEntitySharePermissionPreset =
  'FULL_ACCESS' | 'READ_WRITE' | 'READ_ONLY';

/** A preset, or `CUSTOM` when the bits match none of them. */
export type BAIEntitySharePermissionChoice =
  BAIEntitySharePermissionPreset | 'CUSTOM';

/** The five bits, in the order the Custom flyout lists them. */
export const ENTITY_SHARE_PERMISSION_BITS: ReadonlyArray<BAIEntitySharePermissionBit> =
  ['CREATE', 'READ', 'UPDATE', 'SOFT_DELETE', 'HARD_DELETE'];

/** The presets in menu order, each with the bits it sends. */
export const ENTITY_SHARE_PERMISSION_PRESETS: ReadonlyArray<{
  key: BAIEntitySharePermissionPreset;
  bits: ReadonlyArray<BAIEntitySharePermissionBit>;
}> = [
  {
    key: 'FULL_ACCESS',
    bits: ['CREATE', 'READ', 'UPDATE', 'SOFT_DELETE', 'HARD_DELETE'],
  },
  { key: 'READ_WRITE', bits: ['READ', 'UPDATE', 'SOFT_DELETE'] },
  { key: 'READ_ONLY', bits: ['READ'] },
];

/** Drops unknown values and duplicates and puts the bits in flyout order. */
export const normalizeEntitySharePermissionBits = (
  bits: ReadonlyArray<string> | null | undefined,
): Array<BAIEntitySharePermissionBit> =>
  ENTITY_SHARE_PERMISSION_BITS.filter((bit) => _.includes(bits, bit));

/** The preset whose bits equal `bits` as a set, else `CUSTOM`. */
export const toEntitySharePermissionChoice = (
  bits: ReadonlyArray<string> | null | undefined,
): BAIEntitySharePermissionChoice => {
  const normalized = normalizeEntitySharePermissionBits(bits);
  return (
    _.find(ENTITY_SHARE_PERMISSION_PRESETS, (preset) =>
      _.isEqual(normalizeEntitySharePermissionBits(preset.bits), normalized),
    )?.key ?? 'CUSTOM'
  );
};

const CHOICE_KEYS: Readonly<Record<BAIEntitySharePermissionChoice, string>> = {
  FULL_ACCESS: 'comp:BAIEntitySharePermissionSelector.FullAccess',
  READ_WRITE: 'comp:BAIEntitySharePermissionSelector.ReadAndWrite',
  READ_ONLY: 'comp:BAIEntitySharePermissionSelector.ReadOnly',
  CUSTOM: 'comp:BAIEntitySharePermissionSelector.Custom',
};

const BIT_KEYS: Readonly<Record<BAIEntitySharePermissionBit, string>> = {
  CREATE: 'comp:BAIEntitySharePermissionSelector.Create',
  READ: 'comp:BAIEntitySharePermissionSelector.Read',
  UPDATE: 'comp:BAIEntitySharePermissionSelector.Update',
  SOFT_DELETE: 'comp:BAIEntitySharePermissionSelector.SoftDelete',
  HARD_DELETE: 'comp:BAIEntitySharePermissionSelector.HardDelete',
};

/**
 * The selector's own labels, for a caller that shows a share's cap elsewhere
 * (a table cell, a summary line) with the same words the menu uses.
 */
export const useEntitySharePermissionLabels = () => {
  'use memo';
  const { t } = useBAIi18n();
  const bitLabel = (bit: BAIEntitySharePermissionBit) => t(BIT_KEYS[bit]);
  return {
    choiceLabel: (choice: BAIEntitySharePermissionChoice) =>
      t(CHOICE_KEYS[choice]),
    bitLabel,
    /** "Read only", or the bits of a custom set: "Create, Read, Update". */
    summary: (bits: ReadonlyArray<string> | null | undefined) => {
      const choice = toEntitySharePermissionChoice(bits);
      return choice === 'CUSTOM'
        ? _.map(normalizeEntitySharePermissionBits(bits), bitLabel).join(
            ', ',
          ) || t(CHOICE_KEYS.CUSTOM)
        : t(CHOICE_KEYS[choice]);
    },
  };
};

export interface BAIEntitySharePermissionSelectorProps extends Omit<
  FieldProps,
  | 'children'
  | 'inputID'
  | 'labelID'
  | 'descriptionID'
  | 'isGroupLabel'
  | 'onChange'
> {
  /** The bits the share is capped at. Omit it to let the selector keep them. */
  value?: ReadonlyArray<BAIEntitySharePermissionBit>;
  /** Initial bits when `value` is not controlled. */
  defaultValue?: ReadonlyArray<BAIEntitySharePermissionBit>;
  /** The new bits in flyout order, and the preset they match or `CUSTOM`. */
  onChange?: (
    bits: Array<BAIEntitySharePermissionBit>,
    choice: BAIEntitySharePermissionChoice,
  ) => void;
  size?: 'sm' | 'md' | 'lg';
  /** `secondary` is the bordered form trigger; `ghost` matches toolbar buttons. */
  variant?: 'secondary' | 'ghost';
  placement?: 'above' | 'below' | 'start' | 'end';
  alignment?: 'start' | 'center' | 'end';
  /** Minimum width of the menu; it still grows for its content. */
  menuWidth?: number | string;
  onOpenChange?: (isOpen: boolean) => void;
}

const DEFAULT_BITS = ENTITY_SHARE_PERMISSION_PRESETS[2].bits;

const BAIEntitySharePermissionSelector: React.FC<
  BAIEntitySharePermissionSelectorProps
> = (props) => {
  'use memo';
  const {
    value: _value,
    defaultValue: _defaultValue,
    onChange: _onChange,
    size,
    variant = 'secondary',
    placement = 'below',
    alignment = 'start',
    menuWidth,
    onOpenChange,
    isDisabled,
    // The Field chrome the doc names; the rest of FieldProps passes through.
    isLabelHidden,
    description,
    status,
    'data-testid': testId,
    ...fieldProps
  } = props;
  const { choiceLabel, bitLabel } = useEntitySharePermissionLabels();
  const inputID = useId();
  // Several selectors share a page (one per table row), so the rows' test
  // ids hang off the selector's own.
  const rowTestId = (suffix: string) =>
    `${testId ?? 'bai-entity-share-permission'}-${suffix}`;
  const [bits, setBits] = useControllableValue<
    ReadonlyArray<BAIEntitySharePermissionBit>
  >(props, { defaultValue: DEFAULT_BITS });

  const selected = normalizeEntitySharePermissionBits(bits);
  const choice = toEntitySharePermissionChoice(selected);

  const commit = (next: ReadonlyArray<BAIEntitySharePermissionBit>) => {
    const normalized = normalizeEntitySharePermissionBits(next);
    setBits(normalized, toEntitySharePermissionChoice(normalized));
  };

  return (
    <Field
      inputID={inputID}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      description={description}
      status={status}
      {...fieldProps}
    >
      <DropdownMenu
        data-testid={testId}
        placement={placement}
        alignment={alignment}
        menuWidth={menuWidth}
        onOpenChange={onOpenChange}
        button={{
          id: inputID,
          label: choiceLabel(choice),
          variant,
          size,
          isDisabled,
          width: '100%',
          className: 'bai-entity-share-permission-selector__trigger',
        }}
      >
        {_.map(ENTITY_SHARE_PERMISSION_PRESETS, (preset) => (
          <DropdownMenuItem
            key={preset.key}
            label={choiceLabel(preset.key)}
            onClick={() => commit(preset.bits)}
          />
        ))}
        <DropdownMenuDivider />
        <DropdownMenuSubMenu
          label={choiceLabel('CUSTOM')}
          data-testid={rowTestId('custom')}
          menuDataTestId={rowTestId('custom-menu')}
        >
          {_.map(ENTITY_SHARE_PERMISSION_BITS, (bit) => {
            const isChecked = _.includes(selected, bit);
            return (
              <DropdownMenuCheckboxItem
                key={bit}
                label={bitLabel(bit)}
                value={isChecked}
                // The last bit stays checked: an empty list is "no ceiling"
                // on the server, the opposite of what unchecking all means.
                isDisabled={isChecked && selected.length === 1}
                hasCloseOnSelect={false}
                onChange={(checked) =>
                  commit(
                    checked ? [...selected, bit] : _.without(selected, bit),
                  )
                }
                data-testid={rowTestId(`bit-${_.kebabCase(bit)}`)}
              />
            );
          })}
        </DropdownMenuSubMenu>
      </DropdownMenu>
    </Field>
  );
};

export default BAIEntitySharePermissionSelector;
