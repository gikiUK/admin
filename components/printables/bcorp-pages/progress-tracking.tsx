import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function ProgressTracking({ data, plan }: BcorpPageProps) {
  const inProgressActions = plan.filter((a) => a.state === "in_progress");
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
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-authored HTML */}
        {data.actions_in_progress ? <div dangerouslySetInnerHTML={{ __html: data.actions_in_progress }} /> : null}
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
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-authored HTML */}
        {data.actions_added ? <div dangerouslySetInnerHTML={{ __html: data.actions_added }} /> : null}

        <h3>Completed Actions</h3>
        <p>
          During the year we completed {completedActions.length} action{completedActions.length !== 1 ? "s" : ""}.
        </p>
        {completedActions.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Action Title</th>
                <th>GHG Scope</th>
              </tr>
            </thead>
            <tbody>
              {completedActions.map((a) => (
                <tr key={a.external_action_id}>
                  <td>{a.tal_action.title}</td>
                  <td>{a.tal_action.ghg_scope?.join(", ") ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
