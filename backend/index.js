import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import jwt from "jsonwebtoken";

// Route imports
import authRoutes from "./routes/auth.js";
import prRoutes from "./routes/pr.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/tasks.js";
import githubWebhookRouter from "./webhook.js";

// Middleware imports
import { protect, restrictTo } from "./middleware/auth.js";

// Utils
import { logSupabaseConfig } from "./utils/checkSupabaseConfig.js";
import { createPR } from "./createPR.js";

dotenv.config();

// ========================================
//  INITIAL SETUP
// ========================================
logSupabaseConfig();

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// ========================================
//  ROUTES SETUP
// ========================================

// 1️⃣ Authentication routes (new)
app.use("/api/auth", authRoutes);

// 2️⃣ Third-party / PR routes
app.use("/pr", prRoutes);
app.use("/webhooks", githubWebhookRouter);

// 3️⃣ RBAC-protected routes
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// 4️⃣ Legacy protected endpoints
app.get("/employees", protect, async (req, res) => {
  const employees = await prisma.employee.findMany();
  res.json(employees);
});

app.post("/employees", protect, restrictTo("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const validRoles = ["ADMIN", "MANAGER", "EMPLOYEE", "INTERN"];
    const employeeRole = validRoles.includes(role) ? role : "EMPLOYEE";

    const { employee, roleAssigned } = await createSupabaseUserAndEmployee({
      name,
      email,
      password,
      role: employeeRole,
    });

    res.status(201).json({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      supabaseUserId: employee.supabase_user_id,
      roleAssigned,
    });
  } catch (err) {
    console.error("Employee creation error:", err);
    res.status(500).json({ error: "Failed to create employee." });
  }
});

// 5️⃣ PR creation
app.post("/tasks/:id/raise-pr", protect, async (req, res) => {
  const taskId = parseInt(req.params.id);
  const authorId = req.user?.id || 1;
  const { branchName } = req.body;

  try {
    const pr = await createPR(taskId, branchName);
    await prisma.pr.create({
      data: { url: pr.html_url, taskId, authorId },
    });
    res.json({ message: "PR created", pr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create PR" });
  }
});

// ========================================
//  SERVER START
// ========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
