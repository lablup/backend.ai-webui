/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAICompactGroup` — a horizontal run of form controls WELDED into one control
 (QA-FINDINGS Q-32), i.e. what antd's `Space.Compact` did.

 ## The finding

 "Bulk Create Users 모달에서 email prefix, email suffix 사이의 input margin이
 없음." Measured on `/admin/users` → Bulk Create Users: the two bordered fields
 met at exactly x=800 with each still carrying `border-radius: 8px` and its own
 1px border, so they read as two controls colliding rather than as one. Legacy
 wrapped that pair in `<Space.Compact>`, which welds its children — `-1px`
 between them, squared inner corners, one shared stroke.

 ## Why a component and not a gap

 The obvious "fix" is to put a gap between the fields, but that is a different
 control: prefix and suffix are two halves of ONE e-mail address, and the weld
 is what says so. The mechanism is documented in `BAICompactGroup.css` — short
 version: Astryx already ships this exact recipe (`InputGroup/groupStyles.js`),
 but hands it out through `InputGroupContext`, and `InputGroup` takes a single
 group-level `label` and explicitly documents "Don't put multiple text inputs in
 one group", so it cannot host two `BAIFormItem`s that each own a label, their
 own `rules` and their own error message.

 ## Using it

 Children are the group's flex items; give them `flex: 1` (or a width) exactly
 as they were given inside the plain `HStack` this replaces. A child may be an
 Astryx control directly, or a wrapper such as `BAIFormItem` that renders one —
 the CSS reaches the bordered surface either way.

 ```tsx
 <BAICompactGroup>
   <BAIFormItem name="email_prefix" label={…} style={{ flex: 1 }} rules={…}>
     <AstryxFormTextInput label={…} />
   </BAIFormItem>
   <BAIFormItem name="email_suffix" label={…} style={{ flex: 1 }} rules={…}>
     <AstryxFormTextInput label={…} />
   </BAIFormItem>
 </BAICompactGroup>
 ```

 PILOT-DECISION — horizontal only. antd's `Space.Compact` also had
 `direction="vertical"`, which stacked controls and squared the horizontal
 joints instead. No call site in this app used it, and supporting it would
 double every selector in the stylesheet for a shape nobody renders. Add it
 (as a `direction` prop plus a mirrored block of rules) when a call site
 actually needs it.
*/
import './BAICompactGroup.css';
import { HStack, type HStackProps } from '@astryxdesign/core/HStack';
import React from 'react';

export interface BAICompactGroupProps extends Omit<
  HStackProps,
  'gap' | 'wrap'
> {
  /**
   * antd `Space.Compact` had no equivalent; the group fills its container by
   * default because every call site so far is a full-width form row. Pass a
   * `SizeValue` (or `undefined`) to size it to its content instead.
   */
  width?: HStackProps['width'];
}

const BAICompactGroup: React.FC<BAICompactGroupProps> = ({
  className,
  width = '100%',
  children,
  ...stackProps
}) => {
  'use memo';
  return (
    <HStack
      {...stackProps}
      // `gap` and `wrap` are fixed, not defaulted: a gap would undo the weld,
      // and a wrapped run would put a squared inner corner at the end of a
      // line where it reads as a rendering bug.
      gap={0}
      wrap="nowrap"
      width={width}
      className={['bai-compact-group', className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </HStack>
  );
};

BAICompactGroup.displayName = 'BAICompactGroup';

export default BAICompactGroup;
