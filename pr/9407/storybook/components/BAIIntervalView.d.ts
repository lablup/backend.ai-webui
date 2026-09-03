import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
type RenderProp<T> = (data: T) => React.ReactNode;
declare const BAIIntervalView: <T>({ callback, render, delay, triggerKey, }: {
    callback: () => T;
    render?: RenderProp<T>;
    delay: number | null;
    triggerKey?: string;
}) => string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | T | null | undefined;
export default BAIIntervalView;
