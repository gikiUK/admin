import { type Paragraph, Table, TextRun } from "docx";
import type { BcorpData, Plan } from "@/lib/bcorp/types";
import { markdownToParagraphs } from "../markdown";
import {
  bodyText,
  heading2,
  heading3,
  pageBreak,
  scopeLabel,
  simpleTable,
  tableDataRow,
  tableHeaderRow
} from "../styles";

const PT = (pt: number) => pt * 2;

function actionTableWithThemes(actions: Plan): Table {
  return simpleTable(
    ["Action Title", "Group"],
    actions.map((a) => [a.tal_action.title, a.tal_action.themes?.join(", ") ?? ""])
  );
}

function actionTableWithScopes(actions: Plan): Table {
  const header = tableHeaderRow(["Action Title", "Category"]);
  const rows = actions.map((a, i) => {
    const scopes = a.tal_action.ghg_scope ?? [];
    const scopeRuns: TextRun[] = [];
    for (const s of scopes) {
      if (scopeRuns.length > 0) scopeRuns.push(new TextRun({ text: " ", size: PT(9) }));
      scopeRuns.push(scopeLabel(s));
    }
    return tableDataRow(
      [
        [new TextRun({ text: a.tal_action.title, size: PT(10.5) })],
        scopeRuns.length > 0 ? scopeRuns : [new TextRun("")]
      ],
      i
    );
  });

  return new Table({
    width: { size: 100, type: "pct" as const },
    rows: [header, ...rows]
  });
}

export function buildProgressTracking(data: BcorpData, plan: Plan, alreadyDoingActions: Plan): (Paragraph | Table)[] {
  const inProgress = plan.filter((a) => a.state === "in_progress");
  const notStarted = plan.filter((a) => a.state === "not_started");
  const completed = plan.filter((a) => a.state === "completed");

  const elements: (Paragraph | Table)[] = [
    pageBreak(),
    heading2("Progress Tracking"),
    heading3("Recording Progress"),
    bodyText("The following section shows the progress we are making towards our plan."),

    heading3("Actions Currently In Progress"),
    bodyText(`We currently have ${inProgress.length} action${inProgress.length !== 1 ? "s" : ""} in progress.`)
  ];

  if (data.actions_in_progress) elements.push(...markdownToParagraphs(data.actions_in_progress));
  if (inProgress.length > 0) elements.push(actionTableWithThemes(inProgress));

  elements.push(heading3("Actions we Plan To Do"));
  if (data.actions_added) elements.push(...markdownToParagraphs(data.actions_added));
  if (notStarted.length > 0) elements.push(actionTableWithScopes(notStarted));

  elements.push(
    heading3("Completed Actions"),
    bodyText(`During the year we completed ${completed.length} action${completed.length !== 1 ? "s" : ""}.`)
  );
  if (completed.length > 0) elements.push(actionTableWithScopes(completed));

  if (alreadyDoingActions.length > 0) {
    elements.push(
      pageBreak(),
      heading3("Actions Completed Before this Plan"),
      bodyText(
        `We had already completed ${alreadyDoingActions.length} action${alreadyDoingActions.length !== 1 ? "s" : ""} before this plan was created.`
      ),
      actionTableWithScopes(alreadyDoingActions)
    );
  }

  return elements;
}
