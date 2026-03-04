import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function PerformanceReporting(_props: BcorpPageProps) {
  return (
    <div className="ui-page">
      <div className="ui-section">
        <h2>Performance Reporting &amp; Public Disclosure</h2>
        <p>
          We are committed to comprehensive public reporting on our plan, creating accountability to our stakeholders
          and demonstrating the integrity of our commitments. We have the following disclosure related actions on our
          plan:
        </p>
        <ul>
          <li>Report publicly on sustainability performance and progress</li>
          <li>Write and publish a Climate Transition Plan</li>
          <li>Get emissions assured</li>
        </ul>
        <p>
          To ensure transparent reporting of climate performance to stakeholders, and accountability for commitments and
          plans, this plan is available on our website or is available on request.
        </p>
      </div>

      {/* SIGN OFF */}
      <div className="ui-section">
        <h2>Sign Off</h2>
        <div className="sign-off-box">
          <p>
            <strong>Approval:</strong> This plan has been approved by: [Board / Directors / Trustees / Executive
            Committee]
          </p>
          <p>
            <strong>Date of Approval:</strong> [Date]
          </p>
          <p>
            <strong>Next Review Date:</strong> [Date]
          </p>
        </div>
      </div>
    </div>
  );
}
