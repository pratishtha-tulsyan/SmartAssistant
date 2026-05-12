import { Router } from "express";
import { db, incidentsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/incidents", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));

  if (!user) {
    res.json([]);
    return;
  }

  const incidents = user.role === "admin"
    ? await db.select().from(incidentsTable).orderBy(desc(incidentsTable.createdAt))
    : await db.select().from(incidentsTable)
        .where(eq(incidentsTable.userId, user.id))
        .orderBy(desc(incidentsTable.createdAt));

  const userIds = [...new Set(incidents.map(i => i.userId))];
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(incidents.map(i => ({
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
  })));
});

router.post("/incidents", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const { title, description, location, incidentType, imageUrl } = req.body;
  if (!title || !description || !location || !incidentType) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [incident] = await db.insert(incidentsTable).values({
    userId: user.id,
    title,
    description,
    location,
    incidentType,
    imageUrl: imageUrl ?? null,
    status: "pending",
  }).returning();

  res.status(201).json({
    id: incident.id,
    userId: incident.userId,
    userName: user.name,
    title: incident.title,
    description: incident.description,
    location: incident.location,
    incidentType: incident.incidentType,
    status: incident.status,
    imageUrl: incident.imageUrl,
    createdAt: incident.createdAt,
  });
});

router.patch("/incidents/:id/status", requireAuth, async (req, res): Promise<void> => {
  const clerkId = (req as any).clerkId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { status } = req.body;

  const [incident] = await db.update(incidentsTable)
    .set({ status })
    .where(eq(incidentsTable.id, id))
    .returning();

  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }

  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map(u => [u.id, u]));

  res.json({
    id: incident.id,
    userId: incident.userId,
    userName: userMap.get(incident.userId)?.name ?? "Unknown",
    title: incident.title,
    description: incident.description,
    location: incident.location,
    incidentType: incident.incidentType,
    status: incident.status,
    imageUrl: incident.imageUrl,
    createdAt: incident.createdAt,
  });
});

export default router;
