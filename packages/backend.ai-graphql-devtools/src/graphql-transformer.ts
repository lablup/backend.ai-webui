import { parse, print, visit } from 'graphql';

export function manipulateGraphQLQueryWithClientDirectives(
  query: string,
  variables: any = {},
  isNotCompatibleWith: (version: string | Array<string>) => boolean,
) {
  const ast = parse(query);

  let newAst = ast;

  newAst = visit(newAst, {
    Field: {
      enter(node) {
        if (
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
                return true;
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
                return true;
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
                return true;
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
                return true;
              }
              return false;
            } else if (
              directiveName === 'skipOnClient' &&
              firstArgName === 'if'
            ) {
              if (arg?.value.kind === 'BooleanValue' && arg.value.value) {
                return true;
              }

              if (
                arg?.value.kind === 'Variable' &&
                variables[arg.value.name.value]
              ) {
                return true;
              }
            }
            return false;
          })
        ) {
          return null;
        }
      },
      leave(node) {
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

  let hasChanges = true;
  const maxCount = 30;
  let count = 0;
  while (hasChanges && count < maxCount) {
    count += 1;
    hasChanges = false;
    const emptyFragmentNames = new Set<string>();

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

    if (hasChanges) {
      newAst = visit(newAst, {
        FragmentSpread: {
          enter(node) {
            if (emptyFragmentNames.has(node.name.value)) {
              return null;
            }
          },
        },
      });
    }
  }

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
        if (!usedFragmentNames.has(node.name.value)) {
          return null;
        }
      },
    },
  });

  const usedVariables: {
    [key: string]: number;
  } = {};
  visit(newAst, {
    Variable(node) {
      usedVariables[node.name.value] =
        (usedVariables[node.name.value] || 0) + 1;
    },
  });

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
