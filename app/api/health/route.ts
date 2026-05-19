export const dynamic = "force-static";

export function GET() {
  return Response.json({
    ok: true,
    service: "vpinnacle-dashboard",
    ts: new Date().toISOString(),
  });
}
