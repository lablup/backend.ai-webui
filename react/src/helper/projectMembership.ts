/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';

/**
 * Manager 26.9.0. Created and removed with the user, so an admin never assigns
 * it and no project selector can offer it.
 */
export const PERSONAL_PROJECT_TYPE = 'PERSONAL';

export type ProjectMembership = {
  id: string;
  name: string;
  type: string;
};

type ProjectMembershipEdges =
  | ReadonlyArray<
      | {
          readonly node?:
            | {
                readonly id: string;
                readonly basicInfo: {
                  readonly name: string;
                  readonly type: string;
                };
              }
            | null
            | undefined;
        }
      | null
      | undefined
    >
  | null
  | undefined;

/**
 * Splits `UserV2.projects` into what a project selector may show and what it
 * must carry untouched — `UpdateUserV2Input.groupIds` replaces the whole
 * membership set, so `personal` has to be re-attached on submit.
 */
export const partitionProjectMemberships = (
  edges: ProjectMembershipEdges,
): {
  assignable: Array<ProjectMembership>;
  personal: Array<ProjectMembership>;
} => {
  const memberships = _.compact(
    _.map(edges, (edge) =>
      edge?.node
        ? {
            id: toLocalId(edge.node.id),
            name: edge.node.basicInfo.name,
            type: edge.node.basicInfo.type,
          }
        : null,
    ),
  );
  return {
    assignable: _.filter(
      memberships,
      (project) => project.type !== PERSONAL_PROJECT_TYPE,
    ),
    personal: _.filter(
      memberships,
      (project) => project.type === PERSONAL_PROJECT_TYPE,
    ),
  };
};
