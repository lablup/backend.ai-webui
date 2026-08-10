/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormItemProps } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { AstryxFormTagsInput } from './astryx-bui/astryxFormControls';
import { Badge } from '@astryxdesign/core/Badge';
import { badgeVariantForTagColor } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import type { CSSProperties, ReactNode } from 'react';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface Props extends FormItemProps {}

export interface PortSelectFormValues {
  ports: string[];
}

const MIN_PORT = 1024;
const MAX_PORT = 65535;
const PortSelectFormItem: React.FC<Props> = ({
  name = 'ports',
  ...formItemProps
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  return (
    <Form.Item
      label={t('session.launcher.PreOpenPortTitle')}
      name={name}
      tooltip={<Trans i18nKey="session.launcher.DescSetPreOpenPort" />}
      extra={t('session.launcher.PreOpenPortRangeGuide')}
      rules={[
        () => ({
          validator(_rule, values) {
            if (
              transformPortValuesToNumbers(values).length <=
              baiClient._config.maxCountForPreopenPorts
            ) {
              return Promise.resolve();
            } else {
              return Promise.reject(
                new Error(
                  t('session.launcher.PreOpenPortMaxCountLimit', {
                    count: baiClient._config.maxCountForPreopenPorts,
                  }),
                ),
              );
            }
          },
        }),
        () => ({
          // To check if the port range is not start <= end
          validator(_rule, values) {
            if (
              _.every(values, (v) => {
                return parseInt(v).toString() === v || isPortRangeStr(v);
              })
            ) {
              return Promise.resolve();
            } else {
              return Promise.reject(
                new Error(t('session.launcher.InvalidPortFormat')),
              );
            }
          },
        }),
        () => ({
          validator(_rule, values) {
            const allPorts = transformPortValuesToNumbers(values);
            if (
              _.every(allPorts, (port) => {
                return port >= MIN_PORT && port <= MAX_PORT;
              })
            ) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error(t('session.launcher.PreOpenPortRange')),
            );
          },
        }),
        () => ({
          validator(_rule, values) {
            // To check if the port is duplicated
            const allPorts = transformPortValuesToNumbers(values);
            if (_.uniq(allPorts).length === allPorts.length) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error(t('session.launcher.DuplicatedPort')),
            );
          },
        }),
      ]}
      {...formItemProps}
    >
      {/*
        PILOT-DECISION: this used to paint an individual chip red (`tagRender`
        + `PortTag`) when the port string was malformed, out of range, or
        duplicated. Astryx advises against per-token colors ("Avoid applying
        custom colors to individual tokens inside a Tokenizer"), and the four
        `rules` above already surface every one of those conditions as a
        field-level error message — so the red chip is dropped rather than
        reproduced. `PortTag` itself stays exported for
        `SessionLauncherPreview`. `open={false}` / `suffixIcon={null}` map to
        nothing: the empty search source yields no dropdown and no suffix
        affordance.

        `tokenSeparators` is RESTORED (input-parity pass) — the `extra` line
        directly above this field tells the user to separate values with a
        comma or a space, so dropping it made the UI lie. The adapter splits on
        commit; see `AstryxFormTagsInputProps.tokenSeparators`.
      */}
      <AstryxFormTagsInput
        tokenSeparators={[',', ' ']}
        label={t('session.launcher.PreOpenPortTitle')}
        // QA-FINDINGS Q-39: an EMPTY placeholder, deliberately.
        //
        // Astryx's `Tokenizer` defaults its input to "Search…", and this field
        // has no suggestion source at all (`EMPTY_TAG_SEARCH_SOURCE`) — so it
        // invited the user to search, showed no list, and read as broken. The
        // `extra` line directly above already says to separate values with a
        // comma or a space, which is the actual instruction.
        //
        // Empty is also exact legacy parity: `git show origin/main:` has the
        // `placeholder` prop COMMENTED OUT on the antd `Select mode="tags"`, so
        // legacy rendered no placeholder either.
        placeholder=""
      />
    </Form.Item>
  );
};

/**
 * antd `Tag` → Astryx `Badge` (MAPPING §3.5), with the colour routed through
 * the repo-global lookup (ticket 13) instead of a literal hue.
 *
 * P1 note: the props were grepped, not guessed — the only call site
 * (`SessionLauncherPreview`) passes `value`, `style` and `children`.
 */
interface PortTagProps {
  value: string;
  inValid?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const PortTag: React.FC<PortTagProps> = ({
  inValid,
  value,
  children,
  ...tagProps
}) => {
  return (
    <Badge
      {...tagProps}
      variant={badgeVariantForTagColor(
        !inValid && isValidPortStr(value) ? undefined : 'red',
      )}
      label={children ?? value}
    />
  );
};

export const isValidPortStr = (portStr: string) => {
  // consider range as valid
  if (isPortRangeStr(portStr)) {
    const splitPortRange = portStr.split(':');
    const [start, end] = splitPortRange.map((v) => parseInt(v));
    return start >= MIN_PORT && end <= MAX_PORT;
  } else if (
    portStr === parseInt(portStr).toString() &&
    parseInt(portStr) >= MIN_PORT &&
    parseInt(portStr) <= MAX_PORT
  ) {
    return true;
  }
  return false;
};

export const isPortRangeStr = (portRange: string) => {
  const splitPortRange = portRange.split(':');
  if (splitPortRange.length === 2) {
    const [start, end] = splitPortRange.map((v) => parseInt(v));
    return start <= end;
  }
  return false;
};

export const parsePortRangeToNumbers = (portRange: string) => {
  const [start, end] = portRange.split(':').map((v) => parseInt(v));
  return _.range(start, end + 1);
};

export const transformPortValuesToNumbers = (
  values: PortSelectFormValues['ports'],
) => {
  return _.flatten(
    _.map(values, (v) =>
      isPortRangeStr(v) ? parsePortRangeToNumbers(v) : parseInt(v),
    ),
  );
};
// const portGuides = {
//   '5432': 'PostgreSQL',
//   '3306': 'MySQL',
//   '1521': 'Oracle',
//   '27017': 'MongoDB',
//   '6379': 'Redis',
//   '11211': 'Memcached',
//   '9200': 'Elasticsearch',
//   '5601': 'Kibana',
//   '9600': 'Logstash',
//   '9042': 'Cassandra',
//   '2181': 'Zookeeper',
//   '9092': 'Kafka',
//   '80': 'HTTP',
//   '443': 'HTTPS',
//   '22': 'SSH',
//   '21': 'FTP',
//   '25': 'SMTP',
//   '110': 'POP3',
//   '143': 'IMAP',
//   '53': 'DNS',
//   '389': 'LDAP',
//   '636': 'LDAPS',
//   '8080': 'HTTP Alt',
//   '8443': 'HTTP Alt SSL',
//   '465': 'SMTP SSL',
//   '587': 'SMTP TLS',
//   '993': 'IMAP SSL',
//   '995': 'POP3 SSL',
//   '7001': 'WebLogic',
//   '7002': 'WebLogic SSL',
//   '4848': 'GlassFish',
//   '8181': 'GlassFish SSL',
//   '8081': 'Nginx',
// };

export default PortSelectFormItem;
