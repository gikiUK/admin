import { GikiLogo } from "./giki-logo";

export function DocHeader() {
  return (
    <div className="doc-header">
      <GikiLogo size={36} />
      <div className="brand-name">
        giki <span>actions</span>
      </div>
    </div>
  );
}
