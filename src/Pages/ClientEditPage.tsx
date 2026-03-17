import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { createClient, fetchClient, updateClient } from "../api/client.api";
import type { Client } from "../Interfaces/Client";

function parseDateOnly(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateOnly(value?: Date): string {
  if (!value) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ClientEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const clientId = params.id;
  const isCreateMode = useMemo(() => !clientId, [clientId]);

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

  useEffect(() => {
    if (isCreateMode) return;
    if (!clientId) return;

    setPageError("");
    fetchClient(clientId)
      .then((c) => {
        setClient(c);
        setFirstName(c.firstName);
        setLastName(c.lastName);
        setEmail(c.email);
        setPhone(c.phone ?? "");
        setDateOfBirth(formatDateOnly(c.dateOfBirth));
        setStreet(c.street ?? "");
        setCity(c.city ?? "");
        setPostalCode(c.postalCode ?? "");
        setCountry(c.country ?? "");
      })
      .catch((e) =>
        setPageError(e instanceof Error ? e.message : "Laden mislukt"),
      );
  }, [clientId, isCreateMode]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError("");
    setIsSaving(true);

    const input: Omit<Client, "id"> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() ? phone.trim() : undefined,
      dateOfBirth: dateOfBirth ? parseDateOnly(dateOfBirth) : undefined,
      street: street.trim() ? street.trim() : undefined,
      city: city.trim() ? city.trim() : undefined,
      postalCode: postalCode.trim() ? postalCode.trim() : undefined,
      country: country.trim() ? country.trim() : undefined,
    };

    try {
      if (isCreateMode) {
        const created = await createClient(input);
        navigate(`/client/${created.id}`);
      } else if (clientId) {
        await updateClient(clientId, input);
        navigate(`/client/${clientId}`);
      }
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Klant opslaan mislukt",
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

      <form className="client-edit-card" onSubmit={handleSave}>
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
          <button type="submit" disabled={isSaving}>
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
      </form>
    </div>
  );
}
