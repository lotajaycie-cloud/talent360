'use client';
import { useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../lib/store';
import { emp, successorsFor, computeBenchStrength, benchColor, detectSinglePointDependency, successionCoverage } from '../../lib/helpers';

export default function SuccessionPage() {
  const { employees, criticalRoles, currentUser, myTeam } = useApp();
  const router = useRouter();
  const [openRole, setOpenRole] = useState(null);

  const scoped = currentUser.role === 'PEOPLE_MANAGER';
  const teamIds = scoped ? myTeam().map(e => e.id) : null;
  const roles = scoped ? criticalRoles.filter(r => successorsFor(employees, r.id).some(s => teamIds.includes(s.id))) : criticalRoles;
  const dependencies = detectSinglePointDependency(employees);
  const cov = successionCoverage(criticalRoles, employees);

  if (scoped && roles.length === 0) {
    return (
      <>
        <p className="section-title">Succession heat map</p>
        <p className="section-sub">Limited to roles where a member of your team is a nominated successor.</p>
        <div className="card">None of your direct reports are currently nominated as successors for a critical role.</div>
      </>
    );
  }

  if (!scoped && criticalRoles.length === 0) {
    return (
      <>
        <p className="section-title">Succession heat map</p>
        <p className="section-sub">Click a role to see successors, bench strength, and gap detail.</p>
        <div className="card">
          <b>No critical roles defined yet.</b><br/>
          <span style={{fontSize:'12.5px', color:'var(--ink-2)'}}>
            This is real employee data (1,373 people) — succession planning starts once
            Talent Management defines which roles are critical and who the incumbents are.
            Add them in lib/config.js&apos;s initialCriticalRoles array.
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="section-title">Succession heat map</p>
      <p className="section-sub">Click a role to see successors, bench strength, and gap detail.</p>
      {!scoped && dependencies.length > 0 && (
        <div className="caveat">
          ⚠ Single-point dependency: {dependencies.map(e => (
            `${e.name} is nominated for ${e.successorForRoles.length} critical roles (${e.successorForRoles.map(rid => criticalRoles.find(r=>r.id===rid)?.title).join(', ')})`
          )).join('; ')}.
        </div>
      )}
      <div className="stat-row3" style={{marginBottom:'18px'}}>
        <div className="stat3 mint"><div className="l">{scoped ? 'Roles your team is nominated for' : 'Critical roles'}</div><div className="v">{scoped ? roles.length : cov.total}</div></div>
        {scoped
          ? <div className="stat3 amber"><div className="l">Team members nominated</div><div className="v">{myTeam().filter(e=>e.successorForRoles&&e.successorForRoles.length).length}</div></div>
          : <div className="stat3 amber"><div className="l">Coverage</div><div className="v">{cov.total ? cov.pct+'%' : '—'}</div></div>}
        {!scoped && <div className="stat3 lav"><div className="l">Roles without successors</div><div className="v">{cov.total ? cov.total-cov.covered : 0}</div></div>}
      </div>
      <table className="t">
        <thead><tr><th>Critical role</th><th>Incumbent</th><th>Successors</th><th>Bench strength</th></tr></thead>
        <tbody>
          {roles.map(r => {
            const successors = successorsFor(employees, r.id);
            const bench = computeBenchStrength(employees, r.id);
            const incumbent = emp(employees, r.incumbentId);
            return (
              <Fragment key={r.id}>
                <tr className="click" onClick={() => setOpenRole(openRole === r.id ? null : r.id)}>
                  <td>{r.title}</td><td>{incumbent?.name || '—'}</td><td>{successors.length}</td>
                  <td><span className={`pill ${benchColor(bench)}`}>{bench}</span></td>
                </tr>
                {openRole === r.id && (
                  <tr>
                    <td colSpan={4}>
                      {successors.length ? successors.map(s => (
                        <div className="prow" key={s.id} style={{padding:'10px 0'}}>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                            <span><b>{s.name}</b> — {s.readiness || 'Not rated'} {s.successorForRoles.length > 1 && <span className="pill bad">Multi-role nominee</span>}</span>
                            <button className="btn small secondary" onClick={(ev) => { ev.stopPropagation(); router.push(`/profile?id=${s.id}`); }}>Open talent profile →</button>
                          </div>
                          <div style={{fontSize:'12px', color:'var(--ink-2)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px'}}>
                            <span><b>Gap:</b> {s.successorGap || '—'}</span>
                            <span><b>Strengths:</b> {s.successorStrengths || '—'}</span>
                            <span><b>Risk:</b> {s.successorRisks || '—'}</span>
                            <span><b>Target readiness date:</b> {s.targetReadinessDate || '—'}</span>
                          </div>
                        </div>
                      )) : <span style={{color:'var(--ink-3)', fontSize:'12.5px'}}>No successor identified.</span>}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
