/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormItemProps } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { AstryxFormTagsInput } from './astryx-bui/astryxFormControls';
import { Tag } from 'antd';
import { TagProps } from 'antd/lib';
import * as _ from 'lodash-es';
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
        `SessionLauncherPreview`. `tokenSeparators={[',', ' ']}` is dropped
        too (no Tokenizer equivalent — ports commit one at a time with Enter),
        and `open={false}` / `suffixIcon={null}` map to nothing: the empty
        search source yields no dropdown and no suffix affordance.
      */}
      <AstryxFormTagsInput label={t('session.launcher.PreOpenPortTitle')} />
    </Form.Item>
  );
};

interface PortTagProps extends TagProps {
  value: string;
  inValid?: boolean;
}

export const PortTag: React.FC<PortTagProps> = ({
  inValid,
  value,
  ...tagProps
}) => {
  return (
    <Tag
      color={!inValid && isValidPortStr(value) ? undefined : 'red'}
      {...tagProps}
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
