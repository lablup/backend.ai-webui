import BAIGraphQLPropertyFilter from './BAIGraphQLPropertyFilter';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

const meta: Meta<typeof BAIGraphQLPropertyFilter> = {
  title: 'Components/BAIGraphQLPropertyFilter',
  component: BAIGraphQLPropertyFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIGraphQLPropertyFilter** is an advanced filtering component designed for GraphQL-based Backend.AI applications. It provides a sophisticated interface for constructing GraphQL filter objects with support for:

- **GraphQL Filter Types**: Compatible with standard GraphQL filter schemas including StringFilter, NumberFilter, BooleanFilter, and EnumFilter
- **Flexible Combination Mode**: Choose between AND or OR operators to combine multiple filter conditions
- **Rich Operator Set**: Comprehensive operators like eq, ne, contains, startsWith, endsWith, gt, gte, lt, lte, in, notIn
- **Type-Safe Filtering**: Automatic type detection and operator suggestions based on property types
- **Bidirectional Conversion**: Seamless conversion between UI conditions and GraphQL filter objects

New in this version:
- Operatorless fields via valueMode: 'scalar' for properties that should emit direct scalar values (e.g., { isUrgent: true }). Use implicitOperator (defaults to 'eq') to control how tags are displayed in the UI.

The component generates GraphQL-compatible filter objects that can be directly used in GraphQL queries, enabling powerful and flexible data filtering across the platform.

**GraphQL Filter Object Examples:**
\`\`\`javascript
// Simple string filter
{ name: { contains: "john" } }

// Boolean filter
{ active: true }

// Filters combined with AND (all conditions must match)
{ 
  AND: [
    { name: { contains: "john" } },
    { status: { in: ["ACTIVE", "PENDING"] } },
    { priority: { eq: "HIGH" } }
  ]
}

// Filters combined with OR (any condition can match)
{ 
  OR: [
    { status: { eq: "URGENT" } },
    { priority: { eq: "HIGH" } },
    { assignee: { eq: "john" } }
  ]
}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    filterProperties: {
      description: 'Array of filterable properties with their configuration',
      control: { type: 'object' },
      table: {
        type: { summary: 'FilterProperty[]' },
        detail: `
FilterProperty = {
  key: string;              // Property key in the GraphQL schema
  propertyLabel: string;    // Display label for the property
  type: 'string' | 'number' | 'boolean' | 'enum';
  operators?: FilterOperator[];  // Available operators for this property
  defaultOperator?: FilterOperator;
  options?: AutoCompleteProps['options'];  // Autocomplete suggestions
  strictSelection?: boolean;  // Require selection from options
  rule?: {                    // Validation rule
    message: string;
    validate: (value: any) => boolean;
  };
  // Serialization mode for this property:
  //  - 'scalar': emit { [key]: value } (operatorless). Default for boolean.
  //  - 'operator': emit { [key]: { op: value } }. Default for non-boolean.
  valueMode?: 'scalar' | 'operator';
  // Visual operator for UI tags when valueMode='scalar' (default 'eq')
  implicitOperator?: FilterOperator;
}
        `,
      },
    },
    value: {
      control: { type: 'object' },
      description: 'Current GraphQL filter object',
      table: {
        type: { summary: 'GraphQLFilter' },
        detail: `
GraphQLFilter = {
  [property: string]: FilterValue;
  AND?: GraphQLFilter[];
  OR?: GraphQLFilter[];
}
        `,
      },
    },
    onChange: {
      description: 'Callback when filter value changes',
      table: {
        type: { summary: '(value: GraphQLFilter | undefined) => void' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    combinationMode: {
      control: { type: 'radio' },
      options: ['AND', 'OR'],
      description: 'How to combine multiple filter conditions',
      table: {
        type: { summary: "'AND' | 'OR'" },
        defaultValue: { summary: 'AND' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIGraphQLPropertyFilter>;

export const Default: Story = {
  name: 'Basic Usage',
  parameters: {
    docs: {
      description: {
        story:
          'Basic GraphQL property filter with string and boolean properties. Try adding filters and see how they combine into a GraphQL filter object.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
        defaultOperator: 'contains',
      },
      {
        key: 'description',
        propertyLabel: 'Description',
        type: 'string',
      },
      {
        key: 'isActive',
        propertyLabel: 'Active Status',
        type: 'boolean',
      },
    ],
    combinationMode: 'AND',
    onChange: action('Filter changed'),
  },
};

export const WithANDCombination: Story = {
  name: 'Multiple Filters with AND',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates filters combined with AND operator. All conditions must be satisfied for a match. This is useful when you need strict filtering.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'title',
        propertyLabel: 'Title',
        type: 'string',
      },
      {
        key: 'priority',
        propertyLabel: 'Priority',
        type: 'enum',
        options: [
          { label: 'High', value: 'HIGH' },
          { label: 'Medium', value: 'MEDIUM' },
          { label: 'Low', value: 'LOW' },
        ],
      },
      {
        key: 'isUrgent',
        propertyLabel: 'Urgent',
        type: 'boolean',
      },
    ],
    combinationMode: 'AND',
    value: {
      AND: [
        { title: { contains: 'critical' } },
        { priority: { eq: 'HIGH' } },
        { isUrgent: true },
      ],
    },
    onChange: action('AND Filter changed'),
  },
};

export const WithORCombination: Story = {
  name: 'Multiple Filters with OR',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates filters combined with OR operator. Any condition can match for a result. This is useful for more flexible, inclusive filtering.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'status',
        propertyLabel: 'Status',
        type: 'enum',
        options: [
          { label: 'Urgent', value: 'URGENT' },
          { label: 'High Priority', value: 'HIGH_PRIORITY' },
          { label: 'Normal', value: 'NORMAL' },
        ],
      },
      {
        key: 'assignee',
        propertyLabel: 'Assignee',
        type: 'string',
      },
      {
        key: 'dueToday',
        propertyLabel: 'Due Today',
        type: 'boolean',
      },
    ],
    combinationMode: 'OR',
    value: {
      OR: [
        { status: { eq: 'URGENT' } },
        { assignee: { contains: 'john' } },
        { dueToday: true },
      ],
    },
    onChange: action('OR Filter changed'),
  },
};

export const WithNumberFilters: Story = {
  name: 'Number Filters with Comparisons',
  parameters: {
    docs: {
      description: {
        story:
          'Shows numeric filtering with comparison operators like greater than, less than, etc. Useful for filtering by quantities, scores, or metrics.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'score',
        propertyLabel: 'Score',
        type: 'number',
        operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
      },
      {
        key: 'quantity',
        propertyLabel: 'Quantity',
        type: 'number',
      },
      {
        key: 'price',
        propertyLabel: 'Price',
        type: 'number',
        operators: ['gt', 'lt', 'eq'],
        defaultOperator: 'gt',
      },
    ],
    combinationMode: 'AND',
    value: {
      AND: [{ score: { gte: 80 } }, { quantity: { lt: 100 } }],
    },
    onChange: action('Number filter changed'),
  },
};

export const WithEnumFilters: Story = {
  name: 'Enum Filters with Multiple Selection',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates enum type filtering with in/notIn operators for multiple value selection. Perfect for status fields, categories, or any predefined set of values.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'status',
        propertyLabel: 'Status',
        type: 'enum',
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        operators: ['eq', 'ne', 'in', 'notIn'],
        strictSelection: true,
      },
      {
        key: 'category',
        propertyLabel: 'Category',
        type: 'enum',
        options: [
          { label: 'Frontend', value: 'FRONTEND' },
          { label: 'Backend', value: 'BACKEND' },
          { label: 'Database', value: 'DATABASE' },
          { label: 'DevOps', value: 'DEVOPS' },
        ],
        defaultOperator: 'in',
      },
    ],
    combinationMode: 'AND',
    value: {
      AND: [
        { status: { in: ['ACTIVE', 'PENDING'] } },
        { category: { ne: 'DATABASE' } },
      ],
    },
    onChange: action('Enum filter changed'),
  },
};

export const ComplexFilter: Story = {
  name: 'Complex Combined Filter',
  parameters: {
    docs: {
      description: {
        story:
          'Example showing multiple filters with different property types combined with the selected mode (AND/OR) for comprehensive filtering.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
      },
      {
        key: 'email',
        propertyLabel: 'Email',
        type: 'string',
        operators: ['contains', 'startsWith', 'endsWith'],
      },
      {
        key: 'role',
        propertyLabel: 'Role',
        type: 'enum',
        options: [
          { label: 'Admin', value: 'ADMIN' },
          { label: 'User', value: 'USER' },
          { label: 'Guest', value: 'GUEST' },
        ],
      },
      {
        key: 'credits',
        propertyLabel: 'Credits',
        type: 'number',
      },
      {
        key: 'isVerified',
        propertyLabel: 'Verified',
        type: 'boolean',
      },
    ],
    combinationMode: 'AND',
    value: {
      AND: [
        { name: { contains: 'john' } },
        { email: { endsWith: '@company.com' } },
        { role: { eq: 'USER' } },
        { credits: { gte: 100 } },
        { isVerified: true },
      ],
    },
    onChange: action('Complex filter changed'),
  },
};

export const WithValidation: Story = {
  name: 'Custom Validation Rules',
  parameters: {
    docs: {
      description: {
        story:
          'Property filter with custom validation rules for data integrity. Shows email validation and strict selection enforcement.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'email',
        propertyLabel: 'Email Address',
        type: 'string',
        rule: {
          message: 'Please enter a valid email address',
          validate: (value: string) => /\S+@\S+\.\S+/.test(value),
        },
      },
      {
        key: 'phone',
        propertyLabel: 'Phone Number',
        type: 'string',
        rule: {
          message: 'Phone number must be 10 digits',
          validate: (value: string) =>
            /^\d{10}$/.test(value.replace(/\D/g, '')),
        },
      },
      {
        key: 'department',
        propertyLabel: 'Department',
        type: 'enum',
        options: [
          { label: 'Engineering', value: 'ENGINEERING' },
          { label: 'Marketing', value: 'MARKETING' },
          { label: 'Sales', value: 'SALES' },
          { label: 'HR', value: 'HR' },
        ],
        strictSelection: true,
      },
    ],
    combinationMode: 'AND',
    onChange: action('Validated filter changed'),
  },
};

export const WithAutocompleteOptions: Story = {
  name: 'Autocomplete Suggestions',
  parameters: {
    docs: {
      description: {
        story:
          'Filter with predefined autocomplete options for improved user experience and data consistency.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'country',
        propertyLabel: 'Country',
        type: 'string',
        options: [
          { label: 'United States', value: 'US' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'Canada', value: 'CA' },
          { label: 'Australia', value: 'AU' },
          { label: 'Germany', value: 'DE' },
          { label: 'France', value: 'FR' },
        ],
      },
      {
        key: 'language',
        propertyLabel: 'Language',
        type: 'string',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Chinese', value: 'zh' },
          { label: 'Japanese', value: 'ja' },
        ],
        defaultOperator: 'in',
      },
    ],
    combinationMode: 'OR',
    value: {
      OR: [{ country: { eq: 'US' } }, { language: { in: ['en', 'es'] } }],
    },
    onChange: action('Autocomplete filter changed'),
  },
};

export const EmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'GraphQL property filter in its initial state with no applied filters. Start adding filters to see how they combine.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'title',
        propertyLabel: 'Title',
        type: 'string',
      },
      {
        key: 'isPublished',
        propertyLabel: 'Published',
        type: 'boolean',
      },
      {
        key: 'viewCount',
        propertyLabel: 'View Count',
        type: 'number',
      },
    ],
    combinationMode: 'AND',
    onChange: action('Filter changed from empty'),
  },
};

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Filter component in loading state, typically shown while fetching schema information or processing complex queries.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
      },
    ],
    loading: true,
    combinationMode: 'AND',
    onChange: action('Filter changed'),
  },
};

export const ArtifactFilterExample: Story = {
  name: 'Artifact Filter (Real-world Example)',
  parameters: {
    docs: {
      description: {
        story:
          'Real-world example matching the ArtifactFilter GraphQL input type with name and status filtering capabilities. Shows how the component would be used in production.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Artifact Name',
        type: 'string',
        operators: ['eq', 'ne', 'contains', 'startsWith', 'endsWith'],
        defaultOperator: 'contains',
      },
      {
        key: 'status',
        propertyLabel: 'Artifact Status',
        type: 'enum',
        options: [
          { label: 'Draft', value: 'DRAFT' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Archived', value: 'ARCHIVED' },
          { label: 'Deleted', value: 'DELETED' },
        ],
        operators: ['eq', 'in'],
        strictSelection: true,
      },
    ],
    combinationMode: 'AND',
    value: {
      AND: [
        { name: { contains: 'model' } },
        { status: { in: ['PUBLISHED', 'DRAFT'] } },
      ],
    },
    onChange: action('Artifact filter changed'),
  },
};

export const WithFixedOperator: Story = {
  name: 'Fixed Operator (No Selector)',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates properties with fixed operators where the operator selector is hidden. Useful when you want to enforce a specific operator for certain fields.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'search',
        propertyLabel: 'Search (always contains)',
        type: 'string',
        fixedOperator: 'contains', // Only allows 'contains' operator
      },
      {
        key: 'username',
        propertyLabel: 'Username (always equals)',
        type: 'string',
        fixedOperator: 'eq', // Only allows exact match
      },
      {
        key: 'tags',
        propertyLabel: 'Tags (always in)',
        type: 'string',
        fixedOperator: 'in', // Only allows 'in' operator for multiple values
      },
      {
        key: 'score',
        propertyLabel: 'Score (flexible)',
        type: 'number',
        // No fixedOperator, so operator selector is shown
        operators: ['eq', 'gt', 'gte', 'lt', 'lte'],
      },
    ],
    combinationMode: 'AND',
    onChange: action('Fixed operator filter changed'),
  },
};

export const ToggleCombinationMode: Story = {
  name: 'Toggle Between AND/OR',
  parameters: {
    docs: {
      description: {
        story:
          'Example showing how switching between AND and OR combination modes affects the filter logic. Try toggling the combination mode to see how the same conditions behave differently.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'type',
        propertyLabel: 'Type',
        type: 'enum',
        options: [
          { label: 'Feature', value: 'FEATURE' },
          { label: 'Bug', value: 'BUG' },
          { label: 'Task', value: 'TASK' },
        ],
      },
      {
        key: 'priority',
        propertyLabel: 'Priority',
        type: 'enum',
        options: [
          { label: 'Critical', value: 'CRITICAL' },
          { label: 'High', value: 'HIGH' },
          { label: 'Medium', value: 'MEDIUM' },
          { label: 'Low', value: 'LOW' },
        ],
      },
      {
        key: 'assignedToMe',
        propertyLabel: 'Assigned to Me',
        type: 'boolean',
      },
    ],
    combinationMode: 'AND',
    onChange: action('Filter changed with mode toggle'),
  },
};

export const WithScalarValueModeOnString: Story = {
  name: 'Scalar valueMode on string field',
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates valueMode='scalar' on a non-boolean field. The filter emits { slugExact: 'my-slug' } without an operator, while tags still display using implicitOperator (default '=').",
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'slugExact',
        propertyLabel: 'Slug (scalar exact)',
        type: 'string',
        valueMode: 'scalar',
        implicitOperator: 'eq',
      },
      {
        key: 'title',
        propertyLabel: 'Title',
        type: 'string',
        defaultOperator: 'contains',
      },
      {
        key: 'isPublished',
        propertyLabel: 'Published',
        type: 'boolean', // defaults to scalar mode
      },
    ],
    combinationMode: 'AND',
    value: {
      AND: [{ slugExact: 'hello-world' }, { isPublished: true }],
    },
    onChange: action('Scalar mode (string) filter changed'),
  },
};
