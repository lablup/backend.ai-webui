import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
type RenderProp<T> = (data: T) => React.ReactNode;
declare const BAIIntervalView: <T>({ callback, render, delay, triggerKey, }: {
    callback: () => T;
    render?: RenderProp<T>;
    delay: number | null;
    triggerKey?: string;
}) => string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | T | null | undefined;
export default BAIIntervalView;
