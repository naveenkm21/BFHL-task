import { IDENTITY } from "./identity";
import { processEdges } from "./bfhl";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    const url = new URL(req.url);

    if (url.pathname === "/bfhl" && req.method === "POST") {
      let body: any;
      try { body = await req.json(); }
      catch { return json({ error: "Invalid JSON body" }, 400); }

      const result = processEdges(body?.data);
      return json({ ...IDENTITY, ...result });
    }

    if (url.pathname === "/" || url.pathname === "/bfhl") {
      return json({ ok: true, endpoint: "POST /bfhl" });
    }

    return json({ error: "Not found" }, 404);
  },
};
