import { Resend } from "resend";

export const runtime = "nodejs"; // keep it simple and compatible

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const { name, email, message, company, sourcePath } = await req.json();

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim();
    const cleanMsg = String(message || "").trim();
    const cleanSource = String(sourcePath || "").trim();

    if (!cleanEmail) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }
// If honeypot is filled, pretend success but do nothing.
if (typeof company === "string" && company.trim().length > 0) {
  return Response.json({ ok: true });
}

    // Basic anti-spam: reject absurdly long payloads
    if (cleanMsg.length > 5000 || cleanName.length > 200 || cleanEmail.length > 320) {
      return Response.json({ error: "Payload too large" }, { status: 400 });
    }

    await resend.emails.send({
      from: "Veronica Engelage <leads@veronicachs.com>",
      to: ["veronica.engelage@carolinaone.com"],
      replyTo: cleanEmail,
      subject: "New website lead",
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
          <h2 style="margin:0 0 12px 0">New website lead</h2>
          <p style="margin:0 0 6px 0"><strong>Name:</strong> ${escapeHtml(cleanName || "—")}</p>
          <p style="margin:0 0 12px 0"><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
          <p style="margin:0 0 12px 0"><strong>Source:</strong> ${escapeHtml(cleanSource || "Unknown")}</p>
          <p style="margin:0"><strong>Message:</strong></p>
          <p style="margin:6px 0 0 0;white-space:pre-wrap">${escapeHtml(cleanMsg || "—")}</p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (err: any) {
    // Don’t leak internals; log in Vercel instead
    console.error("Contact API error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
