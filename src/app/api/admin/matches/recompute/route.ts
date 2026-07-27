import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { parseBody, ok, err, handleError } from "@/lib/api";
import { scoreJobsForCandidate, scoreCandidatesForJob } from "@/lib/ai-matching";

// POST /api/admin/matches/recompute
// Body: { type: "candidate" | "job", id: string }
// Allows admin to manually re-trigger scoring for one entity

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN")
      return err("Admin access required", 403);

    const body = (await parseBody(req)) as { type: "candidate" | "job"; id: string };

    if (!body || !body.id) {
      return err("Missing required parameter 'id'", 400);
    }

    if (body.type === "candidate") {
      scoreJobsForCandidate(body.id).catch(console.error);
      return ok({ message: "Scoring triggered for candidate. Results in ~30s." });
    }

    if (body.type === "job") {
      scoreCandidatesForJob(body.id).catch(console.error);
      return ok({ message: "Scoring triggered for job. Results in ~45s." });
    }

    return err("Invalid type. Expected 'candidate' or 'job'.", 400);
  } catch (e) {
    return handleError(e);
  }
}
