import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultRole, normalizeRole, permissionsForRole, type UserRole } from "./roles";

export type AuthContext = {
  user: {
    id: string;
    email: string | undefined;
    name: string | undefined;
  };
  role: UserRole;
  permissions: ReturnType<typeof permissionsForRole>;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const metadataRole = normalizeRole(user.user_metadata?.role ?? user.app_metadata?.role ?? defaultRole);
  let role = metadataRole;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role) {
    role = normalizeRole(profile.role);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name,
    },
    role,
    permissions: permissionsForRole(role),
  };
}

export async function requireAuth() {
  const context = await getAuthContext();
  if (!context) {
    return {
      context: null,
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  return { context, response: null };
}

export async function requirePermission(permission: keyof AuthContext["permissions"]) {
  const { context, response } = await requireAuth();
  if (!context) return { context, response };

  if (!context.permissions[permission]) {
    return {
      context,
      response: NextResponse.json({ error: "You do not have permission to perform this action." }, { status: 403 }),
    };
  }

  return { context, response: null };
}
