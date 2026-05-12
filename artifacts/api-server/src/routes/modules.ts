import { Router } from "express";
import { db, modulesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/modules", requireAuth, async (req, res): Promise<void> => {
  const { category } = req.query;
  let query = db.select().from(modulesTable);
  const modules = await query.orderBy(modulesTable.createdAt);
  const filtered = category ? modules.filter(m => m.category === category) : modules;
  res.json(filtered.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    category: m.category,
    contentUrl: m.contentUrl,
    contentType: m.contentType,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
  })));
});

router.post("/modules", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user || !["teacher", "admin"].includes(user.role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { title, description, category, contentUrl, contentType } = req.body;
  if (!title || !description || !category || !contentType) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [mod] = await db.insert(modulesTable).values({
    title,
    description,
    category,
    contentUrl: contentUrl ?? null,
    contentType,
    createdBy: user.id,
  }).returning();

  res.status(201).json({
    id: mod.id,
    title: mod.title,
    description: mod.description,
    category: mod.category,
    contentUrl: mod.contentUrl,
    contentType: mod.contentType,
    createdBy: mod.createdBy,
    createdAt: mod.createdAt,
  });
});

router.get("/modules/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [mod] = await db.select().from(modulesTable).where(eq(modulesTable.id, id));
  if (!mod) {
    res.status(404).json({ error: "Module not found" });
    return;
  }
  res.json({
    id: mod.id,
    title: mod.title,
    description: mod.description,
    category: mod.category,
    contentUrl: mod.contentUrl,
    contentType: mod.contentType,
    createdBy: mod.createdBy,
    createdAt: mod.createdAt,
  });
});

router.patch("/modules/:id", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user || !["teacher", "admin"].includes(user.role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { title, description, category, contentUrl, contentType } = req.body;

  const [mod] = await db.update(modulesTable)
    .set({ title, description, category, contentUrl, contentType })
    .where(eq(modulesTable.id, id))
    .returning();

  if (!mod) {
    res.status(404).json({ error: "Module not found" });
    return;
  }

  res.json({
    id: mod.id,
    title: mod.title,
    description: mod.description,
    category: mod.category,
    contentUrl: mod.contentUrl,
    contentType: mod.contentType,
    createdBy: mod.createdBy,
    createdAt: mod.createdAt,
  });
});

router.delete("/modules/:id", requireRole("teacher", "admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [mod] = await db.delete(modulesTable).where(eq(modulesTable.id, id)).returning();
  if (!mod) {
    res.status(404).json({ error: "Module not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
