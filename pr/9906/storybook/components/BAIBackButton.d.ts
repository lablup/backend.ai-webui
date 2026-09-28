import { NavigateOptions, To } from 'react-router-dom';
export interface BAIBackButtonProps {
    to: To;
    options?: NavigateOptions;
}
declare const BAIBackButton: ({ to, options }: BAIBackButtonProps) => import("react").JSX.Element;
export default BAIBackButton;
