"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createAuditSchema = z.object({
  storeId: z.string().min(1, "Store is required"),
  templateId: z.string().min(1, "Template is required"),
});

export async function getAuditTemplates() {
  const templates = await prisma.auditTemplate.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return templates;
}

export async function getStoresForAudits() {
  const stores = await prisma.store.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return stores;
}

export async function createAuditDraft(formDataOrObject: FormData | { storeId: string; templateId: string }) {
  const user = await requireRole(["ADMIN", "OFFICER"]);

  const data = formDataOrObject instanceof FormData 
    ? {
        storeId: formDataOrObject.get("storeId") as string,
        templateId: formDataOrObject.get("templateId") as string,
      }
    : formDataOrObject;

  const validated = createAuditSchema.parse(data);

  const audit = await prisma.audit.create({
    data: {
      storeId: validated.storeId,
      templateId: validated.templateId,
      conductedById: user.id,
      status: "DRAFT",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/audits");

  return { success: true, auditId: audit.id };
}

export async function getAuditById(id: string) {
  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      store: true,
      template: true,
      conductedBy: true,
    },
  });
  return audit;
}

export async function submitAudit(auditId: string) {
  const user = await requireRole(["ADMIN", "OFFICER"]);

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
  });

  if (!audit) {
    throw new Error("Audit not found");
  }

  if (audit.conductedById !== user.id) {
    throw new Error("Forbidden: You can only submit your own audits");
  }

  if (audit.status !== "DRAFT") {
    throw new Error("Only draft audits can be submitted");
  }

  await prisma.audit.update({
    where: { id: auditId },
    data: { status: "SUBMITTED" },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/audits/${auditId}`);

  return { success: true };
}
