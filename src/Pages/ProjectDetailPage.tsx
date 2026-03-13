import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { FileUpload } from "../Components/FileUpload";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [error, setError] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setError("");
    fetchProject(projectId)
      .then(setProject)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [projectId]);

  function handleEditProject() {
    navigate(`/project/${projectId}/edit`);
  }

  function handleFileSelect(file: File) {
    setSelectedFile(file);
  }

  async function handleSubmit() {
    if (!projectId || !selectedFile) return;
    setUploadError("");
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("files", selectedFile);
      const result = await fetch("/api/files/upload", { method: "POST", body });
      if (!result.ok) throw new Error("Upload mislukt");
      const uploaded = (await result.json()) as UploadedFile[];
      appendFiles(projectId, uploaded);
      setSelectedFile(null);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload mislukt");
    } finally {
      setIsUploading(false);
    }
  }

  if (error) return <div>{error}</div>;
  if (!project) return <div>Loading...</div>;

  return (
    <div className="project-detail-page">
      <h1>Project details</h1>

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

        <button onClick={handleEditProject}>Project bewerken</button>
      </div>
      <div className="project-files">
        <h2>Bestanden</h2>
        <p>Hier komen de bestanden van het project te staan.</p>
        <FileUpload onFileSelect={handleFileSelect} />
        {uploadError ? <p className="error">{uploadError}</p> : null}
        <button onClick={handleSubmit} disabled={!selectedFile || isUploading}>
          {isUploading ? "Bezig..." : "Bestand uploaden"}
        </button>
        <ProjectFiles />
      </div>
    </div>
  );
}
