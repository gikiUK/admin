import { DefList, DocsPage, DocsSection } from "@/components/docs/docs-page";

export default function QuestionsDocsPage() {
  return (
    <DocsPage title="Questions" description="User-facing inputs that set facts.">
      <DocsSection title="What is a Question?">
        <p>
          A question is what the user sees and answers in the Giki questionnaire. Each question sets one or more facts
          based on the user's response. Questions are stored as an <strong>ordered array</strong> — their index in the
          array is their identifier, so reordering questions changes their IDs.
        </p>
      </DocsSection>

      <DocsSection title="Question Types">
        <DefList
          items={[
            {
              term: "boolean_state",
              description: "Yes/No question. Sets a single boolean fact."
            },
            {
              term: "single-select",
              description: "Pick one option from a list. Sets a fact to the selected value."
            },
            {
              term: "multi-select",
              description: "Pick multiple options from a list. Sets an array fact."
            },
            {
              term: "checkbox-radio-hybrid",
              description:
                "A mix: some options are exclusive (radio), others can be combined (checkbox). Used for complex multi-fact mappings."
            }
          ]}
        />
      </DocsSection>

      <DocsSection title="options_ref">
        <p>
          Instead of defining options inline, a question can reference a constants group via{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">options_ref</code>. This is the question-side
          counterpart of a fact's <code className="bg-muted rounded px-1.5 py-0.5 text-sm">values_ref</code> — both
          point to the same constants group, keeping the allowed values consistent.
        </p>
      </DocsSection>

      <DocsSection title="Conditional Visibility">
        <p>Questions can be shown or hidden based on other facts:</p>
        <DefList
          items={[
            {
              term: "show_when",
              description: "Only show this question when the condition is met."
            },
            {
              term: "hide_when",
              description: "Hide this question when the condition is met. Typically checks for not_applicable."
            }
          ]}
        />
        <p>
          When a question is hidden, its fact values remain at their default (unknown) state. See{" "}
          <a href="/docs/conditions" className="text-primary underline">
            Conditions
          </a>{" "}
          for how condition expressions work.
        </p>
      </DocsSection>

      <DocsSection title="Fact Mapping">
        <p>Questions set facts in two ways depending on the question type:</p>
        <DefList
          items={[
            {
              term: "fact",
              description:
                "Single-fact mapping. The question sets one fact directly. Used by boolean_state, single-select, and multi-select."
            },
            {
              term: "facts",
              description:
                "Multi-fact mapping. Maps each option to a set of fact values. Used by checkbox-radio-hybrid questions."
            }
          ]}
        />
      </DocsSection>

      <DocsSection title="Fields Reference">
        <DefList
          items={[
            { term: "type", description: "boolean_state, single-select, multi-select, or checkbox-radio-hybrid." },
            { term: "label", description: "The question text shown to the user." },
            { term: "description", description: "Optional help text displayed below the question." },
            { term: "fact", description: "The single fact this question sets." },
            { term: "facts", description: "Multi-fact mapping object (for checkbox-radio-hybrid)." },
            { term: "options", description: "Inline option list, or use options_ref instead." },
            { term: "options_ref", description: "Reference to a constants group for options." },
            { term: "show_when", description: "Condition: show this question only when met." },
            { term: "hide_when", description: "Condition: hide this question when met." },
            { term: "unknowable", description: "If true, the question has a 'Don't know' option." },
            { term: "enabled", description: "false means soft-deleted." }
          ]}
        />
      </DocsSection>
    </DocsPage>
  );
}
