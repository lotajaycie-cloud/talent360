// Static seed data — mirrors talent360_connected_app.html's DB object exactly.

export const initialCycles = [
  {
    id: 'cycle-2026', name: '2026 Annual Talent Review', year: 2026,
    targetPopulation: 'JG 10+ or SUP-and-up, active, 1+ year tenure — 1,373 employees, 334 with 2026 results on file',
    assessmentStart: '2026-01-01', assessmentEnd: '2026-06-30',
    calibrationStart: '2026-07-01', calibrationEnd: '2026-07-15',
    finalizationDate: '2026-07-20', idpDeadline: '2026-08-31',
    owner: 'Talent Management', status: 'Calibration In Progress',
    historical: true,
  },
  {
    id: 'cycle-2027', name: '2027 Annual Talent Review', year: 2027,
    targetPopulation: 'To be confirmed — carried forward from 2026 population pending HR review',
    assessmentStart: '2027-01-01', assessmentEnd: '2027-06-30',
    calibrationStart: '2027-07-01', calibrationEnd: '2027-07-15',
    finalizationDate: '2027-07-20', idpDeadline: '2027-08-31',
    owner: 'Talent Management', status: 'Draft',
    historical: false,
  },
];

export const CYCLE_STATUSES = ['Draft','Assessment Open','Assessment Submitted','Calibration In Progress','Finalized','IDP Creation','Development Tracking','Closed'];

// Empty by design: no real Critical Role list exists yet. See talent360_connected_app.html's
// comment at the same spot — carrying forward fictional roles onto real employees would
// misrepresent decisions nobody actually made. Add real roles here once HR defines them:
// {id:'r1', title:'...', incumbentId:'e<employee#>'}
export const initialCriticalRoles = [];

export const initialCalibrationSession = {
  name: 'July 2026 Calibration Session', date: '',
  facilitator: '', participants: [],
  status: 'Not yet scheduled',
};

export const nineBoxConfig = {9:'A',8:'A',6:'A', 7:'B',5:'B',3:'B',2:'B', 4:'C',1:'C'};
export const readinessTiers = ['Emergency Cover','Ready Now','Ready 1-2 Years','Ready 2-3 Years','Ready 3-5 Years'];
export const initialFieldPermissions = { age: {SUPER_ADMIN:'read', PEOPLE_MANAGER:'none', EMPLOYEE:'none'} };

export const DEMO_USERS = [
  {loginId:'admin', name:'Jaycie Lota', role:'SUPER_ADMIN', employeeId:null},
  {loginId:'e201700016', name:'Marlo Layog Lepalem', role:'PEOPLE_MANAGER', employeeId:'e201700016'},
  {loginId:'e202200017', name:'Jorge Lago Almirante Jr', role:'EMPLOYEE', employeeId:'e202200017'},
];

export const CATEGORIES = [
  {id:'dashboard', label:'Dashboard', items:[
    {v:'home', label:'Home', path:'/desktop', roles:['SUPER_ADMIN','PEOPLE_MANAGER']},
    {v:'cycle', label:'Review Cycle', path:'/cycle', roles:['SUPER_ADMIN']},
  ]},
  {id:'review', label:'Talent Review', items:[
    {v:'assess',label:'Assessment', path:'/assess', roles:['SUPER_ADMIN','PEOPLE_MANAGER']},
    {v:'calib',label:'Calibration', path:'/calibration', roles:['SUPER_ADMIN']},
    {v:'ninebox',label:'9-Box Grid', path:'/ninebox', roles:['SUPER_ADMIN']},
  ]},
  {id:'decisions', label:'Decisions', items:[
    {v:'succession',label:'Succession', path:'/succession', roles:['SUPER_ADMIN','PEOPLE_MANAGER']},
    {v:'idp',label:'Development Plans', path:'/idp', roles:['SUPER_ADMIN','PEOPLE_MANAGER']},
    {v:'profile',label:'Talent Profile', path:'/profile', roles:['SUPER_ADMIN','PEOPLE_MANAGER']},
    {v:'mentoring',label:'Mentoring', path:'/mentoring', roles:['SUPER_ADMIN','PEOPLE_MANAGER']},
  ]},
  {id:'platform', label:'Platform', items:[
    {v:'admin',label:'Configuration', path:'/admin', roles:['SUPER_ADMIN']},
    {v:'analytics',label:'Analytics', path:'/analytics', roles:['SUPER_ADMIN']},
    {v:'audit',label:'Audit Trail', path:'/audit', roles:['SUPER_ADMIN']},
  ]},
];

export const TITLES = {
  home:'Home', cycle:'Talent Review Cycle', assess:'Talent Assessment', calib:'Calibration',
  ninebox:'9-Box Grid', succession:'Succession Management', idp:'Development Plans',
  profile:'Talent Profile', mentoring:'Mentoring', admin:'Configuration',
  analytics:'Talent Analytics', audit:'Audit Trail',
};

export const AVATAR_COLORS = ['#7C1F3D','#4C5FD5','#2F9E5C','#C98A1F','#6B4FC9','#C4433A'];
