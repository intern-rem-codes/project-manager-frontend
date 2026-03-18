import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchProject } from "../api/projects.api";
import type { Project } from "../Interfaces/Project";

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!projectId) return;
    fetchProject(projectId)
      .then(setProject)
      .catch((e) => setError(e instanceof Error ? e.message : "Laden mislukt"));
  }, [projectId]);

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
          <strong>Aangemaakt:</strong> {project.created_at}
        </p>

        <button onClick={() => navigate(`/project/${projectId}/edit`)}>
          Project bewerken
        </button>
      </div>

      <button onClick={() => navigate("/dashboard")}>
        Terug naar dashboard
      </button>
    </div>
  );
}
