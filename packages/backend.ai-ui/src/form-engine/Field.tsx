/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `Field` — the state half of a form item (to-astryx ticket 34).

 Renders no DOM of its own: it clones its single child with `value` /
 `onChange` (or whatever `valuePropName` / `trigger` name the call site
 declared), owns that field's `touched` / `dirty` / `errors` / `warnings`, and
 decides when to re-render. Everything visual lives in `FormItem`.

 A CLASS component on purpose. The store holds a direct reference to each
 mounted field and calls imperative methods on it (`validateRules`,
 `getMeta`, `onStoreChange`, `isFieldDirty`); a function component would need
 a parallel ref object for all of it, and the render-scheduling below —
 "re-render only this field, synchronously, without touching React state" —
 has no clean hook equivalent.

 The re-render decision in `onStoreChange` is the single most
 behaviour-sensitive part of the engine. Getting it MORE precise than upstream
 is a regression, not an improvement: `SessionLauncherPreview` reads ~40 values
 during render without subscribing to any of them and relies on its parent
 re-rendering it, so a subscription-driven rewrite would change when it
 updates (answers/08 §6.3 risk 4).
 */
import { delayFrame } from './FormStore';
import {
  FieldContext,
  ListContext,
  HOOK_MARK,
  type ListContextValue,
} from './context';
import type {
  FieldEntity,
  InternalFormInstance,
  InternalValidateOptions,
  Meta,
  NotifyInfo,
  Rule,
  RuleError,
  RuleObject,
  StoreValue,
} from './interface';
import {
  containsNamePath,
  defaultGetValueFromEvent,
  getNamePath,
  getValue,
  toArray,
  type InternalNamePath,
  type NamePath,
  type Store,
} from './namePath';
import { validateRules } from './validate';
import { isEqual } from 'lodash-es';
import * as React from 'react';

const EMPTY_ERRORS: string[] = [];

export interface FieldProps {
  name?: NamePath;
  children?:
    | React.ReactNode
    | ((
        control: Record<string, any>,
        meta: Meta,
        form: InternalFormInstance,
      ) => React.ReactNode);
  rules?: Rule[];
  dependencies?: NamePath[];
  shouldUpdate?:
    | boolean
    | ((prev: Store, next: Store, info: { source?: string }) => boolean);
  initialValue?: any;
  preserve?: boolean;
  trigger?: string;
  validateTrigger?: string | string[] | false;
  validateFirst?: boolean | 'parallel';
  valuePropName?: string;
  getValueProps?: (value: StoreValue) => Record<string, unknown>;
  getValueFromEvent?: (...args: any[]) => StoreValue;
  messageVariables?: Record<string, string>;
  isListField?: boolean;
  isList?: boolean;
  onReset?: () => void;
  onMetaChange?: (meta: Meta & { destroy?: boolean }) => void;
}

interface InternalFieldProps extends Omit<FieldProps, 'name'> {
  name?: InternalNamePath;
  fieldContext: InternalFormInstance;
}

function requireUpdate(
  shouldUpdate: FieldProps['shouldUpdate'],
  prev: Store,
  next: Store,
  prevValue: any,
  nextValue: any,
  info: NotifyInfo,
): boolean {
  if (typeof shouldUpdate === 'function') {
    // Only a value update carries a `source`; upstream passes `{}` otherwise,
    // and comparators in this repo destructure it.
    return shouldUpdate(
      prev,
      next,
      'source' in info ? { source: info.source } : {},
    );
  }
  return prevValue !== nextValue;
}

class Field
  extends React.PureComponent<InternalFieldProps, { resetCount: number }>
  implements FieldEntity
{
  static contextType = FieldContext;

  state = { resetCount: 0 };

  private cancelRegisterFunc:
    | ((
        isListField?: boolean,
        preserve?: boolean,
        subNamePath?: InternalNamePath,
      ) => void)
    | null = null;

  private mounted = false;

  /**
   * Kept off React state on purpose: these must be readable synchronously
   * during the same tick they change, before React has re-rendered.
   */
  private touched = false;

  /** Touched OR validated. Only `dependencies` re-validation consults it. */
  private dirty = false;

  private validatePromise: Promise<any> | null | undefined;

  private errors: string[] = EMPTY_ERRORS;

  private warnings: string[] = EMPTY_ERRORS;

  private metaCache: (Meta & { destroy?: boolean }) | null = null;

  constructor(props: InternalFieldProps) {
    super(props);
    // Write `initialValue` into the store during construction, before the
    // first render reads it — otherwise the control paints empty once.
    if (props.fieldContext) {
      props.fieldContext.getInternalHooks(HOOK_MARK)?.initEntityValue(this);
    }
  }

  componentDidMount() {
    const { shouldUpdate, fieldContext } = this.props;
    this.mounted = true;
    if (fieldContext) {
      const hooks = fieldContext.getInternalHooks(HOOK_MARK);
      this.cancelRegisterFunc = hooks?.registerField(this) ?? null;
    }
    // `shouldUpdate === true` means "render me again on anything"; the extra
    // pass makes sure the first paint sees sibling fields that mounted after.
    if (shouldUpdate === true) {
      this.reRender();
    }
  }

  componentWillUnmount() {
    this.cancelRegister();
    this.triggerMetaEvent(true);
    this.mounted = false;
  }

  private cancelRegister = () => {
    const { preserve, isListField, name } = this.props;
    this.cancelRegisterFunc?.(isListField, preserve, getNamePath(name));
    this.cancelRegisterFunc = null;
  };

  // ================================ Utils =================================

  getNamePath = (): InternalNamePath => {
    const { name, fieldContext } = this.props;
    const { prefixName = [] } = fieldContext;
    // `prefixName` is what makes a Form.List child's `name` RELATIVE while
    // its `dependencies` stay absolute.
    return name !== undefined ? [...prefixName, ...name] : [];
  };

  private getRules = (): RuleObject[] => {
    const { rules = [], fieldContext } = this.props;
    return rules.map((rule) =>
      typeof rule === 'function' ? rule(fieldContext) : rule,
    );
  };

  private reRender() {
    if (!this.mounted) return;
    this.forceUpdate();
  }

  /** Remount the child subtree (used on reset so uncontrolled inputs clear). */
  private refresh = () => {
    if (!this.mounted) return;
    this.setState(({ resetCount }) => ({ resetCount: resetCount + 1 }));
  };

  private triggerMetaEvent = (destroy?: boolean) => {
    const { onMetaChange } = this.props;
    if (onMetaChange) {
      const meta = { ...this.getMeta(), destroy };
      if (!isEqual(this.metaCache, meta)) {
        onMetaChange(meta);
      }
      this.metaCache = meta;
    } else {
      this.metaCache = null;
    }
  };

  // ========================= Field entity API =============================

  onStoreChange = (
    prevStore: Store,
    namePathList: InternalNamePath[] | null,
    info: NotifyInfo,
  ) => {
    const { shouldUpdate, dependencies = [], onReset } = this.props;
    const { store } = info;
    const namePath = this.getNamePath();
    const prevValue = this.getValue(prevStore);
    const curValue = this.getValue(store);
    const namePathMatch =
      namePathList && containsNamePath(namePathList, namePath);

    // `setFieldsValue` is treated as user input: it marks the field touched
    // and clears any error the previous value had produced.
    if (
      info.type === 'valueUpdate' &&
      info.source === 'external' &&
      !isEqual(prevValue, curValue)
    ) {
      this.touched = true;
      this.dirty = true;
      this.validatePromise = null;
      this.errors = EMPTY_ERRORS;
      this.warnings = EMPTY_ERRORS;
      this.triggerMetaEvent();
    }

    switch (info.type) {
      case 'reset':
        if (!namePathList || namePathMatch) {
          this.touched = false;
          this.dirty = false;
          this.validatePromise = undefined;
          this.errors = EMPTY_ERRORS;
          this.warnings = EMPTY_ERRORS;
          this.triggerMetaEvent();
          onReset?.();
          this.refresh();
          return;
        }
        break;

      case 'remove': {
        // A `preserve: false` field disappearing can cascade: A hides B hides C.
        if (
          shouldUpdate &&
          requireUpdate(
            shouldUpdate,
            prevStore,
            store,
            prevValue,
            curValue,
            info,
          )
        ) {
          this.reRender();
          return;
        }
        break;
      }

      case 'setField': {
        const { data } = info;
        if (namePathMatch) {
          if ('touched' in data) {
            this.touched = data.touched as boolean;
          }
          if ('validating' in data && !('originRCField' in data)) {
            this.validatePromise = data.validating ? Promise.resolve([]) : null;
          }
          if ('errors' in data) {
            this.errors = data.errors || EMPTY_ERRORS;
          }
          if ('warnings' in data) {
            this.warnings = data.warnings || EMPTY_ERRORS;
          }
          this.dirty = true;
          this.triggerMetaEvent();
          this.reRender();
          return;
        }
        if ('value' in data && containsNamePath(namePathList, namePath, true)) {
          this.reRender();
          return;
        }
        if (
          shouldUpdate &&
          !namePath.length &&
          requireUpdate(
            shouldUpdate,
            prevStore,
            store,
            prevValue,
            curValue,
            info,
          )
        ) {
          this.reRender();
          return;
        }
        break;
      }

      case 'dependenciesUpdate': {
        const dependencyList = dependencies.map(getNamePath);
        if (
          dependencyList.some((dependency) =>
            containsNamePath(info.relatedFields, dependency),
          )
        ) {
          this.reRender();
          return;
        }
        break;
      }

      default:
        // A field re-renders when its own path changed, or — for a field with
        // no `dependencies` shortcut — when `shouldUpdate` says so.
        if (
          namePathMatch ||
          ((!dependencies.length || namePath.length || shouldUpdate) &&
            requireUpdate(
              shouldUpdate,
              prevStore,
              store,
              prevValue,
              curValue,
              info,
            ))
        ) {
          this.reRender();
          return;
        }
        break;
    }

    if (shouldUpdate === true) {
      this.reRender();
    }
  };

  validateRules = (options?: InternalValidateOptions): Promise<RuleError[]> => {
    // Snapshot both, so a `form.setFieldValue` mid-validation cannot swap the
    // value out from under the rules.
    const namePath = this.getNamePath();
    const currentValue = this.getValue();
    const {
      triggerName,
      validateOnly = false,
      delayFrame: showDelayFrame,
    } = options || {};

    const rootPromise = Promise.resolve().then(async () => {
      if (!this.mounted) {
        return [] as RuleError[];
      }
      const { validateFirst = false, messageVariables } = this.props;

      if (showDelayFrame) {
        await delayFrame();
      }

      let filteredRules = this.getRules();
      if (triggerName) {
        filteredRules = filteredRules
          .filter((rule) => rule)
          .filter((rule) => {
            const { validateTrigger } = rule;
            if (!validateTrigger) {
              return true;
            }
            return toArray(validateTrigger).includes(triggerName);
          });
      }

      const promise = validateRules(
        namePath,
        currentValue,
        filteredRules,
        options?.validateMessages ?? {},
        validateFirst,
        messageVariables,
      );

      promise
        .catch((e) => e)
        .then((ruleErrors: RuleError[] = []) => {
          // Ignore a stale run: only the latest validation may publish.
          if (this.validatePromise === rootPromise) {
            this.validatePromise = null;
            const nextErrors: string[] = [];
            const nextWarnings: string[] = [];
            ruleErrors.forEach?.(({ rule: { warningOnly }, errors = [] }) => {
              if (warningOnly) {
                nextWarnings.push(...errors);
              } else {
                nextErrors.push(...errors);
              }
            });
            this.errors = nextErrors;
            this.warnings = nextWarnings;
            this.triggerMetaEvent();
            this.reRender();
          }
        });

      return promise;
    });

    if (validateOnly) {
      return rootPromise as Promise<RuleError[]>;
    }

    this.validatePromise = rootPromise;
    this.dirty = true;
    this.errors = EMPTY_ERRORS;
    this.warnings = EMPTY_ERRORS;
    this.triggerMetaEvent();
    this.reRender();

    return rootPromise as Promise<RuleError[]>;
  };

  isFieldValidating = () => !!this.validatePromise;

  isFieldTouched = () => this.touched;

  isFieldDirty = () => {
    if (this.dirty || this.props.initialValue !== undefined) {
      return true;
    }
    const hooks = this.props.fieldContext.getInternalHooks(HOOK_MARK);
    return hooks?.getInitialValue(this.getNamePath()) !== undefined;
  };

  getErrors = () => this.errors;

  getWarnings = () => this.warnings;

  isListField = () => this.props.isListField;

  isList = () => this.props.isList;

  isPreserve = () => this.props.preserve;

  getMeta = (): Meta => ({
    touched: this.isFieldTouched(),
    validating: this.isFieldValidating(),
    errors: this.errors,
    warnings: this.warnings,
    name: this.getNamePath(),
    validated: this.validatePromise === null,
  });

  // ============================ Field control =============================

  private getValue = (store?: Store) => {
    const { getFieldsValue } = this.props.fieldContext;
    return getValue(store || getFieldsValue(true), this.getNamePath());
  };

  private getOnlyChild = (
    children: InternalFieldProps['children'],
  ): { child: React.ReactNode; isFunction: boolean } => {
    if (typeof children === 'function') {
      const meta = this.getMeta();
      return {
        ...this.getOnlyChild(
          children(this.getControlled(), meta, this.props.fieldContext),
        ),
        isFunction: true,
      };
    }
    const childList = React.Children.toArray(children);
    if (childList.length !== 1 || !React.isValidElement(childList[0])) {
      return { child: childList, isFunction: false };
    }
    return { child: childList[0], isFunction: false };
  };

  getControlled = (childProps: Record<string, any> = {}) => {
    const {
      name,
      trigger = 'onChange',
      validateTrigger,
      getValueFromEvent,
      valuePropName = 'value',
      getValueProps,
      fieldContext,
    } = this.props;
    const mergedValidateTrigger =
      validateTrigger !== undefined
        ? validateTrigger
        : fieldContext.validateTrigger;
    const namePath = this.getNamePath();
    const dispatch = fieldContext.getInternalHooks(HOOK_MARK)?.dispatch;
    const value = this.getValue();
    const mergedGetValueProps =
      getValueProps || ((val: StoreValue) => ({ [valuePropName]: val }));
    const originTriggerFunc = childProps[trigger];
    // A layout-only Field (no `name`) must not inject `value` into its child.
    const valueProps = name !== undefined ? mergedGetValueProps(value) : {};

    const control: Record<string, any> = { ...childProps, ...valueProps };

    control[trigger] = (...args: any[]) => {
      this.touched = true;
      this.dirty = true;
      this.triggerMetaEvent();
      const newValue = getValueFromEvent
        ? getValueFromEvent(...args)
        : defaultGetValueFromEvent(valuePropName, ...args);
      if (newValue !== value) {
        dispatch?.({ type: 'updateValue', namePath, value: newValue });
      }
      originTriggerFunc?.(...args);
    };

    toArray(mergedValidateTrigger || []).forEach((triggerName) => {
      const originTrigger = control[triggerName];
      control[triggerName] = (...args: any[]) => {
        originTrigger?.(...args);
        // Read `rules` at call time — a `dependencies`-driven rule swap must
        // take effect immediately, not on the next render.
        const { rules } = this.props;
        if (rules && rules.length) {
          dispatch?.({ type: 'validateField', namePath, triggerName });
        }
      };
    });

    return control;
  };

  render() {
    const { resetCount } = this.state;
    const { children } = this.props;
    const { child, isFunction } = this.getOnlyChild(children);

    let returnChildNode: React.ReactNode;
    if (isFunction) {
      returnChildNode = child;
    } else if (React.isValidElement(child)) {
      returnChildNode = React.cloneElement(
        child,
        this.getControlled((child as React.ReactElement<any>).props),
      );
    } else {
      returnChildNode = child;
    }

    return <React.Fragment key={resetCount}>{returnChildNode}</React.Fragment>;
  }
}

/**
 * Normalises `name` and resolves the list/field contexts before handing off
 * to the class. The `key` trick matters: a NON-list field is keyed by its
 * path, so renaming it remounts a clean field instead of carrying the old
 * one's touched/error state onto a different name.
 */
const WrapperField: React.FC<
  FieldProps & { fieldContext?: InternalFormInstance }
> = ({ name, ...restProps }) => {
  const fieldContext = React.useContext(FieldContext);
  const listContext = React.useContext<ListContextValue | null>(ListContext);
  const namePath = name !== undefined ? getNamePath(name) : undefined;
  const isMergedListField = restProps.isListField ?? !!listContext;

  const key = isMergedListField ? 'keep' : `_${(namePath || []).join('_')}`;

  return (
    <Field
      key={key}
      {...restProps}
      name={namePath}
      isListField={isMergedListField}
      fieldContext={restProps.fieldContext ?? fieldContext}
    />
  );
};

export default WrapperField;
export { Field as InternalField };
