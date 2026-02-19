import { DefList, DocsPage, DocsSection } from "@/components/docs/docs-page";

export default function RulesDocsPage() {
  return (
    <DocsPage title="Rules" description="Derive new fact values from existing ones.">
      <DocsSection title="What is a Rule?">
        <p>
          A rule computes a fact's value based on other facts. Rules operate on <strong>derived</strong> facts — facts
          that aren't set directly by questions but are instead calculated from the user's answers to other questions.
        </p>
        <p>
          Like questions, rules are stored as an <strong>ordered array</strong> where the index is the identifier.
        </p>
      </DocsSection>

      <DocsSection title="Rule Structure">
        <p>Every rule has four parts:</p>
        <DefList
          items={[
            { term: "sets", description: "The fact ID this rule sets (e.g. uses_buildings)." },
            {
              term: "value",
              description: "The value to assign — true, false, or not_applicable."
            },
            { term: "source", description: "Whether this is a general or hotspot rule." },
            { term: "when", description: "The condition that must be met for this rule to fire." }
          ]}
        />
      </DocsSection>

      <DocsSection title="Rule Types by Value">
        <DefList
          items={[
            {
              term: "value: true",
              description:
                "Derivation rule. Sets a derived fact to true when the condition is met. Example: 'uses_buildings is true when owns_buildings or leases_buildings is true.'"
            },
            {
              term: "value: false",
              description: "Constraint rule. Forces a fact to false, overriding other rules."
            },
            {
              term: 'value: "not_applicable"',
              description:
                "Exclusion rule. Marks a fact as not relevant to this business, removing related questions from view."
            }
          ]}
        />
      </DocsSection>

      <DocsSection title="General vs Hotspot">
        <DefList
          items={[
            {
              term: "general",
              description:
                "Applies broadly. Conditions typically use simple boolean facts. Example: 'uses_buildings is true when owns_buildings is true.'"
            },
            {
              term: "hotspot",
              description:
                "Targets specific industry/size combinations. Conditions typically use array-contains matching on industries and sizes. Example: 'cat_3_relevant is true when industry includes Food Retail.'"
            }
          ]}
        />
      </DocsSection>

      <DocsSection title="Evaluation">
        <p>
          Rules are evaluated in array order. When multiple rules set the same fact, the last matching rule wins. This
          means more specific rules should come after general ones.
        </p>
      </DocsSection>

      <DocsSection title="Fields Reference">
        <DefList
          items={[
            { term: "sets", description: "Fact ID being set by this rule." },
            { term: "value", description: "true, false, or 'not_applicable'." },
            { term: "source", description: "'general' or 'hotspot'." },
            { term: "when", description: "Condition expression (see Conditions)." },
            { term: "enabled", description: "false means soft-deleted." }
          ]}
        />
      </DocsSection>
    </DocsPage>
  );
}
