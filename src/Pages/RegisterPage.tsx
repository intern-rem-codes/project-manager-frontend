import { useState } from "react";
import { useNavigate } from "react-router";

export function RegisterPage() {
  const navigate = useNavigate();
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
            try {
              const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
              });
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registratie mislukt");
              }
              navigate("/login");
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
