import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { createClient, fetchClient, updateClient } from "../api/clients.api";
import type { Client } from "../Interfaces/Client";
import { formatDateOnly } from "../api/helpers";

export default function ClientEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const clientId = params.id;

  const [client, setClient] = useState<Client | undefined>(undefined);
  const [pageError, setPageError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);

  useEffect(() => {
    fetchClient(clientId || "")
      .then((client) => {
        if (!client) {
          setIsCreateMode(true);
          return;
        }
        setClient(client);
        setFirstName(client.firstName);
        setLastName(client.lastName);
        setEmail(client.email);
        setPhone(client.phone ?? "");
        setDateOfBirth(formatDateOnly(client.dateOfBirth));
        setStreet(client.street ?? "");
        setCity(client.city ?? "");
        setPostalCode(client.postalCode ?? "");
        setCountry(client.country ?? "");
      })
      .catch((client) =>
        setPageError(
          client instanceof Error ? client.message : "Laden mislukt",
        ),
      );
  }, [clientId, isCreateMode]);

  console.log(isCreateMode);
  async function handleSave() {
    try {
      if (isCreateMode) {
        await createClient({
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
      } else {
        if (!clientId) return;
        await updateClient(clientId, {
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
      }
      navigate(`/client/${clientId}`);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Project bijwerken mislukt",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (pageError) return <div>{pageError}</div>;
  if (!isCreateMode && !client) return <div>Laden...</div>;

  return (
    <div className="client-edit-page">
      <div className="client-edit-header">
        <h1>{isCreateMode ? "Nieuwe klant" : "Klant bewerken"}</h1>
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
              isCreateMode
                ? navigate("/dashboard")
                : navigate(`/client/${clientId}`)
            }
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
