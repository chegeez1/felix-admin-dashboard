import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Shield, AlertCircle } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const login = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("admin_token", data.token);
        setLocation("/dashboard");
      },
      onError: () => {
        setError("Invalid admin secret. Try again.");
        setSecret("");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;
    setError("");
    login.mutate({ data: { secret } });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "hsl(237,32%,7%)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ background: "hsl(237,28%,12%)", border: "1px solid hsl(237,22%,18%)" }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "hsl(152,80%,30%)" }}
          >
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Portal</h1>
          <p className="text-sm mt-1" style={{ color: "hsl(220,15%,50%)" }}>
            Felix Data Solutions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="secret"
              className="block text-xs font-medium mb-2"
              style={{ color: "hsl(220,15%,60%)" }}
            >
              Admin Secret
            </label>
            <input
              id="secret"
              type="password"
              placeholder="Enter your secret key"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all"
              style={{
                background: "hsl(237,32%,9%)",
                border: "1px solid hsl(237,22%,22%)",
              }}
              onFocus={e => { e.target.style.borderColor = "hsl(152,80%,40%)"; }}
              onBlur={e => { e.target.style.borderColor = "hsl(237,22%,22%)"; }}
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg"
              style={{ background: "hsl(0,60%,15%)", border: "1px solid hsl(0,60%,25%)", color: "hsl(0,90%,70%)" }}
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!secret || login.isPending}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "hsl(152,80%,35%)" }}
            onMouseEnter={e => { if (!login.isPending) (e.currentTarget as HTMLButtonElement).style.background = "hsl(152,80%,40%)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "hsl(152,80%,35%)"; }}
          >
            {login.isPending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
