import { DefList, DocsPage, DocsSection } from "@/components/docs/docs-page";

export default function ConditionsDocsPage() {
  return (
    <DocsPage title="Conditions" description="Key-value expressions that control when things apply.">
      <DocsSection title="How Conditions Work">
        <p>
          A condition is a JSON object where each key is a fact ID and the value is what that fact must equal. When a
          condition has multiple keys, <strong>all must match</strong> (implicit AND). An empty condition{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">{"{}"}</code> always matches.
        </p>
      </DocsSection>

      <DocsSection title="Value Types">
        <DefList
          items={[
            {
              term: "boolean",
              description: 'True/false matching. Example: { "owns_buildings": true } — matches when the fact is true.'
            },
            {
              term: "string",
              description:
                'Exact string match. Example: { "scope_1_relevant": "not_applicable" } — matches when the fact equals that string.'
            },
            {
              term: "array",
              description:
                'Contains matching. Example: { "size": ["Small", "Medium"] } — matches when the fact\'s value is one of the listed values.'
            }
          ]}
        />
      </DocsSection>

      <DocsSection title="OR Logic (any)">
        <p>
          Wrap conditions in <code className="bg-muted rounded px-1.5 py-0.5 text-sm">any</code> for OR logic — at least
          one sub-condition must match:
        </p>
        <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm leading-relaxed">
          {JSON.stringify({ any: [{ owns_buildings: true }, { leases_buildings: true }] }, null, 2)}
        </pre>
        <p>This reads as: "owns buildings OR leases buildings".</p>
      </DocsSection>

      <DocsSection title="Multi-Key AND">
        <p>Multiple keys in one condition object means all must match:</p>
        <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm leading-relaxed">
          {JSON.stringify(
            {
              industries: ["Food Retail", "Brewers"],
              size: ["Small", "Medium"],
              uses_buildings: true
            },
            null,
            2
          )}
        </pre>
        <p>This reads as: "industry is Food Retail or Brewers, AND size is Small or Medium, AND uses buildings".</p>
      </DocsSection>

      <DocsSection title="Where Conditions Are Used">
        <DefList
          items={[
            {
              term: "Questions",
              description:
                "show_when and hide_when control conditional visibility. Typically use simple boolean or string conditions."
            },
            {
              term: "Rules",
              description:
                "The when field determines when a rule fires. General rules use boolean conditions; hotspot rules use array-contains."
            },
            {
              term: "Actions",
              description:
                "include_when and exclude_when control which users see which actions. Often combine multi-key AND with array matching."
            }
          ]}
        />
      </DocsSection>

      <DocsSection title="Condition Patterns in the Data">
        <p>
          Across the dataset there are roughly <strong>769 conditions</strong>. The breakdown:
        </p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>661</strong> multi-key AND conditions (86%) — almost all in action conditions
          </li>
          <li>
            <strong>50</strong> simple boolean conditions — in questions and rules
          </li>
          <li>
            <strong>38</strong> array-contains conditions — in hotspot rules and actions
          </li>
          <li>
            <strong>13</strong> string value conditions — only in question hide_when fields
          </li>
          <li>
            <strong>7</strong> explicit OR (any) conditions — in questions and general rules
          </li>
        </ul>
      </DocsSection>
    </DocsPage>
  );
}
