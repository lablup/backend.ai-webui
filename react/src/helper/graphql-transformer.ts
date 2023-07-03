function parseDirectives(str: string) {
  const pattern = /(\w+)\s@\s*(\w+)\s*\(\s*(\w+)\s*:\s*(\$?\w+)\s*\)/g;
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
  }
) {
  const filteredVariables = { ...variables };
  const directives = parseDirectives(query);
  directives.forEach((directive) => {
    if (
      directive.directive === "skipOnClient" &&
      directive.argumentName === "if"
    ) {
      if (
        directive.argumentValue &&
        (variables[directive.argumentValue.substring(1)] === true ||
          directive.argumentValue === "true")
      ) {
        // remove all lines of query that contains directive
        query = query.replace(directive.originFieldStr, "");
      } else {
        // remove directive only
        query = query.replace(
          directive.originFieldStr,
          directive.originFieldStr.replace(
            /@\s*(skipOnClient)\s*\(\s*(\w+)\s*:\s*(\$?\w+)\s*\)/,
            ""
          )
        );
      }

      // if argumentValue is variable and it is not used in query, remove it from variables and argument definition
      if (
        directive.argumentValue.startsWith("$") &&
        query.split(directive.argumentValue).length === 2
      ) {
        const argumentNameWithoutDollar = directive.argumentValue.substring(1);
        const pattern = new RegExp(`.*${argumentNameWithoutDollar}.*\n`, "g");
        query = query.replace(pattern, "");
        delete filteredVariables[directive.argumentValue.substring(1)];
      }
    } else {
    }
  });
  return {
    query: query,
    variables: filteredVariables,
  };
}
