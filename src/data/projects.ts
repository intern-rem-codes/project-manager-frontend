export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  deadline: string | null;
  client_id: string;
  created_at: string;
  updated_at: string;
}

export type MockProject = {
  id: string;
  name: string;
  description: string;
  status: string;
  deadline: string;
  createdAt: string;
};

const STORAGE_KEY = "projects";

const defaultProjects: Record<string, MockProject> = {
  "1": {
    id: "1",
    name: "Demo-project",
    description: "Dit is een demo project voor jouw project manager.",
    status: "In uitvoering",
    deadline: "2026-03-31",
    createdAt: "2026-03-09",
  },
};

function loadProjects(): Record<string, MockProject> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultProjects;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, MockProject>;
    return { ...defaultProjects, ...parsed };
  } catch {
    return defaultProjects;
  }
}

export function getProjectById(id: string): MockProject {
  const projects = loadProjects();
  return projects[id] ?? defaultProjects["1"];
}

export function listProjects(): MockProject[] {
  const projects = loadProjects();
  return Object.values(projects).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export function saveProject(project: MockProject): void {
  const projects = loadProjects();
  projects[project.id] = project;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(input: Omit<MockProject, "id" | "createdAt">) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now());
  const createdAt = new Date().toISOString().slice(0, 10);

  const project: MockProject = {
    id,
    createdAt,
    ...input,
  };

  saveProject(project);
  return project;
}
