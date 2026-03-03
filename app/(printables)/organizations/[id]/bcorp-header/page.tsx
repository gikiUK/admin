"use client";

import { BcorpPrintablePage } from "@/components/printables/bcorp-printable-page";
import { GikiLogo } from "@/components/printables/giki-logo";

export default function BcorpHeaderPage() {
  return (
    <BcorpPrintablePage>
      {(props) => (
        <div className="ui-page ui-page-first">
          <div className="title-page-top">
            <GikiLogo size={48} />
            <div className="brand-name">
              giki <span>actions</span>
            </div>
          </div>

          <div className="title-page-body">
            <div className="title-page-accent" />
            <h1>B Corp Climate Action Plan</h1>
            <p className="subtitle">{props.data.name} | 2025</p>
            <div className="title-page-meta">
              <p>
                <strong>Prepared by:</strong> Your Company Name
              </p>
              <p>
                <strong>Date:</strong> 2025
              </p>
              <p>
                <strong>Version:</strong> 1.0
              </p>
            </div>
          </div>

          <div className="title-page-footer">Prepared using giki actions | Confidential</div>
        </div>
      )}
    </BcorpPrintablePage>
  );
}
