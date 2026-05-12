import { Router } from "express";
import { db, emergencyContactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth";

const router = Router();

router.get("/emergency-contacts", requireAuth, async (req, res): Promise<void> => {
  const { city } = req.query;
  const contacts = await db.select().from(emergencyContactsTable).orderBy(emergencyContactsTable.department);
  const filtered = city ? contacts.filter(c => c.city.toLowerCase() === (city as string).toLowerCase()) : contacts;
  res.json(filtered.map(c => ({
    id: c.id,
    department: c.department,
    contactNumber: c.contactNumber,
    city: c.city,
    contactType: c.contactType,
  })));
});

router.post("/emergency-contacts", requireRole("admin"), async (req, res): Promise<void> => {
  const { department, contactNumber, city, contactType } = req.body;
  if (!department || !contactNumber || !city || !contactType) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [contact] = await db.insert(emergencyContactsTable).values({
    department,
    contactNumber,
    city,
    contactType,
  }).returning();

  res.status(201).json({
    id: contact.id,
    department: contact.department,
    contactNumber: contact.contactNumber,
    city: contact.city,
    contactType: contact.contactType,
  });
});

export default router;
