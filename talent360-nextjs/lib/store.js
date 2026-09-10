'use client';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { employees as seedEmployees, MANAGER_MAP } from './employeesData';
import {
  initialCycles, initialCriticalRoles, initialCalibrationSession,
  nineBoxConfig as seedNineBoxConfig, readinessTiers, initialFieldPermissions, DEMO_USERS,
} from './config';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState(seedEmployees);
  const [managerMap] = useState(MANAGER_MAP); // static — sourced from HRIS, not edited in-app
  const [criticalRoles, setCriticalRoles] = useState(initialCriticalRoles);
  const [cycles, setCycles] = useState(initialCycles);
  const [activeCycleId, setActiveCycleId] = useState('cycle-2026');
  const [calibrationSession] = useState(initialCalibrationSession);
  const [auditLog, setAuditLog] = useState([]);
  const [nineBoxConfig, setNineBoxConfig] = useState(seedNineBoxConfig);
  const [fieldPermissions, setFieldPermissions] = useState(initialFieldPermissions);
  const [assessmentDrafts, setAssessmentDrafts] = useState({});
  const [calibration, setCalibration] = useState({});
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const toggleMobileNav = useCallback(() => setMobileNavOpen(o => !o), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const signOut = useCallback(() => setSignedOut(true), []);
  const signBackIn = useCallback((loginId) => {
    const u = DEMO_USERS.find(u => u.loginId === loginId);
    if (u) setCurrentUser(u);
    setSignedOut(false);
  }, []);

  const activeCycle = useCallback(() => cycles.find(c => c.id === activeCycleId), [cycles, activeCycleId]);

  const logAudit = useCallback((action, target, oldValue, newValue, reason) => {
    setAuditLog(prev => [{
      who: currentUser.name, whoRole: currentUser.role,
      action, target, oldValue, newValue, reason: reason || '—',
      timestamp: new Date().toLocaleString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit'}),
    }, ...prev]);
  }, [currentUser]);

  const loginAs = useCallback((loginId) => {
    const u = DEMO_USERS.find(u => u.loginId === loginId);
    if (u) setCurrentUser(u);
  }, []);

  const myTeam = useCallback(() => {
    if (!currentUser.employeeId) return [];
    return employees.filter(e => managerMap[e.id] === currentUser.employeeId);
  }, [employees, managerMap, currentUser]);

  const canSee = useCallback((field) => {
    const perm = fieldPermissions[field]?.[currentUser.role];
    return perm && perm !== 'none';
  }, [fieldPermissions, currentUser]);

  // ---- Assessment draft mutations ----
  const saveDraftScore = useCallback((empId, perf, pot, itemRatings) => {
    setAssessmentDrafts(prev => ({ ...prev, [empId]: { ...(prev[empId]||{}), perf, pot, itemRatings } }));
  }, []);
  const saveDraftField = useCallback((empId, itemKey, value) => {
    setAssessmentDrafts(prev => {
      const draft = prev[empId] || {};
      if (itemKey === 'overall') return { ...prev, [empId]: { ...draft, feedback: value } };
      return { ...prev, [empId]: { ...draft, itemComments: { ...(draft.itemComments||{}), [itemKey]: value } } };
    });
  }, []);
  const submitAssessment = useCallback((empId) => {
    const draft = assessmentDrafts[empId];
    if (!draft) return;
    setCalibration(prev => ({
      ...prev,
      [empId]: {
        original: { perf: draft.perf, pot: draft.pot },
        calibrated: { perf: draft.perf, pot: draft.pot },
        locked: false, feedback: draft.feedback || '', itemComments: draft.itemComments || {},
      },
    }));
  }, [assessmentDrafts]);

  // ---- Calibration mutations ----
  const updateCalib = useCallback((empId, field, value) => {
    setCalibration(prev => ({
      ...prev,
      [empId]: { ...prev[empId], calibrated: { ...prev[empId].calibrated, [field]: value } },
    }));
  }, []);
  const setCalibReason = useCallback((empId, reason) => {
    setCalibration(prev => ({ ...prev, [empId]: { ...prev[empId], reason } }));
  }, []);
  const lockCalib = useCallback((empId, boxFromRatingsFn) => {
    const c = calibration[empId];
    const changed = c.calibrated.perf !== c.original.perf || c.calibrated.pot !== c.original.pot;
    if (changed && !c.reason) return { ok: false, message: 'A reason for change is required before this rating can be locked.' };
    const newBox = boxFromRatingsFn(c.calibrated.perf, c.calibrated.pot);
    const oldEmp = employees.find(e => e.id === empId);
    const oldBox = oldEmp?.box;
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, box: newBox } : e));
    setCalibration(prev => ({ ...prev, [empId]: { ...prev[empId], locked: true } }));
    logAudit('Calibration locked', oldEmp?.name || empId,
      `Box ${oldBox||'—'} (${c.original.perf}/${c.original.pot})`,
      `Box ${newBox} (${c.calibrated.perf}/${c.calibrated.pot})`,
      changed ? c.reason : 'No change from original assessment');
    return { ok: true };
  }, [calibration, employees, logAudit]);

  // ---- IDP mutations ----
  const markIdpDone = useCallback((empId, idx) => {
    setEmployees(prev => prev.map(e => {
      if (e.id !== empId) return e;
      const idp = e.idp.map((a,i) => i===idx ? { ...a, status: 'Completed' } : a);
      return { ...e, idp };
    }));
  }, []);

  // ---- Cycle mutations ----
  const setActiveCycle = useCallback((cycleId) => {
    const old = activeCycleId;
    setActiveCycleId(cycleId);
    const newCycle = cycles.find(c => c.id === cycleId);
    logAudit('Active cycle changed', newCycle?.name, old, cycleId, 'Switched which cycle drives Assessment/Calibration/Home');
  }, [activeCycleId, cycles, logAudit]);
  const advanceCycleStatus = useCallback((cycleId, CYCLE_STATUSES) => {
    setCycles(prev => prev.map(c => {
      if (c.id !== cycleId) return c;
      const idx = CYCLE_STATUSES.indexOf(c.status);
      const next = CYCLE_STATUSES[idx+1];
      logAudit('Cycle status advanced', c.name, c.status, next, 'Manual stage advancement');
      return { ...c, status: next };
    }));
  }, [logAudit]);

  // ---- Admin mutations ----
  const updateNineBoxZone = useCallback((box, zone) => {
    setNineBoxConfig(prev => ({ ...prev, [box]: zone }));
  }, []);
  const updateFieldPermission = useCallback((role, value) => {
    setFieldPermissions(prev => ({ ...prev, age: { ...prev.age, [role]: value } }));
  }, []);

  const value = useMemo(() => ({
    employees, managerMap, criticalRoles, cycles, activeCycleId, activeCycle,
    calibrationSession, auditLog, nineBoxConfig, readinessTiers, fieldPermissions,
    assessmentDrafts, calibration, currentUser, DEMO_USERS,
    mobileNavOpen, toggleMobileNav, closeMobileNav, signedOut, signOut, signBackIn,
    loginAs, myTeam, canSee, logAudit,
    saveDraftScore, saveDraftField, submitAssessment,
    updateCalib, setCalibReason, lockCalib,
    markIdpDone, setActiveCycle, advanceCycleStatus,
    updateNineBoxZone, updateFieldPermission,
  }), [
    employees, managerMap, criticalRoles, cycles, activeCycleId, activeCycle,
    calibrationSession, auditLog, nineBoxConfig, fieldPermissions,
    assessmentDrafts, calibration, currentUser,
    mobileNavOpen, toggleMobileNav, closeMobileNav, signedOut, signOut, signBackIn,
    loginAs, myTeam, canSee, logAudit,
    saveDraftScore, saveDraftField, submitAssessment,
    updateCalib, setCalibReason, lockCalib,
    markIdpDone, setActiveCycle, advanceCycleStatus,
    updateNineBoxZone, updateFieldPermission,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
