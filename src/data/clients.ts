export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export type StoredClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};
const STORAGE_KEY = "clients";

const defaultClients: Record<string, StoredClient> = {
  "1": {
    id: "1",
    firstName: "Sanne",
    lastName: "Jansen",
    email: "sanne.jansen@example.com",
    phone: "+31 6 12345678",
    dateOfBirth: "1994-06-12",
    street: "Kerkstraat 10",
    city: "Amsterdam",
    postalCode: "1017 GA",
    country: "Nederland",
  },
  "2": {
    id: "2",
    firstName: "Youssef",
    lastName: "El Amrani",
    email: "youssef.elamrani@example.com",
    phone: "+31 6 87654321",
    dateOfBirth: "1989-11-03",
    street: "Stationsplein 1",
    city: "Utrecht",
    postalCode: "3511 CE",
    country: "Nederland",
  },
};

function loadClients(): Record<string, StoredClient> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultClients;

  try {
    const parsed = JSON.parse(raw) as Record<string, StoredClient>;
    return { ...defaultClients, ...parsed };
  } catch {
    return defaultClients;
  }
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

export function listClients(): StoredClient[] {
  const clients = loadClients();
  return Object.values(clients).sort((a, b) => {
    const last = a.lastName.localeCompare(b.lastName);
    if (last !== 0) return last;
    return a.firstName.localeCompare(b.firstName);
  });
}

export function getClientById(id: string): StoredClient {
  const clients = loadClients();
  const fallbackId = Object.keys(defaultClients)[0];
  return clients[id] ?? defaultClients[fallbackId];
}

export function saveClient(client: StoredClient): void {
  const clients = loadClients();
  clients[client.id] = client;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function deleteClient(id: string): void {
  const clients = loadClients();
  delete clients[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function createClient(input: Omit<StoredClient, "id">): StoredClient {
  const client: StoredClient = {
    id: generateId(),
    ...input,
  };

  saveClient(client);
  return client;
}
