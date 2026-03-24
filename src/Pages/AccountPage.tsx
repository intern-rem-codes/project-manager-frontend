import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { baseUrl } from "../utils/constants";
import { authHeaders, clearAuth, readStoredUser } from "../utils/auth";

type UserProfile = {
  id: number;
  name: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
};

export default function AccountPage() {
  const navigate = useNavigate();
  const storedUser = useMemo(() => readStoredUser(), []);

  const [name, setName] = useState(storedUser?.name ?? "");
  const [email, setEmail] = useState(storedUser?.email ?? "");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!storedUser) navigate("/login");
  }, [navigate, storedUser]);

  useEffect(() => {
    if (!storedUser) return;
    fetch(`${baseUrl}/users/${storedUser.id}`, { headers: { ...authHeaders() } })
      .then(async (r) => {
        const data = (await r.json()) as unknown;
        if (!r.ok) {
          const message =
            typeof (data as { message?: unknown } | undefined)?.message ===
            "string"
              ? (data as { message: string }).message
              : "Laden mislukt";
          throw new Error(message);
        }
        return data as UserProfile;
      })
      .then((profile) => {
        setName(profile.name ?? "");
        setEmail(profile.email ?? "");
        setLastName(profile.lastName ?? "");
        setPhone(profile.phone ?? "");
        setStreet(profile.street ?? "");
        setCity(profile.city ?? "");
        setPostalCode(profile.postalCode ?? "");
        setCountry(profile.country ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Laden mislukt"));
  }, [storedUser]);

  async function saveProfile() {
    if (!storedUser) return;
    if (!name.trim()) {
      setError("Naam is verplicht.");
      return;
    }
    if (!lastName.trim()) {
      setError("Achternaam is verplicht.");
      return;
    }
    if (!email.trim()) {
      setError("E-mailadres is verplicht.");
      return;
    }
    if (!email.includes("@")) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }
    if (!street.trim()) {
      setError("Straat is verplicht.");
      return;
    }
    if (!city.trim()) {
      setError("Plaats is verplicht.");
      return;
    }
    if (!postalCode.trim()) {
      setError("Postcode is verplicht.");
      return;
    }
    if (!country.trim()) {
      setError("Land is verplicht.");
      return;
    }
    setIsSavingProfile(true);
    setError("");
    setProfileMessage("");
    try {
      const response = await fetch(`${baseUrl}/users/${storedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          name,
          lastName,
          email,
          phone,
          street,
          city,
          postalCode,
          country,
        }),
      });
      const data = (await response.json()) as unknown;
      if (!response.ok) {
        const message =
          typeof (data as { message?: unknown } | undefined)?.message === "string"
            ? (data as { message: string }).message
            : "Opslaan mislukt";
        throw new Error(message);
      }

      const updated = data as UserProfile;
      localStorage.setItem("user", JSON.stringify(updated));
      setProfileMessage("Accountgegevens opgeslagen.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Opslaan mislukt");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function savePassword() {
    if (!storedUser) return;
    if (!currentPassword) {
      setError("Huidig wachtwoord is verplicht.");
      return;
    }
    if (!newPassword) {
      setError("Nieuw wachtwoord is verplicht.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Wachtwoord moet minstens 8 tekens zijn.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }
    setIsSavingPassword(true);
    setError("");
    setPasswordMessage("");
    try {
      const response = await fetch(`${baseUrl}/users/${storedUser.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json()) as unknown;
      if (!response.ok) {
        const message =
          typeof (data as { message?: unknown } | undefined)?.message === "string"
            ? (data as { message: string }).message
            : "Wachtwoord wijzigen mislukt";
        throw new Error(message);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordMessage("Wachtwoord bijgewerkt.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wachtwoord wijzigen mislukt");
    } finally {
      setIsSavingPassword(false);
    }
  }

  function logout() {
    clearAuth();
    navigate("/login");
  }

  if (!storedUser) return null;

  return (
    <div className="account-page">
      <div className="account-card">
        <div className="account-header">
          <div>
            <h1>Account</h1>
            <p>Beheer je gegevens en wachtwoord.</p>
          </div>
          <div className="account-actions">
            <button type="button" className="button-secondary" onClick={logout}>
              Uitloggen
            </button>
            <button type="button" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <h2>Gegevens</h2>
        <div className="form-group">
          <label>Naam:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Achternaam:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>E-mailadres:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Telefoon (optioneel):</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Straat:</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Plaats:</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Postcode:</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Land:</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
        {profileMessage ? <p className="success">{profileMessage}</p> : null}
        <button type="button" onClick={saveProfile} disabled={isSavingProfile}>
          {isSavingProfile ? "Opslaan..." : "Opslaan"}
        </button>

        <div className="account-divider" />

        <h2>Wachtwoord</h2>
        <div className="form-group">
          <label>Huidig wachtwoord:</label>
          <div className="password-input-wrapper">
            <input
              className="password-input"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowCurrentPassword((v) => !v)}
              aria-label={
                showCurrentPassword ? "Hide password" : "Show password"
              }
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
                {showCurrentPassword ? (
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

        <div className="form-group">
          <label>Nieuw wachtwoord:</label>
          <div className="password-input-wrapper">
            <input
              className="password-input"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword((v) => !v)}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
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
                {showNewPassword ? (
                  <path
                    d="M4 20 20 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                ) : null}
              </svg>
            </button>
          </div>
          <p className="help-text">Minstens 8 tekens.</p>
        </div>

        <div className="form-group">
          <label>Nieuw wachtwoord herhalen:</label>
          <div className="password-input-wrapper">
            <input
              className="password-input"
              type={showConfirmNewPassword ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmNewPassword((v) => !v)}
              aria-label={
                showConfirmNewPassword ? "Hide password" : "Show password"
              }
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
                {showConfirmNewPassword ? (
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

        {passwordMessage ? <p className="success">{passwordMessage}</p> : null}
        <button type="button" onClick={savePassword} disabled={isSavingPassword}>
          {isSavingPassword ? "Bijwerken..." : "Wachtwoord bijwerken"}
        </button>
      </div>
    </div>
  );
}
