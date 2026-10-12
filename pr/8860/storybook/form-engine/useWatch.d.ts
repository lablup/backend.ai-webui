import { FormInstance, StoreValue } from './interface';
import { NamePath, Store } from './namePath';
export interface WatchOptions<Form = FormInstance> {
    form?: Form;
    /** Read the raw store, including values whose field is unmounted. */
    preserve?: boolean;
}
declare function useWatch<Values = StoreValue>(dependencies: NamePath | ((values: Store) => Values), formOrOptions?: FormInstance | WatchOptions): Values;
export default useWatch;
/** The nearest `<Form>`'s instance, or `undefined` outside one. */
export declare function useFormInstance<Values = any>(): FormInstance<Values>;
