import type { BcorpData } from "@/lib/bcorp/types";

const TARGET_TYPES: [string, string][] = [
  ["target_scope12_interim", "Scope 1 & 2 Short Term Target"],
  ["target_scope3_interim", "Scope 3 Short Term Target"],
  ["target_longterm", "Long Term Target"]
];

export function MetricsAndTargets({ data }: { data: BcorpData }) {
  const hasSmech = data.initiative_smech === "yes";
  const hasSbti = data.initiative_sbti === "yes";
  const targets = TARGET_TYPES.filter(([key]) => data[key]?.trim());

  if (!hasSmech && !hasSbti && targets.length === 0) return null;

  return (
    <>
      <h3>Metrics &amp; Targets</h3>
      {hasSmech && (
        <p>
          We have signed up to SME Climate Hub. SME Climate Hub is a global initiative that helps small and medium-sized
          businesses commit to halving emissions by 2030 and achieving net-zero by 2050.
        </p>
      )}
      {hasSbti && (
        <p>
          We have a Science Based Target. SBTi (Science Based Targets initiative) provides companies with a framework to
          set emissions reduction targets aligned with climate science and the goals of the Paris Agreement.
        </p>
      )}
      {targets.length > 0 && (
        <>
          <p>
            We recognize that measurable targets and commitments are essential to track progress and drive
            accountability. That's why we have included the following targets and commitments in our plan:
          </p>
          <table className="body-table">
            <thead>
              <tr>
                <th>Target Type</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {targets.map(([key, label]) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td>{data[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.baseline_year?.trim() && data.baseline_emissions?.trim() && (
            <p>
              Targets are based on a {data.baseline_year} baseline when emissions were {data.baseline_emissions} tCO2e.
            </p>
          )}
        </>
      )}
    </>
  );
}
