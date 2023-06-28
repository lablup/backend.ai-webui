import React, { useState } from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment } from "react-relay";
import { ProjectMultiSelectorFragment$key } from "./__generated__/ProjectMultiSelectorFragment.graphql";

import { Select, Spin } from "antd";

interface Props {
  projectsFrgmt: ProjectMultiSelectorFragment$key | null;
}

const ProjectMultiSelector: React.FC<Props> = ({ projectsFrgmt }) => {
  const [fetching, setFetching] = useState(false);

  const projects = useFragment(
    graphql`
      fragment ProjectMultiSelectorFragment on Group {
        id
        name
      }
    `, projectsFrgmt
  );

  return (
    <>
    <Select
      labelInValue
      filterOption={false}
      notFoundContent={fetching ? <Spin size="small" /> : null}
    />
    {projects?.name}
    </>
  );
};

export default ProjectMultiSelector;