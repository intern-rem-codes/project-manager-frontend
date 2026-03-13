import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { FileUpload } from "../Components/FileUpload";
import ProjectFiles from "../Components/ProjectFiles";
import { fetchProject, updateProject } from "../api/project.api";
import type { Project } from "../Interfaces/Project";

export default function ProjectEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.id;
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [pageError, setPageError] = useState<string>("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setPageError("Project id ontbreekt.");
      return;
    }
    setPageError("");
    fetchProject(projectId)
      .then((p) => {
        setProject(p);
        setName(p.name);
        setDescription(p.description);
        setStatus(p.status);
        setDeadline(p.deadline ?? "");
      })
      .catch((e) =>
        setPageError(e instanceof Error ? e.message : "Failed to load"),
      );
  }, [projectId]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectId) return;

    try {
      await updateProject(projectId, { name, description, status, deadline });
      navigate(`/project/${projectId}`);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to update project",
      );
    }
  }

  async function handleUploadFile() {
    if (!projectId || !selectedFile) return;
    setUploadError("");
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("files", selectedFile);
      const result = await fetch("/api/files/upload", { method: "POST", body });
      if (!result.ok) throw new Error("Upload mislukt");
      const uploaded = (await result.json()) as Array<{
        id: string;
        name: string;
        url: string;
      }>;
      const key = `project-files:${projectId}`;
      const raw = localStorage.getItem(key);
      const current = raw ? (JSON.parse(raw) as typeof uploaded) : [];
      const next = Array.isArray(current) ? [...current, ...uploaded] : uploaded;
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(
        new CustomEvent("project-files-updated", { detail: { projectId } }),
      );
      setSelectedFile(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload mislukt");
    } finally {
      setIsUploading(false);
    }
  };

  function handleFileSelect(file: File): void {
    setSelectedFile(file);
  }

  if (pageError) return <div>{pageError}</div>;
  if (!projectId) return <div>Project id ontbreekt.</div>;
  if (!project) return <div>Loading...</div>;

  return (
    <div className="project-detail-page">
      <h1>Project bewerken</h1>

      <form className="project-edit-card" onSubmit={handleSave}>
        <div className="form-group">
          <label>Naam project:</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Beschrijving:</label>
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Status:</label>
          <input
            type="text"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Deadline:</label>
          <input
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Aangemaakt:</label>
          <input type="date" value={project.createdAt} disabled />
        </div>

        <div className="project-edit-actions">
          <button type="submit">Opslaan</button>
          <button
            type="button"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            Annuleren
          </button>
        </div>
      </form>
      <div className="file-upload-section">
        <h2>Bestanden uploaden</h2>
        <FileUpload onFileSelect={handleFileSelect} />
        {uploadError ? <p className="error">{uploadError}</p> : null}
        <button
          onClick={handleUploadFile}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "Bezig..." : "Bestand uploaden"}
        </button>
        <ProjectFiles />
      </div>
    </div>
  );
}
