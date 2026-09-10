'use client';
import { useApp } from '../../lib/store';
import { CYCLE_STATUSES } from '../../lib/config';

export default function CyclePage() {
  const { cycles, activeCycleId, setActiveCycle, advanceCycleStatus } = useApp();

  return (
    <>
      <p className="section-title">Talent review cycles</p>
      <p className="section-sub">Every cycle is retained — starting 2027 does not touch 2026&apos;s results. Only one cycle is &quot;active&quot; at a time (drives Assessment/Calibration/Home); switch which one with the button on its card.</p>
      {cycles.map(c => {
        const idx = CYCLE_STATUSES.indexOf(c.status);
        const isActive = c.id === activeCycleId;
        return (
          <div className="card" key={c.id} style={isActive ? {borderColor:'var(--brand)'} : {}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
              <div>
                <div style={{fontSize:'16px', fontWeight:800}}>{c.name} {isActive && <span className="pill brand">Active</span>}</div>
                <div style={{fontSize:'12.5px', color:'var(--ink-2)'}}>{c.targetPopulation}</div>
              </div>
              {!isActive && <button className="btn small secondary" onClick={() => setActiveCycle(c.id)}>Make active</button>}
            </div>
            <div className="stat-row3">
              <div className="stat3 mint"><div className="l">Assessment window</div><div className="v" style={{fontSize:'14px'}}>{c.assessmentStart} → {c.assessmentEnd}</div></div>
              <div className="stat3 amber"><div className="l">Calibration window</div><div className="v" style={{fontSize:'14px'}}>{c.calibrationStart} → {c.calibrationEnd}</div></div>
              <div className="stat3 lav"><div className="l">IDP deadline</div><div className="v" style={{fontSize:'14px'}}>{c.idpDeadline}</div></div>
            </div>
            <div className="prow"><span className="lbl">Cycle owner</span>{c.owner}</div>
            <div className="prow">
              <span className="lbl">Workflow status</span>
              <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                {CYCLE_STATUSES.map((s, i) => (
                  <span className={`pill ${i<idx?'good':i===idx?'brand':'neutral'}`} key={s}>{i+1}. {s}</span>
                ))}
              </div>
              {isActive && idx < CYCLE_STATUSES.length-1 && (
                <button className="btn small" style={{marginTop:'12px'}} onClick={() => advanceCycleStatus(c.id, CYCLE_STATUSES)}>
                  Advance to &quot;{CYCLE_STATUSES[idx+1]}&quot; →
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
