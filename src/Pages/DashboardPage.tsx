import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchProjects } from "../api/project.api";
import type { Project } from "../Interfaces/Project";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | undefined>(undefined);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setError("");
        setProjects(data);
      })
      .catch((e) => {
        setProjects([]);
        setError(
          e instanceof Error
            ? e.message
            : "Kan projecten niet laden. Staat de backend aan?",
        );
      });
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <button onClick={() => navigate("/add-project")}>
        Nieuw project maken
      </button>
      {error ? <p className="error">{error}</p> : null}
      {projects ? (
        <div className="project-list">
          {projects.length === 0 ? <p>Geen projecten gevonden.</p> : null}
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <button onClick={() => navigate(`/project/${project.id}`)}>
                View project
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading projects...</p>
      )}
    </div>
  );
}
