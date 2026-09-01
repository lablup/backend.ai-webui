/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  Form,
  FormInstance,
  FormItemProps,
  FormListProps,
} from '../form-engine';
import { AstryxFormTextInput } from './astryxFormControls';
import { usePopover } from '@astryxdesign/core/Popover';
import { TextInput } from '@astryxdesign/core/TextInput';
import {
  colorVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { BAIButton, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleMinus, PlusIcon } from 'lucide-react';
import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface EnvVarConfig {
  variable: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
}

/**
 * The value input's placeholder depends on the SIBLING `variable` field.
 *
 * `Form.Item`'s `dependencies` re-renders the *Field*, but the
 * `<AstryxFormTextInput placeholder={…}>` element it renders is still the same
 * static element object created on the last OUTER render, so a placeholder
 * computed inline from `form.getFieldValue(...)` never updates — the field the
 * user just typed into keeps showing the generic hint. `Form.useWatch`
 * subscribes this leaf component to the sibling field, which is what actually
 * makes the placeholder reactive.
 *
 * `value` / `onChange` are injected by the enclosing `Form.Item` and forwarded
 * through `...controlProps`.
 */
const EnvVarValueInput: React.FC<
  {
    form: FormInstance;
    variableNamePath: Parameters<FormInstance['getFieldValue']>[0];
    getPlaceholderForVariable: (variable: string) => string;
    label: string;
  } & Omit<
    React.ComponentProps<typeof AstryxFormTextInput>,
    'label' | 'placeholder'
  >
> = ({
  form,
  variableNamePath,
  getPlaceholderForVariable,
  label,
  ...controlProps
}) => {
  'use memo';
  const variable = Form.useWatch(variableNamePath, form);
  return (
    <AstryxFormTextInput
      {...controlProps}
      label={label}
      placeholder={getPlaceholderForVariable(variable)}
    />
  );
};

const comboboxStyles = stylex.create({
  // `anchor-size(width)` (what BaseTypeahead's own popup xstyle uses) only
  // ever floors the width in practice — measured live, the list still grows
  // past the input for a long suggestion. Astryx's own `Popover` component
  // hits the same ceiling: its `customWidth` xstyle takes a JS-measured
  // pixel value rather than trusting `anchor-size()` to cap anything. Mirror
  // that — `width` below is set from the input's measured `ResizeObserver`
  // width (`EnvVarNameInput`'s `anchorWidth` state), with this as the
  // before-first-measurement fallback.
  matchTrigger: {
    minWidth: 'anchor-size(width)',
  },
  width: (px: number) => ({
    width: `${px}px`,
  }),
  anchor: {
    width: '100%',
  },
  dropdown: {
    boxSizing: 'border-box',
    width: '100%',
    // Matches BaseTypeahead's own dropdown cap (Typeahead/BaseTypeahead.tsx).
    maxHeight: '240px',
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
  },
  item: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    padding: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    cursor: 'pointer',
    fontSize: typeScaleVars['--text-body-size'],
    color: colorVars['--color-text-primary'],
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'start',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
});

interface EnvVarNameInputProps {
  /** Injected by `Form.Item`. */
  value?: string;
  /**
   * Injected by `Form.Item`, composed with the caller's own `onChange` (the
   * cross-row duplicate-name revalidation below). Called identically for a
   * keystroke and for picking a suggestion, so both paths validate the same
   * way.
   */
  onChange?: (value: string) => void;
  /** Accessible name; visually hidden — `BAIFormItem` renders the visible one. */
  label: string;
  placeholder?: string;
  /**
   * Suggested names not used by OTHER rows. This row's own value is kept, so
   * re-opening an already-picked field still offers its current name back.
   */
  suggestions: ReadonlyArray<string>;
}

/**
 * Free-text env var name input with inline suggestions.
 *
 * PILOT-DECISION: `Typeahead`/`BaseTypeahead` commit a selected item and
 * clear their internal query on selection (`handleSelect` -> `setQuery('')`)
 * — they cannot hold a value the user is still free-typing, which is
 * mandatory here since env var names are arbitrary. `Selector` is likewise
 * closed to values outside its option list. Built directly on `usePopover`
 * (the same primitive `BaseTypeahead` composes) so the form's own controlled
 * string stays the single source of truth for both typing and picking.
 */
const EnvVarNameInput: React.FC<EnvVarNameInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  suggestions,
}) => {
  'use memo';
  const listboxId = useId();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [anchorWidth, setAnchorWidth] = useState<number | null>(null);
  const composingRef = useRef(false);
  const inputElRef = useRef<HTMLInputElement | null>(null);
  // Whether a pointer is down between mousedown and click — see `showList`.
  const pointerActiveRef = useRef(false);
  // Set around `selectMatch`'s refocus so the focus event it fires doesn't
  // instantly reopen the list that was just dismissed by picking from it
  // (BaseTypeahead guards the same sequence with its search generation
  // counter).
  const suppressFocusOpenRef = useRef(false);

  const popover = usePopover({
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    // The input keeps DOM focus and exposes its own combobox semantics, so a
    // dialog role around the list would misrepresent it (mirrors
    // BaseTypeahead's own `role: 'none'`).
    role: 'none',
  });

  // Substring (not prefix) match — the project's other free-text suggestion
  // source does the same (BAIPowerSearchAdapters `toSearchSource`), and it is
  // what lets "proxy" surface HTTP_PROXY / HTTPS_PROXY / NO_PROXY together.
  const matchesFor = (query: string) => {
    const q = query.trim().toLowerCase();
    return q
      ? suggestions.filter((name) => name.toLowerCase().includes(q))
      : suggestions;
  };
  const matches = matchesFor(value ?? '');

  const getItemId = (index: number) => `${listboxId}-option-${index}`;

  /**
   * `popover.show()`, deferred past the active click when one is in flight.
   *
   * A click that focuses the input fires `onFocus` (which shows the popover)
   * before the click event finishes bubbling. `usePopover`'s
   * `hasLightDismiss` then reads that SAME click as "outside" the freshly
   * shown popover — the input was never registered as its native invoker —
   * and closes what just opened. BaseTypeahead hits the identical footgun
   * and fixes it the same way (Typeahead/BaseTypeahead.tsx `showLayer`).
   */
  const showList = () => {
    if (pointerActiveRef.current) {
      document.addEventListener(
        'click',
        () =>
          requestAnimationFrame(() => popover.show({ skipAutoFocus: true })),
        { once: true },
      );
    } else {
      popover.show({ skipAutoFocus: true });
    }
  };

  const selectMatch = (name: string) => {
    onChange?.(name);
    setHighlightedIndex(-1);
    popover.hide();
    // focus() dispatches its focus event synchronously (when focus moved to
    // the clicked option), so bracketing it leaves no stale flag behind.
    suppressFocusOpenRef.current = true;
    inputElRef.current?.focus();
    suppressFocusOpenRef.current = false;
  };

  return (
    <div
      ref={(el) => {
        // Anchor + measure the WRAPPER, not the bare `<input>` `TextInput`'s
        // `ref` forwards to — that inner element excludes the visible
        // bordered box's own padding, so the popup came out narrower than
        // and offset from what the user actually sees as "the field".
        if (!el) return; // React 19 runs the returned cleanup instead
        popover.triggerRef(el);
        setAnchorWidth(el.getBoundingClientRect().width);
        const ro = new ResizeObserver((entries) => {
          const w = entries[0]?.contentRect.width;
          if (w != null) setAnchorWidth(w);
        });
        ro.observe(el);
        return () => {
          ro.disconnect();
          popover.triggerRef(null);
        };
      }}
      {...stylex.props(comboboxStyles.anchor)}
    >
      <TextInput
        ref={(el) => {
          inputElRef.current = el;
        }}
        type="text"
        value={value ?? ''}
        onChange={(next) => {
          onChange?.(next);
          setHighlightedIndex(-1);
          if (matchesFor(next).length > 0) {
            showList();
          } else {
            popover.hide();
          }
        }}
        label={label}
        isLabelHidden
        placeholder={placeholder}
        width="100%"
        role="combobox"
        aria-expanded={popover.isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          popover.isOpen &&
          highlightedIndex >= 0 &&
          highlightedIndex < matches.length
            ? getItemId(highlightedIndex)
            : undefined
        }
        onFocus={() => {
          if (suppressFocusOpenRef.current) return;
          if (matches.length > 0) showList();
        }}
        onPointerDown={() => {
          pointerActiveRef.current = true;
          document.addEventListener(
            'click',
            () => {
              pointerActiveRef.current = false;
            },
            { once: true },
          );
        }}
        onBlur={(e) => {
          if (!popover.isOpen) return;
          const next = e.relatedTarget as Node | null;
          const popoverEl = document.getElementById(popover.id);
          if (next && popoverEl?.contains(next)) return;
          popover.hide();
        }}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={() => {
          composingRef.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!popover.isOpen && matches.length > 0) {
              showList();
              setHighlightedIndex(0);
              return;
            }
            setHighlightedIndex((i) => (i + 1 >= matches.length ? 0 : i + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (popover.isOpen) {
              setHighlightedIndex((i) => (i <= 0 ? matches.length - 1 : i - 1));
            }
          } else if (e.key === 'Enter') {
            if (composingRef.current) return;
            if (
              popover.isOpen &&
              highlightedIndex >= 0 &&
              highlightedIndex < matches.length
            ) {
              e.preventDefault();
              selectMatch(matches[highlightedIndex]);
            }
          } else if (e.key === 'Escape' && popover.isOpen) {
            e.preventDefault();
            popover.hide();
          }
        }}
      />
      {matches.length > 0 &&
        popover.render(
          <div
            id={listboxId}
            role="listbox"
            {...stylex.props(comboboxStyles.dropdown)}
          >
            {matches.map((name, index) => (
              <div
                key={name}
                id={getItemId(index)}
                role="option"
                aria-selected={index === highlightedIndex}
                tabIndex={-1}
                onClick={() => selectMatch(name)}
                onMouseEnter={() => setHighlightedIndex(index)}
                {...stylex.props(
                  comboboxStyles.item,
                  index === highlightedIndex && comboboxStyles.itemHighlighted,
                )}
              >
                {name}
              </div>
            ))}
          </div>,
          {
            placement: 'below',
            alignment: 'start',
            offset: spacingVars['--spacing-1'],
            xstyle:
              anchorWidth != null
                ? comboboxStyles.width(anchorWidth)
                : comboboxStyles.matchTrigger,
          },
        )}
    </div>
  );
};

interface EnvVarFormListProps extends Omit<FormListProps, 'children'> {
  formItemProps?: FormItemProps;
  requiredEnvVars?: EnvVarConfig[];
  optionalEnvVars?: EnvVarConfig[];
}

export interface EnvVarFormListValue {
  variable: string;
  value: string;
}
const EnvVarFormList: React.FC<EnvVarFormListProps> = ({
  formItemProps,
  requiredEnvVars,
  optionalEnvVars,
  ...props
}) => {
  'use memo';
  const { rules: externalRules, ...restFormItemProps } = formItemProps || {};
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  // Typing into a row does NOT re-render `Form.List`'s render prop (the
  // store dispatches it as `source: 'internal'`, which `List.shouldUpdate`
  // ignores), so without this subscription each row's `suggestions` prop
  // goes stale the moment a sibling row's name is typed rather than picked.
  Form.useWatch(props.name, form);

  const allEnvVars = [
    ..._.filter(
      requiredEnvVars || [],
      (env): env is EnvVarConfig => env != null && !!env.variable,
    ),
    ..._.filter(
      optionalEnvVars || [],
      (env): env is EnvVarConfig => env != null && !!env.variable,
    ),
  ];

  const getPlaceholderForVariable = (variable: string) => {
    if (!variable || !allEnvVars.length)
      return t('session.launcher.EnvironmentVariableValue');
    const envVarConfig = _.find(
      allEnvVars,
      (env) => env && env.variable === variable,
    );
    return (
      envVarConfig?.placeholder ||
      t('session.launcher.EnvironmentVariableValue')
    );
  };

  /**
   * The still-unused suggested variable names for one row, in
   * `optionalEnvVars` then `requiredEnvVars` order — "unused" excludes every
   * OTHER row's current value but not this row's own, so re-focusing an
   * already-picked field still offers it back.
   */
  const getSuggestedVariableNames = (excludeRowName: number) => {
    const currentValues = form.getFieldValue(props.name) || [];
    const usedVariables = _.map(
      _.filter(
        currentValues,
        (item: EnvVarFormListValue, idx: number) =>
          item != null &&
          idx !== excludeRowName &&
          typeof item.variable === 'string' &&
          item.variable.trim() !== '',
      ),
      'variable',
    );

    return _.map(
      _.filter(
        [...(optionalEnvVars || []), ...(requiredEnvVars || [])],
        (env): env is EnvVarConfig =>
          env != null &&
          !!env.variable &&
          !_.includes(usedVariables, env.variable),
      ),
      (env) => env.variable,
    );
  };

  return (
    <Form.List
      {...props}
      rules={[
        ...(props.rules || []),
        // check if all required fields are filled
        {
          validator: async (
            _rule,
            envVars: EnvVarFormListValue[] | undefined,
          ) => {
            if (requiredEnvVars && requiredEnvVars.length > 0) {
              const missingRequiredVars = _.filter(
                requiredEnvVars,
                (requiredEnv) => {
                  return !_.some(
                    envVars,
                    (envVar) =>
                      envVar &&
                      envVar.variable === requiredEnv.variable &&
                      envVar.value.trim() !== '',
                  );
                },
              );
              if (missingRequiredVars.length > 0) {
                return Promise.reject(
                  t('session.launcher.MissingRequiredEnvironmentVariables', {
                    vars: _.map(missingRequiredVars, 'variable').join(', '),
                  }),
                );
              }
            }
          },
        },
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
        <BAIFlex direction="column" gap="xs" align="stretch">
          {fields.map(({ key, name, ...restField }) => (
            <BAIFlex key={key} direction="row" align="baseline" gap="xs">
              <Form.Item
                {...restField}
                style={{ marginBottom: 0, flex: 1 }}
                name={[name, 'variable']}
                rules={[
                  ...(externalRules || []),
                  {
                    required: true,
                    message: t('session.launcher.EnterEnvironmentVariable'),
                  },
                  {
                    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                    message: t(
                      'session.launcher.EnvironmentVariableNamePatternError',
                    ),
                  },
                  ({ getFieldValue }) => ({
                    validator(_rule, variableName) {
                      const variableNames = _.map(
                        getFieldValue(props.name),
                        (i) => i?.variable,
                      );

                      if (
                        !_.isEmpty(variableName) &&
                        variableNames.length > 0 &&
                        _.filter(variableNames, (i) => i === variableName)
                          .length > 1
                      ) {
                        return Promise.reject(
                          t(
                            'session.launcher.EnvironmentVariableDuplicateName',
                          ),
                          // EnvironmentVariableDuplicateName
                        );
                      } else {
                        return Promise.resolve();
                      }
                    },
                  }),
                ]}
                {...restFormItemProps}
              >
                <EnvVarNameInput
                  label={t('session.launcher.EnvironmentVariable')}
                  placeholder={t('session.launcher.EnvironmentVariable')}
                  suggestions={getSuggestedVariableNames(name)}
                  onChange={() => {
                    const fieldNames = fields.map((_field, fieldIndex) => [
                      props.name,
                      fieldIndex,
                      'variable',
                    ]);
                    form.validateFields(fieldNames);
                  }}
                />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'value']}
                style={{ marginBottom: 0, flex: 1 }}
                rules={[
                  {
                    required: true,
                    message: t(
                      'session.launcher.EnvironmentVariableValueRequired',
                    ),
                  },
                ]}
                validateTrigger={['onChange', 'onBlur']}
              >
                <EnvVarValueInput
                  form={form}
                  variableNamePath={[props.name, name, 'variable']}
                  getPlaceholderForVariable={getPlaceholderForVariable}
                  label={t('session.launcher.EnvironmentVariableValue')}
                />
              </Form.Item>
              <CircleMinus size="1em" onClick={() => remove(name)} />
            </BAIFlex>
          ))}
          <Form.Item noStyle>
            <BAIButton
              type="dashed"
              // PILOT-DECISION: the antd `InputRef.focus()` that jumped the
              // caret into the row just added is DROPPED. Astryx uses a
              // `handleRef` convention rather than `ref` + `InputRef`
              // (MAPPING §6.2) and `AstryxFormTextInput` exposes no ref
              // slot; the same call was already made for the select stack
              // (P26-8).
              onClick={() => {
                add();
              }}
              icon={<PlusIcon />}
              block
            >
              {t('session.launcher.AddEnvironmentVariable')}
            </BAIButton>
          </Form.Item>
          <Form.ErrorList errors={errors} />
        </BAIFlex>
      )}
    </Form.List>
  );
};

const sensitivePatterns = [
  /AUTH/i,
  /ACCESS/i,
  /SECRET/i,
  /_KEY/i,
  /PASSWORD/i,
  /PASSWD/i,
  /PWD/i,
  /TOKEN/i,
  /PRIVATE/i,
  /CREDENTIAL/i,
  /JWT/i,
  /KEYPAIR/i,
  /CERTIFICATE/i,
  /SSH/i,
  /ENCRYPT/i,
  /SIGNATURE/i,
  /SALT/i,
  /PIN/i,
  /PASSPHRASE/i,
  /OAUTH/i,
];

export function isSensitiveEnv(key: string) {
  return _.some(sensitivePatterns, (pattern) => pattern.test(key));
}

export function sanitizeSensitiveEnv(envs: EnvVarFormListValue[]) {
  return _.map(envs, (env) => {
    if (env && isSensitiveEnv(env.variable)) {
      return { ...env, value: '' };
    }
    return env;
  });
}

export default EnvVarFormList;
