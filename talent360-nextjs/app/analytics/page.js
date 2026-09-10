'use client';
import { useApp } from '../../lib/store';
import { aZoneCount, successionCoverage } from '../../lib/helpers';

export default function AnalyticsPage() {
  const { employees, criticalRoles, nineBoxConfig } = useApp();
  const cov = successionCoverage(criticalRoles, employees);

  return (
    <>
      <p className="section-title">Executive dashboard</p>
      <p className="section-sub">Computed live from the same pool driving every other module.</p>
      <div className="stat-row3">
        <div className="stat3 mint"><div className="l">Talent Strength (A-Zone)</div><div className="v">{Math.round((aZoneCount(nineBoxConfig, employees)/employees.length)*100)}%</div></div>
        <div className="stat3 amber">
          <div className="l">Succession Risk</div>
          <div className="v">{cov.total ? (cov.covered < cov.total ? 'Moderate' : 'Low') : 'Not tracked'}</div>
          <div className="s">{cov.total ? `${cov.total - cov.covered} roles uncovered` : 'No critical roles defined yet'}</div>
        </div>
        <div className="stat3 lav"><div className="l">Critical Role Coverage</div><div className="v">{cov.total ? cov.pct+'%' : '—'}</div></div>
      </div>
      <p className="caveat">
        This is real July 2026 masterlist data — 1,373 employees (JG≥10 or SUP-and-up, active, 1+ year tenure), 370 with direct reports.
        Everyone loads in unassessed unless matched to real 2026 historical results — that&apos;s the correct starting point, not a bug.
        Competency analytics and the Age × Zone cross-tab still use the separate 343-person Potential Drivers workbook.
      </p>
    </>
  );
}
