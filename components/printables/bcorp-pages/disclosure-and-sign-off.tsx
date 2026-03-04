import { MarkdownContent } from "@/components/printables/markdown-content";
import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function DisclosureAndSignOff({ data, plan }: BcorpPageProps) {
  const disclosureActions = plan.filter((a) =>
    (a.tal_action.themes ?? []).includes("Governance disclosure and reporting")
  );

  return (
    <div className="ui-page">
      {disclosureActions.length > 0 && (
        <div className="ui-section">
          <h2>Performance Reporting &amp; Public Disclosure</h2>
          <MarkdownContent content={data.disclosure_intro ?? ""} />
          <ul>
            {disclosureActions.map((a) => (
              <li key={a.external_action_id}>{a.tal_action.title}</li>
            ))}
          </ul>
          {data.reporting_cdp === "yes" && <p>We also report through CDP.</p>}
          {data.rating_ecovadis === "yes" && (
            <p>
              We have also been Ecovadis rated
              {data.rating_ecovadis_level ? ` and achieved ${data.rating_ecovadis_level} status` : ""}.
            </p>
          )}
          <MarkdownContent content={data.disclosure_closing ?? ""} />
        </div>
      )}

      <div className="ui-section">
        <h2>Sign Off</h2>
        <div className="sign-off-box">
          <p>
            <strong>Approval:</strong> This plan has been approved by: {data.approval_authority}
          </p>
          <p>
            <strong>Date of Approval:</strong> {data.approval_date}
          </p>
          <p>
            <strong>Next Review Date:</strong> {data.review_date}
          </p>
        </div>
      </div>
    </div>
  );
}
