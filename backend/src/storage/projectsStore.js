import fs from "node:fs/promises";
import path from "node:path";

const dataDir = path.resolve("backend/data");
const dataFile = path.join(dataDir, "projects.json");

async function ensureSeed() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    const seed = [
      {
        id: "1",
        name: "Demo Project",
        description: "Dit is een demo project voor jouw project manager.",
        status: "In uitvoering",
        deadline: "2026-03-31",
        createdAt: "2026-03-09",
        updatedAt: "2026-03-09T00:00:00.000Z",
      },
    ];
    await fs.writeFile(dataFile, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export async function readProjects() {
  await ensureSeed();
  const raw = await fs.readFile(dataFile, "utf-8");
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

export async function writeProjects(projects) {
  await ensureSeed();
  await fs.writeFile(dataFile, JSON.stringify(projects, null, 2), "utf-8");
}

