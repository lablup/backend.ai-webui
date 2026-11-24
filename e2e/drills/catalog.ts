import { folderInvitationDrill } from './folder-invitation.drill';
import type { Drill } from './types';

/**
 * Every drill, in the order a related group should be read and run: RBAC
 * prerequisites before the mutation that needs them. Add a new drill here —
 * this array is the only listing, so `--list` and `--all` stay in order.
 */
export const DRILLS: Drill[] = [folderInvitationDrill].sort(
  (a, b) => a.order - b.order || a.title.localeCompare(b.title),
);
