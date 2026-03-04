import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function Engagement({ data }: BcorpPageProps) {
  const hasEngagement = data.engagement && data.engagement.trim() !== "";
  const hasGovernment = data.government && data.government.trim() !== "";

  if (!hasEngagement && !hasGovernment) return null;

  return (
    <div className="ui-page">
      {hasEngagement && (
        <div className="ui-section">
          <h2>Engagement</h2>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-authored HTML */}
          <div dangerouslySetInnerHTML={{ __html: data.engagement ?? "" }} />
        </div>
      )}

      {hasGovernment && (
        <div className={`ui-section${hasEngagement ? " ui-break-before" : ""}`}>
          <h2>Governance</h2>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-authored HTML */}
          <div dangerouslySetInnerHTML={{ __html: data.government ?? "" }} />
        </div>
      )}
    </div>
  );
}
