import { Router } from "express";
import { db, alertsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

router.get("/alerts", requireAuth, async (_req, res): Promise<void> => {
  const alerts = await db.select().from(alertsTable)
    .where(eq(alertsTable.isActive, true))
    .orderBy(desc(alertsTable.createdAt));
  res.json(alerts.map(a => ({
    id: a.id,
    title: a.title,
    message: a.message,
    alertType: a.alertType,
    isActive: a.isActive,
    createdAt: a.createdAt,
  })));
});

router.post("/alerts", requireRole("admin"), async (req, res): Promise<void> => {
  const { title, message, alertType } = req.body;
  if (!title || !message || !alertType) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [alert] = await db.insert(alertsTable).values({
    title,
    message,
    alertType,
    isActive: true,
  }).returning();

  res.status(201).json({
    id: alert.id,
    title: alert.title,
    message: alert.message,
    alertType: alert.alertType,
    isActive: alert.isActive,
    createdAt: alert.createdAt,
  });
});

router.delete("/alerts/:id", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [alert] = await db.delete(alertsTable).where(eq(alertsTable.id, id)).returning();
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
