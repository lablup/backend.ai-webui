/**
 * @generated SignedSource<<37a0f6d784e81a38e53b8b5a390834d4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ServiceLauncherPageContentFragment$data = {
  readonly cluster_mode: string | null | undefined;
  readonly cluster_size: number | null | undefined;
  readonly desired_session_count: number | null | undefined;
  readonly endpoint_id: string | null | undefined;
  readonly environ: string | null | undefined;
  readonly extra_mounts: ReadonlyArray<{
    readonly id: string;
    readonly name: string | null | undefined;
    readonly row_id: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly image_object: {
    readonly architecture: string | null | undefined;
    readonly digest: string | null | undefined;
    readonly humanized_name: string | null | undefined;
    readonly is_local: boolean | null | undefined;
    readonly labels: ReadonlyArray<{
      readonly key: string | null | undefined;
      readonly value: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly name: string | null | undefined;
    readonly namespace: string | null | undefined;
    readonly registry: string | null | undefined;
    readonly resource_limits: ReadonlyArray<{
      readonly key: string | null | undefined;
      readonly max: string | null | undefined;
      readonly min: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly size_bytes: any | null | undefined;
    readonly supported_accelerators: ReadonlyArray<string | null | undefined> | null | undefined;
    readonly tag: string | null | undefined;
  } | null | undefined;
  readonly model: string | null | undefined;
  readonly model_definition_path: string | null | undefined;
  readonly model_mount_destination: string | null | undefined;
  readonly name: string | null | undefined;
  readonly open_to_public: boolean | null | undefined;
  readonly project: string | null | undefined;
  readonly replicas: number | null | undefined;
  readonly resource_group: string | null | undefined;
  readonly resource_opts: string | null | undefined;
  readonly resource_slots: string | null | undefined;
  readonly runtime_variant: {
    readonly human_readable_name: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "ServiceLauncherPageContentFragment";
};
export type ServiceLauncherPageContentFragment$key = {
  readonly " $data"?: ServiceLauncherPageContentFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ServiceLauncherPageContentFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ServiceLauncherPageContentFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endpoint_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "project",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "desired_session_count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "replicas",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_group",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_opts",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cluster_mode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cluster_size",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "open_to_public",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "model",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "model_mount_destination",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "model_definition_path",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "environ",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "RuntimeVariantInfo",
      "kind": "LinkedField",
      "name": "runtime_variant",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "human_readable_name",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VirtualFolderNode",
      "kind": "LinkedField",
      "name": "extra_mounts",
      "plural": true,
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
          "name": "row_id",
          "storageKey": null
        },
        (v0/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ImageNode",
      "kind": "LinkedField",
      "name": "image_object",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "namespace",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "humanized_name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "tag",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "registry",
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
          "name": "is_local",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "digest",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceLimit",
          "kind": "LinkedField",
          "name": "resource_limits",
          "plural": true,
          "selections": [
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "min",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "max",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "KVPair",
          "kind": "LinkedField",
          "name": "labels",
          "plural": true,
          "selections": [
            (v1/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "value",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "size_bytes",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "supported_accelerators",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    (v0/*: any*/)
  ],
  "type": "Endpoint",
  "abstractKey": null
};
})();

(node as any).hash = "2018b5d2506252ca60551cba53bd6c9f";

export default node;
