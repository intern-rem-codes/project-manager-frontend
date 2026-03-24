import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { deleteProject, fetchProject } from "../api/projects.api";
import type { Project } from "../Interfaces/Project";
import { fetchClient } from "../api/clients.api";
import type { Client } from "../Interfaces/Client";
import { readStoredUser } from "../utils/auth";
import ProjectFiles from "../Components/ProjectFiles";

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [error, setError] = useState<string>("");
  const user = readStoredUser();
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!projectId) return;

    fetchProject(projectId)
      .then((project) => {
        if (!project) return;
        setProject(project);
        if (!isAdmin) return;
        return fetchClient(project.clientId);
      })
      .then((client) => {
        if (!client) return;

        setClient(client);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Laden mislukt"));
  }, [projectId, isAdmin]);

  async function handleDelete() {
    if (!projectId) return;

    const confirmed = window.confirm(
      "Weet je zeker dat je dit project wilt verwijderen?",
    );
    if (!confirmed) return;

    try {
      await deleteProject(projectId);
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verwijderen mislukt");
    }
  }

  if (!projectId) return <div>Project id ontbreekt.</div>;

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
        <button onClick={handleDelete} className="button-delete">
          Project verwijderen
        </button>
      </div>

      {isAdmin ? (
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
      ) : null}

      <div className="project-detail-card">
        <ProjectFiles />
      </div>

      <button onClick={() => navigate("/projects")}>Terug naar projecten</button>
    </div>
  );
}
