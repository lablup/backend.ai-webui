/**
 * @generated SignedSource<<d9b5d6c8388b708270a5b5f31312a2df>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyGroupInput = {
  allowed_vfolder_hosts?: string | null | undefined;
  container_registry?: string | null | undefined;
  description?: string | null | undefined;
  domain_name?: string | null | undefined;
  integration_id?: string | null | undefined;
  is_active?: boolean | null | undefined;
  name?: string | null | undefined;
  resource_policy?: string | null | undefined;
  total_resource_slots?: string | null | undefined;
  user_update_mode?: string | null | undefined;
  user_uuids?: ReadonlyArray<string | null | undefined> | null | undefined;
};
export type BAIProjectBulkEditModalProjectMutation$variables = {
  gid: string;
  props: ModifyGroupInput;
};
export type BAIProjectBulkEditModalProjectMutation$data = {
  readonly modify_group: {
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type BAIProjectBulkEditModalProjectMutation = {
  response: BAIProjectBulkEditModalProjectMutation$data;
  variables: BAIProjectBulkEditModalProjectMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "gid"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "gid",
        "variableName": "gid"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "ModifyGroup",
    "kind": "LinkedField",
    "name": "modify_group",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIProjectBulkEditModalProjectMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIProjectBulkEditModalProjectMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f40c80d0c744c4c03a07bd9c64c6cb58",
    "id": null,
    "metadata": {},
    "name": "BAIProjectBulkEditModalProjectMutation",
    "operationKind": "mutation",
    "text": "mutation BAIProjectBulkEditModalProjectMutation(\n  $gid: UUID!\n  $props: ModifyGroupInput!\n) {\n  modify_group(gid: $gid, props: $props) {\n    ok\n  }\n}\n"
  }
};
})();

(node as any).hash = "7a741d4d92325e5c4775978312f23e3d";

export default node;
