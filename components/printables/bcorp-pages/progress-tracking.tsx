import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";
import { MarkdownContent } from "@/components/printables/markdown-content";
import { ScopeLabels } from "@/components/printables/scope-labels";

export function ProgressTracking({ data, plan, alreadyDoingActions }: BcorpPageProps) {
  const inProgressActions = plan.filter((a) => a.state === "in_progress");
  const notStartedActions = plan.filter((a) => a.state === "not_started");
  const completedActions = plan.filter((a) => a.state === "completed");

  return (
    <div className="ui-page">
      <div className="ui-section">
        <h2>Progress Tracking</h2>
        <h3>Recording Progress</h3>
        <p>The following section shows the progress we are making towards our plan.</p>

        <h3>Actions Currently In Progress</h3>
        <p>
          We currently have {inProgressActions.length} action{inProgressActions.length !== 1 ? "s" : ""} in progress.
        </p>
        {data.actions_in_progress ? <MarkdownContent content={data.actions_in_progress} /> : null}
        {inProgressActions.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Action Title</th>
                <th>Group</th>
              </tr>
            </thead>
            <tbody>
              {inProgressActions.map((a) => (
                <tr key={a.external_action_id}>
                  <td>{a.tal_action.title}</td>
                  <td>{a.tal_action.themes?.join(", ") ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>Actions Added to Plan</h3>
        {data.actions_added ? <MarkdownContent content={data.actions_added} /> : null}
        {notStartedActions.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Action Title</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {notStartedActions.map((a) => (
                <tr key={a.external_action_id}>
                  <td>{a.tal_action.title}</td>
                  <td>
                    <ScopeLabels ghgScope={a.tal_action.ghg_scope ?? []} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>Completed Actions</h3>
        <p>
          During the year we completed {completedActions.length} action{completedActions.length !== 1 ? "s" : ""}.
        </p>
        {completedActions.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Action Title</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {completedActions.map((a) => (
                <tr key={a.external_action_id}>
                  <td>{a.tal_action.title}</td>
                  <td>
                    <ScopeLabels ghgScope={a.tal_action.ghg_scope ?? []} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {alreadyDoingActions.length > 0 && (
          <>
            <h3 className="ui-break-before">Actions Completed Before this Plan</h3>
            <p>
              We had already completed {alreadyDoingActions.length} action
              {alreadyDoingActions.length !== 1 ? "s" : ""} before this plan was created.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Action Title</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {alreadyDoingActions.map((a) => (
                  <tr key={a.external_action_id}>
                    <td>{a.tal_action.title}</td>
                    <td>
                      <ScopeLabels ghgScope={a.tal_action.ghg_scope ?? []} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
