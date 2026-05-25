export const PERMISSIONS = {
  VIEW_DASHBOARD:        'view_dashboard',
  MANAGE_USERS:          'manage_users',
  ASSIGN_ROLES:          'assign_roles',
  MANAGE_RESIDENTS:      'manage_residents',
  RECORD_EVENTS:         'record_events',
  APPROVE_CERTIFICATES:  'approve_certificates',
  REQUEST_CERTIFICATE:   'request_certificate',
  VIEW_OWN_DATA:         'view_own_data',
  SYSTEM_CONTROL:        'system_control',
  REGISTER_MARRIAGE:     'register_marriage',
  REGISTER_DIVORCE:      'register_divorce',
  APPROVE_MARRIAGE:      'approve_marriage',
  APPROVE_DIVORCE:       'approve_divorce',
}

export const ROLE_PERMISSIONS = {
  superadmin: Object.values(PERMISSIONS),

  admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.MANAGE_RESIDENTS,
    PERMISSIONS.APPROVE_CERTIFICATES,
    PERMISSIONS.APPROVE_MARRIAGE,
    PERMISSIONS.APPROVE_DIVORCE,
  ],

  clerk: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_RESIDENTS,
    PERMISSIONS.RECORD_EVENTS,
    PERMISSIONS.REGISTER_MARRIAGE,
    PERMISSIONS.REGISTER_DIVORCE,
  ],

  resident: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.REQUEST_CERTIFICATE,
    PERMISSIONS.VIEW_OWN_DATA,
  ],
}

export const ROLE_HIERARCHY = ['resident', 'clerk', 'admin', 'superadmin']

export const ROLE_LABELS = {
  resident:   'Resident',
  clerk:      'Clerk',
  admin:      'Admin',
  superadmin: 'Super Admin',
}

export function buildUserWithPermissions(rawUser) {
  const basePerms = ROLE_PERMISSIONS[rawUser.role] ?? []
  const extra = rawUser.extraPermissions ?? []
  const permissions = [...new Set([...basePerms, ...extra])]
  return { ...rawUser, permissions }
}

export const canPromoteTo = (actorRole, newRole) => {
  if (actorRole === 'superadmin') return true
  if (actorRole === 'admin') return newRole !== 'superadmin'
  return false
}
