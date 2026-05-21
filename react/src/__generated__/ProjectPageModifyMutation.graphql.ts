/**
 * @generated SignedSource<<c7bd3c4fb7ca9b43288fa0bea090b02c>>
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
export type ProjectPageModifyMutation$variables = {
  gid: string;
  props: ModifyGroupInput;
};
export type ProjectPageModifyMutation$data = {
  readonly modify_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ProjectPageModifyMutation = {
  response: ProjectPageModifyMutation$data;
  variables: ProjectPageModifyMutation$variables;
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
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
    "name": "ProjectPageModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectPageModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "52f1023727b64f1963d45b37099cde24",
    "id": null,
    "metadata": {},
    "name": "ProjectPageModifyMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectPageModifyMutation(\n  $gid: UUID!\n  $props: ModifyGroupInput!\n) {\n  modify_group(gid: $gid, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "13b9ec00c988981fdd6ea46a4cc72cdb";

export default node;
