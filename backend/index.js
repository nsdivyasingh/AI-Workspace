import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import prRoutes from "./routes/pr.js";
import githubWebhookRouter from "./webhook.js";
import { createPR } from "./createPR.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/pr", prRoutes);
app.use("/webhooks", githubWebhookRouter);

const prisma = new PrismaClient();

// ✅ Employees
app.get("/employees", async (req, res) => {
  const employees = await prisma.employee.findMany();
  res.json(employees);
});

app.post("/employees", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const employee = await prisma.employee.create({
      data: { name, email, role },
    });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Projects
app.get("/projects", async (req, res) => {
  const projects = await prisma.project.findMany();
  res.json(projects);
});

app.post("/projects", async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: { name, description },
    });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Tasks
app.get("/tasks", async (req, res) => {
  const tasks = await prisma.task.findMany({
    include: { project: true, employee: true },
  });
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  try {
    const { title, description, status, projectId, assignedTo } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        project: { connect: { id: projectId } },
        employee: assignedTo ? { connect: { id: assignedTo } } : undefined,
      },
    });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tasks for a specific project
app.get('/projects/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(id) },
      include: {
        project: true,
        employee: true,
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks for project' });
  }
});

// Update task details (PATCH)
app.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignedTo } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        status,
        assignedTo,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.post("/tasks/:id/raise-pr", async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { branchName } = req.body; // branch containing code

  try {
    const pr = await createPR(taskId, branchName);
    // Optionally, store PR URL in DB
    await prisma.pr.create({
      data: {
        url: pr.html_url,
        taskId: taskId,
        authorId: 1, // example, replace with logged-in employee ID
      },
    });
    res.json({ message: "PR created", pr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create PR" });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
