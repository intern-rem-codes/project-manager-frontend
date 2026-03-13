function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function createProject({ name, description, status, deadline }) {
  const now = new Date().toISOString();
  const createdAt = todayIsoDate();
  return {
    id: crypto.randomUUID(),
    name,
    description,
    status,
    deadline: deadline ?? null,
    createdAt,
    updatedAt: now,
  };
}

export function updateProject(project, patch) {
  return {
    ...project,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.description !== undefined ? { description: patch.description } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.deadline !== undefined ? { deadline: patch.deadline } : {}),
    updatedAt: new Date().toISOString(),
  };
}

