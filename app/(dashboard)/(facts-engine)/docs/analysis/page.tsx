import { DefList, DocsPage, DocsSection } from "@/components/docs/docs-page";

export default function AnalysisDocsPage() {
  return (
    <DocsPage title="Analysis" description="Automated checks that catch dataset errors before they reach users.">
      <DocsSection title="What It Does">
        <p>
          The Analysis page at{" "}
          <a href="/data/analysis" className="text-primary underline">
            /data/analysis
          </a>{" "}
          runs <strong>6 automated checks</strong> against the current dataset and reports issues. It analyses whichever
          version you're currently working with — the <strong>draft</strong> if one exists, otherwise the{" "}
          <strong>live</strong> dataset. Checks run instantly (under 100ms) every time the dataset changes, so you see
          feedback in real time as you edit.
        </p>
        <p>
          Two checks scan the data graph for structural problems. The other four use a <strong>SAT solver</strong>{" "}
          (boolean satisfiability) to reason about whether conditions can actually be satisfied given the constraints in
          the dataset. This catches problems that are invisible from looking at individual records — like two rules that
          conflict, or a condition that references a valid fact but can never actually be true.
        </p>
      </DocsSection>

      <DocsSection title="Issue Severities">
        <DefList
          items={[
            {
              term: "error",
              description:
                "Something is broken — a reference points to a fact that doesn't exist, or rules directly contradict each other. These should be fixed before publishing."
            },
            {
              term: "warning",
              description:
                "Something is suspicious — a fact is defined but never used, or a condition can never be met. May be intentional (e.g. a fact reserved for future use) but worth reviewing."
            }
          ]}
        />
      </DocsSection>

      <DocsSection title="The 6 Checks">
        <h3 className="mt-2 font-semibold">1. Dead Facts (warning)</h3>
        <p>
          Scans every question, rule, and action condition to collect the set of referenced fact IDs. Any enabled fact
          that doesn't appear anywhere is flagged. Dead facts are harmless but add noise — if they're truly unused,
          consider disabling them.
        </p>

        <h3 className="mt-4 font-semibold">2. Undefined References (error)</h3>
        <p>
          The inverse of dead facts. Finds conditions that point to a fact ID that doesn't exist in the dataset, or
          reference a value that isn't in the fact's constants group. For example, a rule with{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">{'{ "typo_fact": true }'}</code> where{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">typo_fact</code> isn't defined. Also catches{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">any_of</code> arrays that reference non-existent
          facts, and array/string values that don't match any constant in the fact's values group.
        </p>

        <h3 className="mt-4 font-semibold">3. Contradictory Rules (error)</h3>
        <p>
          Groups rules by the fact they set, then checks every pair that assigns a different value. Uses the SAT solver
          to test whether both rules' <code className="bg-muted rounded px-1.5 py-0.5 text-sm">when</code> conditions
          can be true simultaneously. If yes, a user could answer questions in a way that triggers both rules, which
          would set the same fact to two different values — a contradiction.
        </p>
        <p>
          Example: Rule A sets <code className="bg-muted rounded px-1.5 py-0.5 text-sm">carbon_relevant</code> to{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">true</code> when{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">owns_buildings</code> is true, while Rule B sets it
          to <code className="bg-muted rounded px-1.5 py-0.5 text-sm">false</code> when{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">size</code> is "Small". If a small business that owns
          buildings exists, both fire with different results.
        </p>

        <h3 className="mt-4 font-semibold">4. Unreachable Questions (warning)</h3>
        <p>
          For each question with a <code className="bg-muted rounded px-1.5 py-0.5 text-sm">show_when</code> condition,
          the SAT solver tests whether the condition can ever be satisfied. If it can't, the question will never be
          shown to any user. Also checks questions that only have a{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">hide_when</code> — if the hide condition is always
          true, the question is always hidden.
        </p>

        <h3 className="mt-4 font-semibold">5. Unreachable Actions (warning)</h3>
        <p>
          Same principle as unreachable questions, but for action conditions. Tests whether each action's{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">include_when</code> condition can ever be satisfied.
          Actions with empty conditions (which match everyone) are skipped.
        </p>

        <h3 className="mt-4 font-semibold">6. Include/Exclude Overlap (warning)</h3>
        <p>
          For actions that have both <code className="bg-muted rounded px-1.5 py-0.5 text-sm">include_when</code> and{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">exclude_when</code> conditions, tests whether both
          can be true at the same time. When they overlap, the action would be simultaneously included and excluded for
          some users, which is ambiguous behaviour.
        </p>
      </DocsSection>

      <DocsSection title="How the SAT Solver Works">
        <p>
          The analysis uses{" "}
          <a href="https://www.npmjs.com/package/logic-solver" className="text-primary underline">
            logic-solver
          </a>
          , a JavaScript SAT solver built on MiniSat. It encodes the entire fact/rule system as a set of boolean
          variables and constraints, then asks "can X be true?" questions. Think of it as a very fast way to check{" "}
          <em>all possible combinations of user answers</em> at once, rather than testing them one by one.
        </p>

        <h3 className="mt-2 font-semibold">Variable Encoding</h3>
        <p>Each fact becomes one or more boolean variables:</p>
        <DefList
          items={[
            {
              term: "fact:{id}:true",
              description: "Whether a boolean_state fact is true."
            },
            {
              term: "fact:{id}:na",
              description: 'Whether the fact is "not_applicable".'
            },
            {
              term: "fact:{id}:val:{name}",
              description: "Whether an enum/array fact has a specific value selected."
            }
          ]}
        />

        <h3 className="mt-4 font-semibold">Constraints</h3>
        <p>
          The solver enforces structural rules: a boolean fact can't be both true and not_applicable; an enum fact can
          have at most one value selected; an array fact that is not_applicable can't have any values. Dataset rules are
          encoded as implications — "if condition X is true, then fact Y gets value Z".
        </p>
        <p>
          Each check then asks the solver a specific question using{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">solveAssuming()</code>, which temporarily assumes a
          formula is true and checks if a valid solution exists. This is non-destructive — the same model is reused for
          all checks.
        </p>
      </DocsSection>

      <DocsSection title="Adding a New Check">
        <p>To add a new analysis check:</p>
        <ol className="list-inside list-decimal space-y-2">
          <li>
            Create a new file in <code className="bg-muted rounded px-1.5 py-0.5 text-sm">lib/analysis/checks/</code>.
            Export a single function matching this signature:
            <pre className="bg-muted mt-2 overflow-x-auto rounded-lg p-4 text-sm leading-relaxed">
              {[
                "// For graph-scan checks (no SAT solver needed):",
                "function checkSomething(data: DatasetData): CheckResult",
                "",
                "// For SAT-based checks:",
                "function checkSomething(data: DatasetData, model: SatModel): CheckResult"
              ].join("\n")}
            </pre>
          </li>
          <li>
            Return a <code className="bg-muted rounded px-1.5 py-0.5 text-sm">CheckResult</code> with a unique{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-sm">id</code>,{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-sm">name</code>,{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-sm">description</code>, and an array of issues. Each
            issue has a <code className="bg-muted rounded px-1.5 py-0.5 text-sm">severity</code> ("error" or "warning"),
            a human-readable <code className="bg-muted rounded px-1.5 py-0.5 text-sm">message</code>, and{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-sm">refs</code> that link to the relevant entities.
          </li>
          <li>
            Export it from <code className="bg-muted rounded px-1.5 py-0.5 text-sm">lib/analysis/checks/index.ts</code>.
          </li>
          <li>
            Call it in <code className="bg-muted rounded px-1.5 py-0.5 text-sm">lib/analysis/run-analysis.ts</code>{" "}
            inside the <code className="bg-muted rounded px-1.5 py-0.5 text-sm">checks</code> array. Pass{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-sm">model</code> if your check needs SAT solving.
          </li>
        </ol>
        <p>The UI picks up new checks automatically — no changes needed in the components.</p>
      </DocsSection>

      <DocsSection title="Working with the SAT Model">
        <p>If your check needs to reason about condition satisfiability, use the shared SAT model:</p>
        <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm leading-relaxed">
          {[
            'import Logic from "logic-solver";',
            'import { encodeCondition } from "../sat-encoding";',
            'import type { SatModel } from "../sat-encoding";',
            "",
            "// Encode a BlobCondition into a SAT formula",
            "const formula = encodeCondition(condition, model.vars);",
            "",
            "// Test if the formula can be satisfied",
            "const solution = model.solver.solveAssuming(formula);",
            "if (!solution) {",
            "  // Condition can never be true",
            "}",
            "",
            "// Test if two conditions can be true simultaneously",
            "const both = Logic.and(formulaA, formulaB);",
            "const overlap = model.solver.solveAssuming(both);",
            "",
            "// Test if a condition is always true",
            "// (its negation is unsatisfiable)",
            "const negated = Logic.not(formula);",
            "const canBeFalse = model.solver.solveAssuming(negated);",
            "if (!canBeFalse) {",
            "  // Condition is always true",
            "}"
          ].join("\n")}
        </pre>
      </DocsSection>

      <DocsSection title="Key Types">
        <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm leading-relaxed">
          {[
            'type IssueSeverity = "error" | "warning";',
            "",
            "type IssueRef = {",
            '  type: "fact" | "question" | "rule" | "action" | "constant";',
            "  id: string;",
            "  label?: string;",
            "};",
            "",
            "type AnalysisIssue = {",
            "  severity: IssueSeverity;",
            "  message: string;",
            "  refs: IssueRef[];",
            "};",
            "",
            "type CheckResult = {",
            "  id: string;",
            "  name: string;",
            "  description: string;",
            "  issues: AnalysisIssue[];",
            "};"
          ].join("\n")}
        </pre>
      </DocsSection>

      <DocsSection title="File Structure">
        <DefList
          items={[
            {
              term: "lib/analysis/types.ts",
              description: "Report and issue type definitions."
            },
            {
              term: "lib/analysis/sat-encoding.ts",
              description: "Builds the SAT model from the dataset — variable creation, constraints, condition encoding."
            },
            {
              term: "lib/analysis/run-analysis.ts",
              description: "Orchestrator — builds the model, runs all checks, tallies results."
            },
            {
              term: "lib/analysis/checks/",
              description: "One file per check. Each exports a single function."
            },
            {
              term: "components/analysis/",
              description: "UI components — AnalysisPanel, CheckResultCard, IssueRow."
            }
          ]}
        />
      </DocsSection>
    </DocsPage>
  );
}
