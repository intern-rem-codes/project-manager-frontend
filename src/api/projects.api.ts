import type { Project } from "../Interfaces/Project";
import { baseUrl } from "../utils/constants";
import { getData, postData, putData } from "./helpers";

// FETCH SINGLE PROJECT
export async function fetchProject(
  projectId?: string,
): Promise<Project | undefined> {
  if (!projectId) {
    console.log("no project id provided");
    return undefined;
  }
  return await getData<Project>(`${baseUrl}/projects/${projectId}`);
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
}): Promise<Project | undefined> {
  return await postData(`${baseUrl}/projects`, input);
}

// UPDATE PROJECT
export async function updateProject(
  projectId: string,
  input: {
    name: string;
    description: string;
    status: string;
    deadline: string;
  },
): Promise<Project | undefined> {
  return await putData(`${baseUrl}/projects/${projectId}`, input);
}
