# Update Storybook with Autodoc

Update React components with comprehensive JSDoc documentation and enhanced Storybook stories with autodoc functionality.

## Usage

```
/update-storybook-autodoc <component-path>
```

## What this command does

1. **Add JSDoc Documentation**: Adds comprehensive JSDoc comments to component interfaces, props, and functions
2. **Configure Storybook Autodoc**: Updates Storybook configuration to enable automatic documentation generation with proper version compatibility
3. **Enhance Stories**: Creates or updates story files with detailed descriptions and manual argTypes
4. **Handle TypeScript Issues**: Addresses "Cannot convert a symbol to a string" errors through proper configuration

## Example

```bash
/update-storybook-autodoc packages/backend.ai-ui/src/components/Table/
```

---

## Implementation Steps

### 1. Add JSDoc Comments to Component Files

For each component file, add comprehensive JSDoc documentation:

```typescript
/**
 * Component description with key features
 * 
 * @param props - Props interface description
 * @returns React component
 * 
 * @example
 * ```tsx
 * <Component prop="value" />
 * ```
 */
export const Component = (props: ComponentProps) => {
  // implementation
};

Component.displayName = 'Component';
```

Key documentation patterns:
- **Interfaces**: Describe purpose and each property
- **Props**: Document all parameters with types and descriptions  
- **Functions**: Include examples and return value descriptions
- **Types**: Explain usage and constraints

### 2. Update Storybook Configuration

**Important**: Due to version compatibility issues between Storybook versions, use this simplified approach:

Update `.storybook/main.ts`:
```typescript
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'Documentation',
  },
  typescript: {
    reactDocgen: false, // Disable to prevent "Cannot convert a symbol to a string" errors
  },
};
```

Update `.storybook/preview.tsx` (note .tsx extension for JSX support):
```typescript
import type { Preview } from '@storybook/react-vite';
import { ConfigProvider } from 'antd';
import React from 'react';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ConfigProvider>
        <div style={{ padding: '16px' }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
  parameters: {
    docs: {
      extractComponentDescription: (_component: any, { notes }: any) => {
        return notes?.markdown || notes?.text || null;
      },
    },
    layout: 'padded',
  },
};

export default preview;
```

### 3. Create Enhanced Story Files

For each component, create comprehensive stories:

```typescript
const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  tags: ['autodocs'], // Enable autodocs
  parameters: {
    docs: {
      description: {
        component: `
Detailed component description with:
- Key features
- Usage patterns  
- Configuration options
        `,
      },
    },
  },
  argTypes: {
    // Example of manual argTypes definition
    status: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error'],
      description: 'Visual status affecting border color and extra button icons',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    title: {
      control: { type: 'text' },
      description: 'Card title displayed in the header',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    children: {
      control: false, // Non-interactive prop
      description: 'Card body content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Story-specific description and usage notes',
      },
    },
  },
  args: {
    // story args
  },
};
```

### 4. Story Patterns to Include

Create stories for common patterns:
- **Default**: Basic usage
- **Interactive**: With state management and callbacks
- **Variants**: Different configurations and sizes
- **Edge Cases**: Loading, error, and empty states
- **Advanced**: Complex configurations and integrations

### 5. Documentation Best Practices

**Component Documentation:**
- Start with a clear one-line description
- List key features and capabilities
- Include practical examples
- Document all props with types and constraints
- Explain callback functions and their parameters

**Story Documentation:**
- Describe what the story demonstrates
- Explain any interactive elements
- Note specific configurations or edge cases
- Include usage recommendations

**ArgTypes Configuration (Manual Approach):**
- Since TypeScript docgen is disabled, manually define all argTypes
- Provide controls for all configurable props with explicit type information
- Add comprehensive descriptions for each control
- Include table summaries and default values
- Set appropriate control types (boolean, select, text, etc.)
- Use `control: false` for non-interactive props like ReactNode

### 6. File Structure

```
src/components/
├── Component/
│   ├── Component.tsx           # Main component with JSDoc
│   ├── Component.stories.tsx   # Enhanced stories
│   └── SubComponent.stories.tsx # Additional component stories
```

### 7. Quality Checks

After running this command:
1. **Verify TypeScript**: No type errors in components
2. **Check Storybook**: Stories render correctly with documentation
3. **Test Autodocs**: Auto-generated docs display prop information
4. **Review Examples**: Code examples are accurate and helpful
5. **Validate Controls**: Interactive controls work as expected

## Notes

- This command focuses on React components with TypeScript
- Requires existing Storybook setup with React
- Works best with functional components and standard prop patterns
- Manual argTypes definition required due to TypeScript docgen limitations
- Version compatibility is crucial - avoid mixing different Storybook addon versions
- Use `.tsx` extension for preview files to support JSX syntax
- Add component displayName to improve debugging and documentation