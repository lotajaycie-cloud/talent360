'use client';
import { usePathname } from 'next/navigation';
import { useApp } from '../lib/store';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import EmployeeView from './EmployeeView';
import SignedOutScreen from './SignedOutScreen';
import UserMenu from './UserMenu';
import BottomTabs from './BottomTabs';
import { CATEGORIES } from '../lib/config';

function isPathAllowed(pathname, role) {
  for (const cat of CATEGORIES) {
    for (const item of cat.items) {
      if (item.path === pathname) return item.roles.includes(role);
    }
  }
  return true;
}

export default function Shell({ children }) {
  const { currentUser, signedOut } = useApp();
  const pathname = usePathname();

  // Signed-out takes priority over everything else, regardless of role or route.
  if (signedOut) return <SignedOutScreen />;

  // Employee role is a deliberately separate, simple shell — not the admin app
  // with things hidden. See lib/config.js DEMO_USERS and the original app's
  // applyShellForRole() for the same behavior.
  if (currentUser.role === 'EMPLOYEE') {
    return (
      <div className="shell">
        <div className="main">
          <div className="topbar">
            <div className="topbar-spacer"></div>
            <UserMenu />
          </div>
          <div className="content"><EmployeeView /></div>
        </div>
      </div>
    );
  }

  const allowed = isPathAllowed(pathname, currentUser.role);

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          {allowed ? children : <NotPermitted />}
        </div>
        <BottomTabs />
      </div>
    </div>
  );
}

function NotPermitted() {
  return (
    <div className="card">
      <b>Not permitted for your role.</b>
      <p style={{fontSize:'12.5px', color:'var(--ink-2)'}}>
        This is a client-side check — real deployment needs the same rule enforced
        server-side too. Use the sidebar to navigate to a permitted module.
      </p>
    </div>
  );
}
