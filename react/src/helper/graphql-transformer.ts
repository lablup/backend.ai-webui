import { parse, print, visit } from 'graphql';

// node 삭제는 enter에서
// 불필요한 arguments나 directive 삭제는 leave에서
export function manipulateGraphQLQueryWithClientDirectives(
  query: string,
  variables: any = {},
  isCompatibleWith: (version: string) => boolean,
) {
  const ast = parse(query);
  let newAst = visit(ast, {
    Field: {
      enter(node) {
        if (
          node?.directives?.find((directive) => {
            const directiveName = directive.name.value;
            const firstArgName = directive.arguments?.[0].name.value;
            // @ts-ignore
            const firstArgValue = directive.arguments?.[0].value?.value;
            const arg = directive.arguments?.[0];

            if (directiveName === 'since' && firstArgName === 'version') {
              if (isCompatibleWith(firstArgValue)) {
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

              if (!isCompatibleWith(version)) {
                return true;
              }
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
          ['since', 'deprecatedSince', 'skipOnClient'].includes(directiveName)
        ) {
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
