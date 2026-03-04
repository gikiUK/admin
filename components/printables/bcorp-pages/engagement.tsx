import { GOVERNANCE_CATEGORIES } from "@/components/bcorps/use-bcorp-form";
import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function Engagement({ data, plan }: BcorpPageProps) {
  console.log(data);
  const hasEngagement = data.engagement && data.engagement.trim() !== "";
  const hasGovernment = data.government && data.government.trim() !== "";

  if (!hasEngagement && !hasGovernment) return null;

  const engagementActions = plan.filter((a) => a.tal_action.ghg_scope?.includes("Engagement"));
  const governanceActions = plan.filter((a) => a.tal_action.ghg_scope?.includes("Governance"));

  const govByCategory: Record<string, string[]> = {};
  for (const a of governanceActions) {
    const cats = (a.tal_action.ghg_category ?? []).filter((c) => GOVERNANCE_CATEGORIES.includes(c));
    const assigned = cats.length > 0 ? cats : ["Other"];
    for (const cat of assigned) {
      if (!govByCategory[cat]) govByCategory[cat] = [];
      govByCategory[cat].push(a.tal_action.title);
    }
  }
  const orderedGovCats = [...GOVERNANCE_CATEGORIES, "Other"].filter((c) => govByCategory[c]);

  return (
    <div className="ui-page">
      {hasEngagement && (
        <div className="ui-section">
          <h2>Engagement</h2>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-authored HTML */}
          <div dangerouslySetInnerHTML={{ __html: data.engagement ?? "" }} />
          {engagementActions.length > 0 && (
            <ul>
              {engagementActions.map((a) => (
                <li key={a.external_action_id}>{a.tal_action.title}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {hasGovernment && (
        <div className={`ui-section${hasEngagement ? " ui-break-before" : ""}`}>
          <h2>Governance</h2>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-authored HTML */}
          <div dangerouslySetInnerHTML={{ __html: data.government ?? "" }} />
          {orderedGovCats.length > 0 && (
            <ul>
              {orderedGovCats.map((cat) => (
                <li key={cat}>
                  <strong>{cat}:</strong> {govByCategory[cat].join("; ")}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
