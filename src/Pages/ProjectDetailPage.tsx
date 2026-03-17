import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import FileUpload from "../Components/FileUpload";
import ProjectFiles from "../Components/ProjectFiles";
import { fetchProject } from "../api/project.api";
import type { Project } from "../Interfaces/Project";

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

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [error, setError] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setError("");
    fetchProject(projectId)
      .then(setProject)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Laden mislukt"),
      );
  }, [projectId]);

  async function uploadSelectedFiles() {
    if (!projectId || !selectedFiles || selectedFiles.length === 0) return true;
    setUploadError("");
    setIsUploading(true);
    try {
      const body = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        body.append("files", selectedFiles[i]);
      }
      const result = await fetch("/api/files/upload", { method: "POST", body });
      if (!result.ok) {
        let message = "Upload mislukt";
        try {
          const data = (await result.json()) as { message?: string };
          if (data?.message) message = data.message;
        } catch {
          // ignore invalid JSON
        }
        throw new Error(message);
      }
      const uploaded = (await result.json()) as UploadedFile[];
      appendFiles(projectId, uploaded);
      setSelectedFiles(null);
      return true;
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload mislukt");
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleEditProject() {
    if (!projectId) return;
    const ok = await uploadSelectedFiles();
    if (ok) navigate(`/project/${projectId}/edit`);
  }

  if (error) return <div>{error}</div>;
  if (!project) return <div>Laden...</div>;

  return (
    <div className="project-detail-page">
      <h1>Projectdetails</h1>

      <div className="project-detail-card">
        <p>
          <strong>Naam project:</strong> {project.name}
        </p>
        <p>
          <strong>Beschrijving:</strong> {project.description}
        </p>
        <p>
          <strong>Status:</strong> {project.status}
        </p>
        <p>
          <strong>Deadline:</strong> {project.deadline}
        </p>
        <p>
          <strong>Aangemaakt:</strong> {project.createdAt}
        </p>

        <button onClick={handleEditProject} disabled={isUploading}>
          {isUploading ? "Bezig..." : "Project bewerken"}
        </button>
      </div>
      <div className="project-files">
        <h2>Bestanden</h2>
        <p>Selecteer bestanden en klik op Project bewerken om te uploaden.</p>
        <FileUpload />
        {selectedFiles && selectedFiles.length > 0 && (
          <p className="file-count">
            {selectedFiles.length} bestand(en) geselecteerd
          </p>
        )}
        {uploadError ? <p className="error">{uploadError}</p> : null}
        <ProjectFiles />
        <button onClick={handleEditProject} disabled={isUploading}>
          {isUploading ? "Bezig..." : "Project bewerken"}
        </button>
      </div>
      <button onClick={() => navigate("/dashboard")}>
        Terug naar dashboard
      </button>
    </div>
  );
}
