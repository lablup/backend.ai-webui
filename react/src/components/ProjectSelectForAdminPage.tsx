/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ProjectSelect, { ProjectSelectProps } from './ProjectSelect';
import React from 'react';

interface ProjectSelectForAdminPageProps extends Omit<
  ProjectSelectProps,
  'disableDefaultFilter'
> {}

const ProjectSelectForAdminPage: React.FC<ProjectSelectForAdminPageProps> = ({
  ...projectSelectProps
}) => {
  return <ProjectSelect {...projectSelectProps} disableDefaultFilter />;
};

export default ProjectSelectForAdminPage;
