/*
 to-astryx W2-D: antd `Descriptions` -> Astryx `MetadataList` +
 `MetadataListItem` (MAPPING §4), and `Typography.Paragraph` -> `Text as="p"
 display="block"`.

 PILOT-DECISION: `column={2}` becomes `columns="multi"` and the per-item
 `span={2}` is DROPPED — MAPPING §4 records both `bordered` (×27 repo-wide) and
 `Descriptions.Item span` (×20) as having **no** Astryx destination. The list
 keeps its two-column reading; the two full-width rows (name, description) now
 occupy one cell each. The `bordered` grid also goes: `MetadataList` is a
 borderless definition list by design, which is the defaults-first answer to a
 closed appearance API (P5).

 The `items` ARRAY becomes children — `MetadataListItem` is a component, and
 its `label` is a required string, which every entry here already was.
*/
import { BAIArtifactDescriptionsFragment$key } from '../../__generated__/BAIArtifactDescriptionsFragment.graphql';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import BAILink from '../BAILink';
import BAIMetadataList from '../BAIMetadataList';
import BAIArtifactTypeTag from './BAIArtifactTypeTag';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { graphql, useFragment } from 'react-relay';

export interface BAIArtifactDescriptionsProps {
  artifactFrgmt: BAIArtifactDescriptionsFragment$key;
}

dayjs.extend(relativeTime);

const BAIArtifactDescriptions = ({
  artifactFrgmt,
}: BAIArtifactDescriptionsProps) => {
  const { t } = useBAIi18n();
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

  return (
    <BAIMetadataList columns="multi">
      <MetadataListItem label={t('comp:BAIArtifactDescriptions.Name')}>
        {artifact.name}
      </MetadataListItem>
      <MetadataListItem label={t('comp:BAIArtifactDescriptions.Type')}>
        <BAIArtifactTypeTag artifactTypeFrgmt={artifact} />
      </MetadataListItem>
      <MetadataListItem label={t('comp:BAIArtifactDescriptions.Source')}>
        <BAILink to={artifact.source.url ?? ''} target="_blank">
          {artifact.source.name}
        </BAILink>
      </MetadataListItem>
      <MetadataListItem label={t('comp:BAIArtifactDescriptions.Description')}>
        {artifact.description ? (
          <Text as="p" display="block">
            {artifact.description}
          </Text>
        ) : (
          'N/A'
        )}
      </MetadataListItem>
    </BAIMetadataList>
  );
};

export default BAIArtifactDescriptions;
