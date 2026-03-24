import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { fetchClients } from "../api/clients.api";
import type { Client } from "../Interfaces/Client";

export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setError("");
    setClients(null);
    fetchClients()
      .then((data) => setClients(data ?? []))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Klanten laden mislukt"),
      );
  }, []);

  const filtered = useMemo(() => {
    const list = clients ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const hay = `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase();
      return hay.includes(q);
    });
  }, [clients, query]);

  return (
    <div className="clients-page">
      <div className="client-detail-card">
        <div className="account-header">
          <div>
            <h1>Klanten</h1>
            <p>Bekijk en beheer alle klanten.</p>
          </div>
          <div className="account-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            <button type="button" onClick={() => navigate("/client/new")}>
              Nieuwe klant
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Zoek:</label>
          <input
            type="search"
            placeholder="Zoek op naam of e-mail..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error ? <p className="error">{error}</p> : null}
      </div>

      {clients === null ? (
        <p>Laden...</p>
      ) : filtered.length === 0 ? (
        <p>Geen klanten gevonden.</p>
      ) : (
        <div className="project-list">
          {filtered.map((client) => (
            <div key={client.id} className="project-card">
              <h2>
                {client.firstName} {client.lastName}
              </h2>
              <p>{client.email}</p>
              <button onClick={() => navigate(`/client/${client.id}`)}>
                Bekijk klant
              </button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => navigate("/dashboard")}>
        Terug naar dashboard
      </button>
    </div>
  );
}
