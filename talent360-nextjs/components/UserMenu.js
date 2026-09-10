'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../lib/store';

const ROLE_LABEL = { SUPER_ADMIN: 'Super Admin', PEOPLE_MANAGER: 'People Manager', EMPLOYEE: 'Employee' };

export default function UserMenu() {
  const { currentUser, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initials = currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('');

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="user-chip" onClick={() => setOpen(o => !o)}>
        <div className="uavatar">{initials}</div><span>{currentUser.name}</span> ⌄
      </button>
      {open && (
        <div className="user-menu-panel">
          <div className="user-menu-item" style={{ cursor: 'default', color: 'var(--ink-3)', fontSize: '11px' }}>
            Signed in as {ROLE_LABEL[currentUser.role]}
          </div>
          <button className="user-menu-item" onClick={() => { setOpen(false); signOut(); }}>🚪 Sign out</button>
        </div>
      )}
    </div>
  );
}
