type ToggleSectionProps = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleSection({ label, description, value, onChange }: ToggleSectionProps) {
  return (
    <label className={`toggle-section${value ? " toggle-section--checked" : ""}`}>
      <input type="checkbox" className="toggle-checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <div className="toggle-label">
        <span>{label}</span>
        {description && <aside>{description}</aside>}
      </div>
      <div className="toggle-indicator" />
    </label>
  );
}
