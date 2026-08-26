/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import DescriptionLabel from './DescriptionLabel';
import { Badge } from '@astryxdesign/core/Badge';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Overlay } from '@astryxdesign/core/Overlay';
import { Spinner } from '@astryxdesign/core/Spinner';
import { BAICard, BAIDoubleTag, BAIFlex, BAIMetadataList } from 'backend.ai-ui';
import { Check, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InformationProps {}
const Information: React.FC<InformationProps> = () => {
  const { t } = useTranslation();

  const baiClient = useSuspendedBackendaiClient();

  let { data: licenseInfo, isLoading: isLoadingLicenseInfo } = useTanQuery<{
    valid: boolean;
    type: string;
    licensee: string;
    key: string;
    expiration: string;
  }>({
    queryKey: ['licenseInfo'],
    queryFn: () => {
      return baiClient.enterprise.getLicense();
    },
    // for to render even this fail query failed
  });

  if (!licenseInfo) {
    licenseInfo = {
      valid: false,
      type: t('information.CannotRead'),
      licensee: t('information.CannotRead'),
      key: t('information.CannotRead'),
      expiration: t('information.CannotRead'),
    };
  }

  return (
    <BAIFlex direction="column" align="stretch" gap="lg">
      {/* PILOT-DECISION: antd's per-Descriptions `column` breakpoint map
          (xxl/xl/lg/md/sm/xs) has no Astryx destination (MAPPING §3.9 —
          Astryx has no breakpoint system). MetadataList's default single-
          column flow is adopted everywhere in this area instead (same
          decision as tickets 16/18: "drop the column map"). */}
      <Grid columns={{ minWidth: 360, max: 2 }} gap={4}>
        <BAICard>
          <BAIMetadataList title={t('information.Core')}>
            <MetadataListItem label={t('information.ManagerVersion')}>
              <BAIFlex direction="column" gap="xxs" align="start">
                Backend.AI {baiClient.managerVersion}
                <BAIDoubleTag
                  values={[
                    t('information.Installation'),
                    baiClient.managerVersion,
                  ]}
                />
              </BAIFlex>
            </MetadataListItem>
            <MetadataListItem label={t('information.APIVersion')}>
              {baiClient.apiVersion}
            </MetadataListItem>
          </BAIMetadataList>
        </BAICard>
        <BAICard>
          <BAIMetadataList title={t('information.Security')}>
            <MetadataListItem
              label={t('information.DefaultAdministratorAccountChanged')}
              icon={
                <DescriptionLabel
                  subtitle={t(
                    'information.DescDefaultAdministratorAccountChanged',
                  )}
                />
              }
            >
              {/* TODO: accountChanged  */}
              {true ? (
                <Icon icon={Check} label="Yes" size="sm" />
              ) : (
                <Icon
                  icon={TriangleAlert}
                  label="No"
                  color="warning"
                  size="sm"
                />
              )}
            </MetadataListItem>
            <MetadataListItem
              label={t('information.UsesSSL')}
              icon={
                <DescriptionLabel subtitle={t('information.DescUsesSSL')} />
              }
            >
              {baiClient?._config.endpoint.startsWith('https:') ? (
                <Icon icon={Check} label="Yes" size="sm" />
              ) : (
                <Icon
                  icon={TriangleAlert}
                  label="No"
                  color="warning"
                  size="sm"
                />
              )}
            </MetadataListItem>
          </BAIMetadataList>
        </BAICard>
      </Grid>

      <BAICard>
        <BAIMetadataList title={t('information.Component')}>
          <MetadataListItem
            label={t('information.DockerVersion')}
            icon={
              <DescriptionLabel subtitle={t('information.DescDockerVersion')} />
            }
          >
            <Badge label={t('information.Compatible')} variant="neutral" />
          </MetadataListItem>
          <MetadataListItem
            label={t('information.PostgreSQLVersion')}
            icon={
              <DescriptionLabel
                subtitle={t('information.DescPostgreSQLVersion')}
              />
            }
          >
            <Badge label={t('information.Compatible')} variant="neutral" />
          </MetadataListItem>
          <MetadataListItem
            label={t('information.ETCDVersion')}
            icon={
              <DescriptionLabel subtitle={t('information.DescETCDVersion')} />
            }
          >
            <Badge label={t('information.Compatible')} variant="neutral" />
          </MetadataListItem>
          <MetadataListItem
            label={t('information.RedisVersion')}
            icon={
              // PILOT-DECISION: `newLineToBrElement` produced a `<br/>`-joined
              // ReactNode; the tooltip icon's `title` is plain `string`
              // (P2), so the line-break formatting is dropped here.
              <DescriptionLabel subtitle={t('information.DescRedisVersion')} />
            }
          >
            <Badge label={t('information.Compatible')} variant="neutral" />
          </MetadataListItem>
        </BAIMetadataList>
      </BAICard>
      <BAICard>
        <Overlay
          isOpen={isLoadingLicenseInfo}
          scrim="light"
          content={<Spinner label={t('general.Loading')} />}
        >
          <BAIMetadataList title={t('information.License')}>
            <MetadataListItem
              label={t('information.IsLicenseValid')}
              icon={
                <DescriptionLabel
                  subtitle={t('information.DescIsLicenseValid')}
                />
              }
            >
              {licenseInfo.valid ? (
                <Icon
                  icon={Check}
                  label={t('information.IsLicenseValid')}
                  size="sm"
                />
              ) : (
                <Icon
                  icon={TriangleAlert}
                  label={t('information.IsLicenseValid')}
                  color="warning"
                  size="sm"
                />
              )}
            </MetadataListItem>
            <MetadataListItem
              label={t('information.LicenseType')}
              icon={
                <DescriptionLabel subtitle={t('information.DescLicenseType')} />
              }
            >
              <Badge
                label={
                  licenseInfo.type === 'fixed'
                    ? t('information.FixedLicense')
                    : t('information.DynamicLicense')
                }
                variant="neutral"
              />
            </MetadataListItem>
            <MetadataListItem
              label={t('information.Licensee')}
              icon={
                <DescriptionLabel subtitle={t('information.DescLicensee')} />
              }
            >
              <Badge label={licenseInfo.licensee} variant="neutral" />
            </MetadataListItem>
            <MetadataListItem
              label={t('information.LicenseKey')}
              icon={
                <DescriptionLabel subtitle={t('information.DescLicenseKey')} />
              }
            >
              <Badge label={licenseInfo.key} variant="neutral" />
            </MetadataListItem>
            <MetadataListItem
              label={t('information.Expiration')}
              icon={
                <DescriptionLabel subtitle={t('information.DescExpiration')} />
              }
            >
              <Badge label={licenseInfo.expiration} variant="neutral" />
            </MetadataListItem>
          </BAIMetadataList>
        </Overlay>
      </BAICard>
    </BAIFlex>
  );
};

export default Information;
