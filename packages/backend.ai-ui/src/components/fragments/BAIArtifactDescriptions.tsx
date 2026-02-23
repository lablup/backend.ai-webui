import { BAIArtifactDescriptionsFragment$key } from '../../__generated__/BAIArtifactDescriptionsFragment.graphql';
import BAILink from '../BAILink';
import BAIArtifactTypeTag from './BAIArtifactTypeTag';
import { Descriptions, Typography, type DescriptionsProps } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactDescriptionsProps {
  artifactFrgmt: BAIArtifactDescriptionsFragment$key;
}

dayjs.extend(relativeTime);

const BAIArtifactDescriptions = ({
  artifactFrgmt,
}: BAIArtifactDescriptionsProps) => {
  const { t } = useTranslation();
  const artifact = useFragment<BAIArtifactDescriptionsFragment$key>(
    graphql`
      fragment BAIArtifactDescriptionsFragment on Artifact {
        name
        description
        source {
          name
          url
        }
        ...BAIArtifactTypeTagFragment
      }
    `,
    artifactFrgmt,
  );

  const items: DescriptionsProps['items'] = [
    {
      key: 'name',
      label: t('comp:BAIArtifactDescriptions.Name'),
      children: artifact.name,
      span: 2,
    },
    {
      key: 'type',
      label: t('comp:BAIArtifactDescriptions.Type'),
      children: <BAIArtifactTypeTag artifactTypeFrgmt={artifact} />,
    },
    {
      key: 'source',
      label: t('comp:BAIArtifactDescriptions.Source'),
      children: (
        <BAILink to={artifact.source.url ?? ''} target="_blank">
          {artifact.source.name}
        </BAILink>
      ),
    },
    {
      key: 'description',
      label: t('comp:BAIArtifactDescriptions.Description'),
      children: artifact.description ? (
        <Typography.Paragraph>{artifact.description}</Typography.Paragraph>
      ) : (
        'N/A'
      ),
      span: 2,
    },
  ];

  return <Descriptions column={2} bordered items={items} />;
};

export default BAIArtifactDescriptions;
