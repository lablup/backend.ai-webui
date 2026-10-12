import { BAISelectProps } from '../BAISelect';
export interface BAIResourceGroupSelectProps extends Omit<BAISelectProps, 'options'> {
}
declare const BAIResourceGroupSelect: ({ ...selectProps }: BAIResourceGroupSelectProps) => import("react").JSX.Element;
export default BAIResourceGroupSelect;
