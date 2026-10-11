/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { exitActAs, getActAsTarget } from '../helper/actAs';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { LogOutIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Marks a tab that acts as another user; not dismissable on purpose. */
const ActAsBanner: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const target = getActAsTarget();
  if (!target) return null;

  return (
    <Banner
      data-testid="act-as-banner"
      status="warning"
      container="section"
      title={t('actAs.BannerTitle', {
        name: target.name || target.email,
        email: target.email,
      })}
      description={t('actAs.BannerDescription')}
      endContent={
        <Button
          variant="secondary"
          icon={<LogOutIcon size="1em" />}
          label={t('actAs.Exit')}
          onClick={exitActAs}
        />
      }
    />
  );
};

export default ActAsBanner;
