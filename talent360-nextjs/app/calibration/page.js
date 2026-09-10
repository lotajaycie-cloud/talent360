'use client';
import { Fragment } from 'react';
import { useApp } from '../../lib/store';
import { emp, zoneOf, boxFromRatings } from '../../lib/helpers';

export default function CalibrationPage() {
  const { employees, calibration, calibrationSession, nineBoxConfig, updateCalib, setCalibReason, lockCalib } = useApp();
  const ids = Object.keys(calibration);
  const s = calibrationSession;

  function handleLock(id) {
    const result = lockCalib(id, boxFromRatings);
    if (!result.ok) alert(result.message);
  }

  return (
    <>
      <p className="section-title">Calibration</p>
      <p className="section-sub">Box is always computed from ratings — never set directly. Changing a calibrated rating requires a reason before it can be locked.</p>
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:'14px', fontWeight:800}}>{s.name}</div>
            <div style={{fontSize:'12px', color:'var(--ink-2)', marginTop:'3px'}}>Facilitator: {s.facilitator || '—'} · {s.date || 'not scheduled'}</div>
          </div>
          <span className="pill info">{s.status}</span>
        </div>
        <div style={{fontSize:'12px', color:'var(--ink-2)', marginTop:'10px'}}>Participants: {s.participants.length ? s.participants.join(', ') : '—'}</div>
      </div>

      {ids.length === 0 ? (
        <div className="card">No assessments currently in this session. Submit one from Assessment.</div>
      ) : (
        <table className="t">
          <thead><tr><th>Talent</th><th>Stage</th><th>Performance</th><th>Potential</th><th>Box / Zone</th><th></th></tr></thead>
          <tbody>
            {ids.map(id => {
              const c = calibration[id];
              const e = emp(employees, id);
              const origBox = boxFromRatings(c.original.perf, c.original.pot);
              const calBox = boxFromRatings(c.calibrated.perf, c.calibrated.pot);
              const changed = c.calibrated.perf !== c.original.perf || c.calibrated.pot !== c.original.pot;
              return (
                <Fragment key={id}>
                  <tr>
                    <td rowSpan={4}><b>{e?.name}</b></td>
                    <td>Original</td><td>{c.original.perf}</td><td>{c.original.pot}</td>
                    <td><span className={`pill ${zoneOf(nineBoxConfig, origBox)}`}>Box {origBox} · {zoneOf(nineBoxConfig, origBox)}</span></td><td></td>
                  </tr>
                  <tr>
                    <td>Calibrated</td>
                    <td>
                      <select value={c.calibrated.perf} onChange={e2 => updateCalib(id, 'perf', e2.target.value)}>
                        <option>Low</option><option>Med</option><option>High</option>
                      </select>
                    </td>
                    <td>
                      <select value={c.calibrated.pot} onChange={e2 => updateCalib(id, 'pot', e2.target.value)}>
                        <option>Low</option><option>Med</option><option>High</option>
                      </select>
                    </td>
                    <td><span className={`pill ${zoneOf(nineBoxConfig, calBox)}`}>Box {calBox} · {zoneOf(nineBoxConfig, calBox)}</span></td><td></td>
                  </tr>
                  <tr>
                    <td colSpan={4}>
                      {changed && (
                        <input
                          type="text" placeholder="Reason for change (required to lock)" value={c.reason || ''}
                          onChange={e2 => setCalibReason(id, e2.target.value)}
                          style={{width:'100%', border:`1px solid ${!c.reason ? 'var(--red)' : 'var(--border)'}`, borderRadius:'8px', padding:'6px 10px', fontSize:'12px'}}
                        />
                      )}
                    </td><td></td>
                  </tr>
                  <tr>
                    <td>Final</td><td colSpan={2}>{c.locked ? 'Locked' : 'Not yet locked'}</td>
                    <td><button className={`btn small ${c.locked?'locked':''}`} onClick={() => handleLock(id)} disabled={c.locked}>{c.locked ? 'Locked' : 'Lock'}</button></td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
