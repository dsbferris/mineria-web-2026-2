import { jsonOk } from "@/lib/api/rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return jsonOk({
    status: "ok",
    service: "tienda-virtual-api",
    time: new Date().toISOString(),
  });
}
