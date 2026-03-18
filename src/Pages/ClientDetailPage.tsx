import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchClient } from "../api/clients.api";
import type { Client } from "../Interfaces/Client";

export default function ClientDetailPage() {
  const navigate = useNavigate();

  const { id: clientId } = useParams();
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [error, setError] = useState<string>("");
  console.log(clientId);
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
          <strong>Telefoon:</strong> {client.phone}
        </p>
        <p>
          <strong>Geboortedatum:</strong>{" "}
          {client?.dateOfBirth
            ? new Intl.DateTimeFormat("nl-NL", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
              }).format(new Date(client.dateOfBirth))
            : "-"}
        </p>
        <p>
          <strong>Straat:</strong> {client.street}
        </p>
        <p>
          <strong>Postcode / Plaats:</strong> {client.postalCode} {client.city}
        </p>
        <p>
          <strong>Land:</strong> {client.country}
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
