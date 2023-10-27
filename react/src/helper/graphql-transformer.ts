import _ from 'lodash';

interface Directive {
  fieldName: string;
  directive: string;
  argumentName: string;
  argumentValue: string;
  originFieldStr: string;
}

function parseDirectives(str: string) {
  const pattern =
    /(\w+)\s@\s*(\w+)\s*\(\s*(\w+)\s*:\s*(\"[\d\.]+\"|\$?\w+)\s*\)/g;

  const directives: Directive[] = [];

  let result;
  while ((result = pattern.exec(str)) !== null) {
    const [originFieldStr, fieldName, directive, argumentName, argumentValue] =
      result;
    directives.push({
      fieldName,
      directive,
      argumentName,
      argumentValue,
      originFieldStr,
    });
  }

  return directives;
}

const removeAllLinesOfQuery = (query: string, directive: Directive) => {
  return query.replace(directive.originFieldStr, '');
};

const removeDirectiveOnly = (query: string, directive: Directive) => {
  return query.replace(
    directive.originFieldStr,
    directive.originFieldStr.replace(
      /@\s*(skipOnClient|since|deprecated_since)\s*\(\s*(\w+)\s*:\s*(\"[\d\.]+\"|\$?\w+)\s*\)/,
      '',
    ),
  );
};

const removeVariableForDirective = (
  query: string,
  directive: Directive,
  variables: {
    [key: string]: any;
  },
) => {
  if (
    directive.argumentValue.startsWith('$') &&
    query.split(directive.argumentValue).length === 2
  ) {
    const argumentNameWithoutDollar = directive.argumentValue.substring(1);
    const pattern = new RegExp(`.*${argumentNameWithoutDollar}.*\n`, 'g');
    query = query.replace(pattern, '');

    return {
      query: query,
      variables: _.omit(variables, [argumentNameWithoutDollar]),
    };
  }
  return {
    query,
    variables,
  };
};

export function removeSkipOnClientDirective(
  query: string,
  variables: {
    [key: string]: any;
  },
) {
  const directives = parseDirectives(query);
  directives.forEach((directive) => {
    if (
      directive.directive === 'skipOnClient' &&
      directive.argumentName === 'if'
    ) {
      if (
        directive.argumentValue &&
        // remove @ from argumentValue and check if it is true
        (variables[directive.argumentValue.substring(1)] === true ||
          directive.argumentValue === 'true')
      ) {
        query = removeAllLinesOfQuery(query, directive);
      } else {
        query = removeDirectiveOnly(query, directive);
      }
      const result = removeVariableForDirective(query, directive, variables);
      query = result.query;
      variables = result.variables;
    } else if (
      directive.directive === 'since' &&
      directive.argumentName === 'version'
    ) {
      const version =
        variables[directive.argumentValue.substring(1)] ||
        directive.argumentValue.replace(/"/g, '');
      if (
        directive.argumentValue &&
        // @ts-ignore
        !globalThis.backendaiclient?.isManagerVersionCompatibleWith(version)
      ) {
        query = removeAllLinesOfQuery(query, directive);
      } else {
        query = removeDirectiveOnly(query, directive);
      }
      const result = removeVariableForDirective(query, directive, variables);
      query = result.query;
      variables = result.variables;
    } else if (
      directive.directive === 'deprecated_since' &&
      directive.argumentName === 'version'
    ) {
      const version =
        variables[directive.argumentValue.substring(1)] ||
        directive.argumentValue.replace(/"/g, '');
      if (
        directive.argumentValue &&
        // @ts-ignore
        globalThis.backendaiclient?.isManagerVersionCompatibleWith(version)
      ) {
        query = removeAllLinesOfQuery(query, directive);
      } else {
        query = removeDirectiveOnly(query, directive);
      }
      const result = removeVariableForDirective(query, directive, variables);
      query = result.query;
      variables = result.variables;
    }
  });

  return {
    query,
    variables,
  };
}
