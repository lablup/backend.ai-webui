import { BAITextProps } from '../BAIText';
export interface UNSAFELazyUserEmailViewProps extends Omit<BAITextProps, 'children'> {
    uuid?: string;
    fetchKey?: string;
}
/**
 * @warning This component should only be used as a last resort.
 * @internal
 */
declare const UNSAFELazyUserEmailView: React.FC<UNSAFELazyUserEmailViewProps>;
export default UNSAFELazyUserEmailView;
