'use client';
import { useApp } from '../../lib/store';

export default function AdminPage() {
  const { nineBoxConfig, updateNineBoxZone, fieldPermissions, updateFieldPermission } = useApp();

  return (
    <>
      <p className="section-title">Admin / configuration</p>
      <p className="section-sub">Changes here take effect immediately across 9-Box and Talent Profile.</p>
      <div className="card">
        <b style={{fontSize:'12.5px'}}>9-box zone mapping</b>
        {[9,8,7,6,5,4,3,2,1].map(box => (
          <div className="prow" key={box} style={{padding:'6px 0', display:'flex', justifyContent:'space-between'}}>
            <span>Box {box}</span>
            <select value={nineBoxConfig[box]} onChange={e => updateNineBoxZone(box, e.target.value)}>
              <option value="A">A</option><option value="B">B</option><option value="C">C</option>
            </select>
          </div>
        ))}
      </div>
      <div className="card">
        <b style={{fontSize:'12.5px'}}>Field permissions — Age</b>
        <p style={{fontSize:'11px', color:'var(--ink-2)', margin:'6px 0 12px'}}>
          Employee role has no path to viewing others&apos; profiles at all, so it isn&apos;t listed here — this matrix only governs what Super Admin and People Manager can see.
        </p>
        {['SUPER_ADMIN','PEOPLE_MANAGER'].map(role => (
          <div className="prow" key={role} style={{padding:'6px 0', display:'flex', justifyContent:'space-between'}}>
            <span>{role === 'SUPER_ADMIN' ? 'Super Admin' : 'People Manager'}</span>
            <select value={fieldPermissions.age[role]} onChange={e => updateFieldPermission(role, e.target.value)}>
              <option value="none">none</option><option value="read">read</option>
            </select>
          </div>
        ))}
      </div>
    </>
  );
}
