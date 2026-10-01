import { BAIUserSelectScope } from './BAIUserSelect';
/**
 * The `BAIUserSelect` scope an admin page hands over: every user for a
 * super-admin, the caller's own domain for a domain admin.
 */
declare const useAdminUserSelectScope: () => BAIUserSelectScope;
export default useAdminUserSelectScope;
