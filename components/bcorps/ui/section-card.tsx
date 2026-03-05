export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
