import type {
  FilterOperator,
  FilterProperty,
} from './BAIGraphQLPropertyFilter';
import BAIUserSelect from './fragments/BAIUserSelect';
import * as _ from 'lodash-es';

export interface CreateUserFilterPropertyOptions {
  /**
   * Property key written into the GraphQL filter. Supports dot notation for
   * nested filters, e.g. `'keypair.userId'` → `{ keypair: { userId: { equals } } }`.
   */
  key: string;
  /** Localized label shown in the property selector and tag prefix. */
  propertyLabel: string;
  /** Localized placeholder for the user picker. Defaults to BAIUserSelect's own. */
  placeholder?: string;
  /**
   * Operator the resolved user id is wrapped in. Defaults to `'equals'`
   * (`{ key: { equals: uuid } }`). The operator selector is hidden — a user
   * filter pins one operator.
   */
  fixedOperator?: FilterOperator;
}

/**
 * Builds a `BAIGraphQLPropertyFilter` `FilterProperty` (of `type: 'uuid'`)
 * backed by `BAIUserSelect`. The control searches users by name/email and emits
 * the resolved local user id (UUID) as the controlled `value`; the filter
 * commits it as a condition on selection.
 *
 * Single-value: re-selecting a user replaces the existing condition rather than
 * stacking another tag.
 *
 * @example
 * <BAIGraphQLPropertyFilter
 *   filterProperties={[
 *     createUserFilterProperty({ key: 'keypair.userId', propertyLabel: t('...User') }),
 *   ]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 */
export function createUserFilterProperty({
  key,
  propertyLabel,
  placeholder,
  fixedOperator = 'equals',
}: CreateUserFilterPropertyOptions): FilterProperty {
  return {
    key,
    propertyLabel,
    placeholder,
    type: 'uuid',
    fixedOperator,
    valueMode: 'operator',
    singleValue: true,
    renderInput: ({ value, onChange }) => (
      <BAIUserSelect
        valuePropName="id"
        excludeInactive
        value={value}
        placeholder={placeholder}
        style={{ minWidth: 220 }}
        onChange={(nextValue) => {
          const userId = _.isArray(nextValue)
            ? nextValue[0]
            : (nextValue ?? undefined);
          onChange(userId);
        }}
      />
    ),
  };
}

export default createUserFilterProperty;
