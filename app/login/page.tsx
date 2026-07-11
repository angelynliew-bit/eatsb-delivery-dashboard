"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setSessionEmail(data.session?.user.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const result =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo:
                typeof window === "undefined" ? undefined : `${window.location.origin}/login`,
            },
          });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "sign-up") {
      setMessage("Account created. Check your email if confirmation is enabled.");
    } else {
      setMessage("Signed in successfully.");
    }

    setLoading(false);
  }

  async function handleSignOut() {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signOut();
    setMessage(error ? error.message : "Signed out.");
    setLoading(false);
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-copy">
          <p className="eyebrow">East Asian Traders</p>
          <h1>Sign in to the delivery dashboard</h1>
          <p>
            The demo dashboard stays open for now. This page prepares the app for the lock-down
            sprint with Supabase email and password authentication.
          </p>
          <Link className="sample-link" href="/">
            Back to dashboard
          </Link>
        </div>

        <div className="login-card">
          <div className="auth-toggle" aria-label="Auth mode">
            <button
              type="button"
              className={mode === "sign-in" ? "active" : ""}
              onClick={() => setMode("sign-in")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "sign-up" ? "active" : ""}
              onClick={() => setMode("sign-up")}
            >
              Sign up
            </button>
          </div>

          {sessionEmail && (
            <div className="notice">
              Signed in as <strong>{sessionEmail}</strong>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Email
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
            <label>
              Password
              <input
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                minLength={6}
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>

          {sessionEmail && (
            <button className="secondary-button" type="button" disabled={loading} onClick={handleSignOut}>
              Sign out
            </button>
          )}

          {message && <div className="notice">{message}</div>}
        </div>
      </section>
    </main>
  );
}
