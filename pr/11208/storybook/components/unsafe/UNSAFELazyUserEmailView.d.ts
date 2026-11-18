import { UserScope } from '../../__generated__/UNSAFELazyUserEmailViewQuery.graphql';
import { BAITextProps } from '../BAIText';
export interface UNSAFELazyUserEmailViewProps extends Omit<BAITextProps, 'children'> {
    uuid?: string;
    /** The users this scope reaches are looked up, usually the current domain (ADR 0012). */
    scope: UserScope;
    fetchKey?: string;
}
/**
 * @warning This component should only be used as a last resort.
 * @internal
 */
declare const UNSAFELazyUserEmailView: React.FC<UNSAFELazyUserEmailViewProps>;
export default UNSAFELazyUserEmailView;
