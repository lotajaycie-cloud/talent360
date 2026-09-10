'use client';
import { useApp } from '../../lib/store';
import { idpProgress } from '../../lib/helpers';

export default function IdpPage() {
  const { employees, currentUser, myTeam, markIdpDone } = useApp();
  const scoped = currentUser.role === 'PEOPLE_MANAGER';
  const pool = scoped ? myTeam() : employees;
  const withIdp = pool.filter(e => e.idp && e.idp.length);
  const noIdp = pool.filter(e => !e.idp || e.idp.length === 0);

  return (
    <>
      <p className="section-title">IDP / development</p>
      <p className="section-sub">{scoped ? 'Scoped to your direct reports. ' : ''}Marking an activity done updates this talent&apos;s Talent Profile and Home&apos;s stats immediately.</p>
      <table className="t">
        <thead><tr><th>Talent</th><th>Progress</th><th>Activities</th></tr></thead>
        <tbody>
          {withIdp.map(e => (
            <tr key={e.id}>
              <td><b>{e.name}</b><br/><span style={{color:'var(--ink-3)'}}>{e.dept}</span></td>
              <td>{idpProgress(e.idp)}%</td>
              <td>
                {e.idp.map((a, i) => {
                  const cls = a.status==='Completed'?'good':a.status==='Behind'?'bad':'neutral';
                  return (
                    <div key={i} style={{marginBottom:'6px'}}>
                      {a.goal} <span className={`pill ${cls}`}>{a.status}</span>{' '}
                      {a.status !== 'Completed' && <button className="btn small secondary" onClick={() => markIdpDone(e.id, i)}>Mark done</button>}
                    </div>
                  );
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {noIdp.length > 0 && (
        <div className="card" style={{marginTop:'14px'}}>
          <b style={{fontSize:'12.5px', color:'var(--red)'}}>No IDP on file</b><br/>
          {noIdp.map(e => e.name).join(', ')}
        </div>
      )}
    </>
  );
}
