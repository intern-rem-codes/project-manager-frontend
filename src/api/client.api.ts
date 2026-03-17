import type { Client } from "../Interfaces/Client";
import {
  createClient as createLocalClient,
  deleteClient as deleteLocalClient,
  getClientById as getLocalClientById,
  listClients as listLocalClients,
  saveClient as saveLocalClient,
  type StoredClient,
} from "../data/clients";

const baseUrl = "http://localhost:3000";

export async function listClients(): Promise<Client[]> {
  return listLocalClients().map(toClient);
}

function parseDateOnly(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeStoredClient(value: unknown): StoredClient | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;

  const id =
    typeof record.id === "string"
      ? record.id
      : record.id !== undefined
        ? String(record.id)
        : "";
  if (!id) return null;

  const firstName =
    typeof record.firstName === "string"
      ? record.firstName
      : typeof record.name === "string"
        ? (record.name.split(" ")[0] ?? "")
        : "";

  const lastName =
    typeof record.lastName === "string"
      ? record.lastName
      : typeof record.name === "string"
        ? (record.name.split(" ").slice(1).join(" ") ?? "")
        : "";

  const email = typeof record.email === "string" ? record.email : "";
  const phone = typeof record.phone === "string" ? record.phone : undefined;

  const dateOfBirth =
    typeof record.dateOfBirth === "string"
      ? record.dateOfBirth
      : record.dateOfBirth instanceof Date
        ? formatDateOnly(record.dateOfBirth)
        : undefined;

  const street = typeof record.street === "string" ? record.street : undefined;
  const city = typeof record.city === "string" ? record.city : undefined;
  const postalCode =
    typeof record.postalCode === "string" ? record.postalCode : undefined;
  const country =
    typeof record.country === "string" ? record.country : undefined;

  return {
    id,
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    street,
    city,
    postalCode,
    country,
  };
}

function toClient(stored: StoredClient): Client {
  const dateOfBirth = stored.dateOfBirth
    ? parseDateOnly(stored.dateOfBirth)
    : undefined;

  return {
    id: stored.id,
    firstName: stored.firstName,
    lastName: stored.lastName,
    email: stored.email,
    phone: stored.phone,
    dateOfBirth,
    street: stored.street,
    city: stored.city,
    postalCode: stored.postalCode,
    country: stored.country,
  };
}

function toStoredClient(
  client: Omit<Client, "id"> & { id?: string },
): Omit<StoredClient, "id"> & { id?: string } {
  return {
    ...(client.id ? { id: client.id } : {}),
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    dateOfBirth: client.dateOfBirth
      ? formatDateOnly(client.dateOfBirth)
      : undefined,
    street: client.street,
    city: client.city,
    postalCode: client.postalCode,
    country: client.country,
  };
}

export async function fetchClients(): Promise<Client[]> {
  try {
    await fetch(`${baseUrl}/clients`);
  } catch (error) {
    console.error(error);
  }
  return listLocalClients().map(toClient);
}

export async function fetchClient(clientId: string): Promise<Client> {
  try {
    await fetch(`${baseUrl}/clients/${clientId}`);
  } catch (error) {
    console.error(error);
  }
  return toClient(getLocalClientById(clientId));
}

export async function createClient(input: Omit<Client, "id">): Promise<Client> {
  saveLocalClient(createLocalClient(toStoredClient(input)));
  try {
    await fetch(`${baseUrl}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toStoredClient(input)),
    });
  } catch (error) {
    console.error(error);
  }
  return toClient(
    createLocalClient(toStoredClient(input) as Omit<StoredClient, "id">),
  );
}

export async function updateClient(
  clientId: string,
  input: Omit<Client, "id">,
): Promise<Client> {
  const existingRaw = getLocalClientById(clientId);
  const normalized = normalizeStoredClient(existingRaw) ?? existingRaw;
  saveLocalClient({
    ...normalized,
    ...toStoredClient({ ...input, id: clientId }),
    id: clientId,
  });
  return toClient(getLocalClientById(clientId));
}

export async function deleteClient(clientId: string): Promise<void> {
  try {
    await fetch(`${baseUrl}/clients/${clientId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(error);
  }
  deleteLocalClient(clientId);
}

export function formatClientDateOfBirth(value?: Date): string {
  if (!value) return "";
  return value ? formatDateOnly(value) : "";
}
