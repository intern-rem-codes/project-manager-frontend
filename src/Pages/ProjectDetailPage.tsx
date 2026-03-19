import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchProject } from "../api/projects.api";
import type { Project } from "../Interfaces/Project";
import { fetchClient } from "../api/clients.api";
import type { Client } from "../Interfaces/Client";

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!projectId) return;

    fetchProject(projectId)
      .then((project) => {
        if (!project) return;
        setProject(project);

        return fetchClient(project.clientId);
      })
      .then((client) => {
        if (!client) return;

        setClient(client);
      })
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
          <strong>Deadline:</strong>{" "}
          {project.deadline && new Date(project.deadline).toLocaleDateString()}
        </p>
        <p>
          <strong>Aangemaakt:</strong>{" "}
          {new Date(project.created_at).toLocaleDateString()}
        </p>

        <button onClick={() => navigate(`/project/${projectId}/edit`)}>
          Project bewerken
        </button>
      </div>

      <div className="project-detail-card">
        <p>
          <strong>Naam klant:</strong> {client?.firstName} {client?.lastName}
        </p>
        <p>
          <strong>Email:</strong> {client?.email}
        </p>
        <p>
          <strong>Telefoon:</strong> {client?.phone}
        </p>
      </div>

      <button onClick={() => navigate("/dashboard")}>
        Terug naar dashboard
      </button>
    </div>
  );
}
