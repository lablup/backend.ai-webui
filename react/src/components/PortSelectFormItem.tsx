import { useSuspendedBackendaiClient } from '../hooks';
import { Form, type FormItemProps, Select, Tag } from 'antd';
import { TagProps } from 'antd/lib';
import _ from 'lodash';
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
  const form = Form.useFormInstance();
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
      <Select
        mode="tags"
        tagRender={(props) => {
          const hasDuplicated =
            _.filter(
              transformPortValuesToNumbers(form.getFieldValue(name)),
              (v) => v === parseInt(props.value),
            ).length > 1;
          return (
            <PortTag
              inValid={hasDuplicated}
              closable={props.closable}
              onClose={props.onClose}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              value={props.value}
            >
              {props.label}
            </PortTag>
          );
        }}
        style={{ width: '100%' }}
        // placeholder={t('session.launcher.PreOpen')}
        // options={_.map(portGuides, (v, k) => ({
        //   value: parseInt(k),
        //   // label: `${k} - ${v}`,
        // }))}
        suffixIcon={null}
        open={false}
        tokenSeparators={[',', ' ']}
      />
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
