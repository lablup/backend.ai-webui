import { useSuspendedBackendaiClient } from '../hooks';
import { Form, FormItemProps, Select, Tag } from 'antd';
import { TagProps } from 'antd/lib';
import _ from 'lodash';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface Props extends FormItemProps {}

const MIN_PORT = 1024;
const MAX_PORT = 65535;
const PortSelectFormItem: React.FC<Props> = ({ ...formItemProps }) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  return (
    <Form.Item
      label={t('session.launcher.PreOpenPortTitle')}
      name="ports"
      tooltip={<Trans i18nKey="session.launcher.DescSetPreOpenPort" />}
      extra={t('session.launcher.PreOpenPortRangeGuide')}
      rules={[
        {
          max: baiClient._config.maxCountForPreopenPorts,
          type: 'array',
          message: t('session.launcher.PreOpenPortMaxCountLimit', {
            count: baiClient._config.maxCountForPreopenPorts,
          }),
        },
        ({ getFieldValue }) => ({
          validator(rule, values) {
            if (
              _.every(values, (v) => {
                const port = parseInt(v);
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
      ]}
      {...formItemProps}
    >
      <Select
        mode="tags"
        tagRender={(props) => {
          return (
            <PortTag
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
        // placeholder={t('session.launcher.preopen')}
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
}
export const PortTag: React.FC<PortTagProps> = ({ value, ...tagProps }) => {
  const port = parseInt(value);
  const isValid = port >= MIN_PORT && port <= MAX_PORT;
  return <Tag color={isValid ? undefined : 'red'} {...tagProps} />;
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
