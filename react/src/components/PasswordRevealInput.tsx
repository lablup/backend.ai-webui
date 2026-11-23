/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './PasswordRevealInput.css';
import { IconButton } from '@lablup/ui-common/IconButton';
import {
  colorVars,
  sizeVars,
  spacingVars,
} from '@lablup/ui-common/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { BAIFlex, BAITextInput, type BAITextInputProps } from 'backend.ai-ui';
import { Eye, EyeOff } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// TextInput has no end slot, so the toggle sits over the control's trailing edge.
const styles = stylex.create({
  control: {
    paddingInlineEnd: `calc(${sizeVars['--size-element-sm']} + ${spacingVars['--spacing-1']} * 2)`,
  },
  toggle: {
    position: 'absolute',
    insetInlineEnd: spacingVars['--spacing-1'],
    top: '50%',
    transform: 'translateY(-50%)',
    // Same tone as the endpoint line under the login form.
    color: colorVars['--color-text-secondary'],
  },
});

// Owned here: the type, the reserved trailing room, and the text-entry hints.
export type PasswordRevealInputProps = Omit<
  BAITextInputProps,
  | 'type'
  | 'controlXstyle'
  | 'controlClassName'
  | 'controlStyle'
  | 'hasClear'
  | 'isLoading'
  | 'hasSpellCheck'
  | 'hasAutoCorrect'
  | 'autoCapitalize'
>;

// Form.Item injects value/onChange here; they pass straight to the input.
const PasswordRevealInput: React.FC<PasswordRevealInputProps> = (props) => {
  'use memo';
  const { t } = useTranslation();
  const [isRevealed, setIsRevealed] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const toggleLabel = isRevealed
    ? t('login.HidePassword')
    : t('login.ShowPassword');

  // Hide again when the form submits: the field disables while the login
  // request runs, so the password never stays revealed through the loading.
  // Adjusting state when a prop changes, per react.dev's render-time reset —
  // not an effect (setState in an effect cascades renders).
  const [prevDisabled, setPrevDisabled] = useState(props.disabled);
  if (props.disabled !== prevDisabled) {
    setPrevDisabled(props.disabled);
    if (props.disabled) {
      setIsRevealed(false);
    }
  }

  return (
    <BAIFlex
      className="bai-password-reveal"
      align="center"
      // The login form submits on any Enter that bubbles up to it.
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === toggleRef.current) {
          e.stopPropagation();
        }
      }}
    >
      <BAITextInput
        {...props}
        type={isRevealed ? 'text' : 'password'}
        // Revealed text must not reach spellcheck services or keyboard autocorrect.
        hasSpellCheck={false}
        hasAutoCorrect={false}
        autoCapitalize="none"
        controlXstyle={styles.control}
      />
      <IconButton
        ref={toggleRef}
        xstyle={styles.toggle}
        variant="ghost"
        size="sm"
        icon={isRevealed ? <EyeOff size="1em" /> : <Eye size="1em" />}
        label={toggleLabel}
        isDisabled={props.disabled}
        // Keep focus (and the mobile keyboard) in the password field.
        onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
        onClick={() => setIsRevealed((v) => !v)}
      />
    </BAIFlex>
  );
};

export default PasswordRevealInput;
