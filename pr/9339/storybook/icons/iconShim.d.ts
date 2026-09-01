import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
