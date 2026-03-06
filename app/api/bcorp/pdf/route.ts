import { PDFDocument, rgb } from "pdf-lib";

const ZERO_MARGIN = { top: "0", right: "0", bottom: "0", left: "0" };
const CONTENT_MARGIN = { top: "15mm", right: "20mm", bottom: "15mm", left: "20mm" };

export async function POST(req: Request) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_PDF_API_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;

  if (!accountId || !apiToken) {
    return new Response("Cloudflare credentials not configured", { status: 500 });
  }
  if (!baseUrl) {
    return new Response("APP_URL not configured", { status: 500 });
  }

  try {
    const { orgId, jwt } = await req.json();

    if (typeof orgId !== "string" || !/^[\w-]+$/.test(orgId)) {
      return new Response("Invalid orgId", { status: 400 });
    }
    if (typeof jwt !== "string" || !jwt) {
      return new Response("Missing JWT token", { status: 400 });
    }

    const orgBase = `${baseUrl}/organizations/${orgId}`;
    const cfEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/pdf`;

    // Fetch all three PDFs in parallel (matches Ruby's threaded approach)
    const [headerBytes, contentBytes] = await Promise.all([
      fetchPdf(cfEndpoint, apiToken, `${orgBase}/bcorp-header?print&jwt=${encodeURIComponent(jwt)}`, ZERO_MARGIN),
      fetchPdf(cfEndpoint, apiToken, `${orgBase}/bcorp-content?print&jwt=${encodeURIComponent(jwt)}`, CONTENT_MARGIN)
      // fetchPdf(cfEndpoint, apiToken, `${orgBase}/bcorp-footer?print&jwt=${encodeURIComponent(jwt)}`, ZERO_MARGIN)
    ]);

    // Add page numbers to content PDF (starting at page 2)
    const numberedContent = await addPageNumbers(contentBytes);

    // Combine all three PDFs
    const combined = await combinePdfs(headerBytes, numberedContent);

    // const combined = await fetchPdf(cfEndpoint, apiToken, `${orgBase}/bcorp-content?print&jwt=${encodeURIComponent(jwt)}`, CONTENT_MARGIN);

    return new Response(combined as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bcorp-report-${orgId}.pdf"`
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PDF generation error:", message);
    return new Response(message, { status: 502 });
  }
}

async function fetchPdf(
  endpoint: string,
  apiToken: string,
  url: string,
  margin: Record<string, string>
): Promise<Uint8Array> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url,
      viewport: { width: 1280, height: 720 },
      pdfOptions: {
        format: "a4",
        printBackground: true,
        margin
      },
      gotoOptions: { waitUntil: "networkidle0" }
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PDF generation failed (${res.status}): ${body}`);
  }

  return new Uint8Array(await res.arrayBuffer());
}

async function addPageNumbers(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBytes);
  const pages = pdf.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageNumber = i + 2; // starts at 2 (header is page 1)
    const { width } = page.getSize();

    page.drawText(pageNumber.toString(), {
      x: width - 50,
      y: 25,
      size: 10,
      color: rgb(0.4, 0.4, 0.4)
    });
  }

  return pdf.save();
}

async function combinePdfs(...pdfBytesList: Uint8Array[]): Promise<Uint8Array> {
  const combined = await PDFDocument.create();

  for (const pdfBytes of pdfBytesList) {
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await combined.copyPages(pdf, pdf.getPageIndices());
    for (const page of pages) {
      combined.addPage(page);
    }
  }

  return combined.save();
}
