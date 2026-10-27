import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
type FormControlStoryVariant = 'basic' | 'error' | 'disabled';
interface FormControlStoryFrameProps {
    /** The `Form.Item` label, which also names the control. */
    label: string;
    initialValue?: unknown;
    /** `checked` for a checkbox or switch. */
    valuePropName?: string;
    variant?: FormControlStoryVariant;
    children: React.ReactElement;
}
/** The Basic, ErrorState and DisabledState stories of one form control. */
export declare const formControlStories: (frame: Omit<FormControlStoryFrameProps, "variant" | "children">, renderControl: () => React.ReactElement) => Record<"Default" | "ErrorState" | "DisabledState", {
    name: string;
    parameters: {
        docs: {
            description: {
                story: string;
            };
        };
    };
    render: () => React.ReactElement;
}>;
/** The component description every form-control story file shares. */
export declare const formControlDocsDescription: (baiName: string, uiCommonName: string, usage: string) => string;
export {};
