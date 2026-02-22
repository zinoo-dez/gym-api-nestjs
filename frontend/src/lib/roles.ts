const MANAGEMENT_ROLES = new Set(["admin", "owner"]);

export const hasManagementAccess = (role?: string | null): boolean => {
  if (!role) {
    return false;
  }

  return MANAGEMENT_ROLES.has(role.toLowerCase());
};
