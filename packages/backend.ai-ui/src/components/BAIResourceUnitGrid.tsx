/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `UnitGrid` under its BUI name (FR-3569), with the WebUI's group
 palette and letter inks from BAIResourceUnitGrid.css. The strings come from
 ui-common's catalog.
*/
import './BAIResourceUnitGrid.css';
import {
  UnitGrid,
  type UnitGridGroup,
  type UnitGridProps,
  type UnitGridUnit,
} from '@lablup/ui-common/components/UnitGrid';
import classNames from 'classnames';
import React from 'react';

export type BAIUnitGridUnit = UnitGridUnit;
export type BAIUnitGridGroup = UnitGridGroup;
export type BAIResourceUnitGridProps = UnitGridProps;

const BAIResourceUnitGrid: React.FC<BAIResourceUnitGridProps> = ({
  className,
  ...unitGridProps
}) => {
  'use memo';
  return (
    <UnitGrid
      {...unitGridProps}
      className={classNames('bai-resource-unit-grid', className)}
    />
  );
};

export default BAIResourceUnitGrid;
