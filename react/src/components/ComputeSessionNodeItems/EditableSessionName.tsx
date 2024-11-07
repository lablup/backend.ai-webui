import { EditableSessionNameFragment$key } from './__generated__/EditableSessionNameFragment.graphql';
import { EditableSessionNameMutation } from './__generated__/EditableSessionNameMutation.graphql';
import { theme } from 'antd';
import Text, { TextProps } from 'antd/es/typography/Text';
import Title, { TitleProps } from 'antd/es/typography/Title';
import graphql from 'babel-plugin-relay/macro';
import React, { useState } from 'react';
import { useFragment, useMutation } from 'react-relay';

type EditableSessionNameProps = {
  sessionFrgmt: EditableSessionNameFragment$key;
} & (
  | ({ component?: typeof Text } & Omit<TextProps, 'children'>)
  | ({ component: typeof Title } & Omit<TitleProps, 'children'>)
);

const EditableSessionName: React.FC<EditableSessionNameProps> = ({
  component: Component = Text,
  sessionFrgmt,
  style,
  ...otherProps
}) => {
  const session = useFragment(
    graphql`
      fragment EditableSessionNameFragment on ComputeSessionNode {
        id
        name
        priority
      }
    `,
    sessionFrgmt,
  );
  const [optimisticName, setOptimisticName] = useState(session.name);
  const { token } = theme.useToken();
  const [commitEditMutation, isPendingEditMutation] =
    useMutation<EditableSessionNameMutation>(graphql`
      mutation EditableSessionNameMutation($input: ModifyComputeSessionInput!) {
        modify_compute_session(input: $input) {
          item {
            id
            name
          }
        }
      }
    `);
  return (
    session && (
      <Component
        editable={
          isPendingEditMutation
            ? undefined
            : {
                onChange: (newName) => {
                  setOptimisticName(newName);
                  commitEditMutation({
                    variables: {
                      input: {
                        id: session.id,
                        name: newName,
                        // TODO: Setting the priority is not needed here. However, due to an API bug, we will keep it.
                        priority: session.priority,
                      },
                    },
                    onCompleted(response, errors) {},
                    onError(error) {},
                  });
                },
                triggerType: ['icon', 'text'],
              }
        }
        copyable
        style={{
          ...style,
          color: isPendingEditMutation ? token.colorTextTertiary : style?.color,
        }}
        {...otherProps}
      >
        {isPendingEditMutation ? optimisticName : session.name}
      </Component>
    )
  );
};

export default EditableSessionName;
