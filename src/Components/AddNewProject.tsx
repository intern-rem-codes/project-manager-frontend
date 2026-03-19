import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { createProject } from "../api/projects.api";
import { fetchClients } from "../api/clients.api";
import type { Client } from "../Interfaces/Client";

export default function AddNewProject() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [deadline, setDeadline] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchClients()
      .then((fetchedClients) => {
        setClients(fetchedClients ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Laden mislukt"));
  }, []);

  async function handleSubmit() {
    setError("");
    setIsSaving(true);
    const project = await createProject({
      name,
      description,
      status,
      deadline,
      clientId,
    });
    if (!project) {
      setError("Project aanmaken mislukt");
      return;
    }
    navigate(`/project/${project.id}`);
  }

  return (
    <div className="project-edit-page">
      <div className="project-edit-header">
        <h1>Nieuw project</h1>
        <p>Vul de details in en voeg bestanden toe.</p>
      </div>
      {error ? <p className="error">{error}</p> : null}

      <form id="add-project-form" className="project-edit-card">
        <div className="form-group">
          <label>Naam project:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Beschrijving:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Status:</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Deadline:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Client:</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Selecteer een client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="project-edit-actions">
          <button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Bezig..." : "Aanmaken"}
          </button>
          <button type="button" onClick={() => navigate("/dashboard")}>
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
