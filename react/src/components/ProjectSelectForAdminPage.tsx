import ProjectSelect, { ProjectSelectProps } from './ProjectSelect';
import React from 'react';

interface ProjectSelectForAdminPageProps
  extends Omit<ProjectSelectProps, 'disableDefaultFilter'> {}

const ProjectSelectForAdminPage: React.FC<ProjectSelectForAdminPageProps> = ({
  ...projectSelectProps
}) => {
  return <ProjectSelect {...projectSelectProps} disableDefaultFilter />;
};

export default ProjectSelectForAdminPage;
