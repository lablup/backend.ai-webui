/**
 * @generated SignedSource<<31cfdcfd066db219a299344a4476ab4c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModelCardV2AccessLevel = "INTERNAL" | "PUBLIC" | "%future added value";
export type CreateModelCardV2Input = {
  accessLevel?: ModelCardV2AccessLevel;
  architecture?: string | null | undefined;
  author?: string | null | undefined;
  category?: string | null | undefined;
  description?: string | null | undefined;
  domainName?: string | null | undefined;
  framework?: ReadonlyArray<string> | null | undefined;
  label?: ReadonlyArray<string> | null | undefined;
  license?: string | null | undefined;
  modelStoreProjectId: string;
  modelVersion?: string | null | undefined;
  name: string;
  readme?: string | null | undefined;
  task?: string | null | undefined;
  title?: string | null | undefined;
  vfolderId: string;
};
export type AdminModelCardSettingModalCreateMutation$variables = {
  input: CreateModelCardV2Input;
};
export type AdminModelCardSettingModalCreateMutation$data = {
  readonly adminCreateModelCardV2: {
    readonly modelCard: {
      readonly id: string;
    };
  } | null | undefined;
};
export type AdminModelCardSettingModalCreateMutation = {
  response: AdminModelCardSettingModalCreateMutation$data;
  variables: AdminModelCardSettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateModelCardPayloadGQL",
    "kind": "LinkedField",
    "name": "adminCreateModelCardV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ModelCardV2",
        "kind": "LinkedField",
        "name": "modelCard",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
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
    "name": "AdminModelCardSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminModelCardSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "09005d505556ef6bee2c7ffe92657e47",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardSettingModalCreateMutation(\n  $input: CreateModelCardV2Input!\n) {\n  adminCreateModelCardV2(input: $input) {\n    modelCard {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1f49685881136e9a0d15ede6818a62cc";

export default node;
