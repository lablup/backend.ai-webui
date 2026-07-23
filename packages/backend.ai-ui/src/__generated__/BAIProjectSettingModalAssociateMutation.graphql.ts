/**
 * @generated SignedSource<<f8e93ebcb644feedc4144d7a4b49c8b9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectSettingModalAssociateMutation$variables = {
  scaling_groups: ReadonlyArray<string | null | undefined>;
  user_group: string;
};
export type BAIProjectSettingModalAssociateMutation$data = {
  readonly associate_scaling_groups_with_user_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type BAIProjectSettingModalAssociateMutation = {
  response: BAIProjectSettingModalAssociateMutation$data;
  variables: BAIProjectSettingModalAssociateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scaling_groups"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "user_group"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "scaling_groups",
        "variableName": "scaling_groups"
      },
      {
        "kind": "Variable",
        "name": "user_group",
        "variableName": "user_group"
      }
    ],
    "concreteType": "AssociateScalingGroupsWithUserGroup",
    "kind": "LinkedField",
    "name": "associate_scaling_groups_with_user_group",
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
    "name": "BAIProjectSettingModalAssociateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIProjectSettingModalAssociateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d68647d92e44837f40c0d1cddffdc119",
    "id": null,
    "metadata": {},
    "name": "BAIProjectSettingModalAssociateMutation",
    "operationKind": "mutation",
    "text": "mutation BAIProjectSettingModalAssociateMutation(\n  $scaling_groups: [String]!\n  $user_group: UUID!\n) {\n  associate_scaling_groups_with_user_group(scaling_groups: $scaling_groups, user_group: $user_group) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "5f413ce037f1909c80975b24e534498e";

export default node;
