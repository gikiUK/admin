import { DefList, DocsPage, DocsSection } from "@/components/docs/docs-page";

export default function FactsDocsPage() {
  return (
    <DocsPage title="Facts" description="Named pieces of knowledge about a business.">
      <DocsSection title="What is a Fact?">
        <p>
          A fact is a single piece of information about a business — for example, "this company owns buildings" or "the
          company's industry is Food Retail". Facts are identified by a unique string ID like{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">owns_buildings</code> or{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">industry</code>.
        </p>
        <p>Facts are the central data structure — questions set them, rules derive them, and actions depend on them.</p>
      </DocsSection>

      <DocsSection title="Fact Types">
        <DefList
          items={[
            {
              term: "boolean_state",
              description: "True or false. The most common type. Example: owns_buildings, has_company_vehicles."
            },
            {
              term: "enum",
              description: "One value from a set. Example: size (one of Small, Medium, Enterprise, etc.)."
            },
            {
              term: "array",
              description: "Multiple values from a set. Example: industries (a company can be in several industries)."
            }
          ]}
        />
      </DocsSection>

      <DocsSection title="Core vs Derived">
        <p>
          Every fact is either <strong>core</strong> or <strong>derived</strong>:
        </p>
        <DefList
          items={[
            {
              term: "core",
              description: "Set directly by a user's answer to a question. Cannot be computed by rules."
            },
            {
              term: "derived",
              description: "Computed by rules from other facts. Never set directly by a question."
            }
          ]}
        />
        <p>
          This distinction is enforced: a core fact should have a question that sets it, and a derived fact should have
          rules that compute it.
        </p>
      </DocsSection>

      <DocsSection title="values_ref">
        <p>
          For <code className="bg-muted rounded px-1.5 py-0.5 text-sm">enum</code> and{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">array</code> facts, the{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">values_ref</code> field points to a constants group
          that defines the allowed values. For example, a fact with{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">values_ref: "industries"</code> uses the values from
          the <code className="bg-muted rounded px-1.5 py-0.5 text-sm">industries</code> constants group.
        </p>
        <p>
          This creates a shared source of truth — the same constants group is also referenced by questions via{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">options_ref</code>, ensuring that question options
          and fact values always stay in sync.
        </p>
      </DocsSection>

      <DocsSection title="Categories">
        <p>
          Facts are automatically assigned to one of 8 categories based on their ID pattern. Categories are used to
          organise facts in the UI:
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>Company Profile</li>
          <li>Buildings & Energy</li>
          <li>Transport & Travel</li>
          <li>Supply Chain</li>
          <li>Products</li>
          <li>Investments</li>
          <li>Engagement & Priorities</li>
          <li>GHG Relevance</li>
        </ul>
      </DocsSection>

      <DocsSection title="Fields Reference">
        <DefList
          items={[
            { term: "type", description: "boolean_state, enum, or array." },
            { term: "core", description: "true if set by questions, false if derived by rules." },
            { term: "category", description: "Auto-assigned grouping (e.g. 'buildings-energy')." },
            { term: "values_ref", description: "Reference to a constants group (for enum/array facts)." },
            { term: "enabled", description: "false means soft-deleted. The fact still exists but is inactive." }
          ]}
        />
      </DocsSection>
    </DocsPage>
  );
}
