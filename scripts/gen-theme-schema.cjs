/**
 * Generate antd ThemeConfig JSON Schema using TypeScript Compiler API.
 *
 * Unlike typescript-json-schema or ts-json-schema-generator, this script
 * properly resolves mapped types like ComponentsConfig which uses
 * `[key in keyof OverrideToken]` pattern.
 *
 * Each component in ComponentsConfig gets:
 *   allOf: [ComponentToken, Partial<AliasToken>, { algorithm }]
 * where Partial<AliasToken> is shared via $ref to avoid duplication.
 *
 * Usage: node scripts/gen-theme-schema.cjs [output-path]
 * Default output: ./resources/antdThemeConfig.schema.json
 */
const ts = require('typescript');
const path = require('path');
const fs = require('fs');

function parseDefault(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'undefined') return undefined;
  if (val === 'null') return null;
  const num = Number(val);
  if (!isNaN(num) && val.trim() !== '') return num;
  if (val.startsWith("'") || val.startsWith('"')) {
    return val.slice(1, -1);
  }
  return val;
}

// Sort properties alphabetically for stable output
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  return sorted;
}

function generateSchema(outputPath) {
  const contextFile = path.resolve(
    __dirname,
    '../react/node_modules/antd/es/config-provider/context.d.ts',
  );
  const componentsFile = path.resolve(
    __dirname,
    '../react/node_modules/antd/es/theme/interface/components.d.ts',
  );

  const program = ts.createProgram([contextFile, componentsFile], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    esModuleInterop: true,
    skipLibCheck: true,
    baseUrl: path.resolve(__dirname, '..'),
  });
  const checker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(contextFile);
  if (!sourceFile) {
    console.error('Could not load', contextFile);
    process.exit(1);
  }

  const componentsSf = program.getSourceFile(componentsFile);
  if (!componentsSf) {
    console.error('Could not load', componentsFile);
    process.exit(1);
  }

  // Find ThemeConfig interface
  let themeConfigType = null;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'ThemeConfig') {
      themeConfigType = checker.getTypeAtLocation(node);
    }
  });

  if (!themeConfigType) {
    console.error('ThemeConfig not found');
    process.exit(1);
  }

  // Find ComponentTokenMap interface (has the resolved component keys)
  let componentTokenMapType = null;
  ts.forEachChild(componentsSf, (node) => {
    if (
      ts.isInterfaceDeclaration(node) &&
      node.name.text === 'ComponentTokenMap'
    ) {
      componentTokenMapType = checker.getTypeAtLocation(node);
    }
  });

  // Schema generation helpers
  function typeToSchema(type, anchorFile, depth = 0) {
    if (depth > 8) return { type: 'object' };

    // Handle union types
    if (type.isUnion()) {
      const filtered = type.types.filter(
        (t) => !(t.flags & ts.TypeFlags.Undefined),
      );
      if (filtered.length === 1)
        return typeToSchema(filtered[0], anchorFile, depth);

      // Check for boolean (true | false union)
      if (
        filtered.length === 2 &&
        filtered.every((t) => t.flags & ts.TypeFlags.BooleanLiteral)
      ) {
        return { type: 'boolean' };
      }

      const schemas = filtered.map((t) =>
        typeToSchema(t, anchorFile, depth + 1),
      );
      const unique = [];
      const seen = new Set();
      for (const s of schemas) {
        const key = JSON.stringify(s);
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(s);
        }
      }
      if (unique.length === 1) return unique[0];
      return { anyOf: unique };
    }

    // Handle intersection types
    if (type.isIntersection()) {
      // Flatten: merge all object property schemas together
      const allProps = {};
      for (const t of type.types) {
        const s = typeToSchema(t, anchorFile, depth + 1);
        if (s.properties) {
          Object.assign(allProps, s.properties);
        }
      }
      if (Object.keys(allProps).length > 0) {
        return { properties: allProps, type: 'object' };
      }
      const schemas = type.types.map((t) =>
        typeToSchema(t, anchorFile, depth + 1),
      );
      return { allOf: schemas };
    }

    // Primitives
    if (type.flags & ts.TypeFlags.String) return { type: 'string' };
    if (type.flags & ts.TypeFlags.Number) return { type: 'number' };
    if (type.flags & ts.TypeFlags.Boolean) return { type: 'boolean' };
    if (type.flags & ts.TypeFlags.Null) return { type: 'null' };
    if (type.flags & ts.TypeFlags.StringLiteral)
      return { type: 'string', const: type.value };
    if (type.flags & ts.TypeFlags.NumberLiteral)
      return { type: 'number', const: type.value };
    if (type.flags & ts.TypeFlags.BooleanLiteral) return { type: 'boolean' };

    // Array
    if (checker.isArrayType(type)) {
      const typeArgs = checker.getTypeArguments(type);
      return {
        type: 'array',
        items: typeArgs.length
          ? typeToSchema(typeArgs[0], anchorFile, depth + 1)
          : { type: 'object' },
      };
    }

    // Function types — just mark as object
    const callSignatures = type.getCallSignatures();
    if (callSignatures.length > 0 && type.getProperties().length === 0) {
      return { type: 'object' };
    }

    // Object types with properties
    const properties = type.getProperties();
    if (properties.length > 0) {
      return objectToSchema(properties, anchorFile, depth);
    }

    return { type: 'object' };
  }

  function objectToSchema(properties, anchorFile, depth) {
    const props = {};
    for (const prop of properties) {
      if (prop.name.startsWith('_')) continue;

      const propType = checker.getTypeOfSymbolAtLocation(prop, anchorFile);
      props[prop.name] = typeToSchema(propType, anchorFile, depth + 1);

      // Add default values from JSDoc
      const jsDocTags = prop.getJsDocTags();
      const defaultTag = jsDocTags.find((t) => t.name === 'default');
      if (defaultTag && defaultTag.text) {
        const defaultVal = defaultTag.text.map((t) => t.text).join('');
        const parsed = parseDefault(defaultVal);
        if (parsed !== undefined || defaultVal === 'null') {
          props[prop.name].default = parsed;
        }
      }
    }
    return { properties: props, type: 'object' };
  }

  // Build Partial<AliasToken> schema from ThemeConfig.token
  function buildAliasTokenSchema() {
    const tokenSym = themeConfigType.getProperty('token');
    if (!tokenSym) return { type: 'object' };

    const tokenType = checker.getTypeOfSymbolAtLocation(tokenSym, sourceFile);
    let resolved = tokenType;
    if (resolved.isUnion()) {
      const nonUndef = resolved.types.filter(
        (t) => !(t.flags & ts.TypeFlags.Undefined),
      );
      if (nonUndef.length === 1) resolved = nonUndef[0];
    }

    const props = resolved.getProperties();
    return objectToSchema(props, sourceFile, 0);
  }

  // Build ComponentsConfig schema by iterating ComponentTokenMap keys.
  // Each component = allOf: [Partial<ComponentToken_N>, Partial<AliasToken>, { algorithm }]
  // Partial<AliasToken> is shared via $ref in definitions.
  function buildComponentsConfigSchema(definitions) {
    if (!componentTokenMapType) {
      console.error(
        'ComponentTokenMap not found in',
        componentsFile,
        '— cannot generate component schemas.',
      );
      process.exit(1);
    }

    // Build and register Partial<AliasToken> as a shared definition
    const aliasTokenSchema = buildAliasTokenSchema();
    definitions['Partial<AliasToken>'] = aliasTokenSchema;

    const componentKeys = componentTokenMapType.getProperties();
    const props = {};
    let compIdx = 0;

    for (const compSym of componentKeys) {
      const compTokenType = checker.getTypeOfSymbolAtLocation(
        compSym,
        componentsSf,
      );

      // Remove undefined from optional type
      let resolved = compTokenType;
      if (resolved.isUnion()) {
        const nonUndef = resolved.types.filter(
          (t) => !(t.flags & ts.TypeFlags.Undefined),
        );
        if (nonUndef.length === 1) resolved = nonUndef[0];
      }

      // Get component-specific token properties
      const compProps = resolved.getProperties();
      const compTokenSchema = objectToSchema(compProps, componentsSf, 2);

      // Register component token as a definition if it has properties
      const hasComponentTokenProps =
        Object.keys(compTokenSchema.properties).length > 0;

      const allOfParts = [];

      if (hasComponentTokenProps) {
        const defName =
          compIdx === 0
            ? 'Partial<ComponentToken>'
            : `Partial<ComponentToken>_${compIdx}`;
        definitions[defName] = compTokenSchema;
        allOfParts.push({ $ref: `#/definitions/${defName}` });
      }

      // Add shared AliasToken ref
      allOfParts.push({ $ref: '#/definitions/Partial<AliasToken>' });

      // Add algorithm property
      allOfParts.push({
        properties: {
          algorithm: {
            anyOf: [
              { items: { type: 'object' }, type: 'array' },
              { type: ['object', 'boolean'] },
            ],
          },
        },
        type: 'object',
      });

      props[compSym.name] = { allOf: allOfParts };
      compIdx++;
    }

    return { properties: props, type: 'object' };
  }

  // Generate definitions and ComponentsConfig
  const definitions = {};
  const componentsConfigSchema = buildComponentsConfigSchema(definitions);

  // Generate schema for ThemeConfig top-level
  const themeSchema = typeToSchema(themeConfigType, sourceFile);

  // Replace the empty components schema with the properly resolved one
  if (themeSchema.properties) {
    themeSchema.properties.components = componentsConfigSchema;
  }

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions,
    ...themeSchema,
  };

  // Sort definitions and inner properties
  if (schema.definitions) {
    for (const [key, val] of Object.entries(schema.definitions)) {
      if (val && val.properties) {
        schema.definitions[key] = {
          ...val,
          properties: sortObjectKeys(val.properties),
        };
      }
    }
  }
  if (schema.properties) {
    for (const [key, val] of Object.entries(schema.properties)) {
      if (val && val.properties) {
        schema.properties[key] = {
          ...val,
          properties: sortObjectKeys(val.properties),
        };
      }
    }
  }

  const output = JSON.stringify(schema, null, 4) + '\n';
  fs.writeFileSync(outputPath, output);

  // Summary
  const componentProps = schema.properties?.components?.properties
    ? Object.keys(schema.properties.components.properties).length
    : 0;
  const tokenProps = schema.properties?.token?.properties
    ? Object.keys(schema.properties.token.properties).length
    : 0;
  const defCount = Object.keys(schema.definitions || {}).length;
  console.log(`Generated ${outputPath}`);
  console.log(`  Components: ${componentProps} entries`);
  console.log(`  Token properties: ${tokenProps} entries`);
  console.log(`  Definitions: ${defCount}`);
  console.log(`  Total lines: ${output.split('\n').length}`);

  return schema;
}

// Run when executed directly
if (require.main === module) {
  const outputPath =
    process.argv[2] ||
    path.resolve(__dirname, '../resources/antdThemeConfig.schema.json');
  generateSchema(outputPath);
}

module.exports = { parseDefault, sortObjectKeys, generateSchema };
