import BAIModal, { BAIModalProps } from './BAIModal';
import { EndpointMetricsModalQuery } from './__generated__/EndpointMetricsModalQuery.graphql';
import { Bar, Line } from '@ant-design/charts';
import { DownOutlined } from '@ant-design/icons';
import { Col, Dropdown, Row, Space } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  useFragment,
  useLazyLoadQuery,
  useMutation,
  useRelayEnvironment,
} from 'react-relay';

interface EndpointMetricsModalProps extends BAIModalProps {
  endpoint_id: string;
}

type LineChartData = {
  label: string;
  data: number;
};

const EndpointMetrics: React.FC<{ endpoint_id: string }> = ({
  endpoint_id,
}: {
  endpoint_id: string;
}) => {
  const relayEvn = useRelayEnvironment();

  const [dataSeries, setDataSeries] =
    useState<{ liveStat: any; lastUpdatedAt: Date }[]>();
  const [selectedMetric, setSelectedMetric] = useState<string>();
  const [chartType, setChartType] = useState<string>();

  const updateStatInfo = async () => {
    const response = await fetchQuery<EndpointMetricsModalQuery>(
      relayEvn,
      graphql`
        query EndpointMetricsModalQuery($endpointId: UUID!) {
          endpoint(endpoint_id: $endpointId) {
            name
            live_stat @since(version: "24.03.11")
          }
        }
      `,
      { endpointId: endpoint_id },
    ).toPromise();
    const liveStatJSON = response?.endpoint?.live_stat;
    if (liveStatJSON) {
      setDataSeries((prev) =>
        [
          ...(prev || []),
          { liveStat: JSON.parse(liveStatJSON), lastUpdatedAt: new Date() },
        ].slice(-30),
      );
    }
  };

  useEffect(() => {
    const itv = setInterval(updateStatInfo, 1500);
    updateStatInfo();

    return () => clearInterval(itv);
  }, []);

  const chartData = useMemo(() => {
    if (!dataSeries || !selectedMetric) return;

    const dataPoints = dataSeries.map((data) => data.liveStat[selectedMetric]);
    if (dataPoints.length === 0) return;
    const dataType = dataPoints[0].__type;

    setChartType(dataType);
    switch (dataType) {
      case 'HISTOGRAM':
        const cdf = dataPoints[dataPoints.length - 1].current;
        const max = parseFloat(cdf['+Inf']);
        return Array.from(Object.keys(cdf)).map((label) => ({
          label,
          data: parseFloat(cdf[label]) / max,
        }));
      case 'GAUGE':
      case 'ACCUMULATION':
        return dataPoints.map((point, index) => {
          const label = `${_.padStart(dataSeries[index].lastUpdatedAt.getHours().toString(), 2, '0')}:${_.padStart(dataSeries[index].lastUpdatedAt.getMinutes().toString(), 2, '0')}:${_.padStart(dataSeries[index].lastUpdatedAt.getSeconds().toString(), 2, '0')}`;
          return { label, data: parseFloat(point.current) };
        });
      default:
        return;
    }
  }, [dataSeries, selectedMetric]);

  const chartStyles = useMemo(() => {
    if (!chartType) return;

    switch (chartType) {
      case 'HISTOGRAM':
        return {
          point: {
            sizeField: 4,
          },
          style: {
            lineWidth: 2,
            stroke: 'red',
          },
          animation: false,
          animate: false,
          autoFit: true,
        };
      case 'GAUGE':
      case 'ACCUMULATION':
        return {
          style: {
            lineWidth: 2,
            stroke: 'blue',
          },
          animation: false,
          animate: false,
          autoFit: true,
        };
    }
  }, [chartType]);

  return (
    <div>
      <Dropdown
        menu={{
          items: dataSeries
            ? Array.from(Object.keys(dataSeries[0].liveStat)).map((key) => ({
                key,
                label: `${key} (${dataSeries[0].liveStat[key].__type})`,
              }))
            : [],
          onClick: (info) => setSelectedMetric(info.key),
        }}
        disabled={dataSeries?.length === 0}
      >
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            {selectedMetric
              ? `${selectedMetric} (${chartType})`
              : 'Select Metric'}
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>

      <div style={{ height: '80%' }}>
        {selectedMetric && chartData ? (
          <Line
            data={chartData}
            xField="label"
            yField="data"
            title={selectedMetric}
            {...(chartStyles || {})}
          />
        ) : null}
      </div>
    </div>
  );
};

const EndpointMetricsModal: React.FC<EndpointMetricsModalProps> = ({
  endpoint_id,
  ...modalProps
}) => {
  const { t } = useTranslation();

  return (
    <BAIModal
      {...modalProps}
      footer={null}
      title={t('button.ViewMetrics')}
      destroyOnClose
      width="90%"
    >
      <EndpointMetrics endpoint_id={endpoint_id} />
    </BAIModal>
  );
};

export default EndpointMetricsModal;
