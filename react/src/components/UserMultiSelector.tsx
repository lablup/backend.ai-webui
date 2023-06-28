import React, { useState } from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment } from "react-relay";
import { UserMultiSelectorFragment$key } from "./__generated__/UserMultiSelectorFragment.graphql";

import { Select, Spin } from "antd";

interface Props {
  usersFrgmt: UserMultiSelectorFragment$key | null;
}
const UserMultiSelector: React.FC<Props> = ({ usersFrgmt }) => {
  const [fetching, setFetching] = useState(false);

  const users = useFragment(
    graphql`
      fragment UserMultiSelectorFragment on User {
        id
        username
      }
    `, usersFrgmt
  );
  return (
    <>
    <Select
      labelInValue
      filterOption={false}
      notFoundContent={fetching ? <Spin size="small" /> : null}
    />
    {users?.username}
    </>
  );
};

export default UserMultiSelector;