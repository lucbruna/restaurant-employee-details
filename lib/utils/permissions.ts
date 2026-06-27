export type Permission = 
  | 'all'
  | 'manage_menu'
  | 'manage_staff'
  | 'view_reports'
  | 'pos_access'
  | 'process_payments'
  | 'create_orders'
  | 'kitchen_display';

export function hasPermission(userPermissions: string[], requiredPermission: Permission): boolean {
  if (userPermissions.includes('all')) return true;
  return userPermissions.includes(requiredPermission);
}
