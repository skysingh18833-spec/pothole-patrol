import { Router, type IRouter } from "express";
import { eq, sql, desc, gte } from "drizzle-orm";
import { db, reportsTable } from "@workspace/db";
import {
  ListReportsQueryParams,
  CreateReportBody,
  GetReportParams,
  DeleteReportParams,
  CreateReportResponse,
  GetReportResponse,
  ListReportsResponse,
  GetReportStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reports/stats", async (_req, res): Promise<void> => {
  const total = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reportsTable);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reportsTable)
    .where(gte(reportsTable.createdAt, sevenDaysAgo));

  const byType = await db
    .select({
      key: reportsTable.damageType,
      count: sql<number>`count(*)::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.damageType)
    .orderBy(desc(sql`count(*)`));

  const bySeverity = await db
    .select({
      key: reportsTable.severity,
      count: sql<number>`count(*)::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.severity)
    .orderBy(desc(sql`count(*)`));

  const byStatus = await db
    .select({
      key: reportsTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(reportsTable)
    .groupBy(reportsTable.status)
    .orderBy(desc(sql`count(*)`));

  const stats = {
    total: total[0]?.count ?? 0,
    recentCount: recent[0]?.count ?? 0,
    byType: byType.map((r) => ({ key: r.key, count: r.count })),
    bySeverity: bySeverity.map((r) => ({ key: r.key, count: r.count })),
    byStatus: byStatus.map((r) => ({ key: r.key, count: r.count })),
  };

  res.json(GetReportStatsResponse.parse(stats));
});

router.get("/reports", async (req, res): Promise<void> => {
  const parsed = ListReportsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { damageType, severity, limit = 50, offset = 0 } = parsed.data;

  let query = db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt))
    .$dynamic();

  if (damageType) {
    query = query.where(eq(reportsTable.damageType, damageType));
  }
  if (severity) {
    query = query.where(eq(reportsTable.severity, severity));
  }

  const reports = await query.limit(limit ?? 50).offset(offset ?? 0);
  res.json(ListReportsResponse.parse(reports));
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [report] = await db
    .insert(reportsTable)
    .values({
      damageType: parsed.data.damageType,
      severity: parsed.data.severity,
      description: parsed.data.description ?? null,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      address: parsed.data.address ?? null,
      photoBase64: parsed.data.photoBase64 ?? null,
      status: "pending",
    })
    .returning();

  res.status(201).json(CreateReportResponse.parse(report));
});

router.get("/reports/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetReportParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid report ID" });
    return;
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, params.data.id));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(GetReportResponse.parse(report));
});

router.delete("/reports/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteReportParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid report ID" });
    return;
  }

  const [deleted] = await db
    .delete(reportsTable)
    .where(eq(reportsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
