import express from "express";
import { readProjects, writeProjects } from "../storage/projectsStore.js";
import { createProject, updateProject } from "../storage/projectsModel.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const projects = await readProjects();
  res.json(projects);
});

router.get("/:id", async (req, res) => {
  const projects = await readProjects();
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.json(project);
});

router.post("/", async (req, res) => {
  const { name, description, status, deadline } = req.body ?? {};
  if (!name || !description || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const projects = await readProjects();
  const project = createProject({
    name,
    description,
    status,
    deadline: deadline ? deadline : null,
  });
  projects.push(project);
  await writeProjects(projects);

  res.status(201).json(project);
});

router.put("/:id", async (req, res) => {
  const { name, description, status, deadline } = req.body ?? {};

  const projects = await readProjects();
  const index = projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Project not found" });
  }

  const updated = updateProject(projects[index], {
    name,
    description,
    status,
    deadline: deadline === "" ? null : deadline,
  });
  projects[index] = updated;
  await writeProjects(projects);

  res.json(updated);
});

export default router;
