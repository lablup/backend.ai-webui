import { parse, print, visit } from 'graphql';

// Delete nodes in enter
// Remove unnecessary arguments or directives in leave
export function manipulateGraphQLQueryWithClientDirectives(
  query: string,
  variables: any = {},
  isNotCompatibleWith: (version: string | Array<string>) => boolean,
) {
  const ast = parse(query);

  // Optionally normalize fragment type conditions from Query to Queries
  let newAst = ast;
  // Since the super graph, the query type has been changed from Queries to Query
  const shouldConvertFragmentTypeToQueries = isNotCompatibleWith('25.12.0');
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

  // First pass: Remove fields with client directives and clean up directives
  newAst = visit(newAst, {
    Field: {
      enter(node) {
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
          return null;
        }
      },
      leave(node) {
        // when field has a empty selectionSet, delete it
        if (
          node.selectionSet &&
          node.selectionSet.kind === 'SelectionSet' &&
          node.selectionSet.selections?.length === 0
        ) {
          return null;
        }
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

  // Second pass: Collect fragment spreads from the transformed AST
  const fragmentSpreadNames = new Set<string>();
  visit(newAst, {
    FragmentSpread: {
      enter(node) {
        fragmentSpreadNames.add(node.name.value);
      },
    },
  });

  // Third pass: Remove unused fragment definitions
  newAst = visit(newAst, {
    FragmentDefinition: {
      leave(node) {
        if (!fragmentSpreadNames.has(node.name.value)) {
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

  return print(newAst);
}
