/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './ResourceGroupOptionsSection.css';
import { Heading } from '@lablup/ui-common/Heading';
import { IconButton } from '@lablup/ui-common/IconButton';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import { SquarePenIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ResourceGroupOptionsSectionProps {
  title: React.ReactNode;
  // Renders the hover-revealed edit button next to the title.
  onEdit?: () => void;
  children?: React.ReactNode;
}

// A titled group of resource group default options in the detail panel; the title sits above the card.
const ResourceGroupOptionsSection: React.FC<
  ResourceGroupOptionsSectionProps
> = ({ title, onEdit, children }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex
      className="bai-rg-options-section"
      direction="column"
      align="stretch"
      gap="xs"
    >
      <BAIFlex direction="row" align="center" gap="xs">
        <Heading level={5}>{title}</Heading>
        {onEdit ? (
          <IconButton
            className="bai-action-accent bai-rg-options-section__edit"
            variant="ghost"
            size="sm"
            icon={<SquarePenIcon aria-hidden />}
            label={t('button.Edit')}
            tooltip={t('button.Edit')}
            onClick={onEdit}
          />
        ) : null}
      </BAIFlex>
      <BAICard>{children}</BAICard>
    </BAIFlex>
  );
};

export default ResourceGroupOptionsSection;
