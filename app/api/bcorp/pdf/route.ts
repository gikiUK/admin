export const runtime = "edge";

export async function POST(req: Request) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;

  if (!accountId || !apiToken) {
    return new Response("Cloudflare credentials not configured", { status: 500 });
  }
  if (!baseUrl) {
    return new Response("APP_URL not configured", { status: 500 });
  }

  const { orgId } = await req.json();

  if (typeof orgId !== "string" || !/^[\w-]+$/.test(orgId)) {
    return new Response("Invalid orgId", { status: 400 });
  }

  const route = `organizations/${orgId}/bcorp-printable`;
  const targetUrl = `${baseUrl}/${route}?print`;

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: targetUrl,
      pdfOptions: {
        format: "a4",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" }
      },
      gotoOptions: { waitUntil: "load" }
    })
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: 502 });
  }

  const pdf = await res.arrayBuffer();

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bcorp-report-${orgId}.pdf"`
    }
  });
}
