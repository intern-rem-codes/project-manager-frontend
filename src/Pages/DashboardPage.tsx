import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchClients } from "../api/clients.api";
import { fetchProjects } from "../api/projects.api";
import type { Client } from "../Interfaces/Client";
import type { Project } from "../Interfaces/Project";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | undefined>(undefined);
  const [error, setError] = useState<string>("");
  const [clients, setClients] = useState<Client[] | undefined>(undefined);
  const [clientsError, setClientsError] = useState<string>("");

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

  useEffect(() => {
    fetchClients()
      .then((data) => {
        setClientsError("");
        setClients(data);
      })
      .catch((e) => {
        setClients([]);
        setClientsError(
          e instanceof Error ? e.message : "Kan klanten niet laden.",
        );
      });
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h1>Dashboard</h1>
          <p>Welkom op je dashboard!</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={() => navigate("/add-project")}>
            Nieuw project maken
          </button>
          <button onClick={() => navigate("/client/new")}>
            Nieuwe klant maken
          </button>
        </div>
      </div>

      <section className="dashboard-section">
        {error ? <p className="error">{error}</p> : null}
        {projects ? (
          <div className="project-list">
            {projects.length === 0 ? <p>Geen projecten gevonden.</p> : null}
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <h2>{project.name}</h2>
                <p>{project.description}</p>
                <button onClick={() => navigate(`/project/${project.id}`)}>
                  Bekijk project
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Projecten laden...</p>
        )}
      </section>

      <div className="dashboard-divider" />

      <section className="dashboard-section">
        <h2>Klanten</h2>
        {clientsError ? <p className="error">{clientsError}</p> : null}
        {clients ? (
          <div className="project-list">
            {clients.length === 0 ? <p>Geen klanten gevonden.</p> : null}
            {clients.map((client) => (
              <div key={client.id} className="project-card">
                <h2>
                  {client.firstName} {client.lastName}
                </h2>
                <p>{client.email}</p>
                <button onClick={() => navigate(`/client/${client.id}`)}>
                  Bekijk klant
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Klanten laden...</p>
        )}
      </section>
    </div>
  );
}
