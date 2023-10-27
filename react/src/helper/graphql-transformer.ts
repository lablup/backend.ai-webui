import { filter } from 'lodash';

function parseDirectives(str: string) {
  const pattern =
    /(\w+)\s@\s*(\w+)\s*\(\s*(\w+)\s*:\s*(\"[\d\.]+\"|\$?\w+)\s*\)/g;

  const directives = [];

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

export function removeSkipOnClientDirective(
  query: string,
  variables: {
    [key: string]: any;
  },
) {
  const filteredVariables = { ...variables };
  const directives = parseDirectives(query);

  directives.forEach((directive) => {
    const removeAllLinesOfQuery = () => {
      query = query.replace(directive.originFieldStr, '');
    };

    const removeDirectiveOnly = () => {
      query = query.replace(
        directive.originFieldStr,
        directive.originFieldStr.replace(
          /@\s*(skipOnClient|since|deprecated_since)\s*\(\s*(\w+)\s*:\s*(\"[\d\.]+\"|\$?\w+)\s*\)/,
          '',
        ),
      );
    };

    const removeVariableForDirective = () => {
      if (
        directive.argumentValue.startsWith('$') &&
        query.split(directive.argumentValue).length === 2
      ) {
        const argumentNameWithoutDollar = directive.argumentValue.substring(1);
        const pattern = new RegExp(`.*${argumentNameWithoutDollar}.*\n`, 'g');
        query = query.replace(pattern, '');
        delete filteredVariables[directive.argumentValue.substring(1)];
      }
    };

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
        removeAllLinesOfQuery();
      } else {
        removeDirectiveOnly();
      }
      removeVariableForDirective();
    } else if (
      directive.directive === 'since' &&
      directive.argumentName === 'version'
    ) {
      const version =
        variables[directive.argumentValue.substring(1)] ||
        directive.argumentValue.replace(/"/g, '');
      console.log('###', version);
      if (
        directive.argumentValue &&
        // @ts-ignore
        !globalThis.backendaiclient?.isManagerVersionCompatibleWith(version)
      ) {
        removeAllLinesOfQuery();
      } else {
        removeDirectiveOnly();
      }
      removeVariableForDirective();
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
        removeAllLinesOfQuery();
      } else {
        removeDirectiveOnly();
      }
      removeVariableForDirective();
    }
  });
  return {
    query: query,
    variables: filteredVariables,
  };
}
