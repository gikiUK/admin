type ToggleSectionProps = {
  label: string;
  description?: string;
  children: React.ReactNode;
};

export function ToggleSection({ label, description, children }: ToggleSectionProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: checkbox is passed via children
    <label className="toggle-section">
      <div className="toggle-label">
        <span>{label}</span>
        {description && <aside>{description}</aside>}
      </div>
      <div className="toggle-body">{children}</div>
    </label>
  );
}
