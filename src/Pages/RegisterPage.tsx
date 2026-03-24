import { useState } from "react";
import { useNavigate } from "react-router";
import { baseUrl } from "../utils/constants";
import { setAuth } from "../utils/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Account aanmaken</h1>
        <p className="aanmaken-description">
          Vul uw gegevens in om te registreren
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            if (password.length < 8) {
              setError("Wachtwoord moet minstens 8 tekens zijn.");
              setLoading(false);
              return;
            }
            try {
              const response = await fetch(`${baseUrl}/auth/register`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: naam, email, password }),
              });
              if (!response.ok) {
                const errorData = (await response.json()) as { message?: unknown };
                throw new Error(
                  typeof errorData?.message === "string"
                    ? errorData.message
                    : "Registratie mislukt",
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
                error instanceof Error ? error.message : "Registratie mislukt",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="form-group">
            <label>Naam:</label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              required
            />
          </div>
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
                autoComplete="new-password"
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
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Bezig met registreren..." : "Registreren"}
          </button>
          <p className="geenaccount">
            Heb je al een account? <a href="/login">Log hier in</a>
          </p>
        </form>
      </div>
    </div>
  );
}
