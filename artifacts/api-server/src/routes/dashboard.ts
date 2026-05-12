import { Router } from "express";
import { db, usersTable, modulesTable, quizzesTable, quizResultsTable, alertsTable, incidentsTable } from "@workspace/db";
import { eq, count, and, gte, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const allUsers = await db.select().from(usersTable);
  const totalUsers = allUsers.length;
  const totalStudents = allUsers.filter(u => u.role === "student").length;
  const totalTeachers = allUsers.filter(u => u.role === "teacher").length;

  const [{ value: activeAlertsCount }] = await db
    .select({ value: count() })
    .from(alertsTable)
    .where(eq(alertsTable.isActive, true));

  const allIncidents = await db.select().from(incidentsTable);
  const openIncidents = allIncidents.filter(i => i.status === "pending" || i.status === "investigating").length;

  const [{ value: totalModulesCount }] = await db.select({ value: count() }).from(modulesTable);
  const [{ value: totalQuizzesCount }] = await db.select({ value: count() }).from(quizzesTable);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const allResults = await db.select().from(quizResultsTable);
  const quizzesCompletedThisMonth = allResults.filter(r => r.completedAt >= startOfMonth).length;

  const incidentTypes = ["fire", "flood", "building_collapse", "medical_emergency", "earthquake", "other"];
  const incidentsByType = incidentTypes.map(type => ({
    category: type,
    count: allIncidents.filter(i => i.incidentType === type).length,
  }));

  const allModules = await db.select().from(modulesTable);
  const moduleCategories = ["earthquake", "flood", "fire", "cyclone", "pandemic", "landslide", "heatwave"];
  const modulesByCategory = moduleCategories.map(cat => ({
    category: cat,
    count: allModules.filter(m => m.category === cat).length,
  }));

  const recentIncidentsRaw = await db.select().from(incidentsTable).orderBy(desc(incidentsTable.createdAt)).limit(5);
  const userMap = new Map(allUsers.map(u => [u.id, u]));
  const recentIncidents = recentIncidentsRaw.map(i => ({
    id: i.id,
    userId: i.userId,
    userName: userMap.get(i.userId)?.name ?? "Unknown",
    title: i.title,
    description: i.description,
    location: i.location,
    incidentType: i.incidentType,
    status: i.status,
    imageUrl: i.imageUrl,
    createdAt: i.createdAt,
  }));

  res.json({
    totalUsers,
    totalStudents,
    totalTeachers,
    activeAlerts: activeAlertsCount,
    openIncidents,
    totalModules: totalModulesCount,
    totalQuizzes: totalQuizzesCount,
    quizzesCompletedThisMonth,
    incidentsByType,
    modulesByCategory,
    recentIncidents,
  });
});

router.get("/dashboard/student-stats", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const results = await db.select().from(quizResultsTable)
    .where(eq(quizResultsTable.userId, user.id))
    .orderBy(desc(quizResultsTable.completedAt));

  const quizzesWithNames = await db.select().from(quizzesTable);
  const quizMap = new Map(quizzesWithNames.map(q => [q.id, q]));

  const quizzesTaken = results.length;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const averageScore = quizzesTaken > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const bestScore = quizzesTaken > 0 ? Math.max(...results.map(r => r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0)) : 0;

  const [{ value: activeAlertsCount }] = await db
    .select({ value: count() })
    .from(alertsTable)
    .where(eq(alertsTable.isActive, true));

  const recentResults = results.slice(0, 5).map(r => ({
    id: r.id,
    userId: r.userId,
    quizId: r.quizId,
    quizTitle: quizMap.get(r.quizId)?.title ?? "Unknown Quiz",
    score: r.score,
    totalQuestions: r.totalQuestions,
    percentage: r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0,
    completedAt: r.completedAt,
  }));

  res.json({
    modulesCompleted: 0,
    quizzesTaken,
    averageScore,
    bestScore,
    totalPoints: totalScore,
    recentResults,
    activeAlerts: activeAlertsCount,
  });
});

export default router;
