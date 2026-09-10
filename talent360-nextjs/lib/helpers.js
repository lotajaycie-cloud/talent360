// Pure computed helpers — logic is a direct port from talent360_connected_app.html,
// unchanged. Every function here takes explicit arguments (employees, config, etc.)
// instead of reading a global DB, so it works cleanly with React state.

export function emp(employees, id) { return employees.find(e => e.id === id); }
export function zoneOf(nineBoxConfig, box) { return box ? nineBoxConfig[box] : null; }

export function boxFromRatings(perf, pot) {
  const map = {'High-High':9,'High-Med':8,'High-Low':7,'Med-High':6,'Med-Med':5,'Med-Low':4,'Low-High':3,'Low-Med':2,'Low-Low':1};
  return map[pot + '-' + perf];
}

export function idpProgress(activities) {
  if (!activities || activities.length === 0) return 0;
  const w = {Completed:1, 'In Progress':0.5, Behind:0.25, 'Not Started':0};
  return Math.round((activities.reduce((s,a) => s + w[a.status], 0) / activities.length) * 100);
}

export function aZoneCount(nineBoxConfig, pool) { return pool.filter(e => zoneOf(nineBoxConfig, e.box) === 'A').length; }
export function totalAssessed(pool) { return pool.filter(e => e.box != null).length; }
export function pendingAssessment(pool) { return pool.filter(e => e.box == null); }

export function successionCoverage(criticalRoles, employees) {
  const covered = criticalRoles.filter(r => employees.some(e => e.successorForRoles && e.successorForRoles.includes(r.id))).length;
  const total = criticalRoles.length;
  const pct = total > 0 ? Math.round((covered/total)*100) : 0;
  return {covered, total, pct};
}
export function successorsFor(employees, roleId) { return employees.filter(e => e.successorForRoles && e.successorForRoles.includes(roleId)); }

export function computeBenchStrength(employees, roleId) {
  const succ = successorsFor(employees, roleId);
  if (succ.length === 0) return 'Critical';
  if (succ.length >= 2) return 'Strong';
  return succ[0].majorGap ? 'Weak' : 'Moderate';
}
export function benchColor(b) { return {Strong:'good', Moderate:'info', Weak:'warn', Critical:'bad'}[b]; }

export function detectSinglePointDependency(employees) {
  return employees.filter(e => e.successorForRoles && e.successorForRoles.length > 1);
}

export function readinessCounts(readinessTiers, pool) {
  const counts = {}; readinessTiers.forEach(t => counts[t] = 0);
  pool.forEach(e => { if (e.readiness) counts[e.readiness] = (counts[e.readiness]||0) + 1; });
  return counts;
}

export function greenZoneTalents(nineBoxConfig, pool) { return pool.filter(e => zoneOf(nineBoxConfig, e.box) === 'A'); }
export function cZoneTalents(nineBoxConfig, pool) { return pool.filter(e => zoneOf(nineBoxConfig, e.box) === 'C'); }
export function idpCreatedCount(pool) { return pool.filter(e => e.idp && e.idp.length > 0).length; }
export function idpStatusBreakdown(pool) {
  const counts = {Completed:0, 'In Progress':0, Behind:0, 'Not Started':0};
  pool.forEach(e => (e.idp||[]).forEach(a => counts[a.status]++));
  return counts;
}
export function behindItems(pool) { return pool.flatMap(e => (e.idp||[]).filter(a=>a.status==='Behind').map(a=>({emp:e,activity:a}))); }
export function rolesWithoutSuccessor(criticalRoles, employees) { return criticalRoles.filter(r => !employees.some(e => e.successorForRoles && e.successorForRoles.includes(r.id))); }

export function boxDistribution(pool) {
  const counts = {};
  for (let b=1; b<=9; b++) counts[b] = 0;
  pool.forEach(e => { if (e.box) counts[e.box]++; });
  return counts;
}
export function deptBreakdown(pool) {
  const byDept = {};
  pool.forEach(e => {
    const d = e.dept || 'Unspecified';
    if (!byDept[d]) byDept[d] = {dept: d, total: 0, assessed: 0};
    byDept[d].total++;
    if (e.box) byDept[d].assessed++;
  });
  return Object.values(byDept).sort((a,b) => b.assessed - a.assessed);
}
// Placeholder metric — see initialCriticalRoles comment. Computes correctly and will
// populate on its own once real critical roles / successors exist.
export function execDmSuccessionCoverage(employees, criticalRoles, pool) {
  const total = pool.filter(e => e.level==='EXEC' || e.level==='DM').length;
  const identified = criticalRoles.filter(r => {
    const incumbent = emp(employees, r.incumbentId);
    return incumbent && (incumbent.level==='EXEC' || incumbent.level==='DM') && successorsFor(employees, r.id).length > 0;
  }).length;
  return {total, identified};
}

export function managerOf(managerMap, empId) { return managerMap[empId] || null; }
export function directReportsOf(managerMap, employees, mgrId) { return employees.filter(e => managerMap[e.id] === mgrId); }

export function avatarColor(avatarColors, id) {
  let h = 0;
  for (const c of id) h = (h*31 + c.charCodeAt(0)) >>> 0;
  return avatarColors[h % avatarColors.length];
}

// ---- Assessment scoring engine — identical to the resolved L1/L3/L4 formula ----
export const APT_BASE = ['Functional Excellence','Understanding the Business','Learning and Change Agility','Making Sound Judgment'];
export const APT_EXTRA = ['Big Picture Thinking'];
export const BEHAVIOR = ['Emotional Intelligence','Stakeholder Management','Bias for Action','Communication'];
export const CAPACITY = ['Leading People','Drive and Ambition','Forward Thinking / Innovating','Planning and Execution'];
export const VAL = {Low:0.5, Med:2, High:3};

export function sectionRating(vals, threshold) {
  const avg = vals.reduce((s,v)=>s+VAL[v],0)/vals.length;
  if (avg >= threshold) return 'High'; if (avg >= 1.6) return 'Med'; return 'Low';
}
export function performanceFinal(bi, val) { if (bi==='Low'||val==='Low') return 'Low'; if (bi==='High') return 'High'; return 'Med'; }
export function potentialFinal(a,b,c) {
  const vals=[a,b,c]; const H=vals.filter(v=>v==='High').length, L=vals.filter(v=>v==='Low').length, M=vals.filter(v=>v==='Med').length;
  if (H===3) return 'High'; if (L>=2) return 'Low'; if (M>=2 && L===1) return 'Low'; return 'Med';
}
