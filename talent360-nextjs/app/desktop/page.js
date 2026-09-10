'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '../../lib/store';
import {
  totalAssessed, pendingAssessment, greenZoneTalents, cZoneTalents, idpCreatedCount,
  idpStatusBreakdown, boxDistribution, deptBreakdown, execDmSuccessionCoverage,
  successionCoverage, avatarColor,
} from '../../lib/helpers';
import { AVATAR_COLORS } from '../../lib/config';

export default function HomePage() {
  const router = useRouter();
  const { employees, criticalRoles, nineBoxConfig, currentUser, myTeam, activeCycle } = useApp();
  const isTeamView = currentUser.role === 'PEOPLE_MANAGER';
  const pool = isTeamView ? myTeam() : employees;
  const cov = successionCoverage(criticalRoles, employees);
  const totalAssessedN = totalAssessed(pool);
  const greenZone = greenZoneTalents(nineBoxConfig, pool);
  const cZone = cZoneTalents(nineBoxConfig, pool);
  const idpCreated = idpCreatedCount(pool);
  const idpStatus = idpStatusBreakdown(pool);
  const boxDist = boxDistribution(pool);
  const deptRows = deptBreakdown(pool);
  const execDm = execDmSuccessionCoverage(employees, criticalRoles, pool);
  const cycle = activeCycle();

  function openProfile(id) { router.push(`/profile?id=${id}`); }

  return (
    <>
      <div className="greet-row">
        <div>
          <div className="greet">Good morning, {currentUser.name.split(' ')[0]}.</div>
          <div className="greet-sub">{isTeamView ? `Here is your team's talent overview — ${pool.length} direct reports.` : 'Here is your talent pipeline overview.'}</div>
        </div>
        <div className="greet-actions">
          <button className="icon-btn">⚙️</button><button className="icon-btn">⬇</button><button className="icon-btn">⤴</button>
        </div>
      </div>
      <div className="home-grid">
        <div>
          <div className="hero">
            <div className="hero-top">
              <h3>{isTeamView ? 'My Team — Talents Assessed' : 'Total of Talents Assessed CPG Wide'}</h3>
              <div className="hero-badge">▲ {pool.length ? Math.round((totalAssessedN/pool.length)*100) : 0}%</div>
            </div>
            <div className="hero-desc">Talent placed on the 9-box grid this cycle{isTeamView ? ', among your direct reports.' : ', across your organization.'}</div>
            <div className="hero-num">{totalAssessedN} <span style={{fontSize:'16px', fontWeight:600, color:'#A5A6B5'}}>of {pool.length} placed</span></div>
            <div className="hero-pills">
              {isTeamView
                ? <div className="hero-pill">📅 {cycle.name}</div>
                : <Link href="/cycle" className="hero-pill" style={{cursor:'pointer', textDecoration:'none', color:'inherit'}}>📅 {cycle.name}</Link>}
              <div className="hero-pill solid">{pendingAssessment(pool).length} pending assessment</div>
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{marginBottom:'2px'}}>9-Box Distribution</div>
            <p className="section-sub" style={{marginBottom:'12px'}}>{totalAssessedN} assessed talent placed across the grid this cycle.</p>
            <div className="grid9">
              {[7,8,9,4,5,6,1,2,3].map(box => (
                <div className={`cell zone-${nineBoxConfig[box]}`} key={box}>
                  <div className="n">BOX {box}</div><div className="c">{boxDist[box] || 0}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-row3">
            <div className="stat3 mint"><div className="l">Green Zone Talents</div><div className="v">{greenZone.length}</div><div className="s">Boxes 6, 8 &amp; 9</div></div>
            <div className="stat3 amber"><div className="l">Assessment Completion</div><div className="v">{pool.length ? Math.round((totalAssessedN/pool.length)*100) : 0}%</div><div className="s">⏰ Complete by {cycle.assessmentEnd}</div></div>
            <div className="stat3 lav">
              <div className="l">{isTeamView ? 'Succession Actions' : 'Succession Coverage'}</div>
              <div className="v">{isTeamView ? pool.filter(e=>e.successorForRoles&&e.successorForRoles.length).length : (cov.total ? cov.pct+'%' : '—')}</div>
              <div className="s">{isTeamView ? 'team members nominated' : (cov.total ? `${cov.covered} of ${cov.total} roles` : 'No critical roles defined yet')}</div>
            </div>
          </div>

          {!isTeamView && (
            <>
              <div className="card">
                <div className="section-title" style={{marginBottom:'2px'}}>Talents Assessed by Department</div>
                <p className="section-sub" style={{marginBottom:'10px'}}>{deptRows.length} departments · sorted by assessed count.</p>
                <div style={{maxHeight:'260px', overflowY:'auto'}}>
                  <table className="t" style={{fontSize:'11.5px'}}>
                    <thead><tr><th>Department</th><th>Assessed</th><th>Total</th><th>%</th></tr></thead>
                    <tbody>
                      {deptRows.map(d => (
                        <tr key={d.dept}>
                          <td>{d.dept}</td><td>{d.assessed}</td><td>{d.total}</td>
                          <td>{d.total ? Math.round((d.assessed/d.total)*100) : 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="section-title" style={{marginBottom:'2px'}}>Succession Coverage — EXEC &amp; DM</div>
                <p className="section-sub" style={{marginBottom:'10px'}}>How many EXEC/DM-level roles have at least one identified successor.</p>
                <div className="caveat" style={{marginBottom:0}}>
                  <b>{execDm.identified} of {execDm.total}</b> EXEC/DM with an identified successor.
                  {execDm.total > 0 && <><br/>Data not yet available — this will populate automatically once Critical Roles and Succession Nominations are defined (currently empty; see Succession module).</>}
                </div>
              </div>
            </>
          )}

          <div className="stat-row3" style={{gridTemplateColumns:'1fr 1.4fr'}}>
            <div className="stat3 mint"><div className="l">IDP Created</div><div className="v">{idpCreated}</div><div className="s">of {pool.length} {isTeamView?'team members':'talent'} have an IDP on file</div></div>
            <div className="card" style={{margin:0}}>
              <div style={{fontSize:'11.5px', fontWeight:600, marginBottom:'10px', color:'var(--ink)'}}>Overall IDP Status</div>
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                <span className="pill good">{idpStatus.Completed} Completed</span>
                <span className="pill info">{idpStatus['In Progress']} In Progress</span>
                <span className="pill bad">{idpStatus.Behind} Behind</span>
                <span className="pill neutral">{idpStatus['Not Started']} Not Started</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="section-title" style={{marginBottom:'10px'}}>{isTeamView ? 'My Green Zone team members' : 'Needs attention — Green Zone talents'}</div>
            <ul className="rank-list">
              {greenZone.length ? greenZone.map(e => (
                <li className="rank-row" key={e.id} onClick={() => openProfile(e.id)}>
                  <div className="rank-avatar" style={{background:avatarColor(AVATAR_COLORS, e.id)}}>{e.initials}</div>
                  <div><div className="rank-name">{e.name}</div><div className="rank-sub">Box {e.box} · {e.readiness || 'Readiness not rated'}</div></div>
                </li>
              )) : <li className="rank-row">No Green Zone talent yet.</li>}
            </ul>
          </div>
          <div className="card">
            <div className="section-title" style={{marginBottom:'10px'}}>{isTeamView ? 'My C-Zone team members' : 'C-Zone talents'}</div>
            <ul className="rank-list">
              {cZone.length ? cZone.map(e => (
                <li className="rank-row" key={e.id} onClick={() => openProfile(e.id)}>
                  <div className="rank-avatar" style={{background:avatarColor(AVATAR_COLORS, e.id)}}>{e.initials}</div>
                  <div><div className="rank-name">{e.name}</div><div className="rank-sub">Box {e.box} · {e.dept}</div></div>
                </li>
              )) : <li className="rank-row">No C-Zone talent currently.</li>}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
