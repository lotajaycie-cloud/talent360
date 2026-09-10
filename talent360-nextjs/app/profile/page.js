'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../lib/store';
import { emp, zoneOf, idpProgress } from '../../lib/helpers';

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<div className="card">Loading…</div>}>
      <ProfilePage />
    </Suspense>
  );
}

function ProfilePage() {
  const { employees, criticalRoles, nineBoxConfig, currentUser, myTeam, canSee } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState('overview');

  const scoped = currentUser.role === 'PEOPLE_MANAGER';
  const pool = scoped ? myTeam() : employees;
  const [query, setQuery] = useState('');

  if (pool.length === 0) return <div className="card">You have no direct reports to view.</div>;

  const idFromUrl = searchParams.get('id');
  const selectedId = pool.some(e => e.id === idFromUrl) ? idFromUrl : pool[0].id;
  const e = emp(employees, selectedId);
  const zone = zoneOf(nineBoxConfig, e.box);
  const successorRoles = (e.successorForRoles || []).map(rid => criticalRoles.find(r => r.id === rid)).filter(Boolean);

  const filteredPool = query ? pool.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : pool;

  function selectEmployee(id) { router.push(`/profile?id=${id}`); }

  return (
    <>
      <div style={{marginBottom:'14px'}}>
        <input
          type="text" placeholder={`Search ${pool.length} talent by name...`} value={query}
          onChange={ev => setQuery(ev.target.value)}
          style={{width:'300px', border:'1px solid var(--border)', borderRadius:'8px', padding:'6px 10px', fontSize:'12.5px', marginBottom:'6px', display:'block'}}
        />
        <select value={selectedId} onChange={ev => selectEmployee(ev.target.value)}>
          {filteredPool.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="profile-head">
        <div className="avatar">{e.initials}</div>
        <div>
          <div style={{fontSize:'17px', fontWeight:700}}>{e.name}</div>
          <div style={{fontSize:'12.5px', color:'#C9CAD6'}}>{e.position} · {e.dept}</div>
          {canSee('age')
            ? <div style={{fontSize:'11.5px', color:'#8892B0', marginTop:'4px'}}>Age {e.age} · Level {e.level}</div>
            : <div style={{fontSize:'11px', color:'#6E7BA0', marginTop:'4px'}}>Age hidden — not permitted for this role</div>}
        </div>
      </div>
      <div className="tab-bar">
        {[['overview','Overview'],['performance','Performance'],['development','Development'],['succession','Succession']].map(([id, label]) => (
          <button key={id} className={`tab-btn ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className="profile-body">
        {tab === 'overview' && (
          <>
            <div className="prow">
              <span className="lbl">Snapshot</span>
              {e.box ? <span className={`pill ${zone}`}>Box {e.box} · {zone}-Zone</span> : <span className="pill bad">Not yet assessed</span>}
              {successorRoles.length > 0 && <span className="pill readiness"> {e.readiness}</span>}
            </div>
            <div className="prow">
              <span className="lbl">Development progress — {idpProgress(e.idp)}%</span>
              <div className="bar-track"><div className="bar-fill" style={{width:`${idpProgress(e.idp)}%`}}></div></div>
            </div>
            <div className="prow"><span className="lbl">Department</span>{e.dept} · Level {e.level}</div>
          </>
        )}
        {tab === 'performance' && (
          <>
            <div className="prow">
              <span className="lbl">Talent assessment</span>
              {e.box ? <span className={`pill ${zone}`}>Box {e.box} · {zone}-Zone</span> : <span className="pill bad">Not yet assessed</span>}
              {e.perf && <span className="pill neutral"> Performance: {e.perf}</span>}
              {e.pot && <span className="pill neutral"> Potential: {e.pot}</span>}
            </div>
            <div className="prow">
              <span className="lbl">Individual competency ratings</span>
              {Object.keys(e.competencies || {}).length > 0 ? (
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 16px'}}>
                  {Object.entries(e.competencies).map(([k, v]) => (
                    <div key={k} style={{display:'flex', justifyContent:'space-between', fontSize:'12.5px', padding:'5px 0', borderBottom:'1px solid var(--border)'}}>
                      <span>{k}</span><span className={`pill ${v==='High'?'good':v==='Med'?'warn':'bad'}`}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : <div style={{fontSize:'12px', color:'var(--ink-3)'}}>No competency ratings on file — not yet assessed this cycle.</div>}
            </div>
          </>
        )}
        {tab === 'development' && (
          <div className="prow">
            <span className="lbl">IDP — {idpProgress(e.idp)}%</span>
            <div className="bar-track"><div className="bar-fill" style={{width:`${idpProgress(e.idp)}%`}}></div></div>
            {(e.idp||[]).length ? e.idp.map((a, i) => (
              <div key={i} style={{marginTop:'10px', fontSize:'12.5px', display:'flex', justifyContent:'space-between'}}>
                <span>{a.goal}</span><span className={`pill ${a.status==='Completed'?'good':a.status==='Behind'?'bad':'neutral'}`}>{a.status}</span>
              </div>
            )) : <div style={{fontSize:'12px', color:'var(--ink-3)', marginTop:'6px'}}>No development activities on file.</div>}
          </div>
        )}
        {tab === 'succession' && (
          successorRoles.length > 0 ? (
            <>
              {successorRoles.length > 1 && <div className="caveat">⚠ Nominated for {successorRoles.length} critical roles simultaneously — single-point dependency.</div>}
              {successorRoles.map(role => (
                <div className="prow" key={role.id}>
                  <span className="lbl">Nominated successor</span>
                  <b>{role.title}</b> <span className="pill readiness">{e.readiness}</span> <span className="pill neutral">Priority: {e.priority}</span>
                  <div style={{fontSize:'12px', color:'var(--ink-2)', marginTop:'10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px'}}>
                    <span><b>Gap:</b> {e.successorGap || '—'}</span>
                    <span><b>Strengths:</b> {e.successorStrengths || '—'}</span>
                    <span><b>Risk:</b> {e.successorRisks || '—'}</span>
                    <span><b>Last reviewed:</b> {e.lastReadinessReview || '—'} · <b>Target:</b> {e.targetReadinessDate || '—'}</span>
                  </div>
                </div>
              ))}
            </>
          ) : <div className="prow"><span className="lbl">Succession</span>Not currently a named successor.</div>
        )}
      </div>
    </>
  );
}
