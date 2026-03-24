import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { createProject } from "../api/projects.api";
import { fetchClients } from "../api/clients.api";
import type { Client } from "../Interfaces/Client";
import ClientCombobox from "./ClientCombobox";
import { readStoredUser } from "../utils/auth";

type AddProjectDraft = Partial<{
  name: string;
  description: string;
  status: string;
  deadline: string;
  clientId: string;
}>;

function readAddProjectDraft(): AddProjectDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem("pm:add-project-draft");
    if (!raw) return {};
    return JSON.parse(raw) as AddProjectDraft;
  } catch {
    return {};
  }
}

function readClientIdFromUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    return new URLSearchParams(window.location.search).get("clientId") ?? "";
  } catch {
    return "";
  }
}

export default function AddNewProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = readStoredUser();
  const isAdmin = user?.role === "ADMIN";
  const initial = useMemo(() => {
    return {
      draft: readAddProjectDraft(),
      clientIdFromUrl: readClientIdFromUrl(),
    };
  }, []);

  const [name, setName] = useState(() =>
    typeof initial.draft.name === "string" ? initial.draft.name : "",
  );
  const [description, setDescription] = useState(() =>
    typeof initial.draft.description === "string"
      ? initial.draft.description
      : "",
  );
  const [status, setStatus] = useState(() =>
    typeof initial.draft.status === "string" ? initial.draft.status : "",
  );
  const [deadline, setDeadline] = useState(() =>
    typeof initial.draft.deadline === "string" ? initial.draft.deadline : "",
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(() => {
    if (typeof initial.clientIdFromUrl === "string" && initial.clientIdFromUrl) {
      return initial.clientIdFromUrl;
    }
    return typeof initial.draft.clientId === "string" ? initial.draft.clientId : "";
  });
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        "pm:add-project-draft",
        JSON.stringify({ name, description, status, deadline, clientId }),
      );
    } catch {
      // negeer
    }
  }, [name, description, status, deadline, clientId]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchClients()
      .then((fetchedClients) => {
        setClients(fetchedClients ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Laden mislukt"));
  }, [isAdmin]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name || !description || !status || !deadline || (isAdmin && !clientId)) {
      setError("Vul alle velden in.");
      return;
    }
    setError("");
    setIsSaving(true);
    const project = await createProject({
      name,
      description,
      status,
      deadline,
      ...(isAdmin ? { clientId } : {}),
    });
    if (!project) {
      setError("Project aanmaken mislukt");
      setIsSaving(false);
      return;
    }
    try {
      sessionStorage.removeItem("pm:add-project-draft");
    } catch {
      // negeer
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

      <form
        id="add-project-form"
        className="project-edit-card"
        onSubmit={handleSubmit}
      >
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
            required
          />
        </div>

        {isAdmin ? (
          <ClientCombobox
            label="Klant:"
            clients={clients}
            value={clientId}
            onChange={setClientId}
            placeholder="Zoek of selecteer een klant…"
            onAddNew={() => {
              const returnTo = `${location.pathname}${location.search}`;
              navigate(`/client/new?returnTo=${encodeURIComponent(returnTo)}`);
            }}
            disabled={isSaving}
          />
        ) : null}

        <div className="project-edit-actions">
          <button type="submit" disabled={isSaving}>
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
