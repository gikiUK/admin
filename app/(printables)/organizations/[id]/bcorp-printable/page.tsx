"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchBcorpData } from "@/lib/bcorp/api";
import type { BcorpData } from "@/lib/bcorp/types";

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex gap-4 py-2 border-b last:border-0">
      <span className="w-56 shrink-0 text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">{value || <span className="text-gray-400 italic">Not set</span>}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-0">
      <h2 className="text-base font-semibold bg-gray-100 px-3 py-2 rounded-sm mb-0">{title}</h2>
      <div className="px-3">{children}</div>
    </section>
  );
}

export default function BcorpPrintablePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BcorpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBcorpData(id)
      .then(setData)
      .catch((err) => {
        if (err instanceof Error && "status" in err && (err as { status: number }).status === 404) {
          setData({});
        } else {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-sm text-red-600">{error}</div>;

  const d = data ?? {};

  return (
    <div className="min-h-screen bg-white p-8 max-w-3xl mx-auto space-y-6 print:p-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">B Corp Climate Action Report</h1>
        <p className="text-sm text-gray-500">Organisation ID: {id}</p>
      </div>

      <Section title="Company Summary">
        <div className="py-3">
          {d.company_description ? (
            <p className="text-sm text-gray-900">{d.company_description}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Not set</p>
          )}
        </div>
      </Section>

      <Section title="Sign Off">
        <Row label="Approval Authority" value={d.approval_authority} />
        <Row label="Approval Date" value={d.approval_date} />
        <Row label="Review Date" value={d.review_date} />
      </Section>

      <Section title="Certifications & Initiatives">
        <Row label="B Corp Certified" value={d.cert_bcorp} />
        <Row label="ISO 14001 Certified" value={d.cert_iso14001} />
        <Row label="SME Climate Hub" value={d.initiative_smech} />
        <Row label="Science Based Target (SBTi)" value={d.initiative_sbti} />
        <Row label="Reports through CDP" value={d.reporting_cdp} />
        <Row label="Ecovadis Rating" value={d.rating_ecovadis} />
        {d.rating_ecovadis === "yes" && <Row label="Ecovadis Rating Level" value={d.rating_ecovadis_level} />}
      </Section>

      <Section title="Policies">
        <Row label="Sustainable Procurement Policy" value={d.policy_procurement} />
        <Row label="Supplier Code of Conduct" value={d.policy_supplier_code} />
        <Row label="Sustainable Travel Policy" value={d.policy_travel} />
        <Row label="Environmental Management Policy" value={d.policy_environment} />
      </Section>

      <Section title="Emission Targets">
        <Row label="Scope 1 & 2 Interim Target" value={d.target_scope12_interim} />
        <Row label="Scope 1 & 2 Long-term Target" value={d.target_scope12_longterm} />
        <Row label="Scope 3 Interim Target" value={d.target_scope3_interim} />
        <Row label="Scope 3 Long-term Target" value={d.target_scope3_longterm} />
        <Row label="Baseline Year" value={d.target_baseline_year} />
        <Row label="Baseline Emissions (tCO2e)" value={d.target_baseline_emissions} />
      </Section>
    </div>
  );
}
