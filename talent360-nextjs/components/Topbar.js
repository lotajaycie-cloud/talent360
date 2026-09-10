'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '../lib/store';
import { DEMO_USERS } from '../lib/config';
import { pendingAssessment, behindItems, rolesWithoutSuccessor } from '../lib/helpers';
import UserMenu from './UserMenu';

export default function Topbar() {
  const { currentUser, loginAs, employees, myTeam, criticalRoles } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);

  const scoped = currentUser.role === 'PEOPLE_MANAGER';
  const pool = scoped ? myTeam() : employees;

  const notifItems = [];
  pendingAssessment(pool).forEach(e => notifItems.push({icon:'📝', color:'var(--brand-bg)', title:`${e.name} — assessment pending`, desc:'Not yet submitted for this cycle'}));
  behindItems(pool).forEach(b => notifItems.push({icon:'⚠️', color:'var(--amber-bg)', title:`${b.emp.name} — activity behind`, desc:b.activity.goal}));
  if (!scoped) rolesWithoutSuccessor(criticalRoles, employees).forEach(r => notifItems.push({icon:'☁️', color:'var(--red-bg)', title:`${r.title} — no successor`, desc:'Critical role uncovered'}));

  return (
    <div className="topbar" style={{position:'relative'}}>
      <Link href="/desktop" className="mobile-logo" title="Go to Home">
        <Image src="/logo.png" alt="Talent360" width={32} height={32} />
        <span>Talent360</span>
      </Link>
      <div className="topbar-spacer"></div>
      <button className="icon-btn" onClick={() => setNotifOpen(o => !o)}>
        🔔{notifItems.length > 0 && <span className="dot"></span>}
      </button>
      <select
        value={currentUser.loginId}
        onChange={e => loginAs(e.target.value)}
        title="Prototype login switcher — not a production access mechanism."
        style={{border:'1.5px dashed var(--brand)', color:'var(--brand)', borderRadius:'20px', padding:'7px 12px', fontSize:'12px', background:'var(--brand-bg)', fontWeight:600}}
      >
        {DEMO_USERS.map(u => (
          <option key={u.loginId} value={u.loginId}>🔑 Log in: {u.role === 'SUPER_ADMIN' ? `Super Admin (${u.name})` : u.role === 'PEOPLE_MANAGER' ? `People Manager (${u.name})` : `Employee (${u.name})`}</option>
        ))}
      </select>
      <UserMenu />

      {notifOpen && (
        <div className="notif-panel">
          {notifItems.length ? notifItems.map((n, i) => (
            <div className="notif-item" key={i}>
              <div className="nicon" style={{background:n.color}}>{n.icon}</div>
              <div><div className="ntitle">{n.title}</div><div className="ndesc">{n.desc}</div></div>
            </div>
          )) : <div className="notif-item"><div className="ndesc">You&apos;re all caught up.</div></div>}
        </div>
      )}
    </div>
  );
}
