import { Router } from "express";
import { db, quizResultsTable, quizzesTable, usersTable } from "@workspace/db";
import { eq, desc, sum, count, avg } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/quiz-results", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user) {
    res.json([]);
    return;
  }

  const results = await db.select().from(quizResultsTable)
    .where(eq(quizResultsTable.userId, user.id))
    .orderBy(desc(quizResultsTable.completedAt));

  const enriched = await Promise.all(results.map(async (r) => {
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, r.quizId));
    const percentage = r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0;
    return {
      id: r.id,
      userId: r.userId,
      quizId: r.quizId,
      quizTitle: quiz?.title ?? "Unknown Quiz",
      score: r.score,
      totalQuestions: r.totalQuestions,
      percentage,
      completedAt: r.completedAt,
    };
  }));

  res.json(enriched);
});

router.get("/quiz-results/leaderboard", requireAuth, async (_req, res): Promise<void> => {
  const allResults = await db.select().from(quizResultsTable);
  const allUsers = await db.select().from(usersTable);

  const userMap = new Map(allUsers.map(u => [u.id, u]));

  const byUser = new Map<number, { totalScore: number; totalQuestions: number; count: number }>();
  for (const r of allResults) {
    const existing = byUser.get(r.userId) ?? { totalScore: 0, totalQuestions: 0, count: 0 };
    byUser.set(r.userId, {
      totalScore: existing.totalScore + r.score,
      totalQuestions: existing.totalQuestions + r.totalQuestions,
      count: existing.count + 1,
    });
  }

  const leaderboard = Array.from(byUser.entries()).map(([userId, stats]) => {
    const user = userMap.get(userId);
    const averagePercentage = stats.totalQuestions > 0
      ? Math.round((stats.totalScore / stats.totalQuestions) * 100)
      : 0;
    return {
      userId,
      userName: user?.name ?? "Unknown",
      totalScore: stats.totalScore,
      quizzesCompleted: stats.count,
      averagePercentage,
    };
  }).sort((a, b) => b.totalScore - a.totalScore);

  res.json(leaderboard);
});

export default router;
