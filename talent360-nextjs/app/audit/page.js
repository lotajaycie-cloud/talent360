'use client';
import { useApp } from '../../lib/store';

const ROLE_LABEL = { SUPER_ADMIN: 'Super Admin', PEOPLE_MANAGER: 'People Manager', EMPLOYEE: 'Employee' };

export default function AuditPage() {
  const { auditLog } = useApp();

  return (
    <>
      <p className="section-title">Audit trail</p>
      <p className="section-sub">Immutable log of rating changes, cycle status advancement, and other tracked decisions.</p>
      {auditLog.length === 0 ? (
        <div className="card">No audit events recorded yet. Calibration rating changes and cycle status changes are logged automatically.</div>
      ) : (
        <table className="t">
          <thead><tr><th>When</th><th>Who</th><th>Role</th><th>Action</th><th>Target</th><th>Old → New</th><th>Reason</th></tr></thead>
          <tbody>
            {auditLog.map((a, i) => (
              <tr key={i}>
                <td>{a.timestamp}</td><td>{a.who}</td><td>{ROLE_LABEL[a.whoRole] || a.whoRole}</td>
                <td>{a.action}</td><td>{a.target}</td><td>{a.oldValue} → {a.newValue}</td><td>{a.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
