import { GOVERNANCE_CATEGORIES } from "@/components/bcorps/use-bcorp-form";
import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";
import { MarkdownContent } from "@/components/printables/markdown-content";

export function EngagementAndGovernance({ data, plan }: BcorpPageProps) {
  const hasEngagement = data.engagement && data.engagement.trim() !== "";
  const hasGovernment = data.government && data.government.trim() !== "";

  if (!hasEngagement && !hasGovernment) return null;

  const engagementActions = plan.filter((a) => a.tal_action.ghg_scope?.includes("Engagement"));
  const governanceActions = plan.filter((a) => a.tal_action.ghg_scope?.includes("Governance"));

  const byCategory: Record<string, string[]> = {};
  for (const a of governanceActions) {
    const cats = (a.tal_action.ghg_category ?? []).filter((c) => GOVERNANCE_CATEGORIES.includes(c));
    const assigned = cats.length > 0 ? cats : ["Other"];
    for (const cat of assigned) {
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(a.tal_action.title);
    }
  }
  const orderedCats = [...GOVERNANCE_CATEGORIES, "Other"].filter((c) => byCategory[c]);

  return (
    <div className="ui-page">
      {hasEngagement && (
        <div className="ui-section">
          <h2>Engagement</h2>
          <MarkdownContent content={data.engagement ?? ""} />
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
        <div className="ui-section">
          <h2>Governance</h2>
          <MarkdownContent content={data.government ?? ""} />
          {orderedCats.length > 0 &&
            orderedCats.map((cat) => (
              <div key={cat}>
                <h3>{cat} Actions</h3>
                <ul>
                  {byCategory[cat].map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
