import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { fetchProjects } from "../api/projects.api";
import type { Project } from "../Interfaces/Project";
import { clearAuth, readStoredUser, roleLabel } from "../utils/auth";

type StatusKey = "active" | "done" | "onHold" | "overdue" | "other";

function getInitials(nameOrEmail: string) {
  const value = nameOrEmail.trim();
  if (!value) return "?";
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return value.slice(0, 2).toUpperCase();
}

// role label comes from stored user.role

function statusKeyFromText(status: string): StatusKey {
  const s = status.trim().toLowerCase();
  if (!s) return "other";
  if (s.includes("actief") || s.includes("active") || s.includes("open")) {
    return "active";
  }
  if (s.includes("afgerond") || s.includes("done") || s.includes("completed")) {
    return "done";
  }
  if (
    s.includes("on-hold") ||
    s.includes("on hold") ||
    s.includes("onhold") ||
    s.includes("pauze") ||
    s.includes("gepauzeerd") ||
    s.includes("hold")
  ) {
    return "onHold";
  }
  if (
    s.includes("verlopen") ||
    s.includes("overdue") ||
    s.includes("expired")
  ) {
    return "overdue";
  }
  return "other";
}

function isProjectOverdue(project: Project, today = new Date()): boolean {
  // If explicitly marked as done/afgerond, don't count as overdue.
  const key = statusKeyFromText(project.status);
  if (key === "done") return false;
  if (!project.deadline) return false;
  const d = new Date(project.deadline);
  if (Number.isNaN(d.getTime())) return false;
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  return d < startOfToday;
}

// readStoredUser is shared in utils/auth

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | undefined>(undefined);
  const [error, setError] = useState<string>("");
  const [accountOpen, setAccountOpen] = useState(false);
  const user = readStoredUser();
  const roleText = user ? roleLabel(user.role) : "";
  const isAdmin = user?.role === "ADMIN";
  const stats = useMemo(() => {
    const list = projects ?? [];
    const today = new Date();

    const total = list.length;
    let active = 0;
    let done = 0;
    let onHold = 0;
    let overdue = 0;

    for (const project of list) {
      const key = statusKeyFromText(project.status);
      const overdueFlag = key === "overdue" || isProjectOverdue(project, today);

      // Mutually exclusive buckets:
      // done > onHold > overdue > active
      if (key === "done") {
        done += 1;
      } else if (key === "onHold") {
        onHold += 1;
      } else if (overdueFlag) {
        overdue += 1;
      } else {
        active += 1;
      }
    }

    return { total, active, done, onHold, overdue };
  }, [projects]);

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
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest?.("[data-account-menu]")) return;
      setAccountOpen(false);
    }

    if (!accountOpen) return;
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
    };
  }, [accountOpen]);

  function logout() {
    clearAuth();
    navigate("/login");
  }

  function openAccount() {
    setAccountOpen(false);
    navigate("/account");
  }

  function openAdmin() {
    setAccountOpen(false);
    navigate("/admin/users");
  }

  function logoutFromMenu() {
    setAccountOpen(false);
    logout();
  }

  return (
    <div className="dashboard-page">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-row">
            <div className="app-header-title">
              <div className="brand" onClick={() => navigate("/dashboard")}>
                <span className="brand-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 6.5c0-1.38 1.12-2.5 2.5-2.5h4.1c.66 0 1.29.26 1.76.73l.8.8c.28.28.66.44 1.06.44H18.5C19.88 6 21 7.12 21 8.5v9c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 20 3 18.88 3 17.5v-11Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <strong className="brand-text">Projectbeheer</strong>
              </div>
            </div>

            <div className="app-header-actions" data-account-menu>
              {user ? (
                <button
                  type="button"
                  className="user-chip"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-expanded={accountOpen}
                >
                  <span className="account-avatar" aria-hidden="true">
                    {getInitials(user.name || user.email)}
                  </span>
                  <span className="user-chip__text">
                    <span className="user-chip__name">{user.name}</span>
                    <span className="user-chip__role">{roleText}</span>
                  </span>
                  <span
                    className={`user-chip__chevron ${
                      accountOpen ? "user-chip__chevron--open" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 10l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              ) : (
                <button type="button" onClick={() => navigate("/login")}>
                  Inloggen
                </button>
              )}

              {accountOpen && user ? (
                <div className="account-popover">
                  <div className="account-popover__meta">
                    <div className="account-popover__identity">
                      <div
                        className="account-avatar account-avatar--lg"
                        aria-hidden="true"
                      >
                        {getInitials(user.name || user.email)}
                      </div>
                      <div>
                        <div className="account-popover__name">{user.name}</div>
                        <div className="account-popover__email">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="account-popover__hint">{roleText}</div>
                  <div className="account-popover__actions">
                    <button
                      type="button"
                      className="account-menu-item"
                      onClick={openAccount}
                    >
                      Account
                    </button>
                    {isAdmin ? (
                      <button
                        type="button"
                        className="account-menu-item"
                        onClick={openAdmin}
                      >
                        Admin
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="account-menu-item account-menu-item--danger"
                      onClick={logoutFromMenu}
                    >
                      Uitloggen
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Overzichten zitten nu op /projects en /clients */}
        </div>
      </header>

      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <h1>Dashboard</h1>
          <p>Welkom op je dashboard!</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={() => navigate("/add-project")}>
            Nieuw project maken
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => navigate("/projects")}
          >
            Alle projecten
          </button>
          {isAdmin ? (
            <>
              <button onClick={() => navigate("/client/new")}>
                Nieuwe klant maken
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => navigate("/clients")}
              >
                Alle klanten
              </button>
            </>
          ) : null}
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <section className="dashboard-stats" aria-label="Projectstatistieken">
        <div className="stat-card stat-card--brand">
          <div className="stat-card__top">
            <span className="stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M4 18V6m0 12h16M8 15l3-3 3 2 4-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="stat-label">Totaal</span>
          </div>
          <div className="stat-value">
            {projects ? stats.total : <span className="stat-skeleton" />}
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__top">
            <span className="stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="stat-label">Actief</span>
          </div>
          <div className="stat-value">
            {projects ? stats.active : <span className="stat-skeleton" />}
          </div>
        </div>

        <div className="stat-card stat-card--neutral">
          <div className="stat-card__top">
            <span className="stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8.5 12.5 11 15l5-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="stat-label">Afgerond</span>
          </div>
          <div className="stat-value">
            {projects ? stats.done : <span className="stat-skeleton" />}
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__top">
            <span className="stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M12 7v6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M12 17h.01"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M10.3 4.2 3.5 16.2c-.9 1.6.3 3.6 2.1 3.6h12.8c1.8 0 3-2 2.1-3.6L13.7 4.2c-.9-1.6-3.2-1.6-4.1 0Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="stat-label">On-hold</span>
          </div>
          <div className="stat-value">
            {projects ? stats.onHold : <span className="stat-skeleton" />}
          </div>
        </div>

        <div className="stat-card stat-card--danger">
          <div className="stat-card__top">
            <span className="stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M12 8v4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M12 16h.01"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M10.3 4.2 3.5 16.2c-.9 1.6.3 3.6 2.1 3.6h12.8c1.8 0 3-2 2.1-3.6L13.7 4.2c-.9-1.6-3.2-1.6-4.1 0Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="stat-label">Verlopen</span>
          </div>
          <div className="stat-value">
            {projects ? stats.overdue : <span className="stat-skeleton" />}
          </div>
        </div>
      </section>
    </div>
  );
}
