export const ROLE = {
    ADMIN: "admin",
    OWNER: "owner",
    STAFF: "staff",
    TRAINER: "trainer",
    MEMBER: "member",
} as const;

export type AppRole = (typeof ROLE)[keyof typeof ROLE];

const MANAGEMENT_ROLES = new Set<AppRole>([ROLE.ADMIN, ROLE.OWNER]);
const OPERATIONS_ROLES = new Set<AppRole>([
    ROLE.ADMIN,
    ROLE.OWNER,
    ROLE.STAFF,
    ROLE.TRAINER,
]);

const normalizeRole = (role?: string | null): AppRole | null => {
    if (!role) {
        return null;
    }

    const normalized = role.trim().toLowerCase() as AppRole;
    return normalized.length > 0 ? normalized : null;
};

export const hasManagementAccess = (role?: string | null): boolean => {
    const normalizedRole = normalizeRole(role);
    return normalizedRole ? MANAGEMENT_ROLES.has(normalizedRole) : false;
};

export const hasOperationsAccess = (role?: string | null): boolean => {
    const normalizedRole = normalizeRole(role);
    return normalizedRole ? OPERATIONS_ROLES.has(normalizedRole) : false;
};

// Route-level role constants used by App.tsx and AdminLayout
export const PAYMENT_ROUTE_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.STAFF] as const;
export const INVENTORY_ROUTE_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.STAFF] as const;
export const CLASS_SCHEDULE_ROUTE_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.TRAINER] as const;
export const CLASS_ATTENDANCE_ROUTE_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.STAFF] as const;
export const CLASS_MANAGEMENT_ROUTE_ROLES = [ROLE.ADMIN, ROLE.OWNER, ROLE.STAFF, ROLE.TRAINER] as const;

export const hasAnyRole = (
    role: string | null | undefined,
    allowedRoles: readonly AppRole[],
): boolean => {
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
        return false;
    }

    return allowedRoles.includes(normalizedRole);
};
