import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { createProject } from "../api/projects.api";
import { fetchClients } from "../api/clients.api";
import type { Client } from "../Interfaces/Client";
import ClientCombobox from "./ClientCombobox";
import { authHeaders, readStoredUser } from "../utils/auth";
import { baseUrl } from "../utils/constants";

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
  const [status, setStatus] = useState(() => {
    const draft = typeof initial.draft.status === "string" ? initial.draft.status : "";
    return draft || "Actief";
  });
  const [deadline, setDeadline] = useState(() =>
    typeof initial.draft.deadline === "string" ? initial.draft.deadline : "",
  );
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(() => {
    if (
      typeof initial.clientIdFromUrl === "string" &&
      initial.clientIdFromUrl
    ) {
      return initial.clientIdFromUrl;
    }
    return typeof initial.draft.clientId === "string"
      ? initial.draft.clientId
      : "";
  });
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{
      key: string;
      file: File;
      url: string;
    }>
  >([]);
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [preview, setPreview] = useState<{
    name: string;
    url: string;
    mimeType: string;
  } | null>(null);

  function formatBytes(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    const rounded = index === 0 ? String(Math.round(value)) : value.toFixed(1);
    return `${rounded} ${units[index]}`;
  }

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

  useEffect(() => {
    if (!preview) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPreview(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview]);

  useEffect(() => {
    return () => {
      for (const item of selectedFiles) URL.revokeObjectURL(item.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadFiles(projectId: number, files: File[]) {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      setUploadProgress(`Uploaden (${i + 1}/${files.length}): ${file.name}`);
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${baseUrl}/projects/${projectId}/files`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: form,
      });
      const text = await response.text();
      const data = text ? (JSON.parse(text) as unknown) : undefined;
      if (!response.ok) {
        const message =
          typeof (data as { message?: unknown } | undefined)?.message ===
          "string"
            ? (data as { message: string }).message
            : "Upload mislukt";
        throw new Error(message);
      }
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (createdProjectId) return;
    if (
      !name ||
      !description ||
      !status ||
      !deadline ||
      (isAdmin && !clientId)
    ) {
      setError("Vul alle velden in.");
      return;
    }
    setError("");
    setIsSaving(true);
    setUploadProgress("");
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
    setCreatedProjectId(project.id);

    try {
      if (selectedFiles.length > 0) {
        await uploadFiles(
          project.id,
          selectedFiles.map((item) => item.file),
        );
      }
      setUploadProgress("");
      try {
        sessionStorage.removeItem("pm:add-project-draft");
      } catch {
        // negeer
      }
      navigate(`/project/${project.id}`);
    } catch (e) {
      setIsSaving(false);
      setUploadProgress("");
      setError(
        e instanceof Error
          ? `Project is aangemaakt, maar bestanden uploaden mislukt: ${e.message}`
          : "Project is aangemaakt, maar bestanden uploaden mislukt.",
      );
    }
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
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            disabled={isSaving}
          >
            <option value="Actief">Actief</option>
            <option value="Afgerond">Afgerond</option>
            <option value="On-hold">On-hold</option>
            <option value="Verlopen">Verlopen</option>
          </select>
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

        <div className="form-group">
          <div className="project-files">
            <div className="project-files-header">
              <div>
                <h2 className="project-files-title">
                  Bestanden{" "}
                  <span className="project-files-count">
                    {selectedFiles.length}{" "}
                    {selectedFiles.length === 1 ? "bestand" : "bestanden"}
                  </span>
                </h2>
                <p className="help-text">
                  Voeg bestanden toe aan dit project (optioneel).
                </p>
              </div>

              <label className="file-upload">
                <input
                  type="file"
                  multiple
                  disabled={isSaving}
                  onChange={(e) => {
                    const list = Array.from(e.target.files ?? []);
                    e.target.value = "";
                    if (list.length === 0) return;
                    setSelectedFiles((prev) => {
                      const next = [...prev];
                      for (const file of list) {
                        next.push({
                          key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
                          file,
                          url: URL.createObjectURL(file),
                        });
                      }
                      return next;
                    });
                  }}
                />
                <span className="file-upload-button">Bestanden kiezen</span>
              </label>
            </div>

            {selectedFiles.length > 0 ? (
              <ul className="project-files-list" aria-label="Bestanden">
                {selectedFiles.map((item) => (
                  <li key={item.key} className="project-file-row">
                    <div className="project-file-main">
                      <div className="project-file-name" title={item.file.name}>
                        {item.file.name}
                      </div>
                      <div className="project-file-meta">
                        {formatBytes(item.file.size)}
                      </div>
                    </div>

                    <div className="project-file-actions">
                      <button
                        type="button"
                        className="icon-button"
                        disabled={isSaving}
                        onClick={() =>
                          setPreview({
                            name: item.file.name,
                            url: item.url,
                            mimeType:
                              item.file.type || "application/octet-stream",
                          })
                        }
                        aria-label="Bekijken"
                        title="Bekijken"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
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
                        </svg>
                      </button>

                      <a
                        className="icon-button"
                        href={item.url}
                        download={item.file.name}
                        aria-label="Downloaden"
                        title="Downloaden"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 3v10"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M8 11l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4 20h16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </a>

                      <button
                        type="button"
                        className="icon-button icon-button--danger"
                        disabled={isSaving}
                        onClick={() =>
                          setSelectedFiles((prev) => {
                            const next = prev.filter((f) => f.key !== item.key);
                            URL.revokeObjectURL(item.url);
                            return next;
                          })
                        }
                        aria-label="Verwijderen"
                        title="Verwijderen"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 7h16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10 11v7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M14 11v7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6 7l1 14h10l1-14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 7V4h6v3"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {uploadProgress ? (
              <p className="help-text">{uploadProgress}</p>
            ) : null}
          </div>
        </div>

        <div className="project-edit-actions">
          <button type="submit" disabled={isSaving}>
            {isSaving
              ? selectedFiles.length > 0
                ? "Aanmaken + uploaden..."
                : "Aanmaken..."
              : "Aanmaken"}
          </button>
          {createdProjectId ? (
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate(`/project/${createdProjectId}`)}
            >
              Ga naar project
            </button>
          ) : null}
          <button type="button" onClick={() => navigate("/dashboard")}>
            Annuleren
          </button>
        </div>
      </form>

      {preview ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Bestand bekijken"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreview(null);
          }}
        >
          <div className="modal-card project-file-preview">
            <div className="project-file-preview-header">
              <div className="project-file-preview-title" title={preview.name}>
                {preview.name}
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setPreview(null)}
                aria-label="Sluiten"
                title="Sluiten"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="project-file-preview-body">
              {preview.mimeType.startsWith("image/") ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="project-file-preview-media"
                />
              ) : preview.mimeType === "application/pdf" ? (
                <iframe
                  className="project-file-preview-media"
                  src={preview.url}
                  title={preview.name}
                />
              ) : (
                <div className="project-file-preview-fallback">
                  <p className="help-text">
                    Voor dit bestandstype is geen preview beschikbaar.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-actions project-file-preview-actions">
              <button type="button" onClick={() => setPreview(null)}>
                Sluiten
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
