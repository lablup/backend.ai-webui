/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FormInstance } from '../../../form-engine';
import {
  assertRequiredInputs,
  getIn,
  isSameFieldValue,
  LauncherInvariantError,
  pathKey,
  setIn,
  transition,
  type AppliedPatch,
  type ComposedModel,
  type LauncherEvent,
  type LauncherInputs,
  type LauncherState,
  type Loadable,
  type LauncherValues,
  type ProvenanceMap,
} from '../model';
import { useBAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

const readModelValues = (form: FormInstance, model: ComposedModel) => {
  const all: LauncherValues = form.getFieldsValue(true);
  return model.fields.reduce<LauncherValues>(
    (values, path) => setIn(values, path, getIn(all, path)),
    {},
  );
};

const replay = (form: FormInstance, patch: AppliedPatch) => {
  if (patch.write.method === 'setFieldValue') {
    form.setFieldValue(patch.path, patch.value);
  } else if (patch.write.method === 'setFieldsValue') {
    form.setFieldsValue(setIn({}, patch.path, patch.value));
  }
  const { validateAfter, validateOptions } = patch.write;
  if (validateAfter) {
    (validateOptions
      ? form.validateFields(validateAfter, validateOptions)
      : form.validateFields(validateAfter)
    ).catch(() => {});
  }
};

/**
 * Binds a composed launcher model to a Form store (ADR 0013): reads the
 * model's fields from the form, runs `transition`, and replays the writes.
 */
export const useFormBoundSlice = (
  form: FormInstance,
  model: ComposedModel,
  inputs: LauncherInputs,
) => {
  'use memo';
  const { logger } = useBAILogger();
  const provenanceRef = useRef<ProvenanceMap>({});
  const [state, setState] = useState<LauncherState>(() => {
    assertRequiredInputs(model, inputs);
    return { values: readModelValues(form, model), provenance: {} };
  });

  const run = (event: LauncherEvent, inputs: LauncherInputs) => {
    const current: LauncherState = {
      values: readModelValues(form, model),
      provenance: provenanceRef.current,
    };
    let result: ReturnType<typeof transition>;
    try {
      result = transition(model, current, event, inputs);
    } catch (error) {
      if (!(error instanceof LauncherInvariantError) || import.meta.env.DEV) {
        throw error;
      }
      logger.error('[useFormBoundSlice]', error.message, event);
      result = { state: error.state, patches: error.patches };
    }
    for (const patch of result.patches) replay(form, patch);
    // Inputs rebuilt every render arrive every render; a no-op must not re-render.
    const changed =
      result.patches.length > 0 ||
      !_.isEqual(result.state.provenance, provenanceRef.current);
    provenanceRef.current = result.state.provenance;
    if (changed) setState(result.state);

    if (import.meta.env.DEV) {
      const formValues = readModelValues(form, model);
      const diverged = model.fields.filter(
        (path) =>
          !isSameFieldValue(
            path,
            getIn(formValues, path),
            getIn(result.state.values, path),
          ),
      );
      if (diverged.length > 0) {
        logger.warn('[useFormBoundSlice] model and form diverged', {
          event,
          diverged: diverged.map(pathKey),
        });
      }
    }
  };

  // An input arrives when it turns ready or its ready value is replaced
  // (a refetch); a fresh `Loadable` wrapping the same value is churn.
  const previousRef = useRef<Readonly<Record<string, Loadable<unknown>>>>({});
  // `inputs` is passed in: read from the effect event's closure it lagged a
  // render under the compiler, and R-05 missed an image change.
  const onInputsChange = useEffectEvent((inputs: LauncherInputs) => {
    const previous = previousRef.current;
    previousRef.current = inputs;
    const arrived = Object.keys(inputs).filter((key) => {
      const now = inputs[key];
      const before = previous[key];
      return (
        now.status === 'ready' &&
        (before?.status !== 'ready' || before.value !== now.value)
      );
    });
    if (arrived.length > 0) run({ type: 'dataArrived', keys: arrived }, inputs);
  });
  useEffect(() => {
    onInputsChange(inputs);
  }, [inputs]);

  const dispatch = (event: LauncherEvent) => run(event, inputs);

  return { dispatch, state };
};
