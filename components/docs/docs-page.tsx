interface DocsPageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DocsPage({ title, description, children }: DocsPageProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-2 text-lg">{description}</p>}
      </div>
      <div className="prose-custom space-y-8">{children}</div>
    </div>
  );
}

export function DocsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

export function DefList({ items }: { items: { term: string; description: string }[] }) {
  return (
    <dl className="space-y-2">
      {items.map((item) => (
        <div key={item.term}>
          <dt className="inline font-medium">
            <code className="bg-muted rounded px-1.5 py-0.5 text-sm">{item.term}</code>
          </dt>
          <dd className="text-muted-foreground ml-2 inline">{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}
