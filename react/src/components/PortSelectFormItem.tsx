import { Form, FormItemProps, Select, Tag } from 'antd';
import _ from 'lodash';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface Props extends FormItemProps {}

const portPattern =
  /^(102[4-9]|10[3-9][0-9]|1[1-9][0-9]{2}|[2-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;

const PortSelectFormItem: React.FC<Props> = ({ ...formItemProps }) => {
  const { t } = useTranslation();
  return (
    <Form.Item
      label={t('session.launcher.PreOpenPortTitle')}
      name="ports"
      tooltip={<Trans i18nKey="session.launcher.DescSetPreOpenPort" />}
      extra={t('session.launcher.PreOpenPortRangeGuide')}
      rules={[
        // {
        //   max: 2,
        //   type: 'array',
        // },
        ({ getFieldValue }) => ({
          validator(rule, values) {
            if (_.every(values, (v) => portPattern.test(v))) {
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
          const isValid = portPattern.test(props.value);
          return (
            <Tag
              closable={props.closable}
              onClose={props.onClose}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              color={isValid ? undefined : 'red'}
            >
              {props.label}
            </Tag>
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
