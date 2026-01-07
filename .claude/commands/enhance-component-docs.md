---
model: claude-sonnet-4-5
---

# Enhance Component Documentation

Automatically enhance React component documentation with JSDoc comments, improved Storybook stories, and autodoc configuration.

## Usage

```
/enhance-component-docs <component-files...>
```

## What this command does

This command replicates the comprehensive documentation enhancement process:

1. **Analyze Component Structure**: Read and understand component interfaces, props, and functionality
2. **Add Comprehensive JSDoc**: Add detailed documentation comments to all interfaces, types, and functions
3. **Configure Storybook Autodocs**: Enable automatic documentation generation with proper version compatibility handling
4. **Create Enhanced Stories**: Improve existing stories or create new ones with detailed descriptions
5. **Add Interactive Examples**: Create stories demonstrating real-world usage patterns

## Implementation

### Step 1: Add JSDoc to Component Files

For each component file, add documentation following these patterns:

#### Interfaces and Types
```typescript
/**
 * Configuration interface for component settings
 * Extends base props with custom functionality
 */
export interface ComponentProps extends BaseProps {
  /** Whether the component should be visible */
  visible?: boolean;
  /** Callback function called when state changes */
  onStateChange?: (newState: State) => void;
  /** Configuration object for advanced features */
  config?: ComponentConfig;
}

/**
 * Array type for component items
 */
export type ComponentItems<T = any> = ComponentItem<T>[];
```

#### Utility Functions
```typescript
/**
 * Utility function to determine component visibility
 * Takes into account multiple factors and overrides
 * 
 * @param item - The component item to check
 * @param key - Unique identifier for the item  
 * @param overrides - Override settings to apply
 * @returns Whether the item should be visible
 */
export const isItemVisible = (
  item: ComponentItem,
  key: string,
  overrides?: OverrideSettings,
): boolean => {
  // implementation
};
```

#### Main Component
```typescript
/**
 * ComponentName - Brief description of what it does
 * 
 * A comprehensive component that provides:
 * - Feature 1 with detailed explanation
 * - Feature 2 with use cases
 * - Feature 3 with configuration options
 * 
 * Key capabilities:
 * - List important capabilities
 * - Explain complex behaviors
 * - Document integration patterns
 * 
 * @param props - ComponentProps configuration
 * @returns React element
 * 
 * @example
 * ```tsx
 * <ComponentName
 *   visible={true}
 *   config={{
 *     feature1: true,
 *     feature2: 'advanced'
 *   }}
 *   onStateChange={handleStateChange}
 * />
 * ```
 */
const ComponentName = (props: ComponentProps): React.ReactElement => {
  // implementation
};

ComponentName.displayName = 'ComponentName';
```

### Step 2: Configure Storybook Autodocs

**Important**: Due to version compatibility issues, use this simplified approach:

Update `.storybook/main.ts`:
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

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

export default config;
```

Update `.storybook/preview.tsx` (note .tsx extension):
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

### Step 3: Enhance Story Files

Create comprehensive stories with this template:

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentName, ComponentProps } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'], // Enable autodocs
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
ComponentName provides [brief description].

## Key Features

### Feature 1
Detailed explanation of the feature and its benefits.

### Feature 2  
How this feature works and when to use it.

### Integration
How to integrate with other components or systems.

## Usage Patterns

### Basic Usage
Simple examples for common use cases.

### Advanced Configuration
Examples of complex configurations and edge cases.
        `,
      },
    },
  },
  argTypes: {
    // Manual argTypes definition (since TypeScript docgen is disabled)
    visible: {
      control: { type: 'boolean' },
      description: 'Control component visibility',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    config: {
      control: { type: 'object' },
      description: 'Advanced configuration options',
      table: {
        type: { summary: 'ComponentConfig' },
      },
    },
    onStateChange: {
      action: 'stateChanged',
      description: 'Called when component state changes',
      table: {
        type: { summary: '(newState: State) => void' },
      },
    },
    children: {
      control: false, // Non-interactive prop
      description: 'Component children content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Basic usage with default settings. Shows the component in its simplest form.',
      },
    },
  },
  args: {
    visible: true,
    config: {
      // default config
    },
  },
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive example with state management. Demonstrates callbacks and dynamic behavior.',
      },
    },
  },
  render: () => {
    const [state, setState] = useState(initialState);
    
    return (
      <ComponentName
        visible={state.visible}
        config={state.config}
        onStateChange={(newState) => {
          setState(newState);
          console.log('State changed:', newState);
        }}
      />
    );
  },
};

export const ConfigurationVariants: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Different configuration options showing component flexibility.',
      },
    },
  },
  args: {
    visible: true,
    config: {
      // specific configuration
    },
  },
};
```

### Step 4: Create Sub-component Stories

For complex components with sub-components, create dedicated story files:

```typescript
// SubComponent.stories.tsx
const meta: Meta<typeof SubComponent> = {
  title: 'Components/ComponentName/SubComponent',
  component: SubComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'SubComponent documentation focusing on its specific functionality.',
      },
    },
  },
};
```

### Step 5: Validation Steps

After enhancement:

1. **TypeScript Check**: Ensure no type errors
2. **Build Stories**: Verify Storybook builds successfully  
3. **Review Documentation**: Check auto-generated docs are complete
4. **Test Interactivity**: Validate all controls and actions work
5. **Cross-reference**: Ensure examples match actual component behavior

## File Checklist

For each component, ensure these files are created/updated:

- [ ] `Component.tsx` - JSDoc comments added
- [ ] `Component.stories.tsx` - Enhanced stories with descriptions
- [ ] `SubComponent.stories.tsx` - Sub-component stories (if applicable)
- [ ] `.storybook/main.ts` - Autodoc configuration enabled
- [ ] `.storybook/preview.ts` - Global autodoc settings

## Best Practices

1. **Documentation First**: Write docs that explain the "why" not just the "what"
2. **Real Examples**: Use practical examples that developers will actually use
3. **Interactive Stories**: Create stories that let users experiment
4. **Comprehensive Coverage**: Cover edge cases and error states
5. **Consistent Style**: Maintain consistent documentation patterns across components
6. **Manual ArgTypes**: Since TypeScript docgen is disabled, manually define all argTypes with complete information
7. **Version Compatibility**: Always check Storybook addon versions for compatibility
8. **Component DisplayName**: Add displayName to improve debugging and documentation clarity
9. **JSX Support**: Use .tsx extension for preview files when using JSX syntax

## Troubleshooting

### "Cannot convert a symbol to a string" Error
- Disable TypeScript docgen: `reactDocgen: false`
- Use manual argTypes definition instead of automatic extraction
- Ensure all Storybook addons are compatible versions

### Version Compatibility Issues
- Check all `@storybook/*` packages are the same version
- Avoid mixing different major versions of Storybook addons
- Use simplified addon configuration to reduce conflicts

### JSX Syntax Errors in Preview
- Use `.tsx` extension for preview files
- Import React properly: `import React from 'react'`
- Ensure JSX transforms are configured correctly