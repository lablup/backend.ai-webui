/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * Explicit project prop contract (ADR-0001, FR-3407/FR-3408).
 *
 * Converted leaf components take a **required** `project` prop of type
 * `ProjectContext | null` and never read the ambient current project
 * (`useCurrentProjectValue`) internally — the page decides the project
 * context.
 *
 * Both `id` and `name` are required because legacy REST APIs are name-keyed
 * (session creation `group_name`, preset checks) while GraphQL is id-keyed.
 */
export interface ProjectContext {
  id: string;
  name: string;
}

/**
 * `null` means "no ambient project context" (e.g. super-admin pages).
 * How a component reacts to `null` depends on its tier (see ADR-0001):
 * - modal tier renders its own required project selector,
 * - button tier renders disabled with a caller-provided reason,
 * - alert tier suppresses project-comparison UI.
 */
export type ProjectContextOrNull = ProjectContext | null;

/**
 * Narrows the loosely-typed ambient current project
 * (`{ id?: string | null; name?: string | null }` from
 * `useCurrentProjectValue`) to the strict contract shape. Returns `null`
 * when either field is missing — callers that require an ambient project
 * should gate on that before rendering.
 */
export const toProjectContext = (project: {
  id?: string | null;
  name?: string | null;
}): ProjectContextOrNull =>
  project.id && project.name ? { id: project.id, name: project.name } : null;
