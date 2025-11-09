import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import {
  createSupabaseUserAndEmployee,
  authenticateWithSupabase,
  supabase,
} from "../utils/supabaseAuth.js";

const router = express.Router();
const prisma = new PrismaClient();

// ---------- SIGNUP ----------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const { supabaseUser, employee, roleAssigned } = await createSupabaseUserAndEmployee({
      name,
      email,
      password,
      role: "EMPLOYEE",
    });

    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) console.error("Supabase sign-in error:", sessionError);

    const token = jwt.sign(
      {
        id: employee.id,
        role: employee.role,
        supabaseUserId: employee.supabase_user_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      supabaseToken: sessionData?.session?.access_token || null,
      user: {
        id: employee.id,
        email: employee.email,
        role: employee.role,
        name: employee.name,
        supabaseUserId: employee.supabase_user_id,
      },
      roleAssigned,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
});

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    // 1️⃣ Try Supabase authentication first
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data?.user) {
      // User successfully authenticated via Supabase
      const supabase_user_id = data.user.id;

      // Try to find linked Employee record
      const employee = await prisma.employee.findFirst({
        where: { supabase_user_id },
      });

      if (!employee) {
        return res.status(404).json({
          error: "Employee record not found for Supabase user",
          details: "Make sure signup created a matching Employee record.",
        });
      }

      // Generate backend JWT for internal protected routes
      const jwtToken = jwt.sign(
        {
          id: employee.id,
          role: employee.role,
          supabaseUserId: supabase_user_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        success: true,
        token: jwtToken,
        supabaseToken: data.session.access_token,
        user: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          supabaseUserId: supabase_user_id,
        },
      });
    }

    // 2️⃣ Fallback: Legacy user (bcrypt check)
    const employee = await prisma.employee.findFirst({
      where: { email },
    });

    if (!employee)
      return res.status(401).json({ error: "Invalid credentials." });

    if (!employee.password) {
      return res.status(401).json({
        error: "Please log in using Supabase authentication.",
        hint: "This account is linked with Supabase, not legacy bcrypt.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, employee.password);
    if (!passwordMatch)
      return res.status(401).json({ error: "Invalid credentials." });

    const jwtToken = jwt.sign(
      { id: employee.id, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: employee.id,
        email: employee.email,
        role: employee.role,
        name: employee.name,
      },
      legacy: true,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({
      error: "Login failed",
      details: err.message,
    });
  }
});

export default router;