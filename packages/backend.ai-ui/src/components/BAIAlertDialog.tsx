/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIAlertDialog` — the WAI-ARIA alert-dialog pattern
 (https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) on `BAIDialog`'s
 portalled surface, so it leaves the top layer like every other BUI modal
 (FR-3578). Astryx `AlertDialog`'s own off-top-layer path is `isInline`, which
 hard-codes `role="group"` and hides the ids behind `useId` — see the commit.
*/
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIDialog from './BAIDialog';
import type { BAIDialogProps } from './BAIDialog';
import type { AlertDialogProps } from '@astryxdesign/core/AlertDialog';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import React, { useId } from 'react';

export interface BAIAlertDialogProps
  extends
    Omit<
      BAIDialogProps,
      'children' | 'purpose' | 'role' | 'aria-labelledby' | 'aria-describedby'
    >,
    Pick<
      AlertDialogProps,
      | 'title'
      | 'description'
      | 'cancelLabel'
      | 'actionLabel'
      | 'actionVariant'
      | 'isActionLoading'
      | 'onAction'
    > {
  /** Astryx `AlertDialog` has no equivalent; Escape still cancels. */
  isCancelDisabled?: boolean;
  isActionDisabled?: boolean;
}

const BAIAlertDialog: React.FC<BAIAlertDialogProps> = ({
  title,
  description,
  cancelLabel,
  actionLabel,
  actionVariant = 'destructive',
  isActionLoading,
  isActionDisabled,
  isCancelDisabled,
  onAction,
  onOpenChange,
  ...rest
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <BAIDialog
      {...rest}
      onOpenChange={onOpenChange}
      // The pattern's dismissal contract: Escape cancels, the backdrop does
      // not. `purpose="required"` would buy the role by disabling Escape too.
      purpose="form"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <Layout
        content={
          <LayoutContent>
            <Heading level={2} id={titleId}>
              {title}
            </Heading>
            <Text type="body" color="secondary" id={descriptionId}>
              {description}
            </Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack justify="end" gap={2} align="center">
              <Button
                label={cancelLabel ?? t('general.button.Cancel')}
                variant="ghost"
                isDisabled={isCancelDisabled}
                onClick={() => onOpenChange(false)}
                // The pattern preselects the least destructive choice;
                // `BAIDialog` focuses `[data-autofocus]` once open.
                data-autofocus=""
              />
              <Button
                label={actionLabel}
                variant={actionVariant}
                isLoading={isActionLoading}
                isDisabled={isActionDisabled}
                onClick={onAction}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </BAIDialog>
  );
};

BAIAlertDialog.displayName = 'BAIAlertDialog';

export default BAIAlertDialog;
