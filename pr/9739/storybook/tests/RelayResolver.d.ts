import { MockResolvers } from 'relay-test-utils';
export interface RelayResolverProps {
    children?: React.ReactNode;
    mockResolvers?: MockResolvers;
}
declare const RelayResolver: ({ children, mockResolvers, }: RelayResolverProps) => import("react").JSX.Element;
export default RelayResolver;
