import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ProjectFiles from "../Components/ProjectFiles";
import { fetchProject, updateProject } from "../api/project.api";
import type { Project } from "../Interfaces/Project";
import FileUpload from "../Components/FileUpload";

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

  useEffect(() => {
    if (!projectId) return;
    fetchProject(projectId)
      .then((p) => {
        setPageError("");
        setProject(p);
        setName(p.name);
        setDescription(p.description);
        setStatus(p.status);
        setDeadline(p.deadline ?? "");
      })
      .catch((e) =>
        setPageError(e instanceof Error ? e.message : "Laden mislukt"),
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
        error instanceof Error ? error.message : "Project bijwerken mislukt",
      );
    }
  }

  if (pageError) return <div>{pageError}</div>;
  if (!projectId) return <div>Project id ontbreekt.</div>;
  if (!project) return <div>Laden...</div>;

  return (
    <div className="project-edit-page">
      <div className="project-edit-header">
        <h1>Project bewerken</h1>
        <p>Pas details aan en sla wijzigingen op.</p>
      </div>

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
        <FileUpload />
        <ProjectFiles />
      </div>
    </div>
  );
}
