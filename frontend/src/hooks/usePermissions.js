import { useAuth } from '../context/AuthContext'
import { ROLE_HIERARCHY } from '../data/permissions'

/**
 * Returns true if the logged-in user has exactly the given role
 * (or a role higher in the hierarchy when allowHigher=true)
 */
export function useHasRole(role, allowHigher = true) {
  const { user } = useAuth()
  if (!user) return false
  if (allowHigher) {
    const userIdx = ROLE_HIERARCHY.indexOf(user.role)
    const reqIdx  = ROLE_HIERARCHY.indexOf(role)
    return userIdx >= reqIdx
  }
  return user.role === role
}

/**
 * Returns true if the logged-in user has a specific permission string
 */
export function useHasPermission(permission) {
  const { user } = useAuth()
  if (!user) return false
  return user.permissions?.includes(permission) ?? false
}

/**
 * Returns helper functions — use inside components that don't want hooks at top level
 */
export function usePermissions() {
  const { user } = useAuth()

  const hasRole = (role, allowHigher = true) => {
    if (!user) return false
    if (allowHigher) {
      const userIdx = ROLE_HIERARCHY.indexOf(user.role)
      const reqIdx  = ROLE_HIERARCHY.indexOf(role)
      return userIdx >= reqIdx
    }
    return user.role === role
  }

  const hasPermission = (permission) => {
    if (!user) return false
    return user.permissions?.includes(permission) ?? false
  }

  const canDo = (permissionOrRole) => hasPermission(permissionOrRole) || hasRole(permissionOrRole, false)

  return { hasRole, hasPermission, canDo, user }
}
