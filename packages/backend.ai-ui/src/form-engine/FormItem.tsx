/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `Form.Item` / `BAIFormItem` — visuals over the engine (to-astryx ticket 34).

 One component serves both names: ticket 05 split the form item into a
 hand-rendered visual shell (`FormItemVisual`) and a state binding, then kept
 the binding on antd's `<Form.Item noStyle>` until the engine existed. This
 file is that binding, re-pointed at the engine's own `Field`. The visual half
 is untouched, which is exactly what the split was for.

 Four behaviours are load-bearing and were each a bug in the ticket-05
 prototype before they were fixed (answers/08 §3):

 1. `required` IS NOT RE-DERIVED FROM `rules` NAIVELY. Function rules
    (`({getFieldValue}) => ({required: …})`) must be evaluated against the
    live form to decide whether the asterisk shows; a `warningOnly` required
    rule must NOT show it.
 2. LAYOUT-ONLY ITEMS AGGREGATE THEIR CHILDREN'S ERRORS. An item with no
    `name` wrapping `noStyle` children publishes `onSubItemMetaChange`
    through `NoStyleItemContext`; 25 sites in this repo depend on it, and
    without it their messages silently disappear.
 3. `help={false}` OPTS OUT OF BUBBLING. A nested item that renders its own
    help must not ALSO report into an ancestor's aggregate, or the message
    appears twice.
 4. `noStyle` IS A PURE PASSTHROUGH. 104 sites use it as a state-only
    wrapper; giving them a visual shell would change every one of those
    layouts.
 */
import Field, { type FieldProps } from './Field';
import BAIFormItemVisual from './FormItemVisual';
import {
  FieldContext,
  FormConfigContext,
  FormItemInputContext,
  FormItemLayoutContext,
  ListContext,
  NoStyleItemContext,
  type FormItemCol,
  type FormItemStatusContextValue,
  type FormLayout,
  type RequiredMark,
} from './context';
import type {
  InternalFormInstance,
  Meta,
  Rule,
  RuleObject,
  StoreValue,
} from './interface';
import { toArray, type InternalNamePath, type NamePath } from './namePath';
import * as React from 'react';

const NAME_SPLIT = '__SPLIT__';

/** antd's id scheme: `formName_a_b`, with a guard for a reserved DOM name. */
const ID_BLACKLIST = ['parentNode'];
function getFieldId(
  namePath: InternalNamePath,
  formName?: string,
): string | undefined {
  if (!namePath.length) return undefined;
  const mergedId = namePath.join('_');
  if (formName) return `${formName}_${mergedId}`;
  return ID_BLACKLIST.includes(mergedId) ? `form_item_${mergedId}` : mergedId;
}

function genEmptyMeta(): Meta {
  return {
    errors: [],
    warnings: [],
    touched: false,
    validating: false,
    name: [],
    validated: false,
  };
}

function getStatus(
  errors: React.ReactNode[],
  warnings: React.ReactNode[],
  meta: Meta,
  hasFeedback?: boolean,
  validateStatus?: FormItemStatusContextValue['status'],
): FormItemStatusContextValue['status'] {
  if (validateStatus !== undefined) return validateStatus;
  if (meta.validating) return 'validating';
  if (errors.length) return 'error';
  if (warnings.length) return 'warning';
  if (meta.touched || (hasFeedback && meta.validated)) return 'success';
  return '';
}

export interface FormItemProps<Values = any> extends Omit<
  FieldProps,
  'children' | 'name' | 'onMetaChange' | 'isList'
> {
  name?: NamePath;
  label?: React.ReactNode;
  /**
   * A node, or antd's `{ title, icon, placement, ... }` object form (3 call
   * sites). `title` becomes the tooltip BODY and `icon` the trigger glyph,
   * rendered by the visual shell behind a hover/focus target — antd's real
   * behaviour. (The ticket-05 PILOT-DECISION to render it inline was reverted
   * once Astryx's own `Tooltip` made a real one free of an antd dependency.)
   * The remaining keys (`placement`, DOM props) are still dropped: they
   * describe antd's overlay, which Astryx replaces wholesale.
   */
  tooltip?: React.ReactNode | FormItemTooltipConfig;
  extra?: React.ReactNode;
  /** `false` also suppresses meta bubbling to an ancestor item. */
  help?: React.ReactNode;
  /** Overrides the asterisk derived from `rules`. */
  required?: boolean;
  /** Render no wrapper; bubble this field's meta to the nearest ancestor item. */
  noStyle?: boolean;
  hidden?: boolean;
  layout?: FormLayout;
  className?: string;
  style?: React.CSSProperties;
  hasFeedback?: boolean;
  validateStatus?: FormItemStatusContextValue['status'];
  colon?: boolean;
  labelAlign?: 'left' | 'right';
  labelCol?: FormItemCol;
  wrapperCol?: FormItemCol;
  labelWrap?: boolean;
  htmlFor?: string;
  id?: string;
  fieldKey?: React.Key | React.Key[];
  children?:
    React.ReactNode | ((form: InternalFormInstance) => React.ReactNode);
  __values?: Values;
}

export interface FormItemTooltipConfig {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  placement?: string;
  [key: string]: unknown;
}

const isTooltipConfig = (
  tooltip: FormItemProps['tooltip'],
): tooltip is FormItemTooltipConfig =>
  !!tooltip &&
  typeof tooltip === 'object' &&
  !React.isValidElement(tooltip) &&
  'title' in tooltip;

/** The tooltip BODY — antd's `tooltip` node, or the config object's `title`. */
function normalizeTooltip(tooltip: FormItemProps['tooltip']): React.ReactNode {
  return isTooltipConfig(tooltip)
    ? tooltip.title
    : (tooltip as React.ReactNode);
}

/** The tooltip TRIGGER glyph — antd's `tooltip.icon`, when supplied. */
function tooltipIcon(tooltip: FormItemProps['tooltip']): React.ReactNode {
  return isTooltipConfig(tooltip) ? tooltip.icon : undefined;
}

type SubMetaMap = Record<
  string,
  {
    errors?: React.ReactNode[];
    warnings?: React.ReactNode[];
    name?: InternalNamePath;
  }
>;

const FormItem = <Values,>(props: FormItemProps<Values>) => {
  const {
    name,
    label,
    tooltip,
    extra,
    help,
    required,
    noStyle,
    hidden,
    layout: propsLayout,
    className,
    style,
    hasFeedback,
    validateStatus,
    children,
    rules,
    dependencies,
    shouldUpdate,
    messageVariables,
    trigger = 'onChange',
    validateTrigger,
    colon,
    labelAlign,
    labelCol,
    wrapperCol,
    labelWrap,
    htmlFor,
    fieldKey: _fieldKey,
    id: _id,
    __values: _values,
    ...restFieldProps
  } = props;

  const fieldContext = React.useContext(FieldContext);
  const { optionalLabel } = React.useContext(FormConfigContext);
  const {
    layout: formLayout,
    requiredMark,
    name: formName,
    disabled: formDisabled,
    size: formSize,
    colon: formColon,
    labelAlign: formLabelAlign,
    labelCol: formLabelCol,
    wrapperCol: formWrapperCol,
    labelWrap: formLabelWrap,
  } = React.useContext(FormItemLayoutContext);
  const notifyParentMetaChange = React.useContext(NoStyleItemContext);
  const listContext = React.useContext(ListContext);

  const layout = propsLayout || formLayout;
  const mergedLabelCol = labelCol ?? formLabelCol;
  const mergedWrapperColProp = wrapperCol ?? formWrapperCol;
  /**
   * antd's `FormItemInput`: a LABEL-LESS item in a form that declares a
   * `labelCol` gets that span as a wrapper OFFSET, so its control still lines
   * up with the labelled rows above it.
   */
  const mergedWrapperCol =
    label === null &&
    !labelCol &&
    !wrapperCol &&
    formLabelCol?.span !== undefined &&
    formLabelCol.span < 24
      ? { ...mergedWrapperColProp, offset: formLabelCol.span }
      : mergedWrapperColProp;
  const mergedValidateTrigger =
    validateTrigger !== undefined
      ? validateTrigger
      : fieldContext.validateTrigger;

  const [meta, setMeta] = React.useState<Meta>(genEmptyMeta);
  const [subFieldErrors, setSubFieldErrors] = React.useState<SubMetaMap>({});
  // A removed list row no longer resolves through the key manager, so the
  // path used to unpublish it has to be the one we published under.
  const fieldKeyPathRef = React.useRef<InternalNamePath | null>(null);

  const onMetaChange = (nextMeta: Meta & { destroy?: boolean }) => {
    const keyInfo = listContext?.getKey(nextMeta.name);
    setMeta(nextMeta.destroy ? genEmptyMeta() : nextMeta);

    if (noStyle && help !== false && notifyParentMetaChange) {
      let namePath: InternalNamePath = nextMeta.name;
      if (!nextMeta.destroy) {
        if (keyInfo !== undefined) {
          const [fieldKey, restPath] = keyInfo;
          namePath = [fieldKey as string | number, ...restPath];
          fieldKeyPathRef.current = namePath;
        }
      } else {
        namePath = fieldKeyPathRef.current || namePath;
      }
      notifyParentMetaChange(nextMeta, namePath as React.Key[]);
    }
  };

  const onSubItemMetaChange = (
    subMeta: SubMetaMap[string] & { name: InternalNamePath; destroy?: boolean },
    uniqueKeys: React.Key[],
  ) => {
    setSubFieldErrors((prev) => {
      const clone = { ...prev };
      // name: ['user', 1] + key: [4] => 'user__SPLIT__4' — keyed by ROW
      // IDENTITY, so removing a list row drops the right entry.
      const mergedNameKey = [...subMeta.name.slice(0, -1), ...uniqueKeys].join(
        NAME_SPLIT,
      );
      if (subMeta.destroy) {
        delete clone[mergedNameKey];
      } else {
        clone[mergedNameKey] = subMeta;
      }
      return clone;
    });
  };

  const mergedErrors: React.ReactNode[] = [
    ...meta.errors,
    ...Object.values(subFieldErrors).flatMap((sub) => sub.errors ?? []),
  ];
  const mergedWarnings: React.ReactNode[] = [
    ...meta.warnings,
    ...Object.values(subFieldErrors).flatMap((sub) => sub.warnings ?? []),
  ];

  const renderLayout = (
    baseChildren: React.ReactNode,
    fieldId?: string,
    isRequired?: boolean,
  ) => {
    const status: FormItemStatusContextValue = {
      status: getStatus(
        mergedErrors,
        mergedWarnings,
        meta,
        hasFeedback,
        validateStatus,
      ),
      errors: mergedErrors,
      warnings: mergedWarnings,
      hasFeedback,
      isFormItemInput: true,
    };

    // A `noStyle` item contributes state only. Its errors were already sent
    // upward through `notifyParentMetaChange`.
    if (noStyle && !hidden) {
      return (
        <FormItemInputContext.Provider value={status}>
          {baseChildren}
        </FormItemInputContext.Provider>
      );
    }

    // antd keeps `-required` on the label in every case and hides the GLYPH
    // for `false` / `'optional'` / a function mark, because the label itself
    // then carries the hint. Mirrored so `[data-bai-form-item-required]` stays
    // a stable anchor while the asterisk obeys the same rule antd applies.
    const requiredMarkType =
      requiredMark === false
        ? ('hidden' as const)
        : requiredMark === 'optional' || typeof requiredMark === 'function'
          ? ('optional' as const)
          : undefined;
    // An explicit `required` wins over the rules-derived value, and it is the
    // ONLY source on a layout-only item (no `name`, so no rules to derive
    // from). `BAIBulkEditFormItem` renders exactly that shape — it drops
    // `name` from the item and drives the marker by hand.
    const mergedRequired = required !== undefined ? required : !!isRequired;
    const mergedLabel = applyRequiredMark(
      label,
      mergedRequired,
      requiredMark,
      optionalLabel ?? '(optional)',
    );

    return (
      <FormItemInputContext.Provider value={status}>
        <BAIFormItemVisual
          label={mergedLabel}
          labelTitle={typeof label === 'string' ? label : undefined}
          tooltip={normalizeTooltip(tooltip)}
          tooltipIcon={tooltipIcon(tooltip)}
          extra={extra}
          help={help}
          required={mergedRequired}
          requiredMarkType={requiredMarkType}
          layout={layout}
          size={formSize}
          colon={colon ?? formColon}
          labelAlign={labelAlign ?? formLabelAlign}
          labelCol={mergedLabelCol}
          wrapperCol={mergedWrapperCol}
          labelWrap={labelWrap ?? formLabelWrap}
          status={status.status}
          hasFeedback={hasFeedback}
          className={className}
          style={style}
          hidden={hidden}
          fieldId={fieldId}
          htmlFor={htmlFor}
          errors={mergedErrors}
          warnings={mergedWarnings}
        >
          <NoStyleItemContext.Provider value={onSubItemMetaChange}>
            {baseChildren}
          </NoStyleItemContext.Provider>
        </BAIFormItemVisual>
      </FormItemInputContext.Provider>
    );
  };

  const hasName = name !== undefined && name !== null;
  const isRenderProps = typeof children === 'function';

  // Pure layout item: no field is registered, but the shell still renders and
  // still aggregates the `noStyle` children nested inside it.
  if (!hasName && !isRenderProps && !dependencies) {
    return renderLayout(children as React.ReactNode);
  }

  // `${label}` in a validate message resolves to the item's label when it is
  // a plain string, else to its name — matching antd's `messageVariables`.
  let variables: Record<string, string> = {};
  if (typeof label === 'string') {
    variables.label = label;
  } else if (name) {
    variables.label = String(name);
  }
  if (messageVariables) {
    variables = { ...variables, ...messageVariables };
  }

  return (
    <Field
      {...restFieldProps}
      name={name}
      rules={rules}
      dependencies={dependencies}
      shouldUpdate={shouldUpdate}
      messageVariables={variables}
      trigger={trigger}
      validateTrigger={mergedValidateTrigger}
      onMetaChange={onMetaChange}
    >
      {(control, renderMeta, context) => {
        const mergedName = toArray(name as any).length ? renderMeta.name : [];
        const fieldId = getFieldId(mergedName, formName);
        const isRequired =
          required !== undefined ? required : isRuleRequired(rules, context);

        let childNode: React.ReactNode = null;

        if (isRenderProps && (shouldUpdate || dependencies) && !hasName) {
          childNode = (
            children as (form: InternalFormInstance) => React.ReactNode
          )(context);
        } else if (React.isValidElement(children)) {
          const element = children as React.ReactElement<Record<string, any>>;
          const childProps: Record<string, any> = {
            ...element.props,
            ...control,
          };
          if (!childProps.id) {
            childProps.id = fieldId;
          }
          // Astryx controls replace `id` with their own `useId()` but pass
          // `data-*` through to the element, so this is the handle that
          // survives (scrollToError.ts, FormStore.getFieldDOMNode).
          childProps['data-bai-field-id'] = fieldId;
          if (formDisabled && childProps.disabled === undefined) {
            childProps.disabled = true;
          }

          const describedbyArr: string[] = [];
          if (help || mergedErrors.length > 0) {
            describedbyArr.push(`${fieldId}_help`);
          }
          if (extra) {
            describedbyArr.push(`${fieldId}_extra`);
          }
          if (describedbyArr.length) {
            childProps['aria-describedby'] = describedbyArr.join(' ');
          }
          if (mergedErrors.length > 0) {
            childProps['aria-invalid'] = 'true';
          }
          if (isRequired) {
            childProps['aria-required'] = 'true';
          }

          // Keep the child's own handlers: `control[trigger]` writes to the
          // store, then the author's handler runs.
          const triggers = new Set<string>([
            ...toArray(trigger),
            ...toArray(mergedValidateTrigger as string | string[]),
          ]);
          triggers.forEach((eventName) => {
            childProps[eventName] = (...args: any[]) => {
              control[eventName]?.(...args);
              (element.props as any)[eventName]?.(...args);
            };
          });

          childNode = React.cloneElement(element, childProps);
        } else {
          childNode = children as React.ReactNode;
        }

        return renderLayout(childNode, fieldId, isRequired);
      }}
    </Field>
  );
};

/**
 * Evaluate `rules` — INCLUDING function rules, against the live form — to
 * decide whether the required marker shows. A `warningOnly` required rule
 * does not count: it is advice, not a requirement.
 */
function isRuleRequired(
  rules: Rule[] | undefined,
  form: InternalFormInstance,
): boolean {
  return !!rules?.some((rule) => {
    if (typeof rule === 'function') {
      const resolved = rule(form) as RuleObject | undefined;
      return !!resolved?.required && !resolved?.warningOnly;
    }
    return !!rule?.required && !rule?.warningOnly;
  });
}

/**
 * `requiredMark` decorates the LABEL. The app supplies a function that appends
 * "(Optional)" to non-required labels (`DefaultProviders.tsx`), which is also
 * why required fields show no asterisk there — any function or `'optional'`
 * mark replaces the asterisk entirely, exactly as antd does.
 */
function applyRequiredMark(
  label: React.ReactNode,
  required: boolean,
  requiredMark: RequiredMark | undefined,
  optionalLabel: React.ReactNode,
): React.ReactNode {
  if (label === undefined || label === null) return label;
  if (typeof requiredMark === 'function') {
    return requiredMark(label, { required });
  }
  if (requiredMark === 'optional' && !required) {
    // antd renders the bare locale string and spaces it with
    // `margin-inline-start: marginXXS`, so the gap survives text selection and
    // copy. The engine had baked a literal leading space into the string,
    // which put " (optional)" in `label.textContent` where antd has
    // "(optional)".
    return (
      <>
        {label}
        <span data-bai-form-item-optional="">{optionalLabel}</span>
      </>
    );
  }
  return label;
}

/** Errors/warnings of the nearest enclosing `Form.Item`. */
export const useFormItemStatus = () => {
  const {
    status,
    errors = [],
    warnings = [],
  } = React.useContext(FormItemInputContext);
  return { status, errors, warnings };
};

export { getFieldId };
export default FormItem;
export type { StoreValue };
