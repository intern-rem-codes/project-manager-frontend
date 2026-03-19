import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchProject, updateProject } from "../api/projects.api";
import type { Project } from "../Interfaces/Project";
import { formatDateOnly } from "../api/helpers";

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
    fetchProject(projectId).then((project) => {
      if (!project) {
        return;
      }
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setDeadline(project.deadline ?? "");
      setProject(project);
    });
  }, [projectId]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault(); // Voorkom de standaardgedraging van het formulier (paginavernieuwing)
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
          <input
            type="date"
            value={formatDateOnly(project.created_at)}
            disabled
          />
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
    </div>
  );
}
