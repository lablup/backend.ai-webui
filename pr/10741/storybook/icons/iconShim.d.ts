import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface CustomIconComponentProps {
    width: string | number;
    height: string | number;
    fill?: string;
    viewBox?: string;
    className?: string;
    color?: string;
    style?: React.CSSProperties;
}
export interface IconBaseProps extends React.HTMLProps<HTMLSpanElement> {
    spin?: boolean;
    rotate?: number;
}
export interface IconComponentProps extends IconBaseProps {
    viewBox?: string;
    component?: React.ComponentType<CustomIconComponentProps | React.SVGProps<SVGSVGElement>> | React.ForwardRefExoticComponent<CustomIconComponentProps>;
    ariaLabel?: React.AriaAttributes['aria-label'];
}
declare const Icon: React.ForwardRefExoticComponent<Omit<IconComponentProps, "ref"> & React.RefAttributes<HTMLSpanElement>>;
export default Icon;
