export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  department?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export type UserRole = 'admin' | 'manager' | 'agent' | 'assistant';

export type Permission = 
  | 'documents.view.all'
  | 'documents.view.own'
  | 'documents.create'
  | 'documents.edit.all'
  | 'documents.edit.own'
  | 'documents.delete.all'
  | 'documents.delete.own'
  | 'documents.archive.access'
  | 'templates.manage'
  | 'users.manage'
  | 'reports.view'
  | 'settings.manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'documents.view.all',
    'documents.create',
    'documents.edit.all',
    'documents.delete.all',
    'documents.archive.access',
    'templates.manage',
    'users.manage',
    'reports.view',
    'settings.manage'
  ],
  manager: [
    'documents.view.all',
    'documents.create',
    'documents.edit.all',
    'documents.delete.own',
    'documents.archive.access',
    'templates.manage',
    'reports.view'
  ],
  agent: [
    'documents.view.own',
    'documents.create',
    'documents.edit.own',
    'documents.delete.own',
    'documents.archive.access'
  ],
  assistant: [
    'documents.view.own',
    'documents.create',
    'documents.edit.own'
  ]
};

export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

export const hasPermission = (user: User, permission: Permission): boolean => {
  return user.permissions.includes(permission);
};

export const canViewDocument = (user: User, documentOwnerId: string): boolean => {
  return hasPermission(user, 'documents.view.all') || 
         (hasPermission(user, 'documents.view.own') && user.id === documentOwnerId);
};

export const canEditDocument = (user: User, documentOwnerId: string): boolean => {
  return hasPermission(user, 'documents.edit.all') || 
         (hasPermission(user, 'documents.edit.own') && user.id === documentOwnerId);
};

export const canDeleteDocument = (user: User, documentOwnerId: string): boolean => {
  return hasPermission(user, 'documents.delete.all') || 
         (hasPermission(user, 'documents.delete.own') && user.id === documentOwnerId);
};