"use client";

import { BcorpPrintablePage } from "@/components/printables/bcorp-printable-page";

import "./styles.css";

export default function BcorpFooterPage() {
  return (
    <BcorpPrintablePage>
      {(props) => (
        <div className="ui-page ui-page-final">
          <div className="company-name">{props.data.name || "Company Name"}</div>
          <p>Certified B Corporation</p>
          <div className="page-footer">
            {props.data.name || "Company Name"} | B Corp Climate Action Plan 2025 | Prepared using <a href="https://gikiactions.com/">Giki Actions</a>
          </div>
        </div>
      )}
    </BcorpPrintablePage>
  );
}
