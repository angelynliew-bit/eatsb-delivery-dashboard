"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage("Invalid email or password. Please check your details and try again.");
      setLoading(false);
      return;
    }

    const redirectTarget = searchParams.get("redirectedFrom") || "/";
    router.replace(redirectTarget.startsWith("/") ? redirectTarget : "/");
    router.refresh();
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-copy">
          <div>
            <p className="eyebrow">East Asian Traders</p>
            <h1>East Asian Traders Delivery System</h1>
            <p>
              Sign in with the account created or invited by your administrator.
              Registration is closed for public users.
            </p>
          </div>
        </div>

        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit}>
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
            <label>
              Password
              <input
                autoComplete="current-password"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <Link className="reset-link" href="/reset-password">
            Reset password
          </Link>

          {message && <div className="notice">{message}</div>}
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="login-shell"><div className="empty">Loading sign-in...</div></main>}>
      <LoginForm />
    </Suspense>
  );
}
