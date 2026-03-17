import type { Project } from "../Interfaces/Project";
import {
  createProject as createLocalProject,
  getProjectById as getLocalProjectById,
  saveProject as saveLocalProject,
  type MockProject,
} from "../data/projects";

const baseUrl = "http://localhost:3000";

function toProject(local: MockProject): Project {
  return {
    id: local.id,
    name: local.name,
    description: local.description,
    status: local.status,
    deadline: local.deadline === "" ? null : local.deadline,
    createdAt: local.createdAt,
    updatedAt: local.createdAt,
  };
}

export async function fetchProject(projectId: string): Promise<Project> {
  try {
    const result = await fetch(`${baseUrl}/projects/${projectId}`);
    if (!result.ok) throw new Error("Projectdetails ophalen mislukt");
    return (await result.json()) as Project;
  } catch (error) {
    console.warn(
      "API niet beschikbaar, terugvallen op lokale projectdata.",
      error,
    );
    return toProject(getLocalProjectById(projectId));
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const result = await fetch(`${baseUrl}/projects`);
    if (!result.ok) throw new Error("Projecten ophalen mislukt");
    return (await result.json()) as Project[];
  } catch {
    return [];
  }
}

export async function createProject(input: {
  name: string;
  description: string;
  status: string;
  deadline: string;
}): Promise<Project> {
  try {
    const result = await fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!result.ok) throw new Error("Project aanmaken mislukt");
    return (await result.json()) as Project;
  } catch (error) {
    console.warn(
      "API niet beschikbaar, terugvallen op lokale projectdata.",
      error,
    );
    return toProject(
      createLocalProject({
        name: input.name,
        description: input.description,
        status: input.status,
        deadline: input.deadline,
      }),
    );
  }
}

export async function updateProject(
  projectId: string,
  input: {
    name: string;
    description: string;
    status: string;
    deadline: string;
  },
): Promise<Project> {
  try {
    const result = await fetch(`${baseUrl}/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!result.ok) throw new Error("Project bijwerken mislukt");
    return (await result.json()) as Project;
  } catch (error) {
    console.warn(
      "API niet beschikbaar, terugvallen op lokale projectdata.",
      error,
    );
    const existing = getLocalProjectById(projectId);
    saveLocalProject({
      ...existing,
      name: input.name,
      description: input.description,
      status: input.status,
      deadline: input.deadline,
    });
    return toProject(getLocalProjectById(projectId));
  }
}
