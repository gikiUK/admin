"use client";

import { BcorpPrintablePage } from "@/components/printables/bcorp-printable-page";
import { GikiLogo } from "@/components/printables/giki-logo";

import "./styles.css";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDate(date: Date): string {
  const day = ordinal(date.getDate());
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function BcorpHeaderPage() {
  return (
    <BcorpPrintablePage>
      {(props) => (
        <div className="ui-page ui-page-first">
          <div className="title-page-top">
            <GikiLogo size={48} />
            <div className="brand-name">
              Giki <span>Actions</span>
            </div>
          </div>

          <div className="title-page-body">
            <div className="title-page-accent" />
            <h1>B Corp Climate Action Plan</h1>
            <p className="subtitle">{props.data.name} | 2025</p>
            <div className="title-page-meta">
              <p>
                <strong>Prepared by:</strong> Jo Hand
              </p>
              <p>
                <strong>Date:</strong> {formatDate(new Date())}
              </p>
              <p>
                <strong>Version:</strong> 1.0
              </p>
            </div>
          </div>

          <div className="title-page-footer">Prepared using <a href="https://gikiactions.com/">Giki Actions</a> | Confidential</div>
        </div>
      )}
    </BcorpPrintablePage>
  );
}
