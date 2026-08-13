/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The form store — the heart of the self-hosted form engine (to-astryx ticket 34).

 Owns the value tree, the registry of mounted fields, validation orchestration
 and every observer channel (`onStoreChange` for fields, `registerWatch` for
 `useWatch`, `onValuesChange`/`onFieldsChange`/`onFinish` for the app,
 `Form.Provider`'s `onFormChange` for cross-form listeners).

 Behavioural contracts pinned by the acceptance suite, in rough order of how
 easy they are to get subtly wrong:

 - `validateFields()` rejects with EXACTLY `{message, values, errorFields,
   outOfDate}`. `message` is the FIRST error string of the FIRST failing
   field, `errorFields[].name` is a path ARRAY including numeric list
   indices, and the order is FIELD REGISTRATION order (not DOM order).
   74 of the 98 call sites `.catch()` this object.
 - `warningOnly` rules land in `warnings`, never `errors`. The Session
   Launcher's Launch button reads `getFieldsError()` and would be permanently
   disabled if a warning leaked into the error channel.
 - `setFieldsValue` deep-MERGES (arrays replaced wholesale); `setFields`
   injects meta without touching unrelated fields; `setFieldsValue` on an
   UNREGISTERED path still writes the value into the store but produces no
   field, which is what makes it look "ignored" to code that reads it back
   through `getFieldsValue()` (no `true`).
 - Unmount honours `preserve`: `true` (the default) keeps the value alive so a
   conditionally hidden group still submits; `false` deletes the KEY, so it
   disappears from `getFieldsValue()` entirely.
 - `resetFields()` re-applies the `initialValues` prop AS OF THE CALL, not as
   of mount.
 */
import { HOOK_MARK } from './context';
import {
  FieldEntity,
  FieldData,
  FieldError,
  Callbacks,
  DistributiveOmit,
  InternalHooks,
  InternalFormInstance,
  Meta,
  NotifyInfo,
  ReducerAction,
  StoreValue,
  ValidateErrorEntity,
  ValidateMessages,
  ValidateOptions,
  ScrollOptions,
} from './interface';
import { mergeValidateMessages } from './messages';
import NameMap, {
  cloneByNamePathList,
  containsNamePath,
  getNamePath,
  getValue,
  matchNamePath,
  merge,
  setValue,
  type InternalNamePath,
  type NamePath,
  type Store,
} from './namePath';
import * as React from 'react';

/** Run `fn` on the next macrotask. Batches watcher notifications. */
function macroTask(fn: () => void) {
  if (typeof MessageChannel !== 'undefined') {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => fn();
    channel.port2.postMessage(null);
  } else {
    setTimeout(fn, 0);
  }
}

/**
 * Wait for the next paint before validating dependency children, so a rule
 * built from `useWatch` sees the value the dependency just produced instead
 * of the previous render's.
 */
export function delayFrame(): Promise<void> {
  return new Promise((resolve) => {
    macroTask(() => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 0);
      }
    });
  });
}

/**
 * Resolve when every promise settles; REJECT with the full result array if
 * any rejected. Deliberately not `Promise.allSettled` — index alignment and
 * the reject-with-all-results shape are what `validateFields` builds on.
 */
function allPromiseFinish<T>(promiseList: Promise<T>[]): Promise<T[]> {
  let hasError = false;
  let count = promiseList.length;
  const results: T[] = [];
  if (!promiseList.length) {
    return Promise.resolve([]);
  }
  return new Promise((resolve, reject) => {
    promiseList.forEach((promise, index) => {
      promise
        .catch((e) => {
          hasError = true;
          return e as T;
        })
        .then((result) => {
          count -= 1;
          results[index] = result;
          if (count > 0) {
            return;
          }
          if (hasError) {
            reject(results);
          }
          resolve(results);
        });
    });
  });
}

type WatchCallBack = (values: Store, allValues: Store) => void;

/** Batches `useWatch` notifications so a burst of updates yields one render. */
class WatcherCenter {
  private namePathList: InternalNamePath[] = [];
  private taskId = 0;
  private watcherList = new Set<WatchCallBack>();
  private store: FormStore;

  constructor(store: FormStore) {
    this.store = store;
  }

  register(callback: WatchCallBack) {
    this.watcherList.add(callback);
    return () => {
      this.watcherList.delete(callback);
    };
  }

  notify(namePath: InternalNamePath[]) {
    namePath.forEach((path) => {
      if (this.namePathList.every((exist) => !matchNamePath(exist, path))) {
        this.namePathList.push(path);
      }
    });
    this.doBatch();
  }

  private doBatch() {
    this.taskId += 1;
    const currentId = this.taskId;
    macroTask(() => {
      if (currentId === this.taskId && this.watcherList.size) {
        const form = this.store.getForm();
        const values = form.getFieldsValue();
        const allValues = form.getFieldsValue(true);
        this.watcherList.forEach((callback) => callback(values, allValues));
        this.namePathList = [];
      }
    });
  }
}

export class FormStore {
  private forceRootUpdate: () => void;
  private subscribable = true;
  private store: Store = {};
  private fieldEntities: FieldEntity[] = [];
  private initialValues: Store = {};
  private callbacks: Callbacks = {};
  private validateMessages: ValidateMessages | null = null;
  private preserve?: boolean;
  private lastValidatePromise: Promise<any> | null = null;
  private watcherCenter = new WatcherCenter(this);
  /** Paths of `preserve: false` fields alive at the previous unmount. */
  private prevWithoutPreserves: NameMap<boolean> | null = null;

  constructor(forceRootUpdate: () => void) {
    this.forceRootUpdate = forceRootUpdate;
  }

  getForm = (): InternalFormInstance =>
    ({
      getFieldValue: this.getFieldValue,
      getFieldsValue: this.getFieldsValue,
      getFieldError: this.getFieldError,
      getFieldWarning: this.getFieldWarning,
      getFieldsError: this.getFieldsError,
      isFieldsTouched: this.isFieldsTouched,
      isFieldTouched: this.isFieldTouched,
      isFieldValidating: this.isFieldValidating,
      isFieldsValidating: this.isFieldsValidating,
      resetFields: this.resetFields,
      setFields: this.setFields,
      setFieldValue: this.setFieldValue,
      setFieldsValue: this.setFieldsValue,
      validateFields: this.validateFields,
      submit: this.submit,
      scrollToField: this.scrollToField,
      focusField: this.focusField,
      getFieldInstance: this.getFieldInstance,
      _init: true,
      getInternalHooks: this.getInternalHooks,
    }) as unknown as InternalFormInstance;

  // ======================== Internal hooks ========================

  getInternalHooks = (key: string): InternalHooks | null => {
    if (key === HOOK_MARK) {
      return {
        dispatch: this.dispatch,
        initEntityValue: this.initEntityValue,
        registerField: this.registerField,
        useSubscribe: this.useSubscribe,
        setInitialValues: this.setInitialValues,
        destroyForm: this.destroyForm,
        setCallbacks: this.setCallbacks,
        setValidateMessages: this.setValidateMessages,
        getFields: this.getFields,
        setPreserve: this.setPreserve,
        getInitialValue: this.getInitialValue,
        registerWatch: this.registerWatch,
      };
    }
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[BAIForm] `getInternalHooks` is internal usage.');
    }
    return null;
  };

  private useSubscribe = (subscribable: boolean) => {
    this.subscribable = subscribable;
  };

  private setCallbacks = (callbacks: Callbacks) => {
    this.callbacks = callbacks;
  };

  private setValidateMessages = (validateMessages: ValidateMessages) => {
    this.validateMessages = validateMessages;
  };

  private setPreserve = (preserve?: boolean) => {
    this.preserve = preserve;
  };

  /**
   * `init` is true only on the very first render, so later `initialValues`
   * prop changes update what `resetFields()` will restore WITHOUT stomping
   * the values the user already typed.
   */
  private setInitialValues = (
    initialValues: Store | undefined,
    init: boolean,
  ) => {
    this.initialValues = initialValues || {};
    if (init) {
      let nextStore = merge(initialValues, this.store);
      // Fields the previous mount dropped for `preserve: false` must come
      // back from `initialValues`, not from the stale store value.
      this.prevWithoutPreserves?.map(({ key: namePath }) => {
        nextStore = setValue(
          nextStore,
          namePath,
          getValue(initialValues, namePath),
        );
        return null;
      });
      this.prevWithoutPreserves = null;
      this.updateStore(nextStore);
    }
  };

  private destroyForm = (clearOnDestroy?: boolean) => {
    if (clearOnDestroy) {
      this.updateStore({});
    } else {
      const prevWithoutPreserves = new NameMap<boolean>();
      this.getFieldEntities(true).forEach((entity) => {
        if (!this.isMergedPreserve(entity.isPreserve())) {
          prevWithoutPreserves.set(entity.getNamePath(), true);
        }
      });
      this.prevWithoutPreserves = prevWithoutPreserves;
    }
  };

  private getInitialValue = (namePath: InternalNamePath) => {
    const initValue = getValue(this.initialValues, namePath);
    // Deep-clone nested initial values so a reset cannot hand back an object
    // a previous edit already mutated in place.
    return namePath.length ? merge(initValue) : initValue;
  };

  private registerWatch = (callback: WatchCallBack) =>
    this.watcherCenter.register(callback);

  private notifyWatch = (namePath: InternalNamePath[] = []) => {
    this.watcherCenter.notify(namePath);
  };

  private updateStore = (nextStore: Store) => {
    this.store = nextStore;
  };

  // ============================ Fields ============================

  private getFieldEntities = (pure = false): FieldEntity[] => {
    if (!pure) {
      return this.fieldEntities;
    }
    return this.fieldEntities.filter((field) => field.getNamePath().length);
  };

  private getFieldsMap = (pure = false) => {
    const cache = new NameMap<FieldEntity>();
    this.getFieldEntities(pure).forEach((field) => {
      cache.set(field.getNamePath(), field);
    });
    return cache;
  };

  private getFieldEntitiesForNamePathList = (
    nameList?: NamePath[] | null,
    includesSubNamePath = false,
  ): (FieldEntity | { INVALIDATE_NAME_PATH: InternalNamePath })[] => {
    if (!nameList) {
      return this.getFieldEntities(true);
    }
    const cache = this.getFieldsMap(true);
    if (!includesSubNamePath) {
      return nameList.map((name) => {
        const namePath = getNamePath(name);
        return cache.get(namePath) || { INVALIDATE_NAME_PATH: namePath };
      });
    }
    return nameList.flatMap<
      FieldEntity | { INVALIDATE_NAME_PATH: InternalNamePath }
    >((name) => {
      const namePath = getNamePath(name);
      const fields = cache.getAsPrefix(namePath);
      if (fields.length) {
        return fields;
      }
      return [{ INVALIDATE_NAME_PATH: namePath }];
    });
  };

  /**
   * `getFieldsValue()`         — only REGISTERED fields.
   * `getFieldsValue(true)`     — the raw store, including values with no
   *                              mounted field (3 call sites need this).
   * `getFieldsValue(['a','b'])`— those paths and everything beneath them.
   */
  getFieldsValue = (
    nameList?:
      | NamePath[]
      | true
      | { strict?: boolean; filter?: (meta: Meta) => boolean },
    filterFunc?: (meta: Meta) => boolean,
  ): Store => {
    let mergedNameList: NamePath[] | true | undefined;
    let mergedFilterFunc = filterFunc;
    if (nameList === true || Array.isArray(nameList)) {
      mergedNameList = nameList;
    } else if (nameList && typeof nameList === 'object') {
      mergedFilterFunc = nameList.filter;
    }
    if (mergedNameList === true && !mergedFilterFunc) {
      return this.store;
    }

    const fieldEntities = this.getFieldEntitiesForNamePathList(
      Array.isArray(mergedNameList) ? mergedNameList : null,
      true,
    );
    const filteredNameList: InternalNamePath[] = [];
    const listNamePaths: InternalNamePath[] = [];
    fieldEntities.forEach((entity) => {
      const namePath =
        (entity as { INVALIDATE_NAME_PATH?: InternalNamePath })
          .INVALIDATE_NAME_PATH || (entity as FieldEntity).getNamePath();
      if ((entity as FieldEntity).isList?.()) {
        // The list's own value is covered by its children; recording it here
        // too would overwrite them with the pre-change array.
        listNamePaths.push(namePath);
        return;
      }
      if (!mergedFilterFunc) {
        filteredNameList.push(namePath);
      } else {
        const meta =
          'getMeta' in entity ? (entity as FieldEntity).getMeta() : null;
        if (meta && mergedFilterFunc(meta)) {
          filteredNameList.push(namePath);
        }
      }
    });

    let mergedValues = cloneByNamePathList(this.store, filteredNameList);
    // An empty Form.List must still appear as `[]`, not as a missing key.
    listNamePaths.forEach((namePath) => {
      if (!getValue(mergedValues, namePath)) {
        mergedValues = setValue(mergedValues, namePath, []);
      }
    });
    return mergedValues;
  };

  getFieldValue = (name: NamePath): StoreValue =>
    getValue(this.store, getNamePath(name));

  getFieldsError = (nameList?: NamePath[]): FieldError[] => {
    const fieldEntities = this.getFieldEntitiesForNamePathList(nameList);
    return fieldEntities.map((entity, index) => {
      if (entity && !(entity as any).INVALIDATE_NAME_PATH) {
        const field = entity as FieldEntity;
        return {
          name: field.getNamePath(),
          errors: field.getErrors(),
          warnings: field.getWarnings(),
        };
      }
      return {
        name: getNamePath(nameList![index]),
        errors: [],
        warnings: [],
      };
    });
  };

  getFieldError = (name: NamePath): string[] =>
    this.getFieldsError([getNamePath(name)])[0].errors;

  getFieldWarning = (name: NamePath): string[] =>
    this.getFieldsError([getNamePath(name)])[0].warnings;

  isFieldsTouched = (...args: any[]): boolean => {
    const [arg0, arg1] = args;
    let namePathList: InternalNamePath[] | null;
    let isAllFieldsTouched = false;
    if (args.length === 0) {
      namePathList = null;
    } else if (args.length === 1) {
      if (Array.isArray(arg0)) {
        namePathList = arg0.map(getNamePath);
      } else {
        namePathList = null;
        isAllFieldsTouched = arg0;
      }
    } else {
      namePathList = arg0.map(getNamePath);
      isAllFieldsTouched = arg1;
    }

    const fieldEntities = this.getFieldEntities(true);
    const isFieldTouched = (field: FieldEntity) => field.isFieldTouched();

    if (!namePathList) {
      return isAllFieldsTouched
        ? fieldEntities.every(
            (entity) => isFieldTouched(entity) || entity.isList(),
          )
        : fieldEntities.some(isFieldTouched);
    }

    const map = new NameMap<FieldEntity[]>();
    namePathList.forEach((shortNamePath) => {
      map.set(shortNamePath, []);
    });
    fieldEntities.forEach((field) => {
      const fieldNamePath = field.getNamePath();
      namePathList!.forEach((shortNamePath) => {
        if (
          shortNamePath.every((nameUnit, i) => fieldNamePath[i] === nameUnit)
        ) {
          map.update(shortNamePath, (list) => [...(list || []), field]);
        }
      });
    });

    const isNamePathListTouched = (entities: FieldEntity[]) =>
      entities.some(isFieldTouched);
    const namePathListEntities = map.map(({ value }) => value);
    return isAllFieldsTouched
      ? namePathListEntities.every(isNamePathListTouched)
      : namePathListEntities.some(isNamePathListTouched);
  };

  isFieldTouched = (name: NamePath) => this.isFieldsTouched([name]);

  isFieldsValidating = (nameList?: NamePath[]) => {
    const fieldEntities = this.getFieldEntities();
    if (!nameList) {
      return fieldEntities.some((field) => field.isFieldValidating());
    }
    const namePathList = nameList.map(getNamePath);
    return fieldEntities.some(
      (field) =>
        containsNamePath(namePathList, field.getNamePath()) &&
        field.isFieldValidating(),
    );
  };

  isFieldValidating = (name: NamePath) => this.isFieldsValidating([name]);

  /**
   * Apply per-field `initialValue` props. Form-level `initialValues` wins;
   * two fields declaring `initialValue` for the same path is ambiguous and
   * neither is applied.
   */
  private resetWithFieldInitialValue = (
    info: {
      entities?: FieldEntity[];
      namePathList?: InternalNamePath[];
      skipExist?: boolean;
    } = {},
  ) => {
    const cache = new NameMap<Set<{ entity: FieldEntity; value: any }>>();
    const fieldEntities = this.getFieldEntities(true);
    fieldEntities.forEach((field) => {
      const { initialValue } = field.props;
      const namePath = field.getNamePath();
      if (initialValue !== undefined) {
        const records = cache.get(namePath) || new Set();
        records.add({ entity: field, value: initialValue });
        cache.set(namePath, records);
      }
    });

    const resetWithFields = (entities: FieldEntity[]) => {
      entities.forEach((field) => {
        const { initialValue } = field.props;
        if (initialValue === undefined) return;
        const namePath = field.getNamePath();
        if (this.getInitialValue(namePath) !== undefined) {
          return;
        }
        const records = cache.get(namePath);
        if (!records || records.size > 1) {
          return;
        }
        const originValue = this.getFieldValue(namePath);
        if (
          !field.isListField() &&
          (!info.skipExist || originValue === undefined)
        ) {
          this.updateStore(
            setValue(this.store, namePath, [...records][0].value),
          );
        }
      });
    };

    let requiredFieldEntities: FieldEntity[];
    if (info.entities) {
      requiredFieldEntities = info.entities;
    } else if (info.namePathList) {
      requiredFieldEntities = [];
      info.namePathList.forEach((namePath) => {
        const records = cache.get(namePath);
        if (records) {
          requiredFieldEntities.push(...[...records].map((r) => r.entity));
        }
      });
    } else {
      requiredFieldEntities = fieldEntities;
    }
    resetWithFields(requiredFieldEntities);
  };

  resetFields = (nameList?: NamePath[]) => {
    const prevStore = this.store;
    if (!nameList) {
      // `this.initialValues` is whatever the LAST render passed, so a form
      // whose `initialValues` prop changed resets to the new values.
      this.updateStore(merge(this.initialValues));
      this.resetWithFieldInitialValue();
      this.notifyObservers(prevStore, null, { type: 'reset' });
      this.notifyWatch();
      return;
    }
    const namePathList = nameList.map(getNamePath);
    namePathList.forEach((namePath) => {
      this.updateStore(
        setValue(this.store, namePath, this.getInitialValue(namePath)),
      );
    });
    this.resetWithFieldInitialValue({ namePathList });
    this.notifyObservers(prevStore, namePathList, { type: 'reset' });
    this.notifyWatch(namePathList);
  };

  setFields = (fields: FieldData[]) => {
    const prevStore = this.store;
    const namePathList: InternalNamePath[] = [];
    fields.forEach((fieldData) => {
      const { name, ...data } = fieldData;
      const namePath = getNamePath(name);
      namePathList.push(namePath);
      if ('value' in data) {
        this.updateStore(setValue(this.store, namePath, data.value));
      }
      this.notifyObservers(prevStore, [namePath], {
        type: 'setField',
        data: fieldData,
      });
    });
    this.notifyWatch(namePathList);
  };

  private getFields = (): FieldData[] =>
    this.getFieldEntities(true).map((field) => {
      const namePath = field.getNamePath();
      const meta = field.getMeta();
      const fieldData: FieldData = {
        ...meta,
        name: namePath,
        value: this.getFieldValue(namePath),
      };
      Object.defineProperty(fieldData, 'originRCField', { value: true });
      return fieldData;
    });

  // =========================== Observer ===========================

  private initEntityValue = (entity: FieldEntity) => {
    const { initialValue } = entity.props;
    if (initialValue !== undefined) {
      const namePath = entity.getNamePath();
      if (getValue(this.store, namePath) === undefined) {
        this.updateStore(setValue(this.store, namePath, initialValue));
      }
    }
  };

  private isMergedPreserve = (fieldPreserve?: boolean) => {
    const mergedPreserve =
      fieldPreserve !== undefined ? fieldPreserve : this.preserve;
    return mergedPreserve ?? true;
  };

  private registerField = (entity: FieldEntity) => {
    this.fieldEntities.push(entity);
    const namePath = entity.getNamePath();
    this.notifyWatch([namePath]);

    if (entity.props.initialValue !== undefined) {
      const prevStore = this.store;
      this.resetWithFieldInitialValue({ entities: [entity], skipExist: true });
      this.notifyObservers(prevStore, [namePath], {
        type: 'valueUpdate',
        source: 'internal',
      });
    }

    return (
      isListField?: boolean,
      preserve?: boolean,
      subNamePath: InternalNamePath = [],
    ) => {
      this.fieldEntities = this.fieldEntities.filter((item) => item !== entity);

      if (
        !this.isMergedPreserve(preserve) &&
        (!isListField || subNamePath.length > 1)
      ) {
        const defaultValue = isListField
          ? undefined
          : this.getInitialValue(namePath);
        if (
          namePath.length &&
          this.getFieldValue(namePath) !== defaultValue &&
          // Another field may still own this path (two controls, one name).
          this.fieldEntities.every(
            (field) => !matchNamePath(field.getNamePath(), namePath),
          )
        ) {
          const prevStore = this.store;
          this.updateStore(setValue(prevStore, namePath, defaultValue, true));
          this.notifyObservers(prevStore, [namePath], { type: 'remove' });
          this.triggerDependenciesUpdate(prevStore, namePath);
        }
      }
      this.notifyWatch([namePath]);
    };
  };

  private dispatch = (action: ReducerAction) => {
    switch (action.type) {
      case 'updateValue': {
        this.updateValue(action.namePath, action.value);
        break;
      }
      case 'validateField': {
        this.validateFields([action.namePath], {
          triggerName: action.triggerName,
        });
        break;
      }
      default:
        break;
    }
  };

  private notifyObservers = (
    prevStore: Store,
    namePathList: InternalNamePath[] | null,
    info: DistributiveOmit<NotifyInfo, 'store'>,
  ) => {
    if (this.subscribable) {
      const mergedInfo = {
        ...info,
        store: this.getFieldsValue(true),
      } as NotifyInfo;
      this.getFieldEntities().forEach(({ onStoreChange }) => {
        onStoreChange(prevStore, namePathList, mergedInfo);
      });
    } else {
      this.forceRootUpdate();
    }
  };

  /**
   * Re-validate and re-render the fields that declare `namePath` in their
   * `dependencies`, transitively. Only DIRTY dependents are re-validated —
   * that is why a pristine field does not flash an error the moment an
   * unrelated field changes.
   */
  private triggerDependenciesUpdate = (
    prevStore: Store,
    namePath: InternalNamePath,
  ) => {
    const childrenFields = this.getDependencyChildrenFields(namePath);
    if (childrenFields.length) {
      this.validateFields(childrenFields, {
        delayFrame: true,
      } as ValidateOptions);
    }
    this.notifyObservers(prevStore, childrenFields, {
      type: 'dependenciesUpdate',
      relatedFields: [namePath, ...childrenFields],
    });
    return childrenFields;
  };

  private updateValue = (name: NamePath, value: StoreValue) => {
    const namePath = getNamePath(name);
    const prevStore = this.store;
    this.updateStore(setValue(this.store, namePath, value));
    this.notifyObservers(prevStore, [namePath], {
      type: 'valueUpdate',
      source: 'internal',
    });
    this.notifyWatch([namePath]);

    const childrenFields = this.triggerDependenciesUpdate(prevStore, namePath);

    const { onValuesChange } = this.callbacks;
    if (onValuesChange) {
      const changedValues = cloneByNamePathList(this.store, [namePath]);
      const allValues = this.getFieldsValue();
      onValuesChange(
        changedValues,
        setValue(allValues, namePath, getValue(changedValues, namePath)),
      );
    }
    this.triggerOnFieldsChange([namePath, ...childrenFields]);
  };

  setFieldsValue = (store: Store) => {
    const prevStore = this.store;
    if (store) {
      // Deep merge, arrays replaced — `setFieldsValue({resource:{cpu:2}})`
      // keeps the other `resource.*` keys intact.
      this.updateStore(merge(this.store, store));
    }
    this.notifyObservers(prevStore, null, {
      type: 'valueUpdate',
      source: 'external',
    });
    this.notifyWatch();
  };

  setFieldValue = (name: NamePath, value: StoreValue) => {
    this.setFields([{ name, value, errors: [], warnings: [], touched: true }]);
  };

  private getDependencyChildrenFields = (
    rootNamePath: InternalNamePath,
  ): InternalNamePath[] => {
    const children = new Set<FieldEntity>();
    const childrenFields: InternalNamePath[] = [];
    const dependencies2fields = new NameMap<Set<FieldEntity>>();

    this.getFieldEntities().forEach((field) => {
      const { dependencies } = field.props;
      (dependencies || []).forEach((dependency) => {
        dependencies2fields.update(getNamePath(dependency), (fields) => {
          const next = fields || new Set<FieldEntity>();
          next.add(field);
          return next;
        });
      });
    });

    const fillChildren = (namePath: InternalNamePath) => {
      const fields =
        dependencies2fields.get(namePath) || new Set<FieldEntity>();
      fields.forEach((field) => {
        if (!children.has(field)) {
          children.add(field);
          const fieldNamePath = field.getNamePath();
          if (field.isFieldDirty() && fieldNamePath.length) {
            childrenFields.push(fieldNamePath);
            fillChildren(fieldNamePath);
          }
        }
      });
    };
    fillChildren(rootNamePath);
    return childrenFields;
  };

  private triggerOnFieldsChange = (
    namePathList: InternalNamePath[],
    fieldErrors?: FieldError[],
  ) => {
    const { onFieldsChange } = this.callbacks;
    if (!onFieldsChange) return;
    const fields = this.getFields();
    if (fieldErrors) {
      const cache = new NameMap<string[]>();
      fieldErrors.forEach(({ name, errors }) => cache.set(name, errors));
      fields.forEach((field) => {
        field.errors =
          cache.get(field.name as InternalNamePath) || field.errors;
      });
    }
    const changedFields = fields.filter(({ name }) =>
      containsNamePath(namePathList, name as InternalNamePath),
    );
    if (changedFields.length) {
      onFieldsChange(changedFields, fields);
    }
  };

  // =========================== Validate ===========================

  validateFields = (arg1?: any, arg2?: any): Promise<Store> => {
    let nameList: NamePath[] | undefined;
    let options: ValidateOptions | undefined;
    if (
      Array.isArray(arg1) ||
      typeof arg1 === 'string' ||
      typeof arg2 === 'string'
    ) {
      nameList = arg1;
      options = arg2;
    } else {
      options = arg1;
    }

    const provideNameList = !!nameList;
    const namePathList: InternalNamePath[] = provideNameList
      ? nameList!.map(getNamePath)
      : [];
    // Resolve value excludes Form.List container paths so a list's items win.
    const finalValueNamePathList = [...namePathList];

    const promiseList: Promise<FieldError>[] = [];
    const TMP_SPLIT = String(Date.now());
    const validateNamePathList = new Set<string>();
    const { recursive, dirty } = options || {};
    const mergedMessages = mergeValidateMessages(this.validateMessages);

    this.getFieldEntities(true).forEach((field) => {
      const fieldNamePath = field.getNamePath();

      if (!provideNameList) {
        if (
          !field.isList() ||
          !namePathList.some((name) => matchNamePath(name, fieldNamePath, true))
        ) {
          finalValueNamePathList.push(fieldNamePath);
        }
        namePathList.push(fieldNamePath);
      }

      if (!field.props.rules || !field.props.rules.length) {
        return;
      }
      if (dirty && !field.isFieldDirty()) {
        return;
      }
      validateNamePathList.add(fieldNamePath.join(TMP_SPLIT));

      if (
        !provideNameList ||
        containsNamePath(namePathList, fieldNamePath, recursive)
      ) {
        const promise = field.validateRules({
          ...options,
          validateMessages: mergedMessages,
        });
        promiseList.push(
          promise
            .then(() => ({ name: fieldNamePath, errors: [], warnings: [] }))
            .catch(
              (
                ruleErrors: {
                  rule: { warningOnly?: boolean };
                  errors: string[];
                }[],
              ) => {
                const mergedErrors: string[] = [];
                const mergedWarnings: string[] = [];
                ruleErrors.forEach?.(({ rule: { warningOnly }, errors }) => {
                  if (warningOnly) {
                    mergedWarnings.push(...errors);
                  } else {
                    mergedErrors.push(...errors);
                  }
                });
                if (mergedErrors.length) {
                  return Promise.reject({
                    name: fieldNamePath,
                    errors: mergedErrors,
                    warnings: mergedWarnings,
                  });
                }
                return {
                  name: fieldNamePath,
                  errors: mergedErrors,
                  warnings: mergedWarnings,
                };
              },
            ),
        );
      }
    });

    const summaryPromise = allPromiseFinish(promiseList);
    this.lastValidatePromise = summaryPromise;

    summaryPromise
      .catch((results) => results)
      .then((results: FieldError[]) => {
        const resultNamePathList = results.map(({ name }) => name);
        this.notifyObservers(this.store, resultNamePathList, {
          type: 'validateFinish',
        });
        this.triggerOnFieldsChange(resultNamePathList, results);
      });

    const returnPromise = summaryPromise
      .then((): Promise<Store> => {
        if (this.lastValidatePromise === summaryPromise) {
          return Promise.resolve(this.getFieldsValue(finalValueNamePathList));
        }
        return Promise.reject([]);
      })
      .catch((results: FieldError[]) => {
        const errorList = results.filter(
          (result) => result && result.errors.length,
        );
        return Promise.reject<Store>({
          message: errorList[0]?.errors?.[0],
          values: this.getFieldsValue(namePathList),
          errorFields: errorList,
          outOfDate: this.lastValidatePromise !== summaryPromise,
        } satisfies ValidateErrorEntity & { message: any });
      });

    // Swallow the internal branch so an unhandled rejection never reaches the
    // console; the caller's own `.catch()` still sees it.
    returnPromise.catch((e) => e);

    const triggerNamePathList = namePathList.filter((namePath) =>
      validateNamePathList.has(namePath.join(TMP_SPLIT)),
    );
    this.triggerOnFieldsChange(triggerNamePathList);

    return returnPromise;
  };

  submit = () => {
    this.validateFields()
      .then((values) => {
        const { onFinish } = this.callbacks;
        if (onFinish) {
          try {
            onFinish(values);
          } catch (err) {
            // A throwing `onFinish` is the app's bug, not a validation
            // failure — surface it instead of routing to onFinishFailed.
            // eslint-disable-next-line no-console
            console.error(err);
          }
        }
      })
      .catch((e) => {
        this.callbacks.onFinishFailed?.(e);
      });
  };

  // ======================= Scroll / focus =========================

  /**
   * Resolved through the control's generated `id`, which `FormItem` stamps
   * onto every child. Composing a ref onto arbitrary children would be the
   * only other way and buys nothing: `getFieldInstance` has zero call sites.
   */
  getFieldInstance = (name: NamePath) => this.getFieldDOMNode(name);

  /**
   * Thin by design (answers/08 §6.2): `scrollToField` has ONE call site, and
   * this repo's main scroll-to-error consumer deliberately bypasses it and
   * walks the DOM itself because registration order and DOM order disagree.
   */
  scrollToField = (name: NamePath, options: ScrollOptions = {}) => {
    const { focus, ...restOpt } = options;
    const node = this.getFieldDOMNode(name);
    if (node) {
      node.scrollIntoView({ block: 'nearest', ...restOpt });
      if (focus) {
        this.focusField(name);
      }
    }
  };

  focusField = (name: NamePath) => {
    const instance = this.getFieldInstance(name);
    if (typeof instance?.focus === 'function') {
      instance.focus();
      return;
    }
    this.getFieldDOMNode(name)?.focus?.();
  };

  private getFieldDOMNode = (name: NamePath): HTMLElement | undefined => {
    if (typeof document === 'undefined') return undefined;
    const id = getNamePath(name).join('_');
    return document.getElementById(id) ?? undefined;
  };
}

/**
 * Create (or adopt) a form instance.
 *
 * The instance lives in `useState`'s lazy initialiser rather than a ref: both
 * give "construct exactly once", but a ref would have to be read AND written
 * during render, which React's rules-of-refs lint rightly rejects. The
 * `forceUpdate` handed to the store is the escape hatch for the one case
 * field subscriptions cannot express — a `<Form>` whose children read values
 * without registering a field.
 */
export default function useForm<Values = any>(
  form?: InternalFormInstance,
): [InternalFormInstance] {
  const [, forceUpdate] = React.useState({});
  const [ownInstance] = React.useState<InternalFormInstance>(() =>
    new FormStore(() => forceUpdate({})).getForm(),
  );

  return [
    (form ?? ownInstance) as InternalFormInstance & { __values?: Values },
  ];
}
