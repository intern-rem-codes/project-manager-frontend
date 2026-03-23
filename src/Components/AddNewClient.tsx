import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { createClient } from "../api/clients.api";

export default function AddNewClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get("returnTo");

  const [pageError, setPageError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  async function handleSave() {
    setIsSaving(true);
    if (!email.includes("@")) {
      setEmailError("Een e-mailadres moet een @ bevatten.");
      setIsSaving(false);
      return;
    }
    setEmailError("");
    try {
      const newClient = await createClient({
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        street,
        city,
        postalCode,
        country,
      });
      if (newClient && newClient.id) {
        if (returnTo) {
          const url = new URL(returnTo, window.location.origin);
          url.searchParams.set("clientId", String(newClient.id));
          navigate(`${url.pathname}${url.search}`);
        } else {
          navigate(`/client/${newClient.id}`);
        }
      } else {
        navigate(`/dashboard`);
      }
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Aanmaken mislukt",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (pageError) return <div>{pageError}</div>;

  return (
    <div className="client-edit-page">
      <div className="client-edit-header">
        <h1>Nieuwe klant</h1>
        <p>Vul de gegevens in en sla op.</p>
      </div>

      <div className="client-edit-card">
        <div className="form-group">
          <label>Voornaam:</label>
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Achternaam:</label>
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {emailError && <span className="error">{emailError}</span>}
        </div>

        <div className="form-group">
          <label>Telefoon:</label>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Geboortedatum:</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Straat:</label>
          <input
            type="text"
            value={street}
            onChange={(event) => setStreet(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Plaats:</label>
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Postcode:</label>
          <input
            type="text"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Land:</label>
          <input
            type="text"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          />
        </div>

        <div className="client-edit-actions">
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Bezig..." : "Opslaan"}
          </button>
          <button
            type="button"
            onClick={() =>
                navigate("/dashboard")
            }
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
