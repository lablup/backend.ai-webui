/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `Form.ErrorList` (to-astryx ticket 34).

 Two call sites (`EnvVarFormList`, `RoleFormModal`), both rendering the errors
 of a LIST-LEVEL rule — a validation that belongs to the collection rather
 than to any row, so there is no field item to hang it on. Reuses the same
 `data-bai-form-item-explain*` anchors as the item shell so the E2E selectors
 migrated in ticket 31 keep matching.
 */
import * as React from 'react';

export interface ErrorListProps {
  errors?: React.ReactNode[];
  warnings?: React.ReactNode[];
  className?: string;
  style?: React.CSSProperties;
}

const ErrorList: React.FC<ErrorListProps> = ({
  errors = [],
  warnings = [],
  className,
  style,
}) => {
  'use memo';
  if (!errors.length && !warnings.length) {
    return null;
  }
  return (
    <div
      className={className}
      data-bai-form-item-explain=""
      role="alert"
      style={{
        fontSize:
          'var(--bai-form-item-explain-font-size, var(--font-size-base, 14px))',
        lineHeight:
          'var(--bai-form-item-label-line-height, 1.5714285714285714)',
        ...style,
      }}
    >
      {errors.map((error, index) => (
        <div
          key={`e-${index}`}
          data-bai-form-item-explain-error=""
          style={{
            color:
              'var(--bai-form-item-error-color, var(--color-error, #ff4d4f))',
          }}
        >
          {error}
        </div>
      ))}
      {warnings.map((warning, index) => (
        <div
          key={`w-${index}`}
          data-bai-form-item-explain-warning=""
          style={{
            color:
              'var(--bai-form-item-warning-color, var(--color-warning, #faad14))',
          }}
        >
          {warning}
        </div>
      ))}
    </div>
  );
};

export default ErrorList;
