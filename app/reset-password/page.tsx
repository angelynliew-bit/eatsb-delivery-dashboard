"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setEmail(data.session?.user.email ?? "");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
      setEmail(session?.user.email ?? "");
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setMessage(error ? error.message : "Password reset email sent. Check your inbox.");
    setLoading(false);
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? error.message : "Password updated. You can return to the dashboard.");
    setLoading(false);
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-copy">
          <div>
            <p className="eyebrow">East Asian Traders</p>
            <h1>Reset your password</h1>
            <p>
              Request a secure reset link, then use the link from your email to set a new password.
            </p>
          </div>
          <Link className="sample-link" href="/login">
            Back to login
          </Link>
        </div>

        <div className="login-card">
          {hasSession ? (
            <form className="login-form" onSubmit={handlePasswordUpdate}>
              <label>
                New password
                <input
                  autoComplete="new-password"
                  minLength={6}
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleResetRequest}>
              <label>
                Email address
                <input
                  autoComplete="email"
                  inputMode="email"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          {message && <div className="notice">{message}</div>}
        </div>
      </section>
    </main>
  );
}
