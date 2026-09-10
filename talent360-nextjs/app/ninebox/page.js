'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../lib/store';

const GRID = [[7,8,9],[4,5,6],[1,2,3]];

export default function NineBoxPage() {
  const { employees, nineBoxConfig } = useApp();
  const router = useRouter();
  const [selectedBox, setSelectedBox] = useState(null);

  const list = selectedBox ? employees.filter(e => e.box === selectedBox) : [];

  return (
    <>
      <p className="section-title">9-box / zone management</p>
      <p className="section-sub">Zone mapping is admin-configurable — change it in Admin / Configuration and this grid updates.</p>
      <div className="grid9">
        {GRID.flat().map(box => {
          const zone = nineBoxConfig[box];
          const count = employees.filter(e => e.box === box).length;
          return (
            <div className={`cell zone-${zone}`} key={box} onClick={() => setSelectedBox(selectedBox === box ? null : box)}>
              <div className="n">BOX {box} · {zone}-ZONE</div><div className="c">{count}</div>
            </div>
          );
        })}
      </div>
      {selectedBox && (
        <div className="card" style={{marginTop:'14px'}}>
          <b style={{fontSize:'12.5px'}}>Box {selectedBox} — {list.length} talent</b>
          {list.map(e => (
            <div className="prow" key={e.id} style={{padding:'8px 0', display:'flex', justifyContent:'space-between'}}>
              <span>{e.name} — {e.dept}</span>
              <button className="btn small secondary" onClick={() => router.push(`/profile?id=${e.id}`)}>View profile</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
