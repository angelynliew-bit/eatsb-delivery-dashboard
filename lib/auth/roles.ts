export type UserRole = "administrator" | "management" | "operations" | "read_only";

export type RolePermissions = {
  canViewDashboard: boolean;
  canViewChannelAnalysis: boolean;
  canViewChainAnalysis: boolean;
  canViewProductAnalysis: boolean;
  canViewStoreAnalysis: boolean;
  canViewDeliveryRecords: boolean;
  canImport: boolean;
  canExport: boolean;
  canViewHistory: boolean;
  canViewExceptions: boolean;
  canViewMasterData: boolean;
  canManageUsers: boolean;
  canViewSettings: boolean;
};

export const defaultRole: UserRole = "read_only";

export function normalizeRole(value: unknown): UserRole {
  const role = String(value ?? "").trim().toLowerCase();
  if (role === "admin" || role === "administrator") return "administrator";
  if (role === "management" || role === "manager") return "management";
  if (role === "operations" || role === "operator") return "operations";
  if (role === "read-only" || role === "readonly" || role === "read_only") return "read_only";
  return "read_only";
}

export function permissionsForRole(role: UserRole): RolePermissions {
  if (role === "administrator") {
    return {
      canViewDashboard: true,
      canViewChannelAnalysis: true,
      canViewChainAnalysis: true,
      canViewProductAnalysis: true,
      canViewStoreAnalysis: true,
      canViewDeliveryRecords: true,
      canImport: true,
      canExport: true,
      canViewHistory: true,
      canViewExceptions: true,
      canViewMasterData: true,
      canManageUsers: true,
      canViewSettings: true,
    };
  }

  if (role === "management") {
    return {
      canViewDashboard: true,
      canViewChannelAnalysis: true,
      canViewChainAnalysis: true,
      canViewProductAnalysis: true,
      canViewStoreAnalysis: true,
      canViewDeliveryRecords: true,
      canImport: false,
      canExport: true,
      canViewHistory: true,
      canViewExceptions: false,
      canViewMasterData: false,
      canManageUsers: false,
      canViewSettings: true,
    };
  }

  if (role === "operations") {
    return {
      canViewDashboard: true,
      canViewChannelAnalysis: true,
      canViewChainAnalysis: true,
      canViewProductAnalysis: true,
      canViewStoreAnalysis: true,
      canViewDeliveryRecords: true,
      canImport: true,
      canExport: false,
      canViewHistory: true,
      canViewExceptions: true,
      canViewMasterData: false,
      canManageUsers: false,
      canViewSettings: false,
    };
  }

  return {
    canViewDashboard: true,
    canViewChannelAnalysis: true,
    canViewChainAnalysis: true,
    canViewProductAnalysis: true,
    canViewStoreAnalysis: true,
    canViewDeliveryRecords: true,
    canImport: false,
    canExport: false,
    canViewHistory: false,
    canViewExceptions: false,
    canViewMasterData: false,
    canManageUsers: false,
    canViewSettings: false,
  };
}

