import { useState } from "react";
import { useNavigate } from "react-router";
import { baseUrl } from "../utils/constants";
import { setAuth } from "../utils/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="title">Demo inloggegevens</h2>
        <div className="content">
          <p>Email: admin@example.com</p>
          <p>Wachtwoord: admin123</p>
        </div>
        <div className="content">
          <p>Email: klant@example.com</p>
          <p>Wachtwoord: klant123</p>
        </div>
      </div>

      <div className="login-card">
        <h1>Inloggen</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
              const response = await fetch(`${baseUrl}/auth/login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
              });
              if (!response.ok) {
                const errorData = (await response.json()) as { message?: unknown };
                throw new Error(
                  typeof errorData?.message === "string"
                    ? errorData.message
                    : "Inloggen mislukt",
                );
              }
              const payload = (await response.json()) as {
                user: { id: number; name: string; email: string; role: "USER" | "ADMIN" };
                token: string;
              };
              setAuth(payload.user, payload.token);
              navigate("/dashboard");
            } catch (error: unknown) {
              setError(
                error instanceof Error ? error.message : "Inloggen mislukt",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Wachtwoord:</label>
            <div className="password-input-wrapper">
              <input
                className="password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  {showPassword ? (
                    <path
                      d="M4 20 20 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  ) : null}
                </svg>
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>
          <p className="geenaccount" onClick={() => navigate("/register")}>
            Nog geen account? <a href="/register">Registreer hier</a>
          </p>
        </form>
      </div>
    </div>
  );
}
