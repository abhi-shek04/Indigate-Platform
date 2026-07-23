import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  parseBody,
  ok,
  err,
  handleError,
  toJobDTO,
  toApplicationDTO,
  toCompanyDTO,
  toCandidateDTO,
  csvEscape,
} from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    const { resource } = await params;
    const session = await getSession();
    if (!session || session.role !== "ADMIN")
      return err("Admin access required.", 403);

    const { searchParams } = new URL(req.url);
    const exportCsv = searchParams.get("export") === "csv";

    if (resource === "candidates") {
      const rows = await db.candidateProfile.findMany({
        include: { user: { select: { email: true, isVerified: true } } },
        orderBy: { createdAt: "desc" },
      });
      const items = rows.map((c) => ({
        ...toCandidateDTO(c),
        email: c.user.email,
        userVerified: c.user.isVerified,
      }));
      if (exportCsv) {
        const header = [
          "Name",
          "Email",
          "Location",
          "JLPT",
          "Experience",
          "Skills",
        ];
        const lines = items.map((i) =>
          [
            csvEscape(i.fullName),
            csvEscape(i.email),
            csvEscape(i.location),
            csvEscape(i.jlptLevel),
            csvEscape(i.experienceYears + " yrs"),
            csvEscape(i.skills.join(", ")),
          ].join(","),
        );
        return new Response([header.join(","), ...lines].join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="indigate-candidates.csv"`,
          },
        });
      }
      return ok({ items });
    }

    if (resource === "companies") {
      const rows = await db.companyProfile.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      });
      const items = rows.map((c) => ({
        ...toCompanyDTO(c),
        email: c.user.email,
      }));
      if (exportCsv) {
        const header = ["Company", "Email", "Industry", "Location", "Approved"];
        const lines = items.map((i) =>
          [
            csvEscape(i.companyName),
            csvEscape(i.email),
            csvEscape(i.industry),
            csvEscape(i.locationJapan),
            csvEscape(i.isApproved ? "Yes" : "No"),
          ].join(","),
        );
        return new Response([header.join(","), ...lines].join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="indigate-companies.csv"`,
          },
        });
      }
      return ok({ items });
    }

    if (resource === "jobs") {
      const rows = await db.job.findMany({
        include: { company: true, applications: { select: { id: true } } },
        orderBy: { postedAt: "desc" },
      });
      const items = rows.map((j) => toJobDTO(j, j.applications.length));
      if (exportCsv) {
        const header = [
          "Title",
          "Company",
          "Location",
          "Type",
          "JLPT",
          "Applications",
          "Active",
        ];
        const lines = items.map((i) =>
          [
            csvEscape(i.title),
            csvEscape(i.company.companyName),
            csvEscape(i.location),
            csvEscape(i.jobType),
            csvEscape(i.jlptRequired),
            csvEscape(i.applicationCount ?? 0),
            csvEscape(i.isActive ? "Yes" : "No"),
          ].join(","),
        );
        return new Response([header.join(","), ...lines].join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="indigate-jobs.csv"`,
          },
        });
      }
      return ok({ items });
    }

    if (resource === "applications") {
      const rows = await db.application.findMany({
        include: {
          job: { include: { company: true } },
          candidate: true,
        },
        orderBy: { appliedAt: "desc" },
        take: 300,
      });
      const items = rows.map(toApplicationDTO);
      if (exportCsv) {
        const header = [
          "Candidate",
          "Email",
          "Job",
          "Company",
          "Status",
          "Applied",
        ];
        const lines = items.map((i) =>
          [
            csvEscape(i.candidate?.fullName ?? ""),
            csvEscape(""),
            csvEscape(i.job?.title ?? ""),
            csvEscape(i.job?.company.companyName ?? ""),
            csvEscape(i.status),
            csvEscape(new Date(i.appliedAt).toLocaleDateString()),
          ].join(","),
        );
        return new Response([header.join(","), ...lines].join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="indigate-applications.csv"`,
          },
        });
      }
      return ok({ items });
    }

    if (resource === "testimonials") {
      const rows = await db.testimonial.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });
      return ok({ items: rows });
    }

    if (resource === "contacts") {
      const rows = await db.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true } } },
      });
      const items = rows.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        subject: c.subject,
        message: c.message,
        userId: c.userId,
        createdAt: c.createdAt.toISOString(),
      }));
      if (exportCsv) {
        const header = ["Name", "Email", "Subject", "Message", "Date"];
        const lines = items.map((i) =>
          [
            csvEscape(i.name),
            csvEscape(i.email),
            csvEscape(i.subject ?? ""),
            csvEscape(i.message),
            csvEscape(new Date(i.createdAt).toLocaleDateString()),
          ].join(","),
        );
        return new Response([header.join(","), ...lines].join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="indigate-contacts.csv"`,
          },
        });
      }
      return ok({ items });
    }

    return err("Unknown resource.", 404);
  } catch (e) {
    return handleError(e);
  }
}

// Toggle testimonial active
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    const { resource } = await params;
    const session = await getSession();
    if (!session || session.role !== "ADMIN")
      return err("Admin access required.", 403);

    const body = await parseBody<{ id?: string }>(req);
    if (resource === "testimonials" && body?.id) {
      const t = await db.testimonial.findUnique({ where: { id: body.id } });
      if (!t) return err("Not found.", 404);
      const updated = await db.testimonial.update({
        where: { id: body.id },
        data: { isActive: !t.isActive },
      });
      return ok(updated);
    }
    return err("Unsupported operation.", 400);
  } catch (e) {
    return handleError(e);
  }
}
