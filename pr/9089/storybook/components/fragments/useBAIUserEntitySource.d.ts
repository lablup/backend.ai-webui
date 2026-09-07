import { FilterEntitySource } from '../BAIPowerSearchAdapters';
/**
 * `FilterEntitySource` over `user_nodes`: searches users by email and resolves
 * user UUIDs back to emails for `BAIGraphQLPropertyFilter` / `BAIPropertyFilter`.
 */
export declare const useBAIUserEntitySource: () => FilterEntitySource;
export default useBAIUserEntitySource;
