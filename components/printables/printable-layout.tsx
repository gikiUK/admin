"use client";

const PRINTABLE_CSS = `
:root {
  --page-width: 210mm;
  --page-height: 297mm;

  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-heading: 'Literata', Georgia, serif;
  --font-size-base: 12.5pt;
  --font-size-body: var(--font-size-base);
  --font-size-h1: calc(var(--font-size-base) * 2.2);
  --font-size-h2: calc(var(--font-size-base) * 2.3);
  --font-size-h3: calc(var(--font-size-base) * 1.2);
  --font-size-small: calc(var(--font-size-base) * 0.75);

  --color-text: #222;
  --color-heading: #111;
  --color-muted: #666;
  --color-accent: #2563eb;
  --color-accent-light: #eff6ff;
  --color-border: #ddd;
  --color-bg-subtle: #f5f5f5;
  --color-bg-dark: #1a1a2e;
}

@page { size: A4; }

*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-body);
  line-height: 1.5;
  font-weight: 300;
  color: var(--color-text);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body { position: relative; }

p { margin-top: 0; margin-bottom: 0.8em; }

.break-before { break-before: page; }
.break-after { break-after: page; }
.no-break { break-inside: avoid; padding-top: 1em; }
.keep-together { break-after: avoid; }

.padded { padding: var(--page-padding-y) var(--page-padding-x) var(--page-padding-y) 180px; }

.page-number {
  position: absolute;
  left: 0;
  width: 3cm;
  text-align: center;
  font-size: calc(var(--font-size-base) * 1.55);
  font-weight: 600;
  color: white;
  font-variant-numeric: tabular-nums;
}

table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--color-border); }
th { font-weight: 600; color: var(--color-heading); }
tr { break-inside: avoid; }

.text-muted { color: var(--color-muted); }
.text-accent { color: var(--color-accent); }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-small { font-size: var(--font-size-small); }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.5em; }
.mb-2 { margin-bottom: 1em; }
.mb-3 { margin-bottom: 2em; }
.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.5em; }
.mt-2 { margin-top: 1em; }
.mt-3 { margin-top: 2em; }

@media screen {
  html {
    background: #e0e0e0;
    padding-bottom: 1cm;
  }
  body {
    background: white;
    margin: 2cm auto;
    box-shadow: 0 2px 16px rgba(0,0,0,0.2);
    width: var(--page-width);
  }
  section {
    border-bottom: 5px solid #e0e0e0;
  }
}
`;

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Literata:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap";

export function PrintableLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href={FONTS_URL} rel="stylesheet" />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static CSS string, not user input */}
      <style dangerouslySetInnerHTML={{ __html: PRINTABLE_CSS }} />
      {children}
    </>
  );
}
