export type Role = "USER" | "ADMIN";

export type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export function readStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      "name" in parsed &&
      "email" in parsed &&
      "role" in parsed &&
      typeof (parsed as { id: unknown }).id === "number" &&
      typeof (parsed as { name: unknown }).name === "string" &&
      typeof (parsed as { email: unknown }).email === "string" &&
      ((parsed as { role: unknown }).role === "USER" ||
        (parsed as { role: unknown }).role === "ADMIN")
    ) {
      return parsed as StoredUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function readToken(): string | null {
  const token = localStorage.getItem("token");
  return typeof token === "string" && token ? token : null;
}

export function setAuth(user: StoredUser, token: string) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
}

export function clearAuth() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export function authHeaders() {
  const token = readToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function roleLabel(role: Role) {
  return role === "ADMIN" ? "Beheerder" : "Gebruiker";
}
