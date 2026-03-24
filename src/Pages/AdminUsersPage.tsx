import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { baseUrl } from "../utils/constants";
import { authHeaders, readStoredUser, roleLabel } from "../utils/auth";

type AdminUser = {
  id: number;
  name: string;
  lastName: string | null;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const me = readStoredUser();

  async function load() {
    setError("");
    const response = await fetch(`${baseUrl}/admin/users`, {
      headers: { ...authHeaders() },
    });
    const data = (await response.json()) as unknown;
    if (!response.ok) {
      const message =
        typeof (data as { message?: unknown } | undefined)?.message === "string"
          ? (data as { message: string }).message
          : "Laden mislukt";
      throw new Error(message);
    }
    setUsers(data as AdminUser[]);
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Laden mislukt"));
  }, []);

  async function patchUser(
    id: number,
    patch: Partial<Pick<AdminUser, "role" | "isActive">>,
  ) {
    if (me?.id === id && patch.isActive === false) {
      setError("Je kunt je eigen account niet deactiveren.");
      return;
    }
    if (me?.id === id && patch.role === "USER") {
      setError("Je kunt je eigen rol niet verlagen.");
      return;
    }
    setError("");
    const response = await fetch(`${baseUrl}/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(patch),
    });
    const data = (await response.json()) as unknown;
    if (!response.ok) {
      const message =
        typeof (data as { message?: unknown } | undefined)?.message === "string"
          ? (data as { message: string }).message
          : "Opslaan mislukt";
      throw new Error(message);
    }
    const updated = data as AdminUser;
    setUsers((prev) => (prev ? prev.map((u) => (u.id === id ? updated : u)) : prev));
  }

  async function resetPassword(id: number) {
    if (me?.id === id) {
      setError("Gebruik accountpagina om je eigen wachtwoord te wijzigen.");
      return;
    }
    setError("");
    setToast("");
    const response = await fetch(`${baseUrl}/admin/users/${id}/reset-password`, {
      method: "POST",
      headers: { ...authHeaders() },
    });
    const data = (await response.json()) as unknown;
    if (!response.ok) {
      const message =
        typeof (data as { message?: unknown } | undefined)?.message === "string"
          ? (data as { message: string }).message
          : "Reset mislukt";
      throw new Error(message);
    }
    const tempPassword =
      typeof (data as { tempPassword?: unknown } | undefined)?.tempPassword ===
      "string"
        ? (data as { tempPassword: string }).tempPassword
        : "";
    setToast(`Tijdelijk wachtwoord: ${tempPassword}`);
  }

  async function deleteUser(id: number) {
    if (me?.id === id) {
      setError("Je kunt jezelf niet verwijderen.");
      return;
    }
    const confirmed = window.confirm("Weet je zeker dat je deze gebruiker wilt verwijderen?");
    if (!confirmed) return;
    setError("");
    const response = await fetch(`${baseUrl}/admin/users/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    if (!response.ok) {
      const data = (await response.json()) as unknown;
      const message =
        typeof (data as { message?: unknown } | undefined)?.message === "string"
          ? (data as { message: string }).message
          : "Verwijderen mislukt";
      throw new Error(message);
    }
    setUsers((prev) => (prev ? prev.filter((u) => u.id !== id) : prev));
  }

  return (
    <div className="admin-users-page">
      <div className="account-card">
        <div className="account-header">
          <div>
            <h1>Users beheren</h1>
            <p>Rollen, activatie en wachtwoord reset.</p>
          </div>
          <div className="account-actions">
            <button type="button" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {toast ? <p className="success">{toast}</p> : null}

        {users === null ? (
          <p>Laden...</p>
        ) : (
          <div className="admin-users-table">
            {users.map((u) => (
              <div key={u.id} className="admin-user-row">
                <div className="admin-user-main">
                  <div className="admin-user-name">
                    {u.name} {u.lastName ?? ""}
                  </div>
                  <div className="admin-user-meta">
                    {u.email} • {roleLabel(u.role)} •{" "}
                    {u.isActive ? "Actief" : "Gedeactiveerd"}
                  </div>
                </div>

                <div className="admin-user-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => patchUser(u.id, { role: u.role === "ADMIN" ? "USER" : "ADMIN" }).catch((e) => setError(e instanceof Error ? e.message : "Opslaan mislukt"))}
                    disabled={me?.id === u.id}
                  >
                    Maak {u.role === "ADMIN" ? "gebruiker" : "admin"}
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => patchUser(u.id, { isActive: !u.isActive }).catch((e) => setError(e instanceof Error ? e.message : "Opslaan mislukt"))}
                    disabled={me?.id === u.id}
                  >
                    {u.isActive ? "Deactiveer" : "Activeer"}
                  </button>
                  <button type="button" onClick={() => resetPassword(u.id).catch((e) => setError(e instanceof Error ? e.message : "Reset mislukt"))}>
                    Reset wachtwoord
                  </button>
                  <button type="button" className="button-danger" disabled={me?.id === u.id} onClick={() => deleteUser(u.id).catch((e) => setError(e instanceof Error ? e.message : "Verwijderen mislukt"))}>
                    Verwijder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
