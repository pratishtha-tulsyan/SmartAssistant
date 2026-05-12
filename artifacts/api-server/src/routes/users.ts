import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, getOrCreateUser } from "../lib/auth";

const router = Router();

router.get("/users/me", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const auth = getAuth(req);

  const email = (auth as any)?.sessionClaims?.email ?? "";
  const name = (auth as any)?.sessionClaims?.name ?? (auth as any)?.sessionClaims?.firstName ?? "User";

  const user = await getOrCreateUser(clerkId, email as string, name as string);
  res.json({
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

router.patch("/users/me", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const { name } = req.body;

  const [user] = await db.update(usersTable)
    .set({ name })
    .where(eq(usersTable.clerkId, clerkId))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

router.get("/users", requireRole("admin"), async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users.map(u => ({
    id: u.id,
    clerkId: u.clerkId,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  })));
});

router.patch("/users/:id/role", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { role } = req.body;

  if (!["student", "teacher", "admin"].includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  const [user] = await db.update(usersTable)
    .set({ role })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

export default router;
