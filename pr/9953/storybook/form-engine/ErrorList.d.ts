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
declare const ErrorList: React.FC<ErrorListProps>;
export default ErrorList;
