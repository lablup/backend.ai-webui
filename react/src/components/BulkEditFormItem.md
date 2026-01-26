# BulkEditFormItem Component

## Overview

`BulkEditFormItem` is a custom Form.Item component designed for bulk editing scenarios in the Backend.AI WebUI. It provides a user-friendly interface for handling bulk updates with three distinct modes:

1. **Keep as is** (default): Maintains current values without changes
2. **Edit**: Allows modification of the field value
3. **Clear**: Unsets the value for all items (only available for optional fields)

## Features

- ✅ Three distinct editing modes with clear user feedback
- ✅ Optional field support with Clear button
- ✅ Undo changes functionality to revert to "Keep as is" state
- ✅ Proper TypeScript types and documentation
- ✅ Internationalization support (21 languages)
- ✅ React Compiler optimization with `'use memo'` directive
- ✅ Comprehensive unit tests
- ✅ Detailed Storybook stories

## Usage

### Basic Example

```tsx
import BulkEditFormItem from './components/BulkEditFormItem';
import { Form, Input } from 'antd';

<Form>
  <BulkEditFormItem name="username" label="Username">
    <Input placeholder="Enter username" />
  </BulkEditFormItem>
</Form>
```

### Optional Field Example

```tsx
<BulkEditFormItem name="domain_name" label="Domain" optional>
  <BAISelect
    options={[
      { value: 'default', label: 'Default' },
      { value: 'custom', label: 'Custom' },
    ]}
  />
</BulkEditFormItem>
```

### Multiple Fields Example

```tsx
<Form>
  <BulkEditFormItem name="domain" label="Domain" optional>
    <BAISelect options={domainOptions} />
  </BulkEditFormItem>
  
  <BulkEditFormItem name="status" label="Status">
    <BAISelect options={statusOptions} />
  </BulkEditFormItem>
  
  <BulkEditFormItem name="notes" label="Notes" optional>
    <Input.TextArea rows={3} />
  </BulkEditFormItem>
</Form>
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `optional` | `boolean` | `false` | Whether this field can be cleared (shows Clear button in "Keep as is" mode) |
| `children` | `ReactElement` | - | Input component to render (typically Select, Input, InputNumber, etc.) |
| `...formItemProps` | `FormItemProps` | - | All Ant Design Form.Item props (name, label, rules, tooltip, etc.) |

## Modes

### Keep as is (Default)

- Input is disabled
- Field value is set to `undefined` (not included in form submission)
- Shows "Keep as is" text
- Displays Edit and Clear (if optional) buttons

### Edit Mode

- Input is enabled
- User can modify the field value
- Shows "Undo changes" button to revert to "Keep as is"

### Clear Mode

- Only available for optional fields
- Field value is set to `null` (explicitly clears the value)
- Shows "Undo changes" button to revert to "Keep as is"

## Implementation Details

### State Management

The component uses React's `useState` to manage the current mode:

```typescript
type BulkEditMode = 'keep' | 'edit' | 'clear';
const [mode, setMode] = useState<BulkEditMode>('keep');
```

### Form Integration

- Uses Ant Design's `Form.useFormInstance()` to access form methods
- Automatically resets to "Keep as is" when form is reset
- Properly handles field value updates

### Children Props

The component clones the children element and adds/overrides props:

- In "Keep as is" mode: `disabled: true`, `value: undefined`
- In other modes: children render with their original props

## Testing

### Unit Tests

Run unit tests with:

```bash
pnpm test BulkEditFormItem.test.tsx
```

The test suite covers:
- Default rendering in "keep" mode
- Clear button visibility for optional fields
- Mode switching (Edit, Clear, Undo)
- Input disable/enable behavior

### Storybook

View the component in Storybook:

```bash
cd packages/backend.ai-ui
pnpm run storybook
```

Navigate to: **Components > BulkEditFormItem**

## Internationalization

The component uses the following i18n keys:

| Key | English | Korean | Japanese | Chinese (Simplified) |
|-----|---------|--------|----------|---------------------|
| `bulkEdit.Clear` | Clear | 지우기 | クリア | 清除 |
| `bulkEdit.Edit` | Edit | 편집 | 編集 | 编辑 |
| `bulkEdit.KeepAsIs` | Keep as is | 그대로 유지 | そのまま維持 | 保持原样 |
| `bulkEdit.UndoChanges` | Undo changes | 변경 취소 | 変更を元に戻す | 撤销更改 |

Translations are available for all 21 supported languages.

## Related Files

- **Component**: `/react/src/components/BulkEditFormItem.tsx`
- **Tests**: `/react/src/components/BulkEditFormItem.test.tsx`
- **Stories**: `/react/src/components/BulkEditFormItem.stories.tsx`
- **Usage Example**: `/react/src/components/UpdateUsersModal.tsx`

## Related Issues

- **JIRA**: FR-1966
- **GitHub Issue**: Custom Form.Item for bulk editing

## Notes

- The component is optimized with React Compiler's `'use memo'` directive
- It follows the existing patterns from `FormItemControl.tsx` and `FormItemWithUnlimited.tsx`
- The component was created to replace the TODO comment in `UpdateUsersModal.tsx`
