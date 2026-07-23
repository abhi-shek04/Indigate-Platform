/**
 * Liveness probe — confirms the Node.js process is running and can serve HTTP.
 * Lightweight: no DB call, no external dependencies.
 * Use for Kubernetes liveness / load-balancer health checks.
 */
export async function GET() {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
