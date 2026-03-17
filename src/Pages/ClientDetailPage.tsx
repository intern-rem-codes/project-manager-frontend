import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchClient, formatClientDateOfBirth } from "../api/client.api";
import type { Client } from "../Interfaces/Client";

export default function ClientDetailPage() {
  const navigate = useNavigate();
  const { id: clientId } = useParams();
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!clientId) return;
    fetchClient(clientId)
      .then((data) => {
        setError("");
        setClient(data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Laden mislukt"));
  }, [clientId]);

  if (!clientId) return <div>Klant id ontbreekt.</div>;
  if (error) return <div>{error}</div>;
  if (!client) return <div>Laden...</div>;

  const dateOfBirth = formatClientDateOfBirth(client.dateOfBirth) || "-";
  const phone = client.phone?.trim() ? client.phone : "-";
  const street = client.street?.trim() ? client.street : "-";
  const cityLine =
    client.postalCode || client.city
      ? `${client.postalCode ?? ""} ${client.city ?? ""}`.trim()
      : "-";
  const country = client.country?.trim() ? client.country : "-";

  return (
    <div className="client-detail-page">
      <h1>Klantgegevens</h1>

      <div className="client-detail-card">
        <p>
          <strong>Naam:</strong> {client.firstName} {client.lastName}
        </p>
        <p>
          <strong>Email:</strong> {client.email}
        </p>
        <p>
          <strong>Telefoon:</strong> {phone}
        </p>
        <p>
          <strong>Geboortedatum:</strong> {dateOfBirth}
        </p>
        <p>
          <strong>Straat:</strong> {street}
        </p>
        <p>
          <strong>Postcode / Plaats:</strong> {cityLine}
        </p>
        <p>
          <strong>Land:</strong> {country}
        </p>

        <button onClick={() => navigate(`/client/${client.id}/edit`)}>
          Klant bewerken
        </button>
      </div>

      <button onClick={() => navigate("/dashboard")}>
        Terug naar dashboard
      </button>
    </div>
  );
}
