/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionOwnerSetterCardQuery } from '../__generated__/SessionOwnerSetterCardQuery.graphql';
import { Form } from '../form-engine';
import { useCurrentUserRole } from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import HiddenFormItem from './HiddenFormItem';
// FRONTIER (ticket 17): form-heavy card. `Form.useWatch` / `Form.Item` are
// still antd's (ticket 34's self-hosted engine is parked); every control and
// every piece of chrome below is Astryx now.
import { Card } from '@astryxdesign/core/Card';
import { Grid, GridSpan } from '@astryxdesign/core/Grid';
import { IconButton } from '@astryxdesign/core/IconButton';
import { InputGroup } from '@astryxdesign/core/InputGroup';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Selector } from '@astryxdesign/core/Selector';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Switch } from '@astryxdesign/core/Switch';
import { Heading } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import {
  BAICard,
  BAICardProps,
  BAIFlex,
  BAISelect,
  BAIProjectResourceGroupSelect,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CheckIcon, SearchIcon } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, fetchQuery, useRelayEnvironment } from 'react-relay';

export interface SessionOwnerSetterFormValues {
  owner?:
    | {
        email: string;
        accesskey: string;
        project: string;
        resourceGroup: string;
        enabled: true;
        domainName: string;
      }
    | {
        email?: string;
        accesskey?: string;
        project?: string;
        resourceGroup?: string;
        enabled: false;
        domainName?: string;
      };
}

/**
 * The card's on/off toggle. A local adapter (not the shared
 * `AstryxFormSwitch`) so the accessible name can be the card title while the
 * label stays visually hidden. `Form.Item`'s two contracts are honoured
 * inline.
 */
const OwnerEnabledSwitch: React.FC<{
  label: string;
  /** Injected by `Form.Item valuePropName="checked"`. */
  checked?: boolean;
  /** Injected by `Form.Item`. */
  onChange?: (value: boolean) => void;
}> = ({ label, checked, onChange }) => {
  'use memo';
  return (
    <Switch
      label={label}
      isLabelHidden
      value={checked ?? false}
      onChange={(next) => onChange?.(next)}
    />
  );
};

/**
 * `Input.Search` has no Astryx counterpart (MAPPING 3.6 -- NONE). This is the
 * documented composition: a `TextInput` and a trailing `IconButton` welded by
 * an `InputGroup`. `Form.Item`'s two contracts are honoured inline.
 */
const OwnerEmailSearchInput: React.FC<{
  label: string;
  isLoading?: boolean;
  isResolved?: boolean;
  onSearch: (value: string) => void;
  onValueChange: () => void;
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
}> = ({
  label,
  isLoading,
  isResolved,
  onSearch,
  onValueChange,
  value,
  onChange,
}) => {
  'use memo';
  const current = value ?? '';
  return (
    <InputGroup label={label} isLabelHidden>
      <TextInput
        label={label}
        isLabelHidden
        width="100%"
        value={current}
        onChange={(next) => {
          onChange?.(next);
          onValueChange();
        }}
        onEnter={() => onSearch(current)}
      />
      <IconButton
        icon={isResolved ? <CheckIcon /> : <SearchIcon />}
        label={label}
        isLoading={isLoading}
        onClick={() => onSearch(current)}
      />
    </InputGroup>
  );
};

// PILOT-DECISION: the props no longer come from antd's `CardProps` (a
// type-only antd import still keeps the module in the antd import graph, P15).
// The sole consumer (`SessionLauncherPage`) passes only `style`.
interface SessionOwnerSetterCardProps {
  style?: React.CSSProperties;
}

const SessionOwnerSetterCard: React.FC<SessionOwnerSetterCardProps> = (
  props,
) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance<SessionOwnerSetterFormValues>();

  const isActive = Form.useWatch(['owner', 'enabled'], form);

  const [fetchingEmail, setFetchingEmail] = useState<string>();
  const relayEvn = useRelayEnvironment();

  const { data, isFetching } = useTanQuery({
    queryKey: ['SessionOwnerSetterCard', 'ownerInfo', fetchingEmail],
    queryFn: () => {
      const email = form.getFieldValue(['owner', 'email']);
      if (!email) return;

      const query = graphql`
        query SessionOwnerSetterCardQuery($email: String!) {
          keypairs(email: $email) {
            access_key
          }
          user(email: $email) {
            domain_name
            groups {
              name
              id
            }
          }
        }
      `;
      return fetchQuery<SessionOwnerSetterCardQuery>(relayEvn, query, {
        email,
      }).toPromise();
    },
    enabled: !!fetchingEmail,
  });

  const ownerKeypairs = form.getFieldValue(['owner', 'email'])
    ? data?.keypairs
    : undefined;
  const owner = form.getFieldValue(['owner', 'email']) ? data?.user : undefined;

  const nonExistentOwner = !isFetching && fetchingEmail && !owner;

  return (
    // MAPPING 5.1: Astryx `Card` is a BARE container -- the title/extra row is
    // composition (`HStack justify="between"`), and antd's
    // `styles.header.borderBottom` opt-out disappears with the header divider
    // that Astryx's Card never draws. The collapsed state keeps its
    // `display:none` body so the form fields stay mounted (and registered)
    // while hidden, exactly as before.
    <Card {...props}>
      <VStack gap={4} align="stretch">
        <HStack justify="between" align="center" gap={2}>
          <Heading level={5}>{t('session.launcher.SetSessionOwner')}</Heading>
          <Form.Item
            name={['owner', 'enabled']}
            valuePropName="checked"
            noStyle
          >
            <OwnerEnabledSwitch label={t('session.launcher.SetSessionOwner')} />
          </Form.Item>
        </HStack>
        <div style={{ display: isActive ? 'block' : 'none' }}>
          <HiddenFormItem
            name={['owner', 'domainName']}
            value={owner?.domain_name}
          />
          <Form.Item dependencies={[['owner', 'enabled']]} noStyle>
            {({ getFieldValue }) => {
              return (
                <>
                  <BAIFlex>
                    <Form.Item
                      name={['owner', 'email']}
                      label={t('session.launcher.OwnerEmail')}
                      rules={[
                        {
                          required: isActive,
                        },
                        {
                          type: 'email',
                          message: t('general.validation.InvalidEmailAddress'),
                        },
                      ]}
                      style={{ flex: 1 }}
                      validateStatus={nonExistentOwner ? 'error' : undefined}
                      help={
                        nonExistentOwner
                          ? t('credential.NoUserToDisplay')
                          : undefined
                      }
                    >
                      {/* MAPPING 3.6: `Input.Search` is NONE -- the documented
                      recipe is `TextInput` + an `IconButton` inside an
                      `InputGroup`, which is what the local adapter below
                      builds. `onSearch` fires on Enter or on the trailing
                      button, exactly like antd's `enterButton`; the button's
                      check-vs-search glyph keeps signalling the
                      resolved-owner state. */}
                      <OwnerEmailSearchInput
                        label={t('session.launcher.OwnerEmail')}
                        isLoading={isFetching}
                        isResolved={!isFetching && !!owner}
                        onSearch={(v) => {
                          form
                            .validateFields([['owner', 'email']])
                            .then(() => {
                              setFetchingEmail(v);
                            })
                            .catch(() => {});
                        }}
                        onValueChange={() => {
                          setFetchingEmail('');
                          form.setFieldsValue({
                            owner: {
                              accesskey: '',
                              project: undefined,
                              resourceGroup: undefined,
                            },
                          });
                        }}
                      />
                    </Form.Item>
                  </BAIFlex>
                  <Form.Item
                    name={['owner', 'accesskey']}
                    label={t('session.launcher.OwnerAccessKey')}
                    rules={[
                      {
                        required: getFieldValue(['owner', 'enabled']),
                      },
                    ]}
                  >
                    <BAISelect
                      options={_.map(ownerKeypairs, (k) => {
                        return {
                          label: k?.access_key,
                          value: k?.access_key,
                        };
                      })}
                      autoSelectOption
                      disabled={_.isEmpty(fetchingEmail) || isFetching}
                      // defaultActiveFirstOption
                    />
                  </Form.Item>
                  {/* MAPPING 3.9: `Row gutter` + two `Col span={12}` with NO
                  breakpoint props is the one Row/Col shape that translates
                  directly -- `Grid columns={24}` + `GridSpan
                  columns={12}` (Astryx spells antd's `span` as `columns`). */}
                  <Grid columns={24} gap={3}>
                    <GridSpan columns={12}>
                      <Form.Item
                        name={['owner', 'project']}
                        label={t('session.launcher.OwnerGroup')}
                        rules={[
                          {
                            required: getFieldValue(['owner', 'enabled']),
                          },
                        ]}
                      >
                        <BAISelect
                          options={_.map(owner?.groups, (g) => {
                            return {
                              label: g?.name,
                              value: g?.name,
                            };
                          })}
                          autoSelectOption
                          disabled={_.isEmpty(fetchingEmail) || isFetching}
                        />
                      </Form.Item>
                    </GridSpan>
                    <GridSpan columns={12}>
                      <Form.Item dependencies={[['owner', 'project']]} noStyle>
                        {({ getFieldValue }) => {
                          return (
                            <Suspense
                              fallback={
                                <Form.Item
                                  label={t(
                                    'session.launcher.OwnerResourceGroup',
                                  )}
                                  rules={[
                                    {
                                      required: getFieldValue([
                                        'owner',
                                        'enabled',
                                      ]),
                                    },
                                  ]}
                                >
                                  {/* Suspense placeholder only -- an inert,
                                  loading Selector. */}
                                  <Selector
                                    label={t(
                                      'session.launcher.OwnerResourceGroup',
                                    )}
                                    isLabelHidden
                                    isLoading
                                    options={[]}
                                    width="100%"
                                  />
                                </Form.Item>
                              }
                            >
                              <Form.Item
                                name={['owner', 'resourceGroup']}
                                label={t('session.launcher.OwnerResourceGroup')}
                                rules={[
                                  {
                                    required: getFieldValue([
                                      'owner',
                                      'enabled',
                                    ]),
                                  },
                                ]}
                              >
                                {getFieldValue(['owner', 'project']) ? (
                                  <BAIProjectResourceGroupSelect
                                    projectName={getFieldValue([
                                      'owner',
                                      'project',
                                    ])}
                                    disabled={
                                      _.isEmpty(fetchingEmail) || isFetching
                                    }
                                    autoSelectDefault
                                  />
                                ) : (
                                  <Selector
                                    label={t(
                                      'session.launcher.OwnerResourceGroup',
                                    )}
                                    isLabelHidden
                                    isDisabled
                                    options={[]}
                                    width="100%"
                                  />
                                )}
                              </Form.Item>
                            </Suspense>
                          );
                        }}
                      </Form.Item>
                    </GridSpan>
                  </Grid>
                </>
              );
            }}
          </Form.Item>
        </div>
      </VStack>
    </Card>
  );
};

export const SessionOwnerSetterPreviewCard: React.FC<BAICardProps> = (
  props,
) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const isActive = Form.useWatch(['owner', 'enabled'], form);
  const currentUserRole = useCurrentUserRole();
  return (
    (currentUserRole === 'admin' || currentUserRole === 'superadmin') &&
    isActive && (
      <BAICard
        title={t('session.launcher.SetSessionOwner')}
        showDivider
        size="small"
        status={
          form.getFieldError(['owner', 'email']).length > 0 ||
          form.getFieldError(['owner', 'accesskey']).length > 0 ||
          form.getFieldError(['owner', 'project']).length > 0 ||
          form.getFieldError(['owner', 'resourceGroup']).length > 0
            ? 'error'
            : undefined
        }
        extraButtonTitle={t('button.Edit')}
        {...props}
      >
        {/* antd `Descriptions size="small" column={1}` -> `MetadataList
            columns="single"` (MAPPING 4; `size` has no destination). */}
        <MetadataList columns="single">
          <MetadataListItem label={t('session.launcher.OwnerEmail')}>
            {form.getFieldValue(['owner', 'email'])}
          </MetadataListItem>
          <MetadataListItem label={t('session.launcher.OwnerAccessKey')}>
            {form.getFieldValue(['owner', 'accesskey'])}
          </MetadataListItem>
          <MetadataListItem label={t('session.launcher.OwnerGroup')}>
            {form.getFieldValue(['owner', 'project'])}
          </MetadataListItem>
          <MetadataListItem label={t('session.launcher.OwnerResourceGroup')}>
            {form.getFieldValue(['owner', 'resourceGroup'])}
          </MetadataListItem>
        </MetadataList>
      </BAICard>
    )
  );
};

export default SessionOwnerSetterCard;
