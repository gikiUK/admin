import { DefList, DocsPage, DocsSection } from "@/components/docs/docs-page";

export default function HowItWorksPage() {
  return (
    <DocsPage title="How It Works" description="An overview of Giki's climate action data engine.">
      <DocsSection title="The Big Picture">
        <p>
          Giki helps businesses understand their environmental impact and take action. The engine behind it uses a{" "}
          <strong>three-valued logic system</strong> to guide users from answering questions about their business to
          receiving personalised climate actions.
        </p>
        <p>The data flows through four layers:</p>
        <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm leading-relaxed">
          {[
            "Questions   ──  what we ask the user",
            "    │",
            "    ▼",
            "Facts        ──  what we know about the business",
            "    │",
            "    ▼",
            "Rules        ──  derive new facts from existing ones",
            "    │",
            "    ▼",
            "Actions      ──  recommendations shown to the user"
          ].join("\n")}
        </pre>
      </DocsSection>

      <DocsSection title="Three-Valued Logic">
        <p>
          The engine uses three-valued logic: every fact can be{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">true</code>,{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">false</code>, or{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">unknown</code>. Facts start as unknown and get
          resolved as the user answers questions. Rules and actions can handle all three states, which allows the system
          to show sensible recommendations even before the questionnaire is fully completed.
        </p>
        <p>
          This is distinct from <code className="bg-muted rounded px-1.5 py-0.5 text-sm">unknowable</code> — a
          question-level flag that adds a "Don't know" option, letting the user explicitly indicate they can't answer.
        </p>
      </DocsSection>

      <DocsSection title="Draft / Live Versioning">
        <p>
          The dataset has two versions: <strong>live</strong> (what users see) and <strong>draft</strong> (work in
          progress). When you make your first edit, a draft is automatically created. You can make as many changes as
          you like — they auto-save every 80ms — and then publish the draft to make it live.
        </p>
        <DefList
          items={[
            { term: "Live", description: "The published dataset that users interact with." },
            { term: "Draft", description: "Your in-progress changes. Only you can see these." },
            { term: "Publish", description: "Promotes the draft to become the new live version." },
            { term: "Discard", description: "Deletes the draft and reverts to the live version." }
          ]}
        />
      </DocsSection>

      <DocsSection title="Constants">
        <p>
          Constants are reusable lists of values (e.g. industries, building types, business sizes). Both facts and
          questions can reference a constants group to share the same set of options. See the{" "}
          <a href="/docs/constants" className="text-primary underline">
            Constants
          </a>{" "}
          page for details.
        </p>
      </DocsSection>

      <DocsSection title="Conditions">
        <p>
          Conditions are key-value expressions used throughout the data to control when things apply. Questions use them
          for conditional visibility (<code className="bg-muted rounded px-1.5 py-0.5 text-sm">show_when</code>/
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">hide_when</code>), rules use them to define when a
          derivation applies, and actions use them to target specific business profiles. See the{" "}
          <a href="/docs/conditions" className="text-primary underline">
            Conditions
          </a>{" "}
          page for the full breakdown.
        </p>
      </DocsSection>
    </DocsPage>
  );
}
