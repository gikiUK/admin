export type YesNo = "yes" | "no" | "";

export function yesNo(val: string | undefined): YesNo {
  if (val === "yes" || val === "no") return val;
  return "";
}

function CheckIcon() {
  return (
    <svg
      viewBox="-1 -1 24 24"
      xmlns="http://www.w3.org/2000/svg"
      height="22"
      width="22"
      role="img"
      aria-label="Checked"
    >
      <path
        d="M5.5 12.121083333333333 7.745833333333333 15.308333333333332a0.9615833333333332 0.9615833333333332 0 0 0 1.56475 0.04674999999999999L16.5 6.259"
        fill="none"
        stroke="#0d9488"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M0.6875 10.999083333333333a10.3125 10.3125 0 1 0 20.625 0 10.3125 10.3125 0 1 0 -20.625 0Z"
        fill="none"
        stroke="#0d9488"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function UncheckedIcon() {
  return (
    <svg
      viewBox="-1 -1 24 24"
      xmlns="http://www.w3.org/2000/svg"
      height="22"
      width="22"
      role="img"
      aria-label="Unchecked"
    >
      <path
        d="M0.6875 10.999083333333333a10.3125 10.3125 0 1 0 20.625 0 10.3125 10.3125 0 1 0 -20.625 0Z"
        fill="none"
        stroke="#ef4444"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M7.5 7.5 14.5 14.5M14.5 7.5 7.5 14.5"
        fill="none"
        stroke="#ef4444"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function YesNoSelect({ value, onChange }: { value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <>
      <input
        type="checkbox"
        className="toggle-checkbox"
        checked={value === "yes"}
        onChange={(e) => onChange(e.target.checked ? "yes" : "")}
      />
      <span className="toggle-icon">{value === "yes" ? <CheckIcon /> : <UncheckedIcon />}</span>
    </>
  );
}
