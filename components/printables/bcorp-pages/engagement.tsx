import type { BcorpPageProps } from "@/components/printables/bcorp-printable-page";

export function Engagement(_props: BcorpPageProps) {
  return (
    <div className="ui-page">
      <div className="ui-section">
        <h2>Engagement</h2>
        <p>
          We recognise that achieving our climate ambitions requires working alongside our customers and industry peers
          &mdash; that&rsquo;s why we are committed to engaging in collaborative initiatives where our participation can
          contribute to collective progress. Our plan contains the following Engagement actions:
        </p>
        <ul>
          <li>Research government support that&rsquo;s available</li>
          <li>Join key industry sustainability initiatives</li>
          <li>Publicly share sustainability plans</li>
          <li>Encourage customers and clients to set targets and join initiatives</li>
        </ul>
      </div>

      {/* GOVERNANCE */}
      <div className="ui-section ui-break-before">
        <h2>Governance</h2>
        <p>
          We recognise that delivering our climate ambitions requires robust governance structures, clear accountability,
          and aligned organisational culture. That&rsquo;s why we are committed to embedding our transition plan across
          all levels of our organisation, from Board oversight to day-to-day operations. Our plan contains the following
          Governance actions:
        </p>
        <h3>Management and Board</h3>
        <ul>
          <li>Create a framework that allows you to communicate your transition plan clearly</li>
          <li>Assign management responsibilities for taking climate action</li>
          <li>Ensure a board member is accountable for sustainability performance</li>
          <li>Provide the Board with sustainability training</li>
          <li>Build senior leadership support</li>
          <li>Report on climate KPIs internally</li>
          <li>Include sustainability on meeting agendas</li>
        </ul>
        <h3 className="ui-break-before">Culture</h3>
        <ul>
          <li>Conduct employee engagement survey on sustainability</li>
          <li>Leverage the power of your Green Team</li>
          <li>Raise sustainability awareness with lunch and learn sessions</li>
          <li>Create a Green Wall to collect employee ideas for company sustainability</li>
          <li>Ensure rewards and performance reviews are aligned with net zero goals</li>
          <li>Start a Green Team</li>
          <li>Help employees adopt sustainable lifestyles with pledges and personal carbon footprints</li>
        </ul>
        <h3 className="ui-break-before">Learning and Development</h3>
        <ul>
          <li>Use free online resources to build sustainability knowledge</li>
          <li>Help employees reduce their digital carbon footprints</li>
          <li>Understand where sustainability capability gaps exist in the workforce</li>
          <li>Regularly share sustainability plans with colleagues</li>
          <li>Include sustainability training in employee learning and development</li>
          <li>Add sustainability to job descriptions and goals</li>
        </ul>
      </div>
    </div>
  );
}
