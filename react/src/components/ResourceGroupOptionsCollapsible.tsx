/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './ResourceGroupOptionsCollapsible.css';
import { Collapsible } from '@lablup/ui-common/Collapsible';
import { BAICard } from 'backend.ai-ui';
import React from 'react';

interface ResourceGroupOptionsCollapsibleProps {
  title: React.ReactNode;
  defaultIsOpen?: boolean;
  children?: React.ReactNode;
}

// One section of the resource group default options edit form: a card whose
// header is the Collapsible trigger, open by default.
const ResourceGroupOptionsCollapsible: React.FC<
  ResourceGroupOptionsCollapsibleProps
> = ({ title, defaultIsOpen = true, children }) => {
  'use memo';
  return (
    <BAICard padding={0}>
      <Collapsible
        className="bai-rg-options-collapsible"
        defaultIsOpen={defaultIsOpen}
        trigger={title}
      >
        {children}
      </Collapsible>
    </BAICard>
  );
};

export default ResourceGroupOptionsCollapsible;
