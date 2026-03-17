import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { createProject } from "../api/project.api";
import FileUpload from "../Components/FileUpload";

type UploadedFile = {
  id: string;
  name: string;
  url: string;
};

function storageKey(projectId: string) {
  return `project-files:${projectId}`;
}

function appendFiles(projectId: string, uploaded: UploadedFile[]) {
  const raw = localStorage.getItem(storageKey(projectId));
  const current = raw ? (JSON.parse(raw) as UploadedFile[]) : [];
  const next = Array.isArray(current) ? [...current, ...uploaded] : uploaded;
  localStorage.setItem(storageKey(projectId), JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent("project-files-updated", { detail: { projectId } }),
  );
}

export default function AddNewProject() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  function handleFileSelect(files: FileList) {
    setSelectedFiles(files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const project = await createProject({
        name,
        description,
        status,
        deadline,
      });

      if (selectedFiles && selectedFiles.length > 0) {
        const body = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
          body.append("files", selectedFiles[i]);
        }
        const result = await fetch("/api/files/upload", {
          method: "POST",
          body,
        });
        if (result.ok) {
          const uploaded = (await result.json()) as UploadedFile[];
          appendFiles(project.id, uploaded);
          setSelectedFiles(null);
          setUploadError("");
        } else {
          setUploadError("Upload mislukt");
        }
      }
      navigate(`/project/${project.id}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Project aanmaken mislukt. Staat de backend aan?",
      );
    } finally {
      setIsSaving(false);
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

        <div className="project-edit-actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Bezig..." : "Aanmaken"}
          </button>
          <button type="button" onClick={() => navigate("/dashboard")}>
            Annuleren
          </button>
        </div>
      </form>

      <div className="project-upload-card">
        <h2>Bestanden toevoegen</h2>
        <p>Optioneel: voeg alvast bestanden toe voor dit project.</p>
        <div className="file-upload-box">
          <FileUpload />
          {selectedFiles && selectedFiles.length > 0 && (
            <p className="file-count">
              {selectedFiles.length} bestand(en) geselecteerd
            </p>
          )}
        </div>
        {uploadError ? <p className="error">{uploadError}</p> : null}
      </div>
    </div>
  );
}
