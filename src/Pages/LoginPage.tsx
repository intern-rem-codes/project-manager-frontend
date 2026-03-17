import { useState } from "react";
import { useNavigate } from "react-router";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLogin() {
    localStorage.setItem("username", email);
    localStorage.setItem("password", password);
    navigate("/dashboard"); // Navigate to the dashboard page after successful login

    // Determine the user role based on the email or any other criteria
    const userRole = email === "admin@example.com" ? "admin" : "client"; // Replace this with your actual user role determination logic

    // Set the user role in the local storage
    localStorage.setItem("userRole", userRole);
  }

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
        <h1>Login</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
              const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
              });
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
              }
              navigate("/dashboard");
            } catch (error: unknown) {
              setError(error instanceof Error ? error.message : "Login failed");
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
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading} onClick={handleLogin}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="geenaccount" onClick={() => navigate("/register")}>
            Nog geen account? <a href="/register">Registreer hier</a>
          </p>
        </form>
      </div>
    </div>
  );
}
