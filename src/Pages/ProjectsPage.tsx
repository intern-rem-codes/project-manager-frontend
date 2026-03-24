import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { fetchProjects } from "../api/projects.api";
import type { Project } from "../Interfaces/Project";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setError("");
    setProjects(null);
    fetchProjects()
      .then((data) => setProjects(data ?? []))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Projecten laden mislukt"),
      );
  }, []);

  const filtered = useMemo(() => {
    const list = projects ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const hay = `${p.name} ${p.description} ${p.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [projects, query]);

  return (
    <div className="projects-page">
      <div className="project-detail-card">
        <div className="account-header">
          <div>
            <h1>Projecten</h1>
            <p>Bekijk en beheer al je projecten.</p>
          </div>
          <div className="account-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            <button type="button" onClick={() => navigate("/add-project")}>
              Nieuw project
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Zoek:</label>
          <input
            type="search"
            placeholder="Zoek op naam, status of beschrijving..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error ? <p className="error">{error}</p> : null}
      </div>

      {projects === null ? (
        <p>Laden...</p>
      ) : filtered.length === 0 ? (
        <p>Geen projecten gevonden.</p>
      ) : (
        <div className="project-list">
          {filtered.map((project) => (
            <div key={project.id} className="project-card">
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <p>
                <strong>Status:</strong> {project.status}
              </p>
              <p>
                <strong>Deadline:</strong>{" "}
                {project.deadline
                  ? new Date(project.deadline).toLocaleDateString()
                  : "-"}
              </p>
              <button onClick={() => navigate(`/project/${project.id}`)}>
                Bekijk project
              </button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => navigate("/dashboard")}>
        Terug naar dashboard
      </button>
    </div>
  );
}
