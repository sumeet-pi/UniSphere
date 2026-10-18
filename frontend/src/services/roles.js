/**
 * Centralized Role Normalization Utilities for UniSphere
 * Canonical Frontend Roles:
 * - 'General Student'
 * - 'Club Coordinator'
 * - 'Admin'
 */

export const ROLES = {
  STUDENT: 'General Student',
  COORDINATOR: 'Club Coordinator',
  ADMIN: 'Admin',
};

/**
 * Normalizes any backend or legacy role string into a canonical frontend role.
 * Handles variations in case, underscores, and legacy values ('organizer', 'faculty', 'teacher', 'club_student', 'student').
 * Returns null if the role is unrecognized or falsy.
 */
export function normalizeRole(rawRole) {
  if (!rawRole || typeof rawRole !== 'string') return null;

  const normalized = rawRole.trim().toLowerCase().replace(/[\s-]+/g, '_');

  switch (normalized) {
    case 'student':
    case 'general_student':
      return ROLES.STUDENT;

    case 'organizer':
    case 'faculty':
    case 'coordinator':
    case 'club_coordinator':
    case 'teacher':
    case 'club_student':
      return ROLES.COORDINATOR;

    case 'admin':
    case 'administrator':
      return ROLES.ADMIN;

    default:
      return null;
  }
}

/**
 * Returns true if the user's role is a Club Coordinator or Admin.
 */
export function isCoordinatorRole(rawRole) {
  const role = normalizeRole(rawRole);
  return role === ROLES.COORDINATOR || role === ROLES.ADMIN;
}

/**
 * Returns true if the user's role is General Student.
 */
export function isStudentRole(rawRole) {
  const role = normalizeRole(rawRole);
  return role === ROLES.STUDENT;
}

/**
 * Determines the target dashboard route for a given user or role.
 */
export function getDashboardPathForRole(rawRole) {
  const role = normalizeRole(rawRole);
  if (role === ROLES.ADMIN) {
    return '/admin';
  }
  if (isCoordinatorRole(rawRole)) {
    return '/club-dashboard';
  }
  if (isStudentRole(rawRole)) {
    return '/student';
  }
  return null;
}
