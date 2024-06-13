import { parse, print, visit } from 'graphql';

// Delete nodes in enter
// Remove unnecessary arguments or directives in leave
export function manipulateGraphQLQueryWithClientDirectives(
  query: string,
  variables: any = {},
  isNotCompatibleWith: (version: string | Array<string>) => boolean,
) {
  const ast = parse(query);
  let newAst = visit(ast, {
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
