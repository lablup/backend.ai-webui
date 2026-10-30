import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
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
