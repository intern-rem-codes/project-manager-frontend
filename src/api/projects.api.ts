import type { Project } from "../Interfaces/Project";
import { baseUrl } from "../utils/constants";
import { deleteData, getData, postData, putData } from "./helpers";

// FETCH SINGLE PROJECT
export async function fetchProject(
  projectId?: string | number,
): Promise<Project | undefined> {
  if (!projectId) {
    console.log("no project id provided");
    return undefined;
  }
  return await getData<Project>(`${baseUrl}/projects/${String(projectId)}`);
}

// FETCH ALL PROJECTS
export async function fetchProjects(): Promise<Project[]> {
  const projects = await getData<Project[]>(`${baseUrl}/projects`);

  if (projects === undefined) {
    return [];
  }

  return projects;
}

/// CREATE NEW PROJECT
export async function createProject(input: {
  name: string;
  description: string;
  status: string;
  deadline: string;
  clientId?: string | number;
}): Promise<Project | undefined> {
  return await postData(`${baseUrl}/projects`, input);
}

// UPDATE PROJECT
export async function updateProject(
  projectId: string | number,
  input: {
    name: string;
    description: string;
    status: string;
    deadline: string;
  },
): Promise<Project | undefined> {
  return await putData(`${baseUrl}/projects/${String(projectId)}`, input);
}

// DELETE PROJECT
export async function deleteProject(
  projectId: string | number,
): Promise<Project | undefined> {
  return await deleteData<Project>(`${baseUrl}/projects/${String(projectId)}`);
}
