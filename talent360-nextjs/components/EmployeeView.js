'use client';
import { useApp } from '../lib/store';
import { emp, idpProgress } from '../lib/helpers';

export default function EmployeeView() {
  const { employees, currentUser, markIdpDone } = useApp();
  const e = emp(employees, currentUser.employeeId);
  if (!e) return <div className="card">No profile found for this login.</div>;

  const pct = idpProgress(e.idp);
  const dueSoon = (e.idp||[]).filter(a => a.status !== 'Completed').length;
  const overdue = (e.idp||[]).filter(a => a.status === 'Behind').length;
  const done = (e.idp||[]).filter(a => a.status === 'Completed').length;

  return (
    <>
      <div className="greet-row">
        <div>
          <div className="greet">My Development</div>
          <div className="greet-sub">Track and update progress on your own IDP. Talent Review, Calibration, and other employees&apos; data are not part of this view.</div>
        </div>
      </div>
      <div className="hero" style={{maxWidth:'520px'}}>
        <div className="hero-top"><h3>IDP Progress</h3></div>
        <div className="hero-num">{pct}%</div>
        <div className="hero-pills">
          <div className="hero-pill">{done} completed</div>
          <div className="hero-pill">{dueSoon} active</div>
          {overdue > 0 && <div className="hero-pill" style={{background:'var(--red)', borderColor:'var(--red)'}}>{overdue} overdue</div>}
        </div>
      </div>
      <div className="card" style={{maxWidth:'640px'}}>
        <div className="section-title" style={{marginBottom:'12px'}}>My development activities</div>
        {(e.idp||[]).length ? e.idp.map((a, i) => (
          <div className="prow" key={i}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
              <b style={{fontSize:'13px'}}>{a.goal}</b>
              <span className={`pill ${a.status==='Completed'?'good':a.status==='Behind'?'bad':'neutral'}`}>{a.status}</span>
            </div>
            <div style={{fontSize:'11.5px', color:'var(--ink-2)', marginBottom:'8px'}}>{a.type} · {a.purpose} · Target {a.target}</div>
            {a.status !== 'Completed' && (
              <button className="btn small secondary" onClick={() => markIdpDone(e.id, i)}>Mark as complete</button>
            )}
          </div>
        )) : <div style={{color:'var(--ink-3)', fontSize:'12.5px'}}>No development activities on file yet.</div>}
      </div>
    </>
  );
}
