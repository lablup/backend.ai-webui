// Test hook for storybook-check workflow validation
// This file should NOT be detected by the workflow (hooks should be excluded)
export const useTestHookForWorkflow = () => {
  return { test: true };
};
