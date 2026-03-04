function Scope1Icon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
      <path fill="currentColor" d="M6 1C3.5 4.5 2.5 7 2.5 8.5a3.5 3.5 0 107 0C9.5 7 8.5 4.5 6 1z" />
    </svg>
  );
}

function Scope2Icon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
      <path fill="currentColor" d="M7 1L2.5 6.5H5L4 11l5.5-5.5H7z" />
    </svg>
  );
}

function Scope3Icon() {
  return (
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 .5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM5.5 10.4A4.5 4.5 0 011.5 6c0-.3 0-.7.1-1L4 7.4V8c0 .6.4 1 1 1v1.4zm3.6-1.3c-.2-.5-.6-.8-1.1-.8H7.5V7.2c0-.3-.2-.5-.5-.5H4V5.5h1c.3 0 .5-.2.5-.5V4H7c.6 0 1-.4 1-1v-.2A4.5 4.5 0 0110.5 6c0 1.2-.5 2.3-1.4 3.1z"
      />
    </svg>
  );
}

export function getScopeNumbers(ghgScope: string[]): (1 | 2 | 3)[] {
  return ghgScope
    .map((s) => {
      const match = s.match(/^Scope (\d)/);
      return match ? (Number.parseInt(match[1], 10) as 1 | 2 | 3) : null;
    })
    .filter((n): n is 1 | 2 | 3 => n !== null);
}

export function ScopeLabels({ ghgScope }: { ghgScope: string[] }) {
  return (
    <>
      {ghgScope.map((s) => {
        const match = s.match(/^Scope (\d)/);
        if (match) {
          return <ScopeLabel key={s} scope={Number.parseInt(match[1], 10) as 1 | 2 | 3} />;
        }
        return (
          <span key={s} className="scope-label sl-other">
            {s}
          </span>
        );
      })}
    </>
  );
}

export function ScopeLabel({ scope }: { scope: 1 | 2 | 3 }) {
  const cls = `scope-label sl-${scope}`;
  const icon = scope === 1 ? <Scope1Icon /> : scope === 2 ? <Scope2Icon /> : <Scope3Icon />;
  return (
    <span className={cls}>
      {icon}Scope {scope}
    </span>
  );
}
