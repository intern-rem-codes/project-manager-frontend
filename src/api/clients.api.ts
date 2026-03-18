import type { Client } from "../Interfaces/Client";
import { baseUrl } from "../utils/constants";
import { getData, postData, putData } from "./helpers";

// FETCH SINGLE PROJECT
export async function fetchClient(
  clientId: string,
): Promise<Client | undefined> {
  if (!clientId) {
    console.log("no project id provided");
    return undefined;
  }
  return await getData<Client>(`${baseUrl}/clients/${clientId}`);
}

// FETCH ALL PROJECTS
export async function fetchClients(): Promise<Client[]> {
  const clients = await getData<Client[]>(`${baseUrl}/clients`);

  if (clients === undefined) {
    return [];
  }

  return clients;
}

/// CREATE NEW PROJECT
export async function createClient(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}): Promise<Client | undefined> {
  return await postData(`${baseUrl}/clients`, input);
}

// UPDATE PROJECT
export async function updateClient(
  clientId: string,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  },
): Promise<Client | undefined> {
  return await putData(`${baseUrl}/clients/${clientId}`, input);
}
