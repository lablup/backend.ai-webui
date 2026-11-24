/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { localeCompare } from '../../../helper';
import { useAccessibleProjects } from '../../../hooks/useAccessibleProjects';
import { BAISelect, type BAISelectProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';

interface ProjectNameSelectProps extends Omit<BAISelectProps, 'options'> {
  /** The domain whose active projects are listed. */
  domain: string;
}

/** Picks a project of `domain` by name, the shape plugin settings store. */
const ProjectNameSelect: React.FC<ProjectNameSelectProps> = ({
  domain,
  ...selectProps
}) => {
  'use memo';
  const { groups } = useAccessibleProjects({
    domain,
    fetchPolicy: 'store-and-network',
  });
  return (
    <BAISelect
      showSearch
      options={_.map(groups, (group) => ({
        value: group?.name ?? '',
        label: group?.name ?? '',
      })).sort((a, b) => localeCompare(a.label, b.label))}
      {...selectProps}
    />
  );
};

export default ProjectNameSelect;
