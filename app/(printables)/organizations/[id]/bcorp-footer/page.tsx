"use client";

import { BcorpPrintablePage } from "@/components/printables/bcorp-printable-page";

export default function BcorpFooterPage() {
  return (
    <BcorpPrintablePage>
      {(_props) => (
        <div className="ui-page ui-page-final">
          <div className="company-name">Your Company Name</div>
          <p>Certified B Corporation</p>
          <p style={{ marginTop: "2em" }}>
            www.yourcompany.com
            <br />
            hello@yourcompany.com
          </p>
          <div className="page-footer">
            Your Company Name | B Corp Climate Action Plan 2025 | Prepared using giki actions
          </div>
        </div>
      )}
    </BcorpPrintablePage>
  );
}
