'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '../../lib/store';
import { emp } from '../../lib/helpers';

export default function MentoringPage() {
  const { employees, criticalRoles } = useApp();
  const router = useRouter();
  const relationships = employees.filter(e => e.mentorId).map(e => ({ mentee: e, mentor: emp(employees, e.mentorId) }));

  return (
    <>
      <p className="section-title">Mentoring</p>
      <p className="section-sub">Relationship-scoped — a mentor&apos;s access here comes from being named, not from reporting line.</p>
      {relationships.length === 0 ? (
        <div className="card">No mentoring relationships on file. The masterlist is HRIS/org data — it doesn&apos;t capture mentoring, which has to be established manually (set an employee&apos;s mentorId).</div>
      ) : relationships.map(r => (
        <div className="card" key={r.mentee.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span>
            <b>{r.mentor.name}</b> mentors <b>{r.mentee.name}</b>
            {r.mentee.successorForRoles?.length > 0 && ` — Succession: ${r.mentee.successorForRoles.map(rid => criticalRoles.find(x=>x.id===rid)?.title).join(', ')}`}
          </span>
          <button className="btn small secondary" onClick={() => router.push(`/profile?id=${r.mentee.id}`)}>View mentee profile</button>
        </div>
      ))}
    </>
  );
}
