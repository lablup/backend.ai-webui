/**
 * Hand-written types for the WebMCP page API (webmachinelearning/webmcp,
 * `document.modelContext`). Only the part this package calls is declared.
 */

export type WebMCPPropertySchema =
  | {
      type: 'string';
      description?: string;
      enum?: ReadonlyArray<string>;
      minLength?: number;
      maxLength?: number;
    }
  | {
      type: 'integer' | 'number';
      description?: string;
      enum?: ReadonlyArray<number>;
      minimum?: number;
      maximum?: number;
    }
  | {
      type: 'boolean';
      description?: string;
    };

/**
 * A flat JSON Schema object: the subset `validateWebMCPInput` enforces.
 * Nested objects, arrays and combinators are deliberately not expressible.
 */
export interface WebMCPInputSchema {
  type: 'object';
  properties: Record<string, WebMCPPropertySchema>;
  required?: ReadonlyArray<string>;
  additionalProperties?: boolean;
}

export interface WebMCPToolAnnotations {
  readOnlyHint?: boolean;
  /** The result carries user-authored text (names, emails, descriptions). */
  untrustedContentHint?: boolean;
  consequentialHint?: boolean;
}

/** A tool as `useWebMCPTool` accepts it. `execute` receives validated input. */
export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: WebMCPInputSchema;
  annotations?: WebMCPToolAnnotations;
  execute: (input: Record<string, unknown>) => unknown;
}

/** The descriptor handed to `registerTool`; the platform JSON-stringifies the result. */
export interface WebMCPToolDescriptor {
  name: string;
  description: string;
  inputSchema: WebMCPInputSchema;
  annotations?: WebMCPToolAnnotations;
  execute: (input: unknown) => Promise<unknown>;
}

export interface WebMCPModelContext {
  registerTool: (
    tool: WebMCPToolDescriptor,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
}

export interface WebMCPErrorResult {
  error: {
    code: string;
    message: string;
    issues?: ReadonlyArray<WebMCPInputIssue>;
  };
}

export interface WebMCPInputIssue {
  /** The offending property, or `''` for the input as a whole. */
  path: string;
  message: string;
}
