/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  ASTNode,
  FieldNode,
  FragmentDefinitionNode,
  Kind,
  parse,
  print,
  SelectionSetNode,
  visit,
} from 'graphql';

/** Response keys from the data root down to one field, e.g. `['a', 'edges', 'node', 'b']`. */
export type ResponsePath = ReadonlyArray<string>;

const OPERATION_OWNER = 'operation';
const fragmentOwner = (name: string) => `fragment:${name}`;

const responseKey = (field: FieldNode) =>
  field.alias?.value ?? field.name.value;

type VisitAncestors = ReadonlyArray<ASTNode | ReadonlyArray<ASTNode>>;

// Owner is the operation or the fragment definition the node sits in; the path is relative to it.
function locate(ancestors: VisitAncestors, leaf?: FieldNode) {
  let owner: string | undefined;
  const path: string[] = [];
  for (const ancestor of ancestors) {
    if (Array.isArray(ancestor) || !('kind' in ancestor)) continue;
    const node = ancestor as ASTNode;
    if (node.kind === Kind.OPERATION_DEFINITION) owner = OPERATION_OWNER;
    else if (node.kind === Kind.FRAGMENT_DEFINITION)
      owner = fragmentOwner(node.name.value);
    else if (node.kind === Kind.FIELD) path.push(responseKey(node));
  }
  if (leaf) path.push(responseKey(leaf));
  return owner === undefined ? undefined : { owner, path };
}

const isEmptySelection = (node: {
  selectionSet?: { selections: ReadonlyArray<unknown> };
}) =>
  node.selectionSet !== undefined && node.selectionSet.selections.length === 0;

export function manipulateGraphQLQueryWithClientDirectives(
  query: string,
  variables: any = {},
  isNotCompatibleWith: (version: string | Array<string>) => boolean,
) {
  return transformGraphQLQueryWithClientDirectives(
    query,
    variables,
    isNotCompatibleWith,
  ).query;
}

/**
 * Strips client-directive fields from `query` and returns, next to the query,
 * the response paths of every stripped field. Relay still expects those fields,
 * so `fillStrippedFields` must set them to `null` in the response; otherwise
 * the store records them as missing and every availability check refetches.
 */
export function transformGraphQLQueryWithClientDirectives(
  query: string,
  variables: any = {},
  isNotCompatibleWith: (version: string | Array<string>) => boolean,
): { query: string; nullPaths: Array<ResponsePath> } {
  const ast = parse(query);

  const fragmentsByName = new Map<string, FragmentDefinitionNode>();
  for (const definition of ast.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION)
      fragmentsByName.set(definition.name.value, definition);
  }
  // Every path under a stripped field: another selection of the same response
  // key can keep the parent in the response, leaving only these children absent.
  const collectSubtree = (
    selectionSet: SelectionSetNode | undefined,
    prefix: ResponsePath,
    out: Array<ResponsePath>,
    depth = 0,
  ) => {
    if (!selectionSet || depth > 50) return;
    for (const selection of selectionSet.selections) {
      if (selection.kind === Kind.FIELD) {
        const path = [...prefix, responseKey(selection)];
        out.push(path);
        collectSubtree(selection.selectionSet, path, out, depth + 1);
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        collectSubtree(selection.selectionSet, prefix, out, depth + 1);
      } else {
        const fragment = fragmentsByName.get(selection.name.value);
        collectSubtree(fragment?.selectionSet, prefix, out, depth + 1);
      }
    }
  };

  const strippedByOwner = new Map<string, Array<ResponsePath>>();
  const recordStripped = (ancestors: VisitAncestors, field: FieldNode) => {
    const location = locate(ancestors, field);
    if (!location) return;
    const paths = strippedByOwner.get(location.owner) ?? [];
    paths.push(location.path);
    collectSubtree(field.selectionSet, location.path, paths);
    strippedByOwner.set(location.owner, paths);
  };

  // Optionally normalize fragment type conditions from Query to Queries
  let newAst = ast;
  // Since the super graph, the query type has been changed from Queries to Query
  const shouldConvertFragmentTypeToQueries = isNotCompatibleWith('25.14.0');
  if (shouldConvertFragmentTypeToQueries) {
    function normalizeFragmentTypeCondition(node: any) {
      if (!node.typeCondition) return;
      const current = node.typeCondition.name.value;
      const next = current === 'Query' ? 'Queries' : current;
      if (next !== current) {
        return {
          ...node,
          typeCondition: {
            ...node.typeCondition,
            name: {
              ...node.typeCondition.name,
              value: next,
            },
          },
        };
      }
    }

    newAst = visit(newAst, {
      FragmentDefinition: {
        enter(node) {
          return normalizeFragmentTypeCondition(node);
        },
      },
      InlineFragment: {
        enter(node) {
          return normalizeFragmentTypeCondition(node);
        },
      },
    });
  }

  // Spread locations are taken before any removal: a spread dropped later
  // (its fragment emptied) still maps that fragment's stripped fields.
  const spreadsByOwner = new Map<
    string,
    Array<{ fragment: string; path: ResponsePath }>
  >();
  visit(newAst, {
    FragmentSpread(node, _key, _parent, _path, ancestors) {
      const location = locate(ancestors);
      if (!location) return;
      const spreads = spreadsByOwner.get(location.owner) ?? [];
      spreads.push({ fragment: node.name.value, path: location.path });
      spreadsByOwner.set(location.owner, spreads);
    },
  });

  // First pass: Remove fields with client directives and clean up directives
  newAst = visit(newAst, {
    Field: {
      enter(node, _key, _parent, _path, ancestors) {
        if (
          // find any directive that should be skipped
          node?.directives?.some((directive) => {
            const directiveName = directive.name.value;
            const firstArgName = directive.arguments?.[0].name.value;
            const arg = directive.arguments?.[0];

            if (directiveName === 'since' && firstArgName === 'version') {
              const version =
                arg?.value.kind === 'StringValue'
                  ? arg?.value.value
                  : // @ts-ignore
                    variables[arg?.value.name.value];
              if (isNotCompatibleWith(version)) {
                return true; // skip this field
              }
            } else if (
              directiveName === 'sinceMultiple' &&
              firstArgName === 'versions'
            ) {
              const versions =
                arg?.value.kind === 'ListValue'
                  ? // @ts-ignore
                    arg?.value.values.map((v) => v.value)
                  : // @ts-ignore
                    variables[arg?.value.name.value];
              if (isNotCompatibleWith(versions)) {
                return true; // skip this field
              }
            } else if (
              directiveName === 'deprecatedSince' &&
              firstArgName === 'version'
            ) {
              const version =
                arg?.value.kind === 'StringValue'
                  ? arg?.value.value
                  : // @ts-ignore
                    variables[arg?.value.name.value];
              if (!isNotCompatibleWith(version)) {
                return true; // skip this field
              }
            } else if (
              directiveName === 'deprecatedSinceMultiple' &&
              firstArgName === 'versions'
            ) {
              const versions =
                arg?.value.kind === 'ListValue'
                  ? // @ts-ignore
                    arg?.value.values.map((v) => v.value)
                  : // @ts-ignore
                    variables[arg?.value.name.value];
              if (!isNotCompatibleWith(versions)) {
                return true; // skip this field
              }
              return false;
            } else if (
              directiveName === 'skipOnClient' &&
              firstArgName === 'if'
            ) {
              if (arg?.value.kind === 'BooleanValue' && arg.value.value) {
                return true; // skip this field
              }

              if (
                arg?.value.kind === 'Variable' &&
                variables[arg.value.name.value]
              ) {
                return true; // skip this field
              }
            }
            return false; // do not skip this field
          })
        ) {
          recordStripped(ancestors, node);
          return null;
        }
      },
      leave(node, _key, _parent, _path, ancestors) {
        // when field has a empty selectionSet, delete it
        if (isEmptySelection(node)) {
          recordStripped(ancestors, node);
          return null;
        }
      },
    },
    InlineFragment: {
      // `... on X {}` does not parse; drop it so the parent can empty out too
      leave(node) {
        if (isEmptySelection(node)) return null;
      },
    },
    Directive: {
      // delete all onClient directives
      leave(directive) {
        const directiveName = directive.name.value;
        if (
          [
            'since',
            'sinceMultiple',
            'deprecatedSince',
            'deprecatedSinceMultiple',
            'skipOnClient',
          ].includes(directiveName)
        ) {
          return null;
        }
      },
    },
  });

  // Second pass: Remove fragment spreads to now empty fragments

  let hasChanges = true;
  const maxCount = 30; // prevent infinite loop even though it should not happen theoretically
  let count = 0;
  while (hasChanges && count < maxCount) {
    count += 1;
    hasChanges = false;
    const emptyFragmentNames = new Set<string>();

    // Find & Remove fragments that are now empty
    newAst = visit(newAst, {
      FragmentDefinition: {
        enter(node) {
          if (!node.selectionSet || node.selectionSet.selections.length === 0) {
            emptyFragmentNames.add(node.name.value);
            hasChanges = true;
            return null;
          }
        },
      },
    });

    // Remove spreads to empty fragments, and whatever those spreads empty out
    if (hasChanges) {
      newAst = visit(newAst, {
        FragmentSpread: {
          enter(node) {
            if (emptyFragmentNames.has(node.name.value)) {
              return null;
            }
          },
        },
        Field: {
          leave(node, _key, _parent, _path, ancestors) {
            if (isEmptySelection(node)) {
              recordStripped(ancestors, node);
              return null;
            }
          },
        },
        InlineFragment: {
          leave(node) {
            if (isEmptySelection(node)) return null;
          },
        },
      });
    }
  }

  // Third pass: Collect used fragments and remove unused ones
  const usedFragmentNames = new Set<string>();
  visit(newAst, {
    FragmentSpread: {
      enter(node) {
        usedFragmentNames.add(node.name.value);
      },
    },
  });

  newAst = visit(newAst, {
    FragmentDefinition: {
      leave(node) {
        // Remove if fragment is not used
        if (!usedFragmentNames.has(node.name.value)) {
          return null;
        }
      },
    },
  });

  // count used variables
  const usedVariables: {
    [key: string]: number;
  } = {};
  visit(newAst, {
    Variable(node) {
      usedVariables[node.name.value] =
        (usedVariables[node.name.value] || 0) + 1;
    },
  });

  // delete unused variables
  newAst = visit(newAst, {
    VariableDefinition: {
      enter(variableDefinition) {
        if (usedVariables[variableDefinition.variable.name.value] <= 1) {
          return null;
        }
      },
    },
  });

  return {
    query: print(newAst),
    nullPaths: resolveNullPaths(strippedByOwner, spreadsByOwner),
  };
}

// Expands fragment-relative paths into operation-relative ones through every spread.
function resolveNullPaths(
  strippedByOwner: Map<string, Array<ResponsePath>>,
  spreadsByOwner: Map<string, Array<{ fragment: string; path: ResponsePath }>>,
) {
  const resolved = new Map<string, ResponsePath>();
  const walk = (owner: string, prefix: ResponsePath, depth: number) => {
    // valid GraphQL has no fragment cycles; the bound only guards malformed input
    if (depth > 50) return;
    for (const path of strippedByOwner.get(owner) ?? []) {
      const full = [...prefix, ...path];
      resolved.set(JSON.stringify(full), full);
    }
    for (const spread of spreadsByOwner.get(owner) ?? []) {
      walk(
        fragmentOwner(spread.fragment),
        [...prefix, ...spread.path],
        depth + 1,
      );
    }
  };
  walk(OPERATION_OWNER, [], 0);
  return [...resolved.values()];
}

/**
 * Sets every stripped field that the response lacks to `null`, in place.
 * Lists are followed element by element, and a key the server did return is
 * never overwritten. A path can reach objects of another concrete type (a
 * field under `... on A` also lands on `B` rows); Relay normalizes only the
 * selections of the row's own type, so such extra keys are ignored.
 */
export function fillStrippedFields(
  data: unknown,
  nullPaths: ReadonlyArray<ResponsePath>,
) {
  const fill = (value: unknown, path: ResponsePath, index: number) => {
    if (Array.isArray(value)) {
      for (const item of value) fill(item, path, index);
      return;
    }
    if (value === null || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    const key = path[index];
    if (index === path.length - 1) {
      if (!(key in record)) record[key] = null;
      return;
    }
    fill(record[key], path, index + 1);
  };
  for (const path of nullPaths) {
    if (path.length > 0) fill(data, path, 0);
  }
}
