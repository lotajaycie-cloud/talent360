'use client';
import Image from 'next/image';
import { useApp } from '../lib/store';

export default function SignedOutScreen() {
  const { DEMO_USERS, signBackIn } = useApp();

  return (
    <div className="signed-out-screen">
      <Image src="/logo.png" alt="Talent360" width={96} height={96} />
      <h2>You&apos;ve signed out</h2>
      <p>Choose an account to sign back in.</p>
      <select
        defaultValue=""
        onChange={e => e.target.value && signBackIn(e.target.value)}
        style={{ border: '1.5px dashed var(--brand)', color: 'var(--brand)', borderRadius: '20px', padding: '9px 16px', fontSize: '13px', background: 'var(--brand-bg)', fontWeight: 600 }}
      >
        <option value="" disabled>🔑 Log in as…</option>
        {DEMO_USERS.map(u => (
          <option key={u.loginId} value={u.loginId}>
            {u.role === 'SUPER_ADMIN' ? `Super Admin (${u.name})` : u.role === 'PEOPLE_MANAGER' ? `People Manager (${u.name})` : `Employee (${u.name})`}
          </option>
        ))}
      </select>
    </div>
  );
}
