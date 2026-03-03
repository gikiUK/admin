import { DefList, DocsPage, DocsSection } from "@/components/docs/docs-page";

export default function ConstantsDocsPage() {
  return (
    <DocsPage title="Constants" description="Reusable lists of values shared across facts and questions.">
      <DocsSection title="What are Constants?">
        <p>
          Constants are named groups of values — for example, a list of industries, building types, or business sizes.
          Instead of duplicating these lists in every fact and question that needs them, both reference a shared
          constants group by name.
        </p>
      </DocsSection>

      <DocsSection title="How They're Referenced">
        <p>Constants are the shared source of truth for enumerated values:</p>
        <DefList
          items={[
            {
              term: "values_ref",
              description:
                "Used by facts (enum and array types). Points to the constants group that defines the fact's allowed values."
            },
            {
              term: "options_ref",
              description: "Used by questions. Points to the constants group that provides the dropdown/select options."
            }
          ]}
        />
        <p>
          When a fact's <code className="bg-muted rounded px-1.5 py-0.5 text-sm">values_ref</code> and a question's{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">options_ref</code> point to the same group, the
          allowed values and user-facing options stay in sync automatically.
        </p>
      </DocsSection>

      <DocsSection title="Value Structure">
        <p>Each value in a constants group has:</p>
        <DefList
          items={[
            { term: "id", description: "Numeric identifier, unique within the group." },
            {
              term: "name",
              description: "The internal name used in conditions and data matching (e.g. 'Food Retail')."
            },
            { term: "label", description: "Optional display label. If absent, the name is shown to users." },
            { term: "description", description: "Optional explanatory text." },
            { term: "enabled", description: "false means this value is inactive and won't appear in options." }
          ]}
        />
      </DocsSection>

      <DocsSection title="Common Constants Groups">
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>industries</strong> — ~190 industry names (the largest group)
          </li>
          <li>
            <strong>sizes</strong> — business sizes (Small, Medium, Enterprise, Large Enterprise, etc.)
          </li>
          <li>
            <strong>building_types</strong> — types of buildings a business might occupy
          </li>
          <li>
            <strong>vehicle_types</strong> — types of company vehicles
          </li>
        </ul>
      </DocsSection>
    </DocsPage>
  );
}
