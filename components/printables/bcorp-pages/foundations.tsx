import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

const DEFAULT_WHY_PLANET =
  "<p>Climate change poses an urgent threat to Earth\u2019s ecosystems and communities. Limiting warming to 1.5\u00b0C is critical to protect coral reefs, reduce extreme heatwaves, floods and droughts, and prevent biodiversity collapse.</p><p>Every fraction of a degree matters for people around the world who are already facing the impacts of extreme weather, food insecurity, and rising sea levels. The scientific consensus is clear: decisive action today is essential to avoid irreversible consequences and safeguard a liveable planet for current and future generations.</p>";

const DEFAULT_WHY_BUSINESS =
  "<p>The transition to a low-carbon economy creates significant business opportunities. Companies taking early action can gain competitive advantages through innovation, operational efficiencies, and access to growing sustainable markets.</p><p>Climate change also represents a risk to business continuity. Unchecked warming threatens supply chain resilience, increases operational disruptions and poses direct physical risks including damage to assets from extreme weather. Limiting warming to 1.5\u00b0C helps protect physical assets and employees while reducing long-term business uncertainty.</p>";

const DEFAULT_COMMITMENT =
  "<p>We are committed to supporting the global ambition to limit global warming to 1.5\u00b0C.</p>";

export function Foundations({ data }: BcorpPageProps) {
  const commitment = data.our_commitment || DEFAULT_COMMITMENT;
  const whyPlanet = data.why_planet || DEFAULT_WHY_PLANET;
  const whyBusiness = data.why_business || DEFAULT_WHY_BUSINESS;

  return (
    <div className="ui-page">
      <div className="ui-section">
        <h2>Foundations</h2>
        <h3>Our Commitment</h3>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-authored HTML */}
        <div dangerouslySetInnerHTML={{ __html: commitment }} />
        <h3>Strategic Rationale</h3>
        <h4>Why This Matters for Our Planet</h4>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-authored HTML */}
        <div dangerouslySetInnerHTML={{ __html: whyPlanet }} />
        <h4>Why This Matters for Our Business</h4>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is admin-authored HTML */}
        <div dangerouslySetInnerHTML={{ __html: whyBusiness }} />
      </div>
    </div>
  );
}
