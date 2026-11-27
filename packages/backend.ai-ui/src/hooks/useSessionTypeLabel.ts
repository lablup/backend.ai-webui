import { getSessionTypeLabel } from '../helper/sessionTypeLabel';
import { useBAIi18n } from './useBAIi18n';

/** Session type labels as BUI's session tokens show them (SYSTEM reads "Upload"). */
const useSessionTypeLabel = () => {
  const { t } = useBAIi18n();
  return (type: string): string => getSessionTypeLabel(t, type.toUpperCase());
};

export default useSessionTypeLabel;
