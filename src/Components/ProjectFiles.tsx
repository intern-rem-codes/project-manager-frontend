import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { authHeaders } from "../utils/auth";
import { baseUrl } from "../utils/constants";

type ProjectFile = {
  id: number;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

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

export default function ProjectFiles() {
  const { id } = useParams();
  const projectId = useMemo(() => id ?? "", [id]);
  const [files, setFiles] = useState<ProjectFile[] | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ProjectFile | null>(null);

  async function load() {
    if (!projectId) return;
    setError("");
    const response = await fetch(`${baseUrl}/projects/${projectId}/files`, {
      headers: { ...authHeaders() },
    });
    const data = (await response.json()) as unknown;
    if (!response.ok) {
      const message =
        typeof (data as { message?: unknown } | undefined)?.message === "string"
          ? (data as { message: string }).message
          : "Bestanden laden mislukt";
      throw new Error(message);
    }
    setFiles(data as ProjectFile[]);
  }

  useEffect(() => {
    setFiles(null);
    if (!projectId) return;
    load().catch((e) =>
      setError(e instanceof Error ? e.message : "Laden mislukt"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!preview) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPreview(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview]);

  async function onUpload(file: File) {
    if (!projectId) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${baseUrl}/projects/${projectId}/files`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: form,
      });
      const data = (await response.json()) as unknown;
      if (!response.ok) {
        const message =
          typeof (data as { message?: unknown } | undefined)?.message ===
          "string"
            ? (data as { message: string }).message
            : "Upload mislukt";
        throw new Error(message);
      }
      await load();
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(fileId: number) {
    if (!projectId) return;
    const confirmed = window.confirm("Bestand verwijderen?");
    if (!confirmed) return;
    setError("");
    const response = await fetch(
      `${baseUrl}/projects/${projectId}/files/${fileId}`,
      {
        method: "DELETE",
        headers: { ...authHeaders() },
      },
    );
    if (!response.ok) {
      const text = await response.text();
      let message = "Verwijderen mislukt";
      try {
        const parsed = text ? (JSON.parse(text) as unknown) : undefined;
        if (
          typeof (parsed as { message?: unknown } | undefined)?.message ===
          "string"
        ) {
          message = (parsed as { message: string }).message;
        }
      } catch {
        // ignore
      }
      setError(message);
      return;
    }
    await load();
  }

  if (!projectId) return null;

  return (
    <div className="project-files">
      <div className="project-files-header">
        <div>
          <h2 className="project-files-title">
            Bestanden{" "}
            {files ? (
              <span className="project-files-count">
                {files.length} {files.length === 1 ? "bestand" : "bestanden"}
              </span>
            ) : null}
          </h2>
          <p className="help-text">Voeg bestanden toe aan dit project.</p>
        </div>

        <label className="file-upload">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              onUpload(file).catch((err) =>
                setError(err instanceof Error ? err.message : "Upload mislukt"),
              );
            }}
            disabled={uploading}
          />
          <span className="file-upload-button">
            {uploading ? "Uploaden..." : "Bestand toevoegen"}
          </span>
        </label>
      </div>

      {error ? <p className="error">{error}</p> : null}

      {files === null ? (
        <p>Laden...</p>
      ) : files.length === 0 ? (
        <p>Nog geen bestanden.</p>
      ) : (
        <ul className="project-files-list">
          {files.map((file) => (
            <li key={file.id} className="project-file-row">
              <div className="project-file-main">
                <div className="project-file-name" title={file.name}>
                  {file.name}
                </div>
                <div className="project-file-meta">
                  {formatBytes(file.size)}
                </div>
              </div>

              <div className="project-file-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setPreview(file)}
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
                  href={file.url}
                  download
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
                  onClick={() =>
                    onDelete(file.id).catch((err) =>
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Verwijderen mislukt",
                      ),
                    )
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
      )}

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
