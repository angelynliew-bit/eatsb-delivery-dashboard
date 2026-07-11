export type UserRole = "administrator" | "management" | "operations" | "read-only";

export type RolePermissions = {
  canViewDashboard: boolean;
  canImport: boolean;
  canExport: boolean;
  canViewHistory: boolean;
  canViewMasterData: boolean;
  canManageUsers: boolean;
};

export const defaultRole: UserRole = "read-only";

export function normalizeRole(value: unknown): UserRole {
  const role = String(value ?? "").trim().toLowerCase();
  if (role === "admin" || role === "administrator") return "administrator";
  if (role === "management" || role === "manager") return "management";
  if (role === "operations" || role === "operator") return "operations";
  return "read-only";
}

export function permissionsForRole(role: UserRole): RolePermissions {
  if (role === "administrator") {
    return {
      canViewDashboard: true,
      canImport: true,
      canExport: true,
      canViewHistory: true,
      canViewMasterData: true,
      canManageUsers: true,
    };
  }

  if (role === "management") {
    return {
      canViewDashboard: true,
      canImport: false,
      canExport: true,
      canViewHistory: true,
      canViewMasterData: true,
      canManageUsers: false,
    };
  }

  if (role === "operations") {
    return {
      canViewDashboard: true,
      canImport: true,
      canExport: false,
      canViewHistory: true,
      canViewMasterData: false,
      canManageUsers: false,
    };
  }

  return {
    canViewDashboard: true,
    canImport: false,
    canExport: false,
    canViewHistory: false,
    canViewMasterData: false,
    canManageUsers: false,
  };
}
