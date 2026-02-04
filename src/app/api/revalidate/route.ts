import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const body = await req.json().catch(() => ({}));

  if (!secret || body?.secret !== secret) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  const paths: string[] = Array.isArray(body?.paths) ? body.paths : ["/"];

  paths.forEach((p) => {
    if (typeof p === "string" && p.trim()) {
      revalidatePath(p);
    }
  });

  return NextResponse.json({ ok: true, revalidated: paths });
}
