/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 COMPATIBILITY RE-EXPORT (to-astryx ticket 30).

 Ticket 18 grew a second copy of the pilot's Astryx form-control adapters here,
 next to the other `astryx-bui/` gap components. Both files exported the same
 seven names with quietly divergent prop surfaces, and which one a call site
 got depended on which ticket last touched it. Ticket 30 merged them into
 `../astryxFormControls` (the union of both surfaces, with the reasoning in
 that file's header) and left this module as a pure re-export so the ~30 call
 sites importing `./astryx-bui/astryxFormControls` keep working unchanged.

 New code should import from `components/astryxFormControls` directly. This
 file adds nothing and is expected to disappear once the remaining imports are
 repointed.
*/
export {
  AstryxFormCheckbox,
  AstryxFormMultiSelector,
  AstryxFormNumberInput,
  AstryxFormRadioList,
  AstryxFormSegmented,
  AstryxFormSelector,
  AstryxFormSwitch,
  AstryxFormTextArea,
  AstryxFormTextInput,
} from '../astryxFormControls';
export type {
  AstryxFormCheckboxProps,
  AstryxFormMultiSelectorProps,
  AstryxFormNumberInputProps,
  AstryxFormRadioListProps,
  AstryxFormRadioOption,
  AstryxFormSegmentedOption,
  AstryxFormSegmentedProps,
  AstryxFormSelectorOption,
  AstryxFormSelectorOptions,
  AstryxFormSelectorProps,
  AstryxFormSwitchProps,
  AstryxFormTextAreaProps,
  AstryxFormTextInputProps,
} from '../astryxFormControls';
