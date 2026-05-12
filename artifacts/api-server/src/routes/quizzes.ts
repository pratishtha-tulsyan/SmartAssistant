import { Router } from "express";
import { db, quizzesTable, questionsTable, quizResultsTable, usersTable } from "@workspace/db";
import { eq, sql, avg, sum, count } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

router.get("/quizzes", requireAuth, async (req, res): Promise<void> => {
  const { category } = req.query;
  const quizzes = await db.select().from(quizzesTable).orderBy(quizzesTable.createdAt);

  const withCounts = await Promise.all(
    quizzes.map(async (q) => {
      const [result] = await db
        .select({ count: count() })
        .from(questionsTable)
        .where(eq(questionsTable.quizId, q.id));
      return {
        id: q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        questionCount: result?.count ?? 0,
        createdAt: q.createdAt,
      };
    })
  );

  const filtered = category ? withCounts.filter(q => q.category === category) : withCounts;
  res.json(filtered);
});

router.post("/quizzes", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user || !["teacher", "admin"].includes(user.role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { title, description, category } = req.body;
  if (!title || !description || !category) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [quiz] = await db.insert(quizzesTable).values({ title, description, category }).returning();
  res.status(201).json({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    questionCount: 0,
    createdAt: quiz.createdAt,
  });
});

router.get("/quizzes/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  const isAdmin = user && ["teacher", "admin"].includes(user.role);

  const questions = await db.select().from(questionsTable).where(eq(questionsTable.quizId, id));

  res.json({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    questionCount: questions.length,
    createdAt: quiz.createdAt,
    questions: questions.map(q => ({
      id: q.id,
      quizId: q.quizId,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: isAdmin ? q.correctAnswer : null,
    })),
  });
});

router.post("/quizzes/:id/submit", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const quizId = parseInt(raw, 10);

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, quizId));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const questions = await db.select().from(questionsTable).where(eq(questionsTable.quizId, quizId));
  const { answers } = req.body as { answers: { questionId: number; answer: string }[] };

  let score = 0;
  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.correctAnswer === answer.answer) {
      score++;
    }
  }

  const [result] = await db.insert(quizResultsTable).values({
    userId: user.id,
    quizId,
    score,
    totalQuestions: questions.length,
  }).returning();

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  res.json({
    id: result.id,
    userId: user.id,
    quizId,
    quizTitle: quiz.title,
    score,
    totalQuestions: questions.length,
    percentage,
    completedAt: result.completedAt,
  });
});

router.post("/quizzes/:id/questions", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user || !["teacher", "admin"].includes(user.role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const quizId = parseInt(raw, 10);

  const { questionText, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
  if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [question] = await db.insert(questionsTable).values({
    quizId,
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
  }).returning();

  res.status(201).json({
    id: question.id,
    quizId: question.quizId,
    questionText: question.questionText,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    correctAnswer: question.correctAnswer,
  });
});

export default router;
