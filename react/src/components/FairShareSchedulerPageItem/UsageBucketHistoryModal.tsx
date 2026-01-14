import { DatePicker, Form } from 'antd';
import { BAIFlex, BAIModal, BAIModalProps, BAISelect } from 'backend.ai-ui';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface UsageBucketHistoryModalProps extends BAIModalProps {
  resourceGroupName?: string | null;
  domainName?: string | null;
  projectName?: string | null;
  usageTargetName?: string | null;
  onRequestClose: () => void;
}

const UsageBucketHistoryModal: React.FC<UsageBucketHistoryModalProps> = ({
  resourceGroupName,
  domainName,
  projectName,
  usageTargetName,
  onRequestClose,
  ...modalProps
}) => {
  const { RangePicker } = DatePicker;

  const INITIAL_FORM_VALUES = {
    resourceGroup: resourceGroupName || '',
    domain: domainName || usageTargetName || '',
    project: projectName || usageTargetName || '',
  };

  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  return (
    <BAIModal
      {...modalProps}
      onCancel={onRequestClose}
      width={600}
      title="Usage Bucket History"
    >
      <BAIFlex direction="column" align="stretch">
        <Form
          layout="vertical"
          initialValues={INITIAL_FORM_VALUES}
          requiredMark={false}
        >
          <BAIFlex direction="column" align="start" gap="sm">
            <BAIFlex gap="sm">
              <Form.Item label="Resource Group" name="resourceGroup">
                <BAISelect
                  options={[
                    {
                      value: resourceGroupName || '',
                      label: resourceGroupName || '',
                    },
                    {
                      value: 'example_resource_group_2',
                      label: 'example_resource_group_2',
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Domain" name="domain">
                <BAISelect
                  options={[
                    {
                      value: 'domain example',
                      label: 'domain example',
                    },
                    {
                      value: 'example_domain_2',
                      label: 'example_domain_2',
                    },
                  ]}
                />
              </Form.Item>
              {domainName && (
                <Form.Item label="Project" name="project">
                  <BAISelect
                    options={[
                      {
                        value: projectName || '',
                        label: projectName || '',
                      },
                      {
                        value: 'example_project_2',
                        label: 'example_project_2',
                      },
                    ]}
                  />
                </Form.Item>
              )}
            </BAIFlex>
            <Form.Item label="Date Range" name="dateRange">
              <RangePicker />
            </Form.Item>
          </BAIFlex>
        </Form>

        <ResponsiveContainer height={300}>
          <BarChart
            style={{
              width: '100%',
              maxWidth: '700px',
              aspectRatio: 1.618,
            }}
            data={data}
            margin={{
              top: 20,
              right: 0,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pv" stackId="a" fill="#8884d8" background />
            <Bar dataKey="uv" stackId="a" fill="#82ca9d" background />
          </BarChart>
        </ResponsiveContainer>
      </BAIFlex>
    </BAIModal>
  );
};

export default UsageBucketHistoryModal;
