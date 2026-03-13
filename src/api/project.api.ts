import type { Project } from "../Interfaces/Project";
import {
  createProject as createLocalProject,
  getProjectById as getLocalProjectById,
  listProjects as listLocalProjects,
  saveProject as saveLocalProject,
  type MockProject,
} from "../data/projects";

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
    const result = await fetch(`/api/projects/${projectId}`);
    if (!result.ok) throw new Error("Failed to fetch project details");
    return (await result.json()) as Project;
  } catch (error) {
    console.warn("API unavailable, falling back to local project data.", error);
    return toProject(getLocalProjectById(projectId));
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const result = await fetch(`/api/projects`);
    if (!result.ok) throw new Error("Failed to fetch projects");
    return (await result.json()) as Project[];
  } catch (error) {
    console.warn("API unavailable, falling back to local project data.", error);
    return listLocalProjects().map(toProject);
  }
}

export async function createProject(input: {
  name: string;
  description: string;
  status: string;
  deadline: string;
}): Promise<Project> {
  try {
    const result = await fetch(`/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!result.ok) throw new Error("Failed to create project");
    return (await result.json()) as Project;
  } catch (error) {
    console.warn("API unavailable, falling back to local project data.", error);
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
    const result = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!result.ok) throw new Error("Failed to update project");
    return (await result.json()) as Project;
  } catch (error) {
    console.warn("API unavailable, falling back to local project data.", error);
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
