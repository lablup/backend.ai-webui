import { BAISelectProps } from '../BAISelect';
export interface BAIStorageProxySelectProps extends Omit<BAISelectProps, 'options'> {
}
declare const BAIStorageProxySelect: (selectProps: BAIStorageProxySelectProps) => import("react").JSX.Element;
export default BAIStorageProxySelect;
