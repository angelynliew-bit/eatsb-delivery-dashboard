import type { RolePermissions } from "@/lib/auth/roles";

export type NavigationItem = {
  label: string;
  path: string;
  section: string;
  icon: string;
  permission: keyof RolePermissions;
};

export const navigationItems: NavigationItem[] = [
  { label: "Overview", path: "/", section: "Overview", icon: "OV", permission: "canViewDashboard" },
  { label: "Channel Analysis", path: "/channel-analysis", section: "Channel Analysis", icon: "CH", permission: "canViewChannelAnalysis" },
  { label: "Chain Analysis", path: "/chain-analysis", section: "Chain Analysis", icon: "CN", permission: "canViewChainAnalysis" },
  { label: "Product Analysis", path: "/product-analysis", section: "Product Analysis", icon: "PR", permission: "canViewProductAnalysis" },
  { label: "Store Analysis", path: "/store-analysis", section: "Store Analysis", icon: "ST", permission: "canViewStoreAnalysis" },
  { label: "Delivery Records", path: "/delivery-records", section: "Delivery Records", icon: "DR", permission: "canViewDeliveryRecords" },
  { label: "Spreadsheet Import", path: "/spreadsheet-import", section: "Spreadsheet Import", icon: "IM", permission: "canImport" },
  { label: "Import History", path: "/import-history", section: "Import History", icon: "IH", permission: "canViewHistory" },
  { label: "Import Exceptions", path: "/import-exceptions", section: "Import Exceptions", icon: "EX", permission: "canViewExceptions" },
  { label: "Master Data", path: "/master-data", section: "Master Data", icon: "MD", permission: "canViewMasterData" },
  { label: "User Management", path: "/user-management", section: "User Management", icon: "UM", permission: "canManageUsers" },
  { label: "Settings", path: "/settings", section: "Settings", icon: "SE", permission: "canViewSettings" },
];

export function itemForPath(path: string) {
  return navigationItems.find((item) => item.path === path);
}
