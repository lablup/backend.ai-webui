/**
 * @generated SignedSource<<1efb9812636440b518114a35bab8ac8a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModelCardV2AccessLevel = "INTERNAL" | "PUBLIC" | "%future added value";
export type UpdateModelCardV2Input = {
  accessLevel?: ModelCardV2AccessLevel | null | undefined;
  architecture?: string | null | undefined;
  author?: string | null | undefined;
  category?: string | null | undefined;
  description?: string | null | undefined;
  framework?: ReadonlyArray<string> | null | undefined;
  id: string;
  label?: ReadonlyArray<string> | null | undefined;
  license?: string | null | undefined;
  modelVersion?: string | null | undefined;
  name?: string | null | undefined;
  readme?: string | null | undefined;
  task?: string | null | undefined;
  title?: string | null | undefined;
};
export type AdminModelCardSettingModalUpdateMutation$variables = {
  input: UpdateModelCardV2Input;
};
export type AdminModelCardSettingModalUpdateMutation$data = {
  readonly adminUpdateModelCardV2: {
    readonly modelCard: {
      readonly accessLevel: ModelCardV2AccessLevel;
      readonly id: string;
      readonly metadata: {
        readonly architecture: string | null | undefined;
        readonly author: string | null | undefined;
        readonly category: string | null | undefined;
        readonly description: string | null | undefined;
        readonly framework: ReadonlyArray<string>;
        readonly label: ReadonlyArray<string>;
        readonly license: string | null | undefined;
        readonly modelVersion: string | null | undefined;
        readonly task: string | null | undefined;
        readonly title: string | null | undefined;
      };
      readonly name: string;
      readonly readme: string | null | undefined;
    };
  } | null | undefined;
};
export type AdminModelCardSettingModalUpdateMutation = {
  response: AdminModelCardSettingModalUpdateMutation$data;
  variables: AdminModelCardSettingModalUpdateMutation$variables;
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
    "concreteType": "UpdateModelCardPayloadGQL",
    "kind": "LinkedField",
    "name": "adminUpdateModelCardV2",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "accessLevel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelCardV2Metadata",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "author",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "title",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "modelVersion",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "task",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "category",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "architecture",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "framework",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "label",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "license",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "readme",
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
    "name": "AdminModelCardSettingModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminModelCardSettingModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "655ebd8751bf373358d941d415488629",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardSettingModalUpdateMutation(\n  $input: UpdateModelCardV2Input!\n) {\n  adminUpdateModelCardV2(input: $input) {\n    modelCard {\n      id\n      name\n      accessLevel\n      metadata {\n        author\n        title\n        modelVersion\n        description\n        task\n        category\n        architecture\n        framework\n        label\n        license\n      }\n      readme\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5b091c1acbd27243d0a69fd1bafb516e";

export default node;
