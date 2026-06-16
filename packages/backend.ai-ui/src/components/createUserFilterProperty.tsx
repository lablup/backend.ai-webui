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
 * Builds a `BAIGraphQLPropertyFilter` `FilterProperty` (of `type: 'custom'`)
 * backed by `BAIUserSelect`. Operators search users by name/email and the
 * filter submits the resolved local user id (UUID), while the tag displays the
 * chosen user's email instead of the raw UUID.
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
    type: 'custom',
    fixedOperator,
    valueMode: 'operator',
    singleValue: true,
    renderInput: ({ value, setValue, onConfirm }) => (
      <BAIUserSelect
        valuePropName="id"
        excludeInactive
        value={value}
        placeholder={placeholder}
        style={{ minWidth: 220 }}
        onChange={(nextValue, option) => {
          const userId = _.isArray(nextValue)
            ? nextValue[0]
            : (nextValue ?? undefined);
          setValue(userId);
          if (userId) {
            // BAIUserSelect (labelInValue) hands back the matched option whose
            // `label` is the user's email — use it as the human-readable tag.
            // This holds because the selection always originates from the open
            // dropdown list (where options carry the email label); a value
            // restored without picking would instead surface the raw id.
            const matchedOption = _.isArray(option) ? option[0] : option;
            const label = _.isString(matchedOption?.label)
              ? matchedOption.label
              : undefined;
            onConfirm(userId, label);
            // Clear the picker; the confirmed user lives on as a tag.
            setValue(undefined);
          }
        }}
      />
    ),
  };
}

export default createUserFilterProperty;
